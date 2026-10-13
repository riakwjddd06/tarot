
import json

from app import parse_reading_response


# =====================================
# 1. 정상적인 JSON 테스트
# =====================================

sample = {
    "past": "과거에는 안정적인 관계를 중요하게 생각했습니다.",
    "present": "현재는 자신의 선택과 의지가 중요합니다.",
    "future": "앞으로 새로운 변화가 나타날 가능성을 생각해 볼 수 있습니다.",
    "summary": "안정에서 변화로 이어지는 흐름입니다.",
    "advice": "자신이 원하는 관계의 기준을 정리해 보세요."
}

answer = json.dumps(sample, ensure_ascii=False)

result = parse_reading_response(answer)

print("[정상 JSON 테스트]")

for key, value in result.items():
    print(f"{key}: {value}")

assert result == sample

print("정상 JSON 테스트 통과!")


# =====================================
# 2. 누락된 항목 테스트
# =====================================

invalid_sample = {
    "past": "과거 해석",
    "present": "현재 해석",
    "future": "미래 해석",
    "summary": "종합 해석"
}

print("\n[누락된 항목 테스트]")

try:
    parse_reading_response(
        json.dumps(invalid_sample, ensure_ascii=False)
    )
except ValueError:
    print("누락된 항목을 정상적으로 감지했습니다.")
else:
    raise AssertionError("누락된 항목 검증 실패")


# =====================================
# 3. 잘못된 JSON 테스트
# =====================================

print("\n[잘못된 JSON 테스트]")

try:
    parse_reading_response("이것은 JSON이 아닙니다.")
except ValueError:
    print("잘못된 JSON을 정상적으로 감지했습니다.")
else:
    raise AssertionError("JSON 형식 검증 실패")


# =====================================
# 4. 빈 응답 테스트
# =====================================

print("\n[빈 응답 테스트]")

try:
    parse_reading_response("")
except ValueError:
    print("빈 응답을 정상적으로 감지했습니다.")
else:
    raise AssertionError("빈 응답 검증 실패")


print("\n모든 JSON 테스트 통과!")
