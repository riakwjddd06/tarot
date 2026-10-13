
"""POST /api/reading — 1차 기본 리딩 (Vercel Python Serverless Function)"""

import os
import sys
from http.server import BaseHTTPRequestHandler

# 같은 폴더의 공용 모듈(_core.py)을 불러옵니다.
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import _core  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        _core.serve_post(self, _core.run_reading)

    def do_GET(self):
        _core.send_json(self, 405, {
            "success": False,
            "error": "POST 요청만 사용할 수 있습니다.",
        })