"""
Script to reset databases (ChromaDB and SQLite)
"""
import os
import shutil
import logging

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

def reset_databases():
    """Xóa toàn bộ database cũ"""
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    
    # Xóa ChromaDB
    chroma_path = os.path.join(base_dir, "db", "chroma_db")
    if os.path.exists(chroma_path):
        try:
            shutil.rmtree(chroma_path)
            logging.info(f"✅ Đã xóa ChromaDB: {chroma_path}")
        except Exception as e:
            logging.error(f"❌ Lỗi khi xóa ChromaDB: {e}")
    else:
        logging.info("ChromaDB không tồn tại")
    
    # Xóa SQLite
    sqlite_path = os.path.join(base_dir, "db", "cv_job_matching.db")
    if os.path.exists(sqlite_path):
        try:
            os.remove(sqlite_path)
            logging.info(f"✅ Đã xóa SQLite: {sqlite_path}")
        except Exception as e:
            logging.error(f"❌ Lỗi khi xóa SQLite: {e}")
    else:
        logging.info("SQLite database không tồn tại")
    
    # Tạo lại thư mục db
    db_dir = os.path.join(base_dir, "db")
    os.makedirs(db_dir, exist_ok=True)
    logging.info(f"✅ Đã tạo lại thư mục db: {db_dir}")
    
    logging.info("🎉 Reset database hoàn tất!")

if __name__ == "__main__":
    reset_databases()

