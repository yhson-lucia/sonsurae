#!/bin/bash
# ────────────────────────────────────────────────────────────
# docs/system 동기화 필요 알림 hook
#
# Edit/Write 도구로 코드 파일이 변경되면, 어떤 docs/system 파일을
# 갱신해야 하는지 알려주는 알림 스크립트입니다.
#
# 자동 갱신은 하지 않고 알림만 출력합니다.
# 실제 갱신은 docs-writer 에이전트가 담당합니다.
# ────────────────────────────────────────────────────────────

CHANGED="${CLAUDE_FILE_PATHS:-}"

# 변경된 파일 없으면 즉시 종료
[ -z "$CHANGED" ] && exit 0

# docs/system 자체를 갱신 중이면 알림 불필요 (피로도 방지)
if echo "$CHANGED" | grep -qE 'docs/system/'; then
  exit 0
fi

# 갱신 필요 파일 추적
NEEDS=()

# src/app/**/page.tsx 변경 → pages.md
if echo "$CHANGED" | grep -qE 'src/app/.*page\.tsx'; then
  NEEDS+=("docs/system/pages.md  (페이지 카탈로그)")
fi

# src/components/**/*.tsx 변경 → components.md
if echo "$CHANGED" | grep -qE 'src/components/.*\.tsx'; then
  NEEDS+=("docs/system/components.md  (컴포넌트 카탈로그)")
fi

# Server Action / Supabase / 타입 → data-flow.md
if echo "$CHANGED" | grep -qE '(src/app/.*actions\.ts|src/lib/supabase/|src/types/)'; then
  NEEDS+=("docs/system/data-flow.md  (DB/API 흐름)")
fi

# 설정/외부 서비스 → integrations.md
if echo "$CHANGED" | grep -qE '(src/lib/config/business\.ts|next\.config\.ts|\.env\.local\.example|package\.json)'; then
  NEEDS+=("docs/system/integrations.md  (외부 통합)")
fi

# 에이전트/커맨드/워크플로우 → overview.md + CLAUDE.md
if echo "$CHANGED" | grep -qE '\.claude/(agents|commands|workflows)/'; then
  NEEDS+=("docs/system/overview.md + CLAUDE.md  (에이전트/커맨드 표)")
fi

# 알림 출력
if [ ${#NEEDS[@]} -gt 0 ]; then
  echo ""
  echo "📝 [Doc Sync Reminder] 코드가 변경되었습니다. 다음 문서 갱신 검토:"
  for n in "${NEEDS[@]}"; do
    echo "   • $n"
  done
  echo "   → 작업 마무리 시 docs-writer 에이전트 호출 권장"
  echo ""
fi

exit 0
