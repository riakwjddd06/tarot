
import os
from pathlib import Path

from dotenv import load_dotenv
from openai import OpenAI

# backend/.env 파일 불러오기
env_path = Path(__file__).resolve().parent / ".env"
load_dotenv(env_path)

api_key = os.getenv("CODYSSEY_API_KEY")
base_url = os.getenv("CODYSSEY_BASE_URL")
model = os.getenv("CODYSSEY_MODEL")

# 필수 설정 확인
if not api_key or not base_url or not model:
    raise ValueError(
        "API 설정이 부족합니다. backend/.env 파일을 확인하세요."
    )

# Codyssey OpenAI 호환 API 연결
client = OpenAI(
    api_key=api_key,
    base_url=base_url,
    timeout=30.0,
    max_retries=0,
)

print("[Codyssey API 연결 테스트 시작]")

try:
    response = client.chat.completions.create(
        model=model,
        messages=[
            {
                "role": "system",
                "content": "당신은 한국어로 답변하는 AI입니다."
            },
            {
                "role": "user",
                "content": "안녕하세요. 연결 테스트입니다. 짧게 인사해 주세요."
            }
        ],
        max_tokens=100,
    )

    answer = response.choices[0].message.content

    print("\n[AI 응답]")
    print(answer or "(텍스트 응답 없음)")
    print("\nAPI 요청 완료")


except Exception as error:
    print("\n[API 연결 오류]")
    print("오류 종류:", type(error).__name__)

    status_code = getattr(error, "status_code", None)

    if status_code is not None:
        print("HTTP 상태 코드:", status_code)

    if status_code == 401:
        print("인증 실패: API 키 또는 인증 방식을 확인하세요.")
    elif status_code == 403:
        print("접근 거부: API 사용 권한을 확인하세요.")
    elif status_code == 429:
        print("요청 제한: API 사용 한도를 확인하세요.")
    else:
        print("API 설정 또는 서버 연결 상태를 확인하세요.")

