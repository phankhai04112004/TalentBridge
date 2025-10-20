# 📚 HƯỚNG DẪN DỰ ÁN TALENTBRIDGE - GIẢI THÍCH CHI TIẾT

> **Nền tảng tìm việc thông minh cho sinh viên sử dụng AI**

---

## 📋 MỤC LỤC

1. [Tổng Quan Dự Án](#1-tổng-quan-dự-án)
2. [Cấu Trúc Dự Án](#2-cấu-trúc-dự-án)
3. [Công Nghệ Sử Dụng](#3-công-nghệ-sử-dụng)
4. [Cơ Sở Dữ Liệu](#4-cơ-sở-dữ-liệu)
5. [Luồng Hoạt Động Chính](#5-luồng-hoạt-động-chính)
6. [API Endpoints](#6-api-endpoints)
7. [Frontend Pages](#7-frontend-pages)
8. [Cách Chạy Dự Án](#8-cách-chạy-dự-án)

---

## 1. TỔNG QUAN DỰ ÁN

### 🎯 Mục Đích
TalentBridge là nền tảng tìm việc làm thông minh dành riêng cho sinh viên, sử dụng AI để:
- **Phân tích CV tự động** - Upload PDF và AI sẽ đọc, hiểu nội dung
- **Gợi ý công việc phù hợp** - Tìm việc làm match với kỹ năng của bạn
- **Đánh giá chất lượng CV** - AI chấm điểm và đưa ra lời khuyên cải thiện
- **Phân tích thị trường** - Thống kê xu hướng tuyển dụng

### 🌟 Điểm Đặc Biệt
- ✅ **100% tự động** - Không cần nhập tay thông tin CV
- ✅ **AI thông minh** - Sử dụng Google Gemini 2.5 Flash
- ✅ **Semantic Search** - Tìm việc theo nghĩa, không chỉ từ khóa
- ✅ **Tiếng Việt** - Giao diện và nội dung hoàn toàn tiếng Việt

### 📊 Dữ Liệu
- **3,237 công việc** thực tế từ TopCV
- **Đầy đủ thông tin**: Lương, địa điểm, yêu cầu, mô tả công việc
- **Cập nhật liên tục** qua file `data/jobs_processed.jsonl`

---

## 2. CẤU TRÚC DỰ ÁN

```
TalentBridge/
│
├── 📁 api/                          # BACKEND - FastAPI Server
│   ├── main.py                      # ⭐ File chính - Tất cả API endpoints
│   ├── ai_analysis.py               # 🤖 AI phân tích CV, gợi ý cải thiện
│   ├── api_key_manager.py           # 🔑 Quản lý 3 API keys (rotation)
│   ├── langchain_utils.py           # 🔗 RAG - Semantic search với LangChain
│   ├── chroma_utils.py              # 💾 ChromaDB - Vector database
│   ├── db_utils.py                  # 🗄️ SQLite - Database operations
│   ├── pydantic_models.py           # 📝 Data models (validation)
│   └── app.log                      # 📋 Application logs
│
├── 📁 frontend/                     # FRONTEND - HTML/CSS/JS
│   ├── index.html                   # 🏠 Trang chủ (tiếng Việt)
│   ├── jobs_new.html                # 📋 Danh sách việc làm
│   ├── cv-analysis.html             # 📄 Phân tích CV (trang chính)
│   ├── dashboard.html               # 📊 Dashboard thống kê
│   ├── components/
│   │   ├── header.html              # Header component (dùng chung)
│   │   └── footer.html              # Footer component
│   ├── js/
│   │   ├── cv-analysis.js           # Logic phân tích CV
│   │   ├── dashboard.js             # Logic dashboard + charts
│   │   └── jobs.js                  # Logic tìm kiếm việc làm
│   └── assets/                      # CSS, images, vendor libraries
│
├── 📁 db/                           # DATABASES
│   ├── cv_job_matching.db           # SQLite database
│   └── chroma_db/                   # ChromaDB vector store
│
├── 📁 data/                         # DỮ LIỆU
│   ├── jobs_processed.jsonl         # 3,237 công việc (JSONL format)
│   └── jobs_vietnamese.csv          # Backup CSV
│
├── 📁 temp_pdfs/                    # Thư mục lưu CV tạm
│   ├── cv_1.pdf
│   ├── cv_2.pdf
│   └── cv_3.pdf
│
├── main.py                          # 🚀 Entry point - Chạy server
├── requirements.txt                 # 📦 Python dependencies
├── .env                             # 🔐 API keys (3 keys)
└── README.md                        # 📖 Hướng dẫn cơ bản
```

---

## 3. CÔNG NGHỆ SỬ DỤNG

### 🔧 Backend Stack

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| **Python** | 3.12+ | Ngôn ngữ chính |
| **FastAPI** | Latest | Web framework (async, nhanh) |
| **Uvicorn** | Latest | ASGI server (chạy FastAPI) |
| **Google Gemini 2.5 Flash** | Latest | LLM chính - Parse CV, phân tích, ranking |
| **Google Gemini Embedding** | text-embedding-004 | Tạo vector embeddings (768 chiều) |
| **ChromaDB** | Latest | Vector database - Semantic search |
| **SQLite** | 3.x | Relational database |
| **LangChain** | Latest | RAG framework |
| **Pydantic V2** | Latest | Data validation |
| **pdfplumber** | Latest | Đọc PDF |

### 🎨 Frontend Stack

| Công Nghệ | Mục Đích |
|-----------|----------|
| **Vanilla JavaScript** | Logic (không dùng framework) |
| **Chart.js 4.4.0** | Vẽ biểu đồ thống kê |
| **PDF.js** | Preview PDF trong browser |
| **Bootstrap 5** | UI components |
| **JobHub Template** | Template giao diện |

### 🤖 AI Models

1. **Gemini 2.5 Flash** (gemini-2.5-flash)
   - Parse CV từ PDF → JSON
   - Phân tích chất lượng CV
   - Gợi ý cải thiện
   - Ranking jobs (score 0-1)
   - Giải thích "Tại sao phù hợp"
   - Phân tích biểu đồ dashboard

2. **Gemini Embedding** (text-embedding-004)
   - Tạo vector 768 chiều cho jobs
   - Tạo vector cho CV
   - Semantic search (tìm theo nghĩa)

---

## 4. CƠ SỞ DỮ LIỆU

### 📊 SQLite Database (`db/cv_job_matching.db`)

#### **Bảng 1: cv_store** - Lưu CV đã upload
```sql
CREATE TABLE cv_store (
    id INTEGER PRIMARY KEY AUTOINCREMENT,  -- CV ID
    file_name TEXT NOT NULL,               -- Tên file (VD: NguyenVanA_CV.pdf)
    file_data BLOB,                        -- Binary data của PDF
    cv_info_json TEXT NOT NULL,            -- Thông tin CV (JSON)
    timestamp TEXT DEFAULT CURRENT_TIMESTAMP
);
```

**Ví dụ cv_info_json:**
```json
{
  "name": "Nguyễn Văn A",
  "email": "nguyenvana@gmail.com",
  "phone": "0123456789",
  "career_objective": "Tìm vị trí Backend Developer",
  "skills": ["Python", "FastAPI", "Docker", "PostgreSQL"],
  "education": [
    {
      "degree": "Cử nhân Công nghệ Thông tin",
      "school": "Đại học Bách Khoa",
      "year": "2020"
    }
  ],
  "experience": [
    {
      "title": "Backend Developer",
      "company": "FPT Software",
      "duration": "2020-2023",
      "description": "Phát triển API với FastAPI"
    }
  ]
}
```

#### **Bảng 2: job_store** - Lưu 3,237 công việc
```sql
CREATE TABLE job_store (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    job_title TEXT,              -- VD: "Backend Developer"
    company TEXT,                -- VD: "FPT Software"
    salary TEXT,                 -- VD: "15 - 25 triệu"
    location TEXT,               -- VD: "Hà Nội"
    experience TEXT,             -- VD: "2-3 năm"
    job_description TEXT,        -- Mô tả công việc
    job_requirements TEXT,       -- Yêu cầu
    benefits TEXT,               -- Quyền lợi
    deadline TEXT,               -- Hạn nộp
    company_logo TEXT,           -- URL logo
    job_url TEXT,                -- Link apply
    work_type TEXT,              -- Full-time/Part-time/Remote
    timestamp TEXT
);
```

#### **Bảng 3: cv_insights** - Cache phân tích CV
```sql
CREATE TABLE cv_insights (
    cv_id INTEGER PRIMARY KEY,
    quality_score REAL,          -- Điểm chất lượng (0-10)
    market_fit_score REAL,       -- Điểm phù hợp thị trường (0-10)
    completeness_score REAL,     -- Điểm đầy đủ (0-10)
    strengths TEXT,              -- JSON array điểm mạnh
    weaknesses TEXT,             -- JSON array điểm yếu
    insights TEXT,               -- Full JSON insights
    timestamp TEXT
);
```

#### **Bảng 4: match_logs** - Lịch sử matching
```sql
CREATE TABLE match_logs (
    id INTEGER PRIMARY KEY,
    cv_id INTEGER,
    matched_jobs TEXT,           -- JSON array top 20 jobs
    timestamp TEXT
);
```

#### **Bảng 5: applications** - Lịch sử ứng tuyển
```sql
CREATE TABLE applications (
    id INTEGER PRIMARY KEY,
    cv_id INTEGER,
    job_id INTEGER,
    status TEXT,                 -- pending/accepted/rejected
    timestamp TEXT
);
```

### 🔍 ChromaDB Collections

#### **Collection 1: job_collection**
- **Số lượng**: 3,237 documents
- **Embedding**: 768 chiều (text-embedding-004)
- **Metadata**: job_id, job_title, company, location, salary
- **Mục đích**: Semantic search jobs

#### **Collection 2: cv_collection**
- **Số lượng**: Tùy số CV upload
- **Embedding**: 768 chiều
- **Metadata**: cv_id, skills, experience
- **Mục đích**: Tìm CV tương tự

---

## 5. LUỒNG HOẠT ĐỘNG CHÍNH

### 🔄 Luồng 1: Upload & Phân Tích CV

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: Upload file CV.pdf                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: cv-analysis.html                                     │
│  - Chọn file PDF                                                │
│  - Click "Upload CV"                                            │
│  - POST /upload-cv (multipart/form-data)                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: api/main.py - upload_cv()                             │
│  1. Nhận file PDF                                               │
│  2. Lưu tạm vào temp_pdfs/                                      │
│  3. Gọi extract_text_from_pdf() → Text                          │
│  4. Gọi extract_cv_info(text) → Gemini AI parse                 │
│  5. Lưu vào cv_store (file_data + cv_info_json)                 │
│  6. Tạo vector embedding → ChromaDB                             │
│  7. Return: cv_id + cv_info                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Hiển thị thông tin CV                                │
│  - Tên, email, phone                                            │
│  - Skills (badges)                                              │
│  - Education, Experience                                        │
│  - Button "Phân Tích CV"                                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  USER: Click "Phân Tích CV"                                     │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: GET /cv/{cv_id}/insights                             │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: api/main.py - get_cv_insights_endpoint()              │
│  1. Check cache trong cv_insights table                         │
│  2. Nếu có → Return ngay (nhanh)                                │
│  3. Nếu không → Gọi analyze_cv_insights()                       │
│     - Gemini AI phân tích CV                                    │
│     - Tính điểm: quality, market_fit, completeness              │
│     - Tìm điểm mạnh/yếu                                         │
│  4. Lưu vào cv_insights (cache)                                 │
│  5. Return JSON                                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Hiển thị kết quả phân tích                           │
│  - 3 điểm số (progress bars)                                    │
│  - Điểm mạnh (✅ list)                                          │
│  - Điểm yếu (⚠️ list)                                           │
│  - Button "Gợi Ý Cải Thiện"                                     │
└─────────────────────────────────────────────────────────────────┘
```

### 🎯 Luồng 2: Tìm Việc Phù Hợp (Semantic Matching)

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: Click "Tìm Việc Phù Hợp"                                 │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: POST /match                                          │
│  Body: { cv_id: 1, top_k: 5 }                                   │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: api/main.py - match_endpoint()                        │
│  1. Lấy CV info từ cv_store                                     │
│  2. Extract skills + experience                                 │
│  3. Tạo search query:                                           │
│     "Backend Developer with Python, FastAPI, 3 years exp"       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: langchain_utils.py - match_cv()                       │
│  1. ChromaDB semantic search                                    │
│     - Tạo embedding cho query                                   │
│     - Tìm top 50 jobs tương tự (cosine similarity)              │
│  2. Filter jobs:                                                │
│     - Location (nếu có)                                         │
│     - Salary range (nếu có)                                     │
│     - Experience level (nếu có)                                 │
│  3. Rank với Gemini AI:                                         │
│     - Score 0-1 cho mỗi job                                     │
│     - Sắp xếp theo score                                        │
│  4. Generate "why_match" cho top 5:                             │
│     - Gemini AI giải thích tại sao phù hợp                      │
│  5. Cache top 20 vào match_logs                                 │
│  6. Return top 5 jobs                                           │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Hiển thị kết quả matching                            │
│  - 5 jobs cards                                                 │
│  - Match score (%)                                              │
│  - "Tại sao phù hợp" (AI explanation)                           │
│  - Button "Xem Chi Tiết" / "Ứng Tuyển"                          │
└─────────────────────────────────────────────────────────────────┘
```

### 📊 Luồng 3: Dashboard Analytics

```
┌─────────────────────────────────────────────────────────────────┐
│  USER: Mở trang Dashboard                                       │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: dashboard.html                                       │
│  1. GET /jobs/analytics → Lấy dữ liệu thống kê                  │
│  2. Vẽ 6 biểu đồ với Chart.js:                                  │
│     - Top 10 Job Titles (Bar chart)                             │
│     - Top 10 Companies (Bar chart)                              │
│     - Location Distribution (Pie chart)                         │
│     - Job Type (Doughnut chart)                                 │
│     - Experience Level (Bar chart)                              │
│     - Salary Range (Bar chart)                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  USER: Click "Phân Tích AI" trên biểu đồ                        │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: POST /jobs/analytics/insights                        │
│  Body: {                                                        │
│    chart_type: "top_jobs",                                      │
│    data: [...chart data...]                                     │
│  }                                                              │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  BACKEND: api/main.py - generate_chart_insights()               │
│  1. Nhận chart_type + data                                      │
│  2. Gọi Gemini AI với prompt:                                   │
│     "Phân tích biểu đồ này và đưa ra insights"                  │
│  3. AI trả về phân tích bằng tiếng Việt                         │
│  4. Return { analysis: "..." }                                  │
└────────────────────┬────────────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────────────┐
│  FRONTEND: Hiển thị phân tích AI                                │
│  - Insights box dưới biểu đồ                                    │
│  - Phân tích xu hướng, gợi ý cho sinh viên                      │
└─────────────────────────────────────────────────────────────────┘
```

---

## 6. API ENDPOINTS

### 📂 Nhóm 1: CV Management

#### **POST /upload-cv**
**Mục đích:** Upload và parse CV tự động

**Request:**
```bash
curl -X POST http://localhost:9990/upload-cv \
  -F "file=@NguyenVanA_CV.pdf"
```

**Response:**
```json
{
  "cv_id": 1,
  "file_name": "NguyenVanA_CV.pdf",
  "cv_info": {
    "name": "Nguyễn Văn A",
    "email": "nguyenvana@gmail.com",
    "skills": ["Python", "FastAPI"],
    "education": [...],
    "experience": [...]
  }
}
```

**Luồng xử lý:**
1. Nhận file PDF
2. Extract text bằng `pdfplumber`
3. Gọi Gemini AI parse → JSON
4. Lưu vào `cv_store` table
5. Tạo vector embedding → ChromaDB
6. Return cv_id + cv_info

---

#### **GET /cvs**
**Mục đích:** Lấy danh sách tất cả CVs đã upload

**Request:**
```bash
curl http://localhost:9990/cvs
```

**Response:**
```json
{
  "cvs": [
    {
      "id": 1,
      "file_name": "NguyenVanA_CV.pdf",
      "name": "Nguyễn Văn A",
      "email": "nguyenvana@gmail.com",
      "timestamp": "2024-01-15 10:30:00"
    }
  ]
}
```

---

#### **GET /cv/{cv_id}/insights**
**Mục đích:** Phân tích chất lượng CV bằng AI

**Request:**
```bash
curl http://localhost:9990/cv/1/insights
```

**Response:**
```json
{
  "cv_id": 1,
  "quality_score": 8.5,
  "market_fit_score": 7.8,
  "completeness_score": 9.0,
  "strengths": [
    "Kỹ năng lập trình đa dạng",
    "Kinh nghiệm thực tế tốt"
  ],
  "weaknesses": [
    "Thiếu chứng chỉ chuyên môn",
    "Mục tiêu nghề nghiệp chưa rõ ràng"
  ]
}
```

**Luồng xử lý:**
1. Check cache trong `cv_insights` table
2. Nếu có → Return ngay
3. Nếu không → Gọi Gemini AI phân tích
4. Tính 3 điểm số (0-10)
5. Tìm điểm mạnh/yếu
6. Lưu cache
7. Return insights

---

#### **POST /cv/improve?cv_id={cv_id}**
**Mục đích:** Gợi ý cải thiện CV

**Request:**
```bash
curl -X POST http://localhost:9990/cv/improve?cv_id=1
```

**Response:**
```json
{
  "cv_id": 1,
  "suggestions": [
    {
      "category": "Kỹ năng",
      "priority": "high",
      "suggestion": "Thêm kỹ năng Docker, Kubernetes",
      "reason": "Các công ty công nghệ đang tìm kiếm"
    }
  ]
}
```

---

### 🔍 Nhóm 2: Job Matching

#### **POST /match** ⭐ **ENDPOINT CHÍNH**
**Mục đích:** Tìm jobs phù hợp với CV (Semantic Search + AI Ranking)

**Request:**
```bash
curl -X POST http://localhost:9990/match \
  -H "Content-Type: application/json" \
  -d '{
    "cv_id": 1,
    "top_k": 5,
    "location": "Hà Nội",
    "min_salary": 10,
    "max_salary": 25
  }'
```

**Response:**
```json
{
  "cv_id": 1,
  "matched_jobs": [
    {
      "job_id": 123,
      "job_title": "Backend Developer",
      "company": "FPT Software",
      "salary": "15 - 25 triệu",
      "location": "Hà Nội",
      "match_score": 0.92,
      "why_match": "CV của bạn có kỹ năng Python, FastAPI phù hợp với yêu cầu..."
    }
  ]
}
```

**Luồng xử lý:**
1. Lấy CV info từ `cv_store`
2. Extract skills + experience
3. Tạo search query
4. ChromaDB semantic search → Top 50 jobs
5. Filter theo location, salary, experience
6. Rank với Gemini AI (score 0-1)
7. Generate "why_match" cho top 5
8. Cache top 20 vào `match_logs`
9. Return top 5 jobs

---

#### **POST /jobs/search**
**Mục đích:** Tìm kiếm jobs theo từ khóa (không cần CV)

**Request:**
```bash
curl -X POST http://localhost:9990/jobs/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "python developer",
    "location": "Hà Nội",
    "top_k": 10
  }'
```

**Response:**
```json
{
  "jobs": [
    {
      "job_id": 456,
      "job_title": "Python Developer",
      "company": "Viettel",
      "salary": "12 - 20 triệu",
      "location": "Hà Nội"
    }
  ],
  "total": 45
}
```

---

### 📋 Nhóm 3: Jobs Listing

#### **GET /jobs**
**Mục đích:** Lấy danh sách tất cả jobs (có pagination)

**Request:**
```bash
curl "http://localhost:9990/jobs?limit=20&offset=0"
```

**Response:**
```json
{
  "jobs": [...],
  "total": 3237
}
```

---

#### **GET /jobs/{job_id}**
**Mục đích:** Lấy chi tiết 1 job

**Request:**
```bash
curl http://localhost:9990/jobs/123
```

**Response:**
```json
{
  "id": 123,
  "job_title": "Backend Developer",
  "company": "FPT Software",
  "salary": "15 - 25 triệu",
  "location": "Hà Nội",
  "job_description": "...",
  "job_requirements": "...",
  "benefits": "...",
  "deadline": "2024-02-28",
  "company_logo": "https://...",
  "job_url": "https://..."
}
```

---

### 📊 Nhóm 4: Analytics

#### **GET /jobs/analytics**
**Mục đích:** Lấy dữ liệu thống kê thị trường việc làm

**Request:**
```bash
curl http://localhost:9990/jobs/analytics
```

**Response:**
```json
{
  "top_job_titles": [
    {"title": "Backend Developer", "count": 245},
    {"title": "Frontend Developer", "count": 189}
  ],
  "top_companies": [
    {"company": "FPT Software", "count": 156}
  ],
  "location_distribution": [
    {"location": "Hà Nội", "count": 1234},
    {"location": "Hồ Chí Minh", "count": 987}
  ],
  "salary_distribution": [...],
  "experience_distribution": [...],
  "job_type_distribution": [...]
}
```

---

#### **POST /jobs/analytics/insights** 🤖
**Mục đích:** AI phân tích biểu đồ và đưa ra insights

**Request:**
```bash
curl -X POST http://localhost:9990/jobs/analytics/insights \
  -H "Content-Type: application/json" \
  -d '{
    "chart_type": "top_jobs",
    "data": [
      {"title": "Backend Developer", "count": 245}
    ]
  }'
```

**Response:**
```json
{
  "analysis": "Backend Developer là vị trí được tuyển dụng nhiều nhất với 245 công việc. Đây là xu hướng tốt cho sinh viên ngành CNTT..."
}
```

---

### 🔐 Nhóm 5: Utilities

#### **GET /preview-doc/{file_id}**
**Mục đích:** Preview PDF trong browser

**Request:**
```bash
curl http://localhost:9990/preview-doc/abc-123-def
```

**Response:** PDF binary data (inline display)

---

## 7. FRONTEND PAGES

### 🏠 **index.html** - Trang Chủ
**Chức năng:**
- Banner hero với form tìm kiếm
- Danh mục công việc (8 categories)
- Tính năng nổi bật (AI matching, CV analysis)
- CTA "Bắt Đầu Tìm Việc"

**JavaScript:** Không có (static page)

---

### 📄 **cv-analysis.html** - Phân Tích CV (Trang Chính)
**Chức năng:**
1. **Upload CV** (drag & drop hoặc click)
2. **Hiển thị thông tin CV** (name, email, skills, education, experience)
3. **Phân tích CV** (3 điểm số + strengths/weaknesses)
4. **Gợi ý cải thiện** (AI suggestions)
5. **Tìm việc phù hợp** (top 5 matched jobs)

**JavaScript:** `js/cv-analysis.js`
- Upload CV → `/upload-cv`
- Phân tích → `/cv/{cv_id}/insights`
- Cải thiện → `/cv/improve?cv_id={cv_id}`
- Matching → `/match`

---

### 📋 **jobs_new.html** - Danh Sách Việc Làm
**Chức năng:**
- Hiển thị 3,237 công việc
- Filters: search, location, experience, salary
- Pagination (20 jobs/page)
- Sort by: newest, salary, deadline

**JavaScript:** `js/jobs.js`
- Load jobs → `/jobs?limit=20&offset=0`
- Search → `/jobs/search`
- Filter → Query params

---

### 📊 **dashboard.html** - Dashboard Thống Kê
**Chức năng:**
- 6 biểu đồ Chart.js
- AI insights cho mỗi biểu đồ
- Statistics cards (total jobs, CVs, applications)

**JavaScript:** `js/dashboard.js`
- Load analytics → `/jobs/analytics`
- AI insights → `/jobs/analytics/insights`

---

## 8. CÁCH CHẠY DỰ ÁN

### 📦 Bước 1: Cài Đặt Dependencies

```bash
# Clone repository
git clone <repo-url>
cd TalentBridge

# Tạo virtual environment
python -m venv rag_env

# Activate (Windows)
rag_env\Scripts\activate

# Activate (Linux/Mac)
source rag_env/bin/activate

# Cài đặt packages
pip install -r requirements.txt
```

---

### 🔑 Bước 2: Setup API Keys

Tạo file `.env` trong thư mục gốc:

```bash
# 3 API keys để tránh quota limit
GOOGLE_API_KEY_1=AIzaSy...
GOOGLE_API_KEY_2=AIzaSy...
GOOGLE_API_KEY_3=AIzaSy...
```

**Lấy API key:**
1. Vào https://aistudio.google.com/apikey
2. Tạo 3 API keys
3. Copy vào file `.env`

---

### 🚀 Bước 3: Chạy Server

**Cách 1: Dùng main.py (Khuyến nghị)**
```bash
python main.py
```

**Cách 2: Dùng uvicorn trực tiếp**
```bash
cd api
uvicorn main:app --host 0.0.0.0 --port 9990 --reload
```

**Output:**
```
============================================================
🚀 TalentBridge - Nền Tảng Tìm Việc Thông Minh
============================================================
📍 Server đang khởi động...
🌐 URL: http://localhost:9990
📚 API Docs: http://localhost:9990/docs
============================================================
INFO:     Uvicorn running on http://0.0.0.0:9990
INFO:     Started reloader process
✅ Preloading completed
INFO:     Application startup complete.
```

---

### 🌐 Bước 4: Truy Cập Ứng Dụng

**Frontend:**
- Mở file `frontend/index.html` trong browser
- Hoặc dùng Live Server (VS Code extension)
- URL: `http://localhost:5500` (hoặc port khác)

**Backend API:**
- API Docs: http://localhost:9990/docs
- API Base URL: http://localhost:9990

---

### ✅ Bước 5: Test Chức Năng

1. **Upload CV:**
   - Vào `cv-analysis.html`
   - Upload file PDF
   - Xem thông tin được parse

2. **Phân tích CV:**
   - Click "Phân Tích CV"
   - Xem 3 điểm số
   - Xem điểm mạnh/yếu

3. **Tìm việc:**
   - Click "Tìm Việc Phù Hợp"
   - Xem top 5 jobs matched
   - Đọc "Tại sao phù hợp"

4. **Dashboard:**
   - Vào `dashboard.html`
   - Xem 6 biểu đồ
   - Click "Phân Tích AI"

---

## 🎓 KẾT LUẬN

TalentBridge là một dự án hoàn chỉnh kết hợp:
- ✅ **AI/ML**: Gemini 2.5 Flash, Embeddings, Semantic Search
- ✅ **Backend**: FastAPI, SQLite, ChromaDB, LangChain
- ✅ **Frontend**: Vanilla JS, Chart.js, Modern UI
- ✅ **Real Data**: 3,237 công việc thực tế

**Điểm mạnh:**
- Tự động hóa 100% (không cần nhập tay)
- AI thông minh (phân tích, gợi ý, matching)
- Tiếng Việt hoàn toàn
- Dễ mở rộng (thêm features, models)

**Hướng phát triển:**
- Thêm authentication (login/register)
- Chatbot tư vấn nghề nghiệp
- Recommendation system nâng cao
- Mobile app (React Native)
- Deploy lên cloud (AWS, GCP)

---



