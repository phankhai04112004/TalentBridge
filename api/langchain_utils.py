import sqlite3
import json
import logging
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.output_parsers import JsonOutputParser
from langchain_core.prompts import ChatPromptTemplate, MessagesPlaceholder
from langchain.chains import create_history_aware_retriever
from langchain.chains.combine_documents import create_stuff_documents_chain
from langchain_core.documents import Document
from typing import List, Tuple
import os
from dotenv import load_dotenv
from chroma_utils import get_vectorstore
import asyncio
from contextlib import contextmanager
import re

# ======================================================
# ⚙️ Cấu hình môi trường & logging
# ======================================================
load_dotenv()
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

# Tự động tìm đường dẫn database
base_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(base_dir)
DB_NAME = os.path.join(project_root, "db", "cv_job_matching.db")


# ======================================================
# 🧩 Kết nối SQLite
# ======================================================
@contextmanager
def get_db_connection():
    conn = sqlite3.connect(DB_NAME)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()


# ======================================================
# 🔧 Helper
# ======================================================
def _to_int_job_id(x):
    """Chuyển job_id về int an toàn (nhận int, '716', 'job_716'...)."""
    if isinstance(x, int):
        return x
    if isinstance(x, str):
        m = re.search(r"\d+", x)
        if m:
            try:
                return int(m.group())
            except Exception:
                return None
    return None


def _prefix_doc_with_id(doc: Document) -> Document:
    """Nhét JOB_ID/TITLE/URL vào đầu page_content và RÚT GỌN content để Gemini xử lý nhanh hơn."""
    mid = doc.metadata or {}
    job_id = mid.get("job_id", "")
    job_title = mid.get("job_title", "")
    job_url = mid.get("job_url", "")

    # Rút gọn content: chỉ lấy 800 ký tự đầu (đủ cho matching)
    content = doc.page_content or ""
    if len(content) > 800:
        content = content[:800] + "..."

    header = f"JOB_ID: {job_id}\nJOB_TITLE: {job_title}\nJOB_URL: {job_url}\n-----\n"
    doc.page_content = header + content
    return doc


# ======================================================
# 🔍 Tạo các thành phần RAG (trả về retriever + QA chain)
# ======================================================
def get_rag_components(model: str = "gemini-2.5-flash") -> Tuple:
    """
    Trả về (retriever, qa_chain, qa_prompt).
    Sau đó ta sẽ tự gọi retriever -> lấy docs -> gọi thẳng qa_chain với {context: docs}.
    """
    # Use API key rotation
    from api_key_manager import get_next_api_key
    google_api_key = get_next_api_key()

    llm = ChatGoogleGenerativeAI(model=model, google_api_key=google_api_key)

    # Tạo retriever từ Chroma - lấy 20 jobs để Gemini rank
    vectorstore = get_vectorstore()
    retriever = vectorstore.as_retriever(search_kwargs={"k": 20})

    # Prompt tạo query tóm tắt CV thành truy vấn tìm việc (cho history-aware retriever nếu dùng)
    contextualize_q_system_prompt = (
        "You are an assistant helping to match CV skills, aspirations, experience, and education with job postings.\n"
        "Given the match history and a combined input of skills, aspirations, experience, and education from a CV, "
        "reformulate them into a concise query for job matching.\n"
        "Extract and prioritize key keywords from skills, experience, aspirations, and education.\n"
        "Ensure the query focuses on matching CV skills and experience with job description, candidate requirements, and skills listed in job postings.\n"
        "Do NOT generate an answer, only reformulate the input into a clear and concise query."
    )
    contextualize_q_prompt = ChatPromptTemplate.from_messages([
        ("system", contextualize_q_system_prompt),
        MessagesPlaceholder("match_history"),
        ("human", "Match jobs for CV with input: {input}")
    ])
    # Bạn có thể dùng history_aware_retriever nếu cần, hiện tại ta không dùng nó để giữ chủ động context
    _ = create_history_aware_retriever(llm, retriever, contextualize_q_prompt)

    # Prompt chính để RAG đánh giá và match
    qa_prompt = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a job matching assistant. Your task is to match CV skills, aspirations, experience, and education with job postings.\n"
        "Use the provided context (job postings) to identify the top 5 most relevant jobs.\n"
        "Assign weights: 50% for skills, 30% for experience, 10% for aspirations, 10% for education.\n"
        "For matched_skills, ONLY include skills explicitly mentioned in the job's candidate_requirements, job_description, or skills list. "
        "Do NOT include skills from the CV that are not explicitly required or mentioned in the job context.\n"
        "Match experience by comparing CV experience with job description and experience required. "
        "Match aspirations with job title or description. Match education with education required.\n"
        "Provide suggestions to improve skills or gain experience relevant to the matched jobs, focusing on skills present in the CV but not matched.\n"
        "Return a JSON object with the following structure:\n"
        "{{\n"
        "  \"matched_jobs\": [{{\n"
        "      \"job_id\": int,\n"
        "      \"job_title\": str,\n"
        "      \"job_url\": str,\n"
        "      \"match_score\": float,\n"
        "      \"matched_skills\": [str],\n"
        "      \"matched_aspirations\": [str],\n"
        "      \"matched_experience\": [str],\n"
        "      \"matched_education\": [str],\n"
        "      \"why_match\": str (explain in Vietnamese why this job matches the CV, focusing on matched skills, experience, and career goals. Be specific and concise, max 100 words)\n"
        "  }}],\n"
        "  \"suggestions\": [{{\"skill_or_experience\": str, \"suggestion\": str}}]\n"
        "}}\n"
        "Ensure the response is concise, accurate, and based only on the provided context.\n"
        "Do not include any placeholder or sample data, mock examples — only use the actual context data.\n"
        "IMPORTANT:\n"
        "- The 'job_id' MUST be taken from the 'JOB_ID:' line in the context text (not invented).\n"
        "- If a job in the context has a 'JOB_ID' that is not a number, skip it.\n"
        "- Only pick jobs that appear in the provided context.\n"
    ),
    ("system", "Context (job postings):\n{context}"),
    MessagesPlaceholder("match_history"),
    ("human", "Match jobs for CV with input: {input}")
])

    qa_chain = create_stuff_documents_chain(llm, qa_prompt, output_parser=JsonOutputParser())
    logging.info("✅ StuffDocumentsChain created for Gemini.")
    return retriever, qa_chain, qa_prompt


# ======================================================
# 🤖 Hàm Matching chính (đã fix việc LLM luôn thấy JOB_ID)
# ======================================================
async def match_cv(cv: dict, filtered_job_ids: List[int], session_id: str) -> dict:
    """
    Match một CV với danh sách job sử dụng:
      1) retriever để lấy top docs
      2) ép JOB_ID/TITLE/URL vào page_content của từng doc
      3) gọi thẳng qa_chain với {context: docs}
    => Tránh việc create_retrieval_chain bỏ qua context thủ công.
    """
    try:
        cv_id = cv.get("cv_id")
        if not cv_id:
            raise ValueError("CV must include cv_id")

        # ===== 1) Chuẩn bị query =====
        query = (
            f"Skills: {json.dumps(cv.get('skills', []), ensure_ascii=False)} "
            f"Aspirations: {cv.get('aspirations', '')} "
            f"Experience: {cv.get('experience', '')} "
            f"Education: {cv.get('education', '')}"
        )
        logging.info(f"\n🧠 [CV {cv_id}] Query sinh ra từ CV:\n{query}\n")

        # ===== 2) Lấy retriever & QA chain =====
        retriever, qa_chain, qa_prompt = get_rag_components()

        vectorstore = get_vectorstore()

        # ===== 3) Chuẩn bị context docs =====
        logging.info(f"🔎 Đang truy vấn retriever cho CV {cv_id} ...")
        docs: List[Document] = []
        if filtered_job_ids:  # nếu có filter trước
            job_id_strs = [str(j) for j in filtered_job_ids]
            raw = vectorstore.get(where={"job_id": {"$in": job_id_strs}})
            if not raw["ids"]:
                return {
                    "cv_id": cv_id,
                    "matched_jobs": [],
                    "suggestions": [{"skill_or_experience": "N/A", "suggestion": "No jobs matched the filters"}]
                }
            for meta in raw.get("metadatas", []):
                if str(meta.get("job_id", "")).isdigit():
                    d = Document(
                        page_content=meta.get("content", ""),
                        metadata={
                            "job_id": meta.get("job_id"),
                            "job_title": meta.get("job_title"),
                            "job_url": meta.get("job_url"),
                        },
                    )
                    docs.append(_prefix_doc_with_id(d))
        else:
            # Lấy context từ retriever (nhanh & gọn)
            context_docs = retriever.get_relevant_documents(query)
            for d in context_docs:
                docs.append(_prefix_doc_with_id(d))

        # Log số lượng jobs tìm được (rút gọn logging)
        logging.info(f"✅ Tìm được {len(docs)} jobs phù hợp để gửi vào Gemini")

        # ===== 6) Gọi thẳng QA chain với context thủ công =====
        result = await qa_chain.ainvoke({
            "context": docs,
            "input": query,
            "match_history": [],
        })

        # ===== 7) Parse & normalize output =====
        output = result or {}
        if not isinstance(output, dict):
            output = {}

        output["cv_id"] = cv_id
        matched = output.get("matched_jobs", []) or []
        normalized_jobs = []
        for job in matched:
            try:
                # chuẩn hóa job_id về int
                job_id = _to_int_job_id(job.get("job_id"))
                if job_id is None:
                    logging.warning(f"⚠️ Invalid job_id trong output: {job}")
                    continue
                # ép kiểu cẩn thận
                job_title = job.get("job_title") or ""
                job_url = job.get("job_url") or ""
                match_score = float(job.get("match_score", 0.0))
                matched_skills = job.get("matched_skills") or []
                matched_asp = job.get("matched_aspirations") or []
                matched_exp = job.get("matched_experience") or []
                matched_edu = job.get("matched_education") or []
                normalized_jobs.append({
                    "job_id": job_id,
                    "job_title": job_title,
                    "job_url": job_url,
                    "match_score": match_score,
                    "matched_skills": matched_skills if isinstance(matched_skills, list) else [],
                    "matched_aspirations": matched_asp if isinstance(matched_asp, list) else [],
                    "matched_experience": matched_exp if isinstance(matched_exp, list) else [],
                    "matched_education": matched_edu if isinstance(matched_edu, list) else [],
                })
            except Exception as e:
                logging.warning(f"⚠️ Lỗi khi chuẩn hóa job: {e} | raw={job}")

        output["matched_jobs"] = normalized_jobs

        if not normalized_jobs:
            output.setdefault("suggestions", [])
            output["suggestions"].append({
                "skill_or_experience": "N/A",
                "suggestion": "No valid job_id returned by RAG"
            })

        logging.info(f"✅ CV {cv_id} matched {len(normalized_jobs)} jobs successfully")
        return output

    except Exception as e:
        logging.error(f"❌ Error matching CV {cv.get('cv_id', 'unknown')}: {e}")
        return {
            "cv_id": cv.get("cv_id", "unknown"),
            "matched_jobs": [],
            "suggestions": [{"skill_or_experience": "N/A", "suggestion": f"Failed to process CV: {e}"}],
        }


# ======================================================
# 🧾 Kiểm tra tính nhất quán job_id giữa SQLite và Chroma
# ======================================================
def verify_job_id_consistency(job_id: int) -> bool:
    try:
        with get_db_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('''
                SELECT job_url, job_title, work_location, skills
                FROM job_store 
                WHERE id = ?
            ''', (job_id,))
            sqlite_job = cursor.fetchone()
            if not sqlite_job:
                logging.error(f"No job found in SQLite for job_id {job_id}")
                return False

            sqlite_data = dict(sqlite_job)
            sqlite_data["job_id"] = job_id
            logging.info(f"SQLite data for job_id {job_id}: {sqlite_data}")

        vectorstore = get_vectorstore()
        chroma_docs = vectorstore.get(where={"job_id": str(job_id)})
        if not chroma_docs['ids']:
            logging.error(f"No document found in Chroma for job_id {job_id}")
            return False

        chroma_metadata = chroma_docs['metadatas'][0]
        chroma_data = {
            "job_id": chroma_metadata.get("job_id", None),
            "job_url": chroma_metadata.get("job_url", ""),
            "job_title": chroma_metadata.get("job_title", ""),
            "work_location": chroma_metadata.get("work_location", ""),
            "skills": chroma_metadata.get("skills", "")
        }
        logging.info(f"Chroma data for job_id {job_id}: {chroma_data}")

        fields_to_compare = ["job_url", "job_title", "work_location", "skills"]
        is_consistent = True
        for field in fields_to_compare:
            sqlite_value = sqlite_data[field]
            chroma_value = chroma_data[field]
            if field == "skills" and sqlite_value:
                try:
                    sqlite_value = json.dumps(json.loads(sqlite_value), ensure_ascii=False)
                except json.JSONDecodeError:
                    pass
            if sqlite_value != chroma_value:
                logging.error(f"Mismatch in {field} for job_id {job_id}: SQLite={sqlite_value}, Chroma={chroma_value}")
                is_consistent = False

        if is_consistent:
            logging.info(f"✅ job_id {job_id} is consistent between SQLite and Chroma")
        else:
            logging.warning(f"⚠️ job_id {job_id} is NOT consistent between SQLite and Chroma")
        return is_consistent

    except Exception as e:
        logging.error(f"Error verifying job_id {job_id}: {e}")
        return False


# ======================================================
# 🧪 Kiểm thử
# ======================================================
def test_job_id(job_id: int):
    print(f"Đang kiểm tra job_id {job_id}...")
    result = verify_job_id_consistency(job_id)
    print(f"Kết quả: {'Nhất quán' if result else 'Không nhất quán'} giữa SQLite và Chroma")


async def test_match_cv(cv_id: int, session_id: str = "test_session"):
    with get_db_connection() as conn:
        cursor = conn.cursor()
        cursor.execute('SELECT cv_info_json FROM cv_store WHERE id = ?', (cv_id,))
        cv_row = cursor.fetchone()
        if not cv_row:
            logging.error(f"No CV found for cv_id {cv_id}")
            return

        cv = json.loads(cv_row['cv_info_json'])
        cv['cv_id'] = cv_id

    result = await match_cv(cv, filtered_job_ids=None, session_id=session_id)
    print(f"Kết quả khớp CV {cv_id}:")
    print(json.dumps(result, ensure_ascii=False, indent=2))

    matched_jobs = result.get("matched_jobs", [])
    if matched_jobs:
        print("\nKiểm tra tính nhất quán của các job_id trong matched_jobs:")
        for job in matched_jobs:
            jid = _to_int_job_id(job.get("job_id"))
            if jid:
                test_job_id(jid)
    else:
        print("\nKhông có công việc nào được khớp để kiểm tra.")


# ======================================================
# 🚀 Entry point
# ======================================================
if __name__ == "__main__":
    asyncio.run(test_match_cv(cv_id=4, session_id="test_session_4"))
