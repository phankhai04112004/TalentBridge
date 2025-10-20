"""
TalentBridge - Main Entry Point
Tự động khởi chạy FastAPI server với Uvicorn trên port 9990
"""
import uvicorn
import os
import sys

if __name__ == "__main__":
    # Thêm thư mục api vào Python path
    api_dir = os.path.join(os.path.dirname(__file__), "api")
    if api_dir not in sys.path:
        sys.path.insert(0, api_dir)
    
    print("=" * 60)
    print("🚀 TalentBridge - Nền Tảng Tìm Việc Thông Minh")
    print("=" * 60)
    print("📍 Server đang khởi động...")
    print("🌐 URL: http://localhost:9990")
    print("📚 API Docs: http://localhost:9990/docs")
    print("=" * 60)
    
    # Chạy uvicorn với cấu hình
    uvicorn.run(
        "api.main:app",
        host="0.0.0.0",
        port=9990,
        reload=True,  # Auto-reload khi code thay đổi
        log_level="info"
    )

