"""
Simple HTTP Server for Frontend
Serves static files from the frontend directory
"""

import http.server
import socketserver
import os

PORT = 8000
DIRECTORY = "frontend"

class MyHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=DIRECTORY, **kwargs)
    
    def end_headers(self):
        # Add CORS headers
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type')
        super().end_headers()
    
    def do_OPTIONS(self):
        self.send_response(200)
        self.end_headers()

if __name__ == "__main__":
    # Check if frontend directory exists
    if not os.path.exists(DIRECTORY):
        print(f"❌ Error: Directory '{DIRECTORY}' not found!")
        exit(1)
    
    # Start server
    with socketserver.TCPServer(("", PORT), MyHTTPRequestHandler) as httpd:
        print("=" * 60)
        print(f"✅ Frontend server running at http://localhost:{PORT}")
        print(f"📁 Serving files from: {DIRECTORY}/")
        print("=" * 60)
        print(f"\n🌐 Access pages:")
        print(f"   - Home:        http://localhost:{PORT}/index.html")
        print(f"   - Jobs:        http://localhost:{PORT}/jobs.html")
        print(f"   - CV Analysis: http://localhost:{PORT}/cv-analysis.html")
        print(f"   - Dashboard:   http://localhost:{PORT}/dashboard.html")
        print("\n💡 Press Ctrl+C to stop the server\n")
        print("=" * 60)
        
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n\n👋 Server stopped.")

