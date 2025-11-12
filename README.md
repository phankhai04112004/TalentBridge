<div align="center">

<img src="logo.png" alt="TalentBridge Logo" width="200" style="margin-bottom: 20px"/>
# 🎯 TalentBridge

### *Nền Tảng Tìm Việc Thông Minh Cho Sinh Viên*

[![Python](https://img.shields.io/badge/Python-3.12+-3776AB?style=for-the-badge&logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-009688?style=for-the-badge&logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Google Gemini](https://img.shields.io/badge/Google_Gemini-8E75B2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![ChromaDB](https://img.shields.io/badge/ChromaDB-FF6F00?style=for-the-badge&logo=database&logoColor=white)](https://www.trychroma.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

<img src="https://raw.githubusercontent.com/Tarikul-Islam-Anik/Animated-Fluent-Emojis/master/Emojis/Objects/Briefcase.png" alt="Briefcase" width="150" />

**Sử dụng AI để phân tích CV, gợi ý việc làm phù hợp và đánh giá chất lượng hồ sơ**

[🚀 Demo](#-demo) • [✨ Tính Năng](#-tính-năng) • [📦 Cài Đặt](#-cài-đặt) • [📖 Tài Liệu](#-tài-liệu) • [🤝 Đóng Góp](#-đóng-góp)

---

</div>

## 📋 Mục Lục

- [Giới Thiệu](#-giới-thiệu)
- [Tính Năng](#-tính-năng)
- [Công Nghệ](#-công-nghệ)
- [Kiến Trúc Hệ Thống](#-kiến-trúc-hệ-thống)
- [Cài Đặt](#-cài-đặt)
- [Sử Dụng](#-sử-dụng)
- [API Documentation](#-api-documentation)
- [Tài Liệu](#-tài-liệu)
- [Screenshots](#-screenshots)
- [Roadmap](#-roadmap)
- [Đóng Góp](#-đóng-góp)
- [License](#-license)

---

## 🎯 Giới Thiệu

**TalentBridge** là nền tảng tìm việc làm thông minh được xây dựng đặc biệt cho sinh viên Việt Nam. Sử dụng sức mạnh của **Google Gemini AI** và **Semantic Search**, TalentBridge giúp sinh viên:

- 🤖 **Phân tích CV tự động** - Upload PDF và AI sẽ đọc, hiểu toàn bộ nội dung
- 🎯 **Gợi ý việc làm phù hợp** - Tìm công việc match với kỹ năng và kinh nghiệm
- 📊 **Đánh giá chất lượng CV** - AI chấm điểm và đưa ra lời khuyên cải thiện
- 📈 **Phân tích thị trường** - Thống kê xu hướng tuyển dụng và insights

### 🌟 Điểm Đặc Biệt

- ✅ **100% Tự Động** - Không cần nhập tay thông tin CV
- ✅ **AI Thông Minh** - Sử dụng Google Gemini 2.5 Flash
- ✅ **Semantic Search** - Tìm việc theo nghĩa, không chỉ từ khóa
- ✅ **Tiếng Việt** - Giao diện và nội dung hoàn toàn tiếng Việt
- ✅ **3,237 Công Việc** - Dữ liệu thực tế từ TopCV

---

## ✨ Tính Năng

### 🤖 1. Phân Tích CV Thông Minh

- **Upload PDF** - Kéo thả hoặc chọn file CV
- **AI Parse** - Gemini AI tự động đọc và trích xuất thông tin
- **Structured Data** - Chuyển đổi sang JSON với đầy đủ thông tin:
  - Thông tin cá nhân (tên, email, phone)
  - Kỹ năng (skills)
  - Học vấn (education)
  - Kinh nghiệm (experience)
  - Mục tiêu nghề nghiệp (career objective)

### 📊 2. Đánh Giá Chất Lượng CV

- **3 Điểm Số Chính:**
  - 🎯 **Quality Score** (0-10) - Chất lượng tổng thể
  - 💼 **Market Fit Score** (0-10) - Phù hợp với thị trường
  - ✅ **Completeness Score** (0-10) - Đầy đủ thông tin

- **Phân Tích Chi Tiết:**
  - ✅ **Điểm Mạnh** - Những gì bạn làm tốt
  - ⚠️ **Điểm Yếu** - Những gì cần cải thiện
  - 💡 **Gợi Ý** - Lời khuyên cụ thể từ AI

### 🎯 3. Tìm Việc Phù Hợp (Semantic Matching)


- **Semantic Search** - Tìm kiếm theo nghĩa với ChromaDB
- **AI Ranking** - Gemini AI xếp hạng độ phù hợp (0-100%)
- **Smart Filters:**
  - 📍 Địa điểm (Hà Nội, HCM, Đà Nẵng...)
  - 💰 Mức lương (10-50 triệu)
  - 📅 Kinh nghiệm (0-5+ năm)
  - 💼 Loại công việc (Full-time, Part-time, Remote)

- **Giải Thích AI** - "Tại sao công việc này phù hợp với bạn?"

### 📈 4. Dashboard Analytics


- **6 Biểu Đồ Thống Kê:**
  - 📊 Top 10 Vị Trí Tuyển Dụng
  - 🏢 Top 10 Công Ty Tuyển Dụng
  - 📍 Phân Bố Địa Điểm
  - 💼 Loại Công Việc
  - 📅 Yêu Cầu Kinh Nghiệm
  - 💰 Phân Bố Mức Lương

- **AI Insights** - Phân tích xu hướng và gợi ý cho sinh viên

### 🔍 5. Tìm Kiếm & Lọc Việc Làm

- **3,237 Công Việc** thực tế từ TopCV
- **Tìm Kiếm Nâng Cao** - Theo từ khóa, địa điểm, lương
- **Pagination** - 20 jobs/page
- **Sort** - Theo mới nhất, lương, deadline

---

## 🛠️ Công Nghệ

### Backend Stack

| Công Nghệ | Phiên Bản | Mục Đích |
|-----------|-----------|----------|
| ![Python](https://img.shields.io/badge/Python-3.12+-3776AB?logo=python&logoColor=white) | 3.12+ | Ngôn ngữ chính |
| ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688?logo=fastapi&logoColor=white) | Latest | Web framework (async) |
| ![Uvicorn](https://img.shields.io/badge/Uvicorn-Latest-499848?logo=gunicorn&logoColor=white) | Latest | ASGI server |
| ![Google Gemini](https://img.shields.io/badge/Gemini_2.5_Flash-Latest-8E75B2?logo=google&logoColor=white) | 2.5 Flash | LLM - Parse, Analyze, Rank |
| ![ChromaDB](https://img.shields.io/badge/ChromaDB-Latest-FF6F00?logo=database&logoColor=white) | Latest | Vector database |
| ![SQLite](https://img.shields.io/badge/SQLite-3.x-003B57?logo=sqlite&logoColor=white) | 3.x | Relational database |
| ![LangChain](https://img.shields.io/badge/LangChain-Latest-121212?logo=chainlink&logoColor=white) | Latest | RAG framework |
| ![Pydantic](https://img.shields.io/badge/Pydantic-V2-E92063?logo=pydantic&logoColor=white) | V2 | Data validation |

### Frontend Stack

| Công Nghệ | Mục Đích |
|-----------|----------|
| ![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black) | Logic (Vanilla JS) |
| ![Chart.js](https://img.shields.io/badge/Chart.js-4.4.0-FF6384?logo=chartdotjs&logoColor=white) | Biểu đồ thống kê |
| ![PDF.js](https://img.shields.io/badge/PDF.js-Latest-FF0000?logo=adobe&logoColor=white) | Preview PDF |
| ![Bootstrap](https://img.shields.io/badge/Bootstrap-5-7952B3?logo=bootstrap&logoColor=white) | UI components |

### AI Models

- **🤖 Gemini 2.5 Flash** (`gemini-2.5-flash`)
  - Parse CV từ PDF → JSON
  - Phân tích chất lượng CV
  - Ranking jobs (score 0-1)
  - Giải thích "Tại sao phù hợp"
  - Phân tích biểu đồ dashboard

- **🔍 Gemini Embedding** (`text-embedding-004`)
  - Tạo vector 768 chiều
  - Semantic search jobs
  - Cosine similarity matching

---

## 🏗️ Kiến Trúc Hệ Thống

```
┌─────────────────────────────────────────────────────────────┐
│                        FRONTEND                             │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐   │
│  │  index   │  │ cv-analysis│ │  jobs    │  │dashboard │   │
│  │  .html   │  │   .html    │ │_new.html │  │  .html   │   │
│  └────┬─────┘  └─────┬──────┘  └────┬─────┘  └────┬─────┘   │
│       │              │              │             │         │
│       └──────────────┴──────────────┴─────────────┘         │
│                          │                                  │
│                    Fetch API (HTTP)                         │
└──────────────────────────┼──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│                    FASTAPI BACKEND                          │
│  ┌────────────────────────────────────────────────────┐     │
│  │  api/main.py - 15+ REST API Endpoints             │     │
│  │  • POST /upload-cv                                 │     │
│  │  • GET /cv/{cv_id}/insights                        │     │
│  │  • POST /match (Semantic Matching)                 │     │
│  │  • GET /jobs, /jobs/{job_id}                       │     │
│  │  • GET /jobs/analytics                             │     │
│  └────┬───────────────────────────┬────────────────┬──┘     │
│       │                           │                │        │
│  ┌────▼─────┐  ┌─────────────────▼──┐  ┌─────────▼──────┐ │
│  │ AI       │  │ LangChain         │  │ Database       │ │
│  │ Analysis │  │ Utils             │  │ Utils          │ │
│  │          │  │ (RAG + Matching)  │  │                │ │
│  └────┬─────┘  └─────────┬─────────┘  └────┬───────────┘ │
└───────┼──────────────────┼─────────────────┼──────────────┘
        │                  │                 │
┌───────▼──────┐  ┌────────▼────────┐  ┌────▼──────────────┐
│ Google       │  │ ChromaDB        │  │ SQLite            │
│ Gemini AI    │  │ Vector Store    │  │ cv_job_matching.db│
│              │  │                 │  │                   │
│ • Parse CV   │  │ • 3,237 jobs    │  │ • cv_store        │
│ • Analyze    │  │ • 768-dim       │  │ • job_store       │
│ • Rank       │  │   embeddings    │  │ • cv_insights     │
│ • Explain    │  │ • Semantic      │  │ • match_logs      │
│              │  │   search        │  │ • applications    │
└──────────────┘  └─────────────────┘  └───────────────────┘
```

---

## 📦 Cài Đặt

### Yêu Cầu Hệ Thống

- Python 3.12 trở lên
- 4GB RAM (khuyến nghị 8GB)
- 2GB dung lượng ổ cứng

### Bước 1: Clone Repository

```bash
git clone https://github.com/Trinhvhao/TalentBridge.git
cd TalentBridge
```

### Bước 2: Tạo Virtual Environment

```bash
# Windows
python -m venv rag_env
rag_env\Scripts\activate

# Linux/Mac
python3 -m venv rag_env
source rag_env/bin/activate
```

### Bước 3: Cài Đặt Dependencies

```bash
pip install -r requirements.txt
```

### Bước 4: Setup API Keys

Tạo file `.env` trong thư mục gốc:

```bash
# 3 API keys để tránh quota limit (150 requests/day thay vì 50)
GOOGLE_API_KEY_1=AIzaSy...
GOOGLE_API_KEY_2=AIzaSy...
GOOGLE_API_KEY_3=AIzaSy...
```

**Lấy API Key:**
1. Truy cập https://aistudio.google.com/apikey
2. Tạo 3 API keys (miễn phí)
3. Copy vào file `.env`

### Bước 5: Chạy Server

```bash
python main.py
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
✅ Preloading completed
INFO:     Application startup complete.
```

### Bước 6: Truy Cập Ứng Dụng

- **Frontend**: Mở `frontend/index.html` trong browser (hoặc dùng Live Server)
- **API Docs**: http://localhost:9990/docs
- **API Base URL**: http://localhost:9990

---

## 🚀 Sử Dụng

### 1. Upload & Phân Tích CV

```bash
# Mở trang cv-analysis.html
1. Kéo thả file CV.pdf vào khung upload
2. Click "Upload CV"
3. Xem thông tin được AI parse tự động
4. Click "Phân Tích CV" để xem điểm số
5. Click "Gợi Ý Cải Thiện" để nhận lời khuyên
```

### 2. Tìm Việc Phù Hợp

```bash
# Sau khi upload CV
1. Click "Tìm Việc Phù Hợp"
2. Chọn filters (location, salary, experience)
3. Xem top 5 jobs matched với % phù hợp
4. Đọc "Tại sao phù hợp" do AI giải thích
5. Click "Xem Chi Tiết" hoặc "Ứng Tuyển"
```

### 3. Xem Dashboard

```bash
# Mở dashboard.html
1. Xem 6 biểu đồ thống kê thị trường
2. Click "Phân Tích AI" trên mỗi biểu đồ
3. Đọc insights và gợi ý từ AI
```

---

## 📖 API Documentation

### Swagger UI

Truy cập http://localhost:9990/docs để xem API documentation đầy đủ với Swagger UI.

### Endpoints Chính

| Method | Endpoint | Mô Tả |
|--------|----------|-------|
| `POST` | `/upload-cv` | Upload và parse CV |
| `GET` | `/cvs` | Lấy danh sách CVs |
| `GET` | `/cv/{cv_id}/insights` | Phân tích CV |
| `POST` | `/cv/improve` | Gợi ý cải thiện CV |
| `POST` | `/match` | ⭐ Tìm việc phù hợp (Semantic) |
| `POST` | `/jobs/search` | Tìm kiếm jobs theo từ khóa |
| `GET` | `/jobs` | Lấy danh sách jobs |
| `GET` | `/jobs/{job_id}` | Chi tiết job |
| `GET` | `/jobs/analytics` | Thống kê thị trường |
| `POST` | `/jobs/analytics/insights` | AI phân tích biểu đồ |

**Chi tiết:** Xem [docs/API_ENDPOINTS_GUIDE.md](docs/API_ENDPOINTS_GUIDE.md)

---

## 📚 Tài Liệu

- 📘 [API Endpoints Guide](docs/API_ENDPOINTS_GUIDE.md) - Hướng dẫn chi tiết tất cả API endpoints
- 📗 [Project Documentation](docs/PROJECT_DOCUMENTATION.md) - Tài liệu kỹ thuật đầy đủ

---

## 🎓 Roadmap

- [ ] **Authentication** - Login/Register với JWT
- [ ] **Chatbot Tư Vấn** - AI chatbot tư vấn nghề nghiệp
- [ ] **Recommendation System** - Gợi ý jobs dựa trên lịch sử
- [ ] **Email Notifications** - Thông báo jobs mới
- [ ] **Mobile App** - React Native app
- [ ] **Deploy Cloud** - AWS/GCP deployment
- [ ] **Multi-language** - English support

---

## 🤝 Đóng Góp

Contributions, issues và feature requests đều được chào đón!

1. Fork repository
2. Tạo branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Mở Pull Request

---

## 📄 License

Distributed under the MIT License. See `LICENSE` for more information.

---

## 👨‍💻 Tác Giả

**Phan Xuân Khải**

- GitHub: [@phankhai04112004
](https://github.com/phankhai04112004)
- Email: pkhai7444@gmail.com
---

## 🙏 Acknowledgments

- [Google Gemini AI](https://ai.google.dev/) - AI models
- [FastAPI](https://fastapi.tiangolo.com/) - Web framework
- [ChromaDB](https://www.trychroma.com/) - Vector database
- [LangChain](https://www.langchain.com/) - RAG framework
- [TopCV](https://www.topcv.vn/) - Job data source

---

<div align="center">

**⭐ Nếu project này hữu ích, hãy cho một star nhé! ⭐**

Made with ❤️ by [Phan Xuân Khải]

</div>
