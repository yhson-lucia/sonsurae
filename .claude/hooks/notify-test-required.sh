#!/bin/bash
# ────────────────────────────────────────────────────────────
# 테스트 작성 의무 알림 hook
#
# 코드 변경 시 test-writer 호출이 필요한지 감지하고,
# 해당 영역에 .test.ts(x) 파일이 없으면 알림을 출력합니다.
#
# 자동 실행은 하지 않음. 알림만 출력 → 메인 AI/사용자가 판단.
# ────────────────────────────────────────────────────────────

CHANGED="${CLAUDE_FILE_PATHS:-}"
[ -z "$CHANGED" ] && exit 0

# 테스트 파일 자체 변경은 알림 불필요 (피로도 방지)
if echo "$CHANGED" | grep -qE '\.test\.(ts|tsx|js|jsx)$'; then
  exit 0
fi

NEEDS=()

# Server Action 변경 → 테스트 필수
if echo "$CHANGED" | grep -qE 'src/app/.*actions\.ts'; then
  NEEDS+=("Server Action 변경 — actions.test.ts 작성/갱신 의무")
fi

# src/lib 단위 함수 변경 → 테스트 필수
if echo "$CHANGED" | grep -qE 'src/lib/.*\.(ts|tsx)$' && ! echo "$CHANGED" | grep -qE 'src/lib/data/'; then
  NEEDS+=("src/lib 단위 함수 변경 — 단위 테스트 의무")
fi

# 인증 관련 변경 → 테스트 + E2E 권장
if echo "$CHANGED" | grep -qE '(middleware\.ts|src/lib/auth/|src/app/admin/login|src/app/admin/logout)'; then
  NEEDS+=("⚠️ 인증/인가 코드 변경 — 통합 테스트 의무 + E2E 권장 (무한 redirect 같은 흐름 버그 방지)")
fi

# 알림 출력
if [ ${#NEEDS[@]} -gt 0 ]; then
  echo ""
  echo "🧪 [Test Required] 코드 변경에 따른 테스트 작성 의무:"
  for n in "${NEEDS[@]}"; do
    echo "   • $n"
  done
  echo "   → test-writer 에이전트 호출 + npm test 통과 후 진행"
  echo ""
fi

exit 0
