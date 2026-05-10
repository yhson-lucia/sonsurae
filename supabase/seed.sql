-- 손수레 시드 데이터
--
-- 실행 시점: supabase migration 적용 직후 (db reset 시 자동 실행됨)
-- 멱등적: ON CONFLICT 로 재실행해도 안전.
--
-- 채우는 것: 카테고리 20개 (부모 11 + 자식 9 — migration-temp/MAPPING.md 기준)
-- 채우지 않는 것: profiles (사용자 회원가입 후 별도), posts/images (마이그레이션 스크립트가)

-- ============================================================
-- 1. 부모 카테고리 (11개)
-- ============================================================

insert into public.categories (slug, name, description, icon, color, parent_category_id, sort_order) values
  ('ai',       'AI',          '머신러닝 / 딥러닝 / LLM 정리.',           '🧠', 'emerald', null, 10),
  ('aws',      'AWS',         'Lambda / S3 등 AWS 서비스 정리.',          '☁️', 'orange',  null, 20),
  ('fe',       'FE',          'HTML / CSS / JavaScript / React 등.',      '🎨', 'sky',     null, 30),
  ('spring',   'Spring',      'Spring / Spring Boot / MVC / Security.',   '🌱', 'lime',    null, 40),
  ('java',     'Java',        '자바 언어 기초와 객체 지향.',              '☕', 'amber',   null, 50),
  ('jpa',      'JPA',         'JPA 영속성 컨텍스트와 연관관계.',          '💾', 'slate',   null, 60),
  ('jdbc',     'JDBC',        'JDBC / 커넥션 풀 / 트랜잭션.',             '🔌', 'zinc',    null, 70),
  ('database', '데이터베이스', '관계형 DB / SQL / 정규화.',                '🗄️', 'indigo',  null, 80),
  ('network',  '네트워크',    '컴퓨터 네트워크 / TCP·IP / HTTP.',          '🌐', 'cyan',    null, 90),
  ('os',       '운영체제',    'OS / 프로세스 / 메모리 / 파일 시스템.',    '⚙️', 'stone',   null, 100),
  ('docker',   'Docker',      'Docker / 컨테이너 / Compose.',             '🐳', 'blue',    null, 110)
on conflict (slug) do update set
  name        = excluded.name,
  description = excluded.description,
  icon        = excluded.icon,
  color       = excluded.color,
  sort_order  = excluded.sort_order;

-- ============================================================
-- 2. 자식 카테고리 (9개)
--   부모의 id 를 slug 로 조회해서 parent_category_id 채움
-- ============================================================

insert into public.categories (slug, name, description, icon, color, parent_category_id, sort_order) values
  -- AI
  ('ai/deep-learning',       '딥러닝',          '신경망, 활성화 함수, 역전파.',          null, 'emerald',
   (select id from public.categories where slug = 'ai'), 11),
  ('ai/machine-learning',    '머신러닝',        '결정 트리, 부스팅, 앙상블.',            null, 'emerald',
   (select id from public.categories where slug = 'ai'), 12),
  ('ai/practice',            '실습',            '회귀/분류 PyTorch 실습.',               null, 'emerald',
   (select id from public.categories where slug = 'ai'), 13),

  -- AWS
  ('aws/lambda',             'Lambda',          'AWS Lambda / 서버리스.',                 null, 'orange',
   (select id from public.categories where slug = 'aws'), 21),
  ('aws/s3',                 'S3',              'S3 / Batch Operations.',                 null, 'orange',
   (select id from public.categories where slug = 'aws'), 22),

  -- FE
  ('fe/html-css-js',         'HTML / CSS / JS', '웹 표준 / 레이아웃 / JS 기초.',          null, 'sky',
   (select id from public.categories where slug = 'fe'), 31),
  ('fe/react',               'React',           'React / Virtual DOM / 컴포넌트.',        null, 'sky',
   (select id from public.categories where slug = 'fe'), 32),

  -- Spring
  ('spring/spring-mvc',      'Spring MVC',      'DispatcherServlet / 요청 매핑.',        null, 'lime',
   (select id from public.categories where slug = 'spring'), 41),
  ('spring/spring-security', 'Spring Security', '인증·인가 / JWT.',                       null, 'lime',
   (select id from public.categories where slug = 'spring'), 42)
on conflict (slug) do update set
  name               = excluded.name,
  description        = excluded.description,
  parent_category_id = excluded.parent_category_id,
  sort_order         = excluded.sort_order;
