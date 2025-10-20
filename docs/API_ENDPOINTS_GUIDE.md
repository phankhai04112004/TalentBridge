# 📡 TalentBridge - API Endpoints Complete Guide

## 🎯 **Mục Đích & Ý Nghĩa Từng Endpoint**

---

## 📂 **1. CV MANAGEMENT ENDPOINTS**

### **`POST /upload-cv`**

**Mục đích:**
- Upload file PDF CV
- Parse CV tự động bằng Gemini AI
- Lưu vào database và tạo vector embedding

**Luồng xử lý:**
```
1. Nhận file PDF từ frontend
2. Extract text bằng pdfplumber
3. Gọi Gemini 2.5 Flash để parse thành JSON structure
4. Lưu vào cv_store table (file_data + cv_info)
5. Tạo vector embedding và lưu vào ChromaDB
6. Trả về cv_id + cv_info
```

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
    "phone": "0123456789",
    "skills": ["Python", "FastAPI", "React", "Docker"],
    "education": [
      {
        "degree": "Cử nhân Công nghệ Thông tin",
        "school": "Đại học Bách Khoa Hà Nội",
        "year": "2020"
      }
    ],
    "experience": [
      {
        "title": "Backend Developer",
        "company": "FPT Software",
        "duration": "2020-2023",
        "description": "Phát triển API với Python FastAPI, xây dựng microservices"
      }
    ]
  }
}
```

**Ý nghĩa:**
- ✅ Tự động hóa việc đọc CV (không cần nhập tay)
- ✅ Chuẩn hóa dữ liệu CV thành JSON
- ✅ Chuẩn bị cho bước matching với jobs

**Error Handling:**
- 400: File không phải PDF
- 500: Lỗi parse CV (Gemini API error)

---

### **`GET /cvs`**

**Mục đích:**
- Lấy danh sách tất cả CVs đã upload
- Hiển thị trong Dashboard

**Luồng xử lý:**
```
1. Query cv_store table
2. Parse cv_info JSON
3. Trả về list CVs
```

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
      "cv_info": {
        "name": "Nguyễn Văn A",
        "email": "nguyenvana@gmail.com",
        "skills": ["Python", "FastAPI"]
      },
      "timestamp": "2025-10-15 10:30:00"
    },
    {
      "id": 2,
      "file_name": "TranThiB_CV.pdf",
      "cv_info": {...},
      "timestamp": "2025-10-15 11:00:00"
    }
  ]
}
```

**Ý nghĩa:**
- ✅ Quản lý CVs đã upload
- ✅ Cho phép user chọn CV để analyze hoặc match jobs

---

### **`GET /cv/{cv_id}/insights`**

**Mục đích:**
- Phân tích chất lượng CV bằng AI
- Đánh giá điểm số: Quality, Market Fit, Completeness
- Tìm điểm mạnh/yếu

**Luồng xử lý:**
```
1. Check cache trong cv_insights table
2. Nếu có cache → return ngay
3. Nếu không → gọi Gemini AI để analyze
4. Calculate scores (0-10):
   - quality_score: Chất lượng tổng thể
   - market_fit_score: Phù hợp với thị trường
   - completeness_score: Đầy đủ thông tin
5. Extract strengths/weaknesses
6. Save vào cv_insights table (cache)
7. Return insights
```

**Request:**
```bash
curl http://localhost:9990/cv/1/insights
```

**Response:**
```json
{
  "quality_score": 8.5,
  "market_fit_score": 7.8,
  "completeness_score": 9.0,
  "strengths": [
    "Kỹ năng Python và FastAPI rất tốt, phù hợp với xu hướng backend hiện nay",
    "Kinh nghiệm 3 năm tại FPT Software cho thấy khả năng làm việc trong môi trường chuyên nghiệp",
    "Có học vấn tốt từ Đại học Bách Khoa Hà Nội"
  ],
  "weaknesses": [
    "Thiếu chứng chỉ chuyên môn (AWS, Docker, Kubernetes)",
    "Chưa có dự án cá nhân hoặc open-source contributions",
    "Thiếu kỹ năng mềm (leadership, communication)"
  ],
  "overall_assessment": "CV có chất lượng tốt với điểm mạnh về kỹ năng kỹ thuật. Cần bổ sung chứng chỉ và dự án cá nhân để tăng tính cạnh tranh."
}
```

**Ý nghĩa:**
- ✅ Giúp ứng viên hiểu rõ CV của mình
- ✅ Đưa ra đánh giá khách quan bằng AI
- ✅ Caching để tránh gọi LLM nhiều lần (tiết kiệm quota)

**Score Ratings:**
- 9-10: Xuất Sắc 🌟
- 7-8.9: Tốt ✅
- 5-6.9: Trung Bình ⚠️
- 3-4.9: Cần Cải Thiện ⚡
- 0-2.9: Yếu ❌

---

### **`POST /cv/improve?cv_id={cv_id}`**

**Mục đích:**
- Gợi ý cải thiện CV dựa trên AI analysis
- Đưa ra lời khuyên cụ thể theo từng category

**Luồng xử lý:**
```
1. Get CV info từ cv_store
2. Get insights từ cv_insights (hoặc generate mới)
3. Gọi Gemini AI để generate suggestions
4. Categorize suggestions:
   - Kỹ Năng (Skills)
   - Kinh Nghiệm (Experience)
   - Học Vấn (Education)
   - Định Dạng (Format)
   - Nội Dung (Content)
5. Assign priority: high, medium, low
6. Return suggestions list
```

**Request:**
```bash
curl -X POST "http://localhost:9990/cv/improve?cv_id=1"
```

**Response:**
```json
{
  "suggestions": [
    {
      "category": "Kỹ Năng",
      "priority": "high",
      "suggestion": "Thêm kỹ năng Docker và Kubernetes",
      "reason": "Các công ty IT hiện nay đều yêu cầu DevOps skills. 80% job postings cho Backend Developer có yêu cầu Docker.",
      "action": "Học Docker qua Udemy hoặc Docker Documentation, sau đó thêm vào CV"
    },
    {
      "category": "Kinh Nghiệm",
      "priority": "high",
      "suggestion": "Thêm metrics cụ thể vào mô tả công việc",
      "reason": "Thay vì 'Phát triển API', nên viết 'Phát triển 15+ REST APIs phục vụ 100K users/day'",
      "action": "Review lại các dự án và thêm số liệu cụ thể"
    },
    {
      "category": "Học Vấn",
      "priority": "medium",
      "suggestion": "Thêm chứng chỉ AWS hoặc Google Cloud",
      "reason": "Cloud certifications tăng 30% cơ hội được phỏng vấn",
      "action": "Thi AWS Certified Developer Associate"
    },
    {
      "category": "Định Dạng",
      "priority": "low",
      "suggestion": "Thêm link GitHub và LinkedIn",
      "reason": "Recruiters thường check GitHub để đánh giá kỹ năng thực tế",
      "action": "Thêm GitHub profile link vào phần contact"
    }
  ]
}
```

**Ý nghĩa:**
- ✅ Actionable advice (không chỉ nói chung chung)
- ✅ Có lý do cụ thể (data-driven)
- ✅ Phân loại theo priority để user biết làm gì trước

---

### **`DELETE /cv/{cv_id}`**

**Mục đích:**
- Xóa CV khỏi hệ thống
- Cleanup database và vector store

**Luồng xử lý:**
```
1. Delete từ cv_store table
2. Delete từ cv_insights table
3. Delete từ ChromaDB cv_collection
4. Delete related match_logs
5. Return success message
```

**Request:**
```bash
curl -X DELETE http://localhost:9990/cv/1
```

**Response:**
```json
{
  "message": "CV đã được xóa thành công"
}
```

---

## 🔍 **2. JOB MATCHING ENDPOINTS**

### **`POST /match`** ⭐ **PRIMARY ENDPOINT**

**Mục đích:**
- Tìm jobs phù hợp nhất với CV bằng Semantic Search + AI Ranking
- Đây là endpoint CHÍNH cho CV Analysis page

**Luồng xử lý:**
```
1. Get CV info từ cv_store
2. Extract skills + experience từ CV
3. Create search query: "Backend Developer with Python, FastAPI, 3 years experience"
4. ChromaDB semantic search → Top 50 similar jobs
5. Apply filters (location, salary, experience)
6. Rank jobs bằng Gemini AI (score 0-1)
7. Generate "why_match" explanation cho mỗi job
8. Cache top 20 jobs vào match_logs
9. Return top 5 jobs to frontend
```

**Request:**
```bash
curl -X POST http://localhost:9990/match \
  -H "Content-Type: application/json" \
  -d '{
    "cv_id": 1,
    "filters": {
      "location": "Hà Nội",
      "salary_min": 10000000,
      "experience": "2-3 năm"
    },
    "model": "gemini-2.5-flash"
  }'
```

**Response:**
```json
{
  "matched_jobs": [
    {
      "job_id": 123,
      "job_title": "Backend Developer",
      "company": "FPT Software",
      "salary": "15-20 triệu",
      "location": "Hà Nội",
      "experience": "2-3 năm",
      "match_score": 0.92,
      "why_match": "CV của bạn có kỹ năng Python và FastAPI phù hợp 95% với yêu cầu công việc. Kinh nghiệm 3 năm backend development tại FPT Software khớp hoàn toàn với mô tả. Công ty đang tìm người có kinh nghiệm microservices, đúng với background của bạn. Đây là cơ hội tốt để phát triển sự nghiệp với mức lương hấp dẫn 15-20 triệu.",
      "job_description": "Phát triển và maintain các REST APIs cho hệ thống e-commerce...",
      "candidate_requirements": "- 2-3 năm kinh nghiệm Python\n- Thành thạo FastAPI hoặc Django\n- Hiểu biết về microservices",
      "benefits": "- Lương 15-20 triệu\n- Thưởng 13th month\n- Bảo hiểm đầy đủ",
      "job_url": "https://www.topcv.vn/viec-lam/backend-developer-123"
    }
  ],
  "total": 20
}
```

**Ý nghĩa:**
- ✅ **Semantic Search:** Không chỉ match keywords, mà hiểu ngữ nghĩa (Python ≈ Backend ≈ API Development)
- ✅ **AI Ranking:** Gemini đánh giá độ phù hợp dựa trên toàn bộ CV và job description
- ✅ **Why Match:** Giải thích TẠI SAO job này phù hợp (transparency)
- ✅ **Caching:** Top 20 jobs được cache để user có thể "Xem Thêm" mà không cần gọi lại API

**So sánh với `/jobs/search`:**
- `/match`: Semantic search + AI ranking (cho CV Analysis)
- `/jobs/search`: Keyword search + SQL filters (cho Homepage search)

---

### **`POST /jobs/search`**

**Mục đích:**
- Tìm kiếm jobs theo keywords (cho Homepage)
- Simple search không cần CV

**Luồng xử lý:**
```
1. Get search query từ user
2. SQL LIKE query trên job_title, job_description
3. Apply filters (location, salary, experience)
4. Return jobs list
```

**Request:**
```bash
curl -X POST http://localhost:9990/jobs/search \
  -H "Content-Type: application/json" \
  -d '{
    "query": "Python Developer",
    "filters": {
      "location": "Hà Nội",
      "salary_min": 10000000
    }
  }'
```

**Response:**
```json
{
  "jobs": [
    {
      "job_id": 123,
      "job_title": "Python Developer",
      "company": "FPT Software",
      "salary": "15-20 triệu",
      "location": "Hà Nội"
    }
  ],
  "total": 45
}
```

**Ý nghĩa:**
- ✅ Fast keyword search
- ✅ Không cần CV
- ✅ Dùng cho Homepage search bar

---

## 📊 **3. JOB LISTING ENDPOINTS**

### **`GET /jobs`**

**Mục đích:**
- Lấy tất cả jobs trong database (3,237 jobs)
- Hiển thị trong Jobs Listing page

**Request:**
```bash
# Get all jobs
curl http://localhost:9990/jobs

# Get first 100 jobs
curl http://localhost:9990/jobs?limit=100
```

**Response:**
```json
{
  "jobs": [
    {
      "id": 1,
      "job_title": "Nhân Viên Thiết Kế",
      "company": "Công Ty TNHH MTV Thương Mại Dịch Vụ Tổng Hợp Hoàng Gia",
      "salary": "8 - 12 triệu",
      "location": "Hà Nội",
      "experience": "Không yêu cầu",
      "company_logo": "https://cdn-new.topcv.vn/unsafe/150x/https://static.topcv.vn/company_logos/...",
      "job_url": "https://www.topcv.vn/viec-lam/..."
    }
  ],
  "total": 3237
}
```

**Ý nghĩa:**
- ✅ Browse all jobs
- ✅ Pagination support
- ✅ Company logo từ database

---

### **`GET /jobs/{job_id}`**

**Mục đích:**
- Lấy chi tiết 1 job
- Hiển thị trong Job Details page

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
  "job_description": "Phát triển và maintain các REST APIs...",
  "candidate_requirements": "- 2-3 năm kinh nghiệm Python...",
  "benefits": "- Lương 15-20 triệu...",
  "salary": "15-20 triệu",
  "location": "Hà Nội",
  "experience": "2-3 năm",
  "deadline": "30/11/2024",
  "company_logo": "https://...",
  "company_scale": "1000+ nhân viên",
  "company_field": "IT - Phần mềm",
  "work_type": "Full-time",
  "job_url": "https://www.topcv.vn/..."
}
```

**Ý nghĩa:**
- ✅ Full job details
- ✅ Company information
- ✅ Apply button link

---

## 📈 **4. ANALYTICS ENDPOINTS**

### **`GET /jobs/analytics`**

**Mục đích:**
- Phân tích thị trường việc làm
- Aggregate data cho Dashboard charts

**Luồng xử lý:**
```
1. Query job_store table
2. Aggregate by:
   - job_title (top 10)
   - company (top 10)
   - location (top 10)
   - salary (distribution)
   - experience (distribution)
   - job_type (Full-time, Part-time, Remote)
3. Calculate statistics
4. Return JSON
```

**Request:**
```bash
curl http://localhost:9990/jobs/analytics
```

**Response:**
```json
{
  "top_job_titles": [
    {"title": "Nhân Viên Thiết Kế", "count": 57},
    {"title": "Nhân Viên Kinh Doanh", "count": 45}
  ],
  "top_companies": [
    {"company": "FPT Software", "count": 39},
    {"company": "Viettel", "count": 28}
  ],
  "salary_distribution": [
    {"salary": "10-15 triệu", "count": 450},
    {"salary": "15-20 triệu", "count": 380}
  ],
  "location_distribution": [
    {"location": "Hà Nội", "count": 1200},
    {"location": "TP.HCM", "count": 1100}
  ],
  "job_type_distribution": [
    {"type": "Full-time", "count": 2500},
    {"type": "Part-time", "count": 400},
    {"type": "Remote", "count": 337}
  ],
  "experience_distribution": [
    {"experience": "Không yêu cầu", "count": 800},
    {"experience": "1-2 năm", "count": 650}
  ]
}
```

**Ý nghĩa:**
- ✅ Market insights
- ✅ Trends analysis
- ✅ Data for 6 charts

---

### **`POST /jobs/analytics/insights`** ⭐ **NEW - LLM-POWERED**

**Mục đích:**
- Generate AI analysis cho dashboard charts
- Thay thế static text bằng dynamic LLM insights

**Luồng xử lý:**
```
1. Nhận chart_type + data từ frontend
2. Create prompt dựa trên chart_type
3. Call Gemini 2.5 Flash với API key rotation
4. Generate 3-4 câu phân tích
5. Return analysis text
```

**Request:**
```bash
curl -X POST http://localhost:9990/jobs/analytics/insights \
  -H "Content-Type: application/json" \
  -d '{
    "chart_type": "top_jobs",
    "data": [
      {"title": "Nhân Viên Thiết Kế", "count": 57},
      {"title": "Nhân Viên Kinh Doanh", "count": 45}
    ]
  }'
```

**Response:**
```json
{
  "analysis": "Vị trí Nhân Viên Thiết Kế đang dẫn đầu với 57 việc làm, cho thấy nhu cầu cao về nhân sự sáng tạo trong lĩnh vực marketing và branding. Nhân Viên Kinh Doanh và Marketing cũng rất hot với hơn 40 việc làm mỗi vị trí. Đây là cơ hội tốt cho ứng viên có kỹ năng thiết kế đồ họa, sales và digital marketing. Nên chuẩn bị portfolio chuyên nghiệp và kỹ năng mềm để tăng cơ hội được tuyển."
}
```

**Supported chart_type:**
1. `top_jobs` - Top 10 Vị Trí Tuyển Dụng
2. `top_companies` - Top 10 Công Ty
3. `location` - Phân Bố Địa Điểm
4. `job_type` - Loại Hình Công Việc
5. `experience` - Yêu Cầu Kinh Nghiệm
6. `salary` - Phân Bố Mức Lương

**Ý nghĩa:**
- ✅ Dynamic analysis (không hardcode)
- ✅ Context-aware insights
- ✅ Professional recommendations
- ✅ Uses API key rotation (avoid quota)

---

## 🔐 **5. UTILITY ENDPOINTS**

### **`GET /preview-doc/{file_id}`**

**Mục đích:**
- Serve PDF preview trong browser
- Inline display (không download)

**Request:**
```bash
curl http://localhost:9990/preview-doc/abc-123-def
```

**Response:**
- PDF binary data
- Header: `Content-Disposition: inline`

**Ý nghĩa:**
- ✅ Preview CV trong browser
- ✅ Không cần download

---

## 📝 **SUMMARY TABLE**

| Endpoint | Method | Purpose | Used In |
|----------|--------|---------|---------|
| `/upload-cv` | POST | Upload & parse CV | CV Analysis |
| `/cvs` | GET | List all CVs | Dashboard |
| `/cv/{cv_id}/insights` | GET | AI CV analysis | CV Analysis |
| `/cv/improve` | POST | Improvement suggestions | CV Analysis |
| `/match` | POST | **Semantic job matching** | **CV Analysis** |
| `/jobs/search` | POST | Keyword search | Homepage |
| `/jobs` | GET | List all jobs | Jobs Listing |
| `/jobs/{job_id}` | GET | Job details | Job Details |
| `/jobs/analytics` | GET | Market analytics | Dashboard |
| `/jobs/analytics/insights` | POST | **LLM chart analysis** | **Dashboard** |
| `/preview-doc/{file_id}` | GET | PDF preview | CV Analysis |

---

**Version:** 1.0.0  
**Last Updated:** 2025-10-15

