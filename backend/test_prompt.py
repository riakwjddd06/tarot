
from app import build_prompt, validate_request

test_data = {
    "category": "연애",
    "question": "앞으로 연애를 할 때 어떤 점을 중요하게 생각하면 좋을까요?",
    "cards": [
        "major-03",
        "major-07",
        "major-16"
    ]
}

print("[1. 입력 검증]")

error = validate_request(test_data)

if error:
    print("실패:", error)
    raise SystemExit(1)

print("통과")

print("\n[2. 프롬프트 생성]")

prompt = build_prompt(
    test_data["category"],
    test_data["question"],
    test_data["cards"]
)

print("프롬프트 생성 완료")
print("전체 길이:", len(prompt), "글자")

print("\n[3. 필수 정보 확인]")

checks = {
    "고민 분야": "연애" in prompt,
    "상세 질문": test_data["question"] in prompt,
    "과거 카드": "과거 카드: 여황제" in prompt,
    "현재 카드": "현재 카드: 전차" in prompt,
    "미래 카드": "미래 카드: 탑" in prompt,
    "종합 리딩 항목": '"summary"' in prompt,
    "조언 항목": '"advice"' in prompt
}

for name, passed in checks.items():
    result = "통과" if passed else "실패"
    print(f"{name}: {result}")

if all(checks.values()):
    print("\n모든 테스트 통과!")
else:
    print("\n일부 테스트 실패")
    raise SystemExit(1)
