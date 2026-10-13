
"""
로컬 개발용 Flask 서버

배포(Vercel)에서는 api/ 폴더의 서버리스 함수가 같은 일을 합니다.
검증, 프롬프트, AI 호출 로직은 api/_core.py 한 곳에만 있고
이 파일은 그것을 로컬에서 http://127.0.0.1:5001 로 열어 주는 얇은 껍데기입니다.

실행: (프로젝트 루트에서)
    python backend/app.py
"""

import os
import sys

from flask import Flask, jsonify, request
from flask_cors import CORS

sys.path.insert(0, os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "api"))

import _core  # noqa: E402

# 기존 진단 스크립트(diagnose.py, test_prompt.py 등)가 쓰던 이름을 그대로 쓸 수 있게 열어 둡니다.
build_prompt = _core.build_prompt
build_deep_prompt = _core.build_deep_prompt
validate_request = _core.validate_request
parse_reading_response = _core.parse_reading_response
MODEL = _core.get_model()
client = _core.get_client()

app = Flask(__name__)

# 개발 중 Vite(5173)에서 오는 요청만 허용합니다.
CORS(
    app,
    resources={
        r"/api/*": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"]
        }
    },
)

app.config["MAX_CONTENT_LENGTH"] = _core.MAX_BODY_BYTES


def respond(result):
    status, payload = result
    return jsonify(payload), status


@app.errorhandler(413)
def too_large(_error):
    return jsonify({"success": False, "error": "요청 내용이 너무 큽니다."}), 413


@app.get("/api/health")
def health():
    return respond(_core.health())


@app.post("/api/reading")
def reading():
    return respond(_core.run_reading(request.get_json(silent=True)))


@app.post("/api/deep-reading")
def deep_reading():
    return respond(_core.run_deep_reading(request.get_json(silent=True)))


if __name__ == "__main__":
    print("[타로 AI 서버 시작] http://127.0.0.1:5001")
    app.run(host="127.0.0.1", port=5001, debug=False)