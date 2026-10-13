
"""GET /api/health — 서버와 AI 설정 상태 확인 (키 값은 노출하지 않음)"""

import os
import sys
from http.server import BaseHTTPRequestHandler

sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

import _core  # noqa: E402


class handler(BaseHTTPRequestHandler):
    def do_GET(self):
        status, payload = _core.health()
        _core.send_json(self, status, payload)