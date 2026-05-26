-- 손수레 시드 데이터
--
-- 실행 시점: supabase migration 적용 직후 (db reset 시 자동 실행됨)
-- 멱등적: ON CONFLICT 로 재실행해도 안전.
--
-- 채우는 것: 국제보건 카테고리 10개 (최상위)
-- 채우지 않는 것: profiles (사용자 회원가입 후 별도), posts/images (마이그레이션 스크립트가)

-- ============================================================
-- 1. 최상위 카테고리 (10개)
-- ============================================================

insert into public.categories (slug, name, description, icon, color, parent_category_id, sort_order) values
  ('epidemiology',       '역학',           '역학 연구 설계, 바이오통계, 인과추론.',             '🔬', 'emerald', null, 10),
  ('health-policy',      '보건정책',        '보건의료 정책, 거버넌스, 글로벌 규범.',             '📋', 'blue',    null, 20),
  ('health-systems',     '보건시스템',      '보건의료 체계, 서비스 전달, 인력.',                 '🏥', 'sky',     null, 30),
  ('infectious-disease', '감염병',          '감염병 역학, 예방, 대응 및 관리.',                  '🦠', 'red',     null, 40),
  ('maternal-child',     '모자보건',        '모성 보건, 아동 보건, 생애 초기 건강.',             '👶', 'pink',    null, 50),
  ('nutrition',          '영양',            '영양 역학, 식이 정책, 영양 중재.',                  '🥗', 'lime',    null, 60),
  ('environmental-health','환경보건',       '환경 위해 요인, 기후변화와 건강.',                  '🌿', 'green',   null, 70),
  ('health-economics',   '보건경제',        '의료 재정, 비용-효과 분석, 건강보험.',              '💰', 'amber',   null, 80),
  ('research-methods',   '연구방법론',      '정량·정성 연구, 체계적 문헌고찰, 근거 합성.',       '📊', 'violet',  null, 90),
  ('global-health',      '글로벌보건이슈',  'SDGs, 보건 형평성, 국제 보건 기구.',               '🌍', 'cyan',    null, 100)
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  icon        = excluded.icon,
  color       = excluded.color,
  sort_order  = excluded.sort_order;
