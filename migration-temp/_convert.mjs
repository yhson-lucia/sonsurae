// One-shot conversion script: my-website/docs → migration-temp/docs
// Renames files & images per MAPPING.md, rewrites image refs inside md.

import fs from 'node:fs';
import path from 'node:path';

const SRC = '/Users/hwang-yejun/Desktop/WB/my-website/docs';
const DST = '/Users/hwang-yejun/Desktop/project/Sonsurae/migration-temp';

// (orig path relative to SRC) -> { cat, slug, order? }
const POSTS = {
  // AI / deep-learning
  'AI/딥러닝/01.퍼셉트론.md':                          { cat: 'ai/deep-learning', slug: 'perceptron', order: 1 },
  'AI/딥러닝/02.신경망.md':                            { cat: 'ai/deep-learning', slug: 'neural-network', order: 2 },
  'AI/딥러닝/03.신경망 학습.md':                       { cat: 'ai/deep-learning', slug: 'neural-network-training', order: 3 },
  'AI/딥러닝/04.오차역전파법.md':                       { cat: 'ai/deep-learning', slug: 'backpropagation', order: 4 },
  'AI/딥러닝/05.Logistic Regression의 Cost.md':        { cat: 'ai/deep-learning', slug: 'logistic-regression-cost', order: 5 },
  'AI/딥러닝/06.Softmax Regression.md':                { cat: 'ai/deep-learning', slug: 'softmax-regression', order: 6 },
  'AI/딥러닝/07.learning rate,overfitting,regularization.md': { cat: 'ai/deep-learning', slug: 'learning-rate-overfitting-regularization', order: 7 },
  'AI/딥러닝/08.Neural Networks.md':                   { cat: 'ai/deep-learning', slug: 'neural-networks-multilayer', order: 8 },
  'AI/딥러닝/09.ReLU.md':                              { cat: 'ai/deep-learning', slug: 'relu', order: 9 },
  'AI/딥러닝/10.Weight 초기화.md':                      { cat: 'ai/deep-learning', slug: 'weight-initialization', order: 10 },
  'AI/딥러닝/11.overfitting.md':                       { cat: 'ai/deep-learning', slug: 'overfitting', order: 11 },
  'AI/딥러닝/12.ConvNet.md':                           { cat: 'ai/deep-learning', slug: 'convnet', order: 12 },

  // AI / machine-learning
  'AI/머신러닝/02.Rule based Machine Learning Overview.md': { cat: 'ai/machine-learning', slug: 'rule-based-ml-overview', order: 2 },
  'AI/머신러닝/03.Decision Tree.md':                    { cat: 'ai/machine-learning', slug: 'decision-tree', order: 3 },
  'AI/머신러닝/04.Entropy.md':                          { cat: 'ai/machine-learning', slug: 'entropy', order: 4 },
  'AI/머신러닝/05.Information Gain.md':                  { cat: 'ai/machine-learning', slug: 'information-gain', order: 5 },
  'AI/머신러닝/06.Random Forest.md':                    { cat: 'ai/machine-learning', slug: 'random-forest', order: 6 },
  'AI/머신러닝/07.Ada Boost.md':                        { cat: 'ai/machine-learning', slug: 'ada-boost', order: 7 },
  'AI/머신러닝/08.Gradient Boost.md':                   { cat: 'ai/machine-learning', slug: 'gradient-boost', order: 8 },
  'AI/머신러닝/09.Gradient Boost Classification.md':     { cat: 'ai/machine-learning', slug: 'gradient-boost-classification', order: 9 },
  'AI/머신러닝/10. XG Boost.md':                        { cat: 'ai/machine-learning', slug: 'xg-boost', order: 10 },

  // AI / practice
  'AI/실습/00.프레임워크.md':                            { cat: 'ai/practice', slug: 'framework-intro', order: 0 },
  'AI/실습/01.Linear_regression.md':                    { cat: 'ai/practice', slug: 'linear-regression-practice', order: 1 },
  'AI/실습/02.multi-variable linear regression.md':     { cat: 'ai/practice', slug: 'multi-variable-linear-regression-practice', order: 2 },
  'AI/실습/03.logistic_regression.md':                  { cat: 'ai/practice', slug: 'logistic-regression-practice', order: 3 },
  'AI/실습/04.softmax_regression.md':                   { cat: 'ai/practice', slug: 'softmax-regression-practice', order: 4 },
  'AI/실습/05.xor_gate.md':                             { cat: 'ai/practice', slug: 'xor-gate-practice', order: 5 },
  'AI/실습/06.Decision_Tree.md':                        { cat: 'ai/practice', slug: 'decision-tree-practice', order: 6 },

  // AWS
  'AWS/Lambda/AWS Lambda.md':                           { cat: 'aws/lambda', slug: 'aws-lambda' },
  'AWS/S3/01.S3.md':                                    { cat: 'aws/s3', slug: 's3-overview', order: 1 },
  'AWS/S3/02.S3 Batch Operation.md':                    { cat: 'aws/s3', slug: 's3-batch-operation', order: 2 },

  // FE / HTML,CSS,JS
  'FE/HTML,CSS,JS/HTML.md':                             { cat: 'fe/html-css-js', slug: 'html' },
  'FE/HTML,CSS,JS/CSS.md':                              { cat: 'fe/html-css-js', slug: 'css' },
  'FE/HTML,CSS,JS/미디어쿼리.md':                        { cat: 'fe/html-css-js', slug: 'media-query' },
  'FE/HTML,CSS,JS/웹사이트 레이아웃에 영향을 미치는 요소.md': { cat: 'fe/html-css-js', slug: 'website-layout-factors' },
  'FE/HTML,CSS,JS/움직이는 웹사이트 제작.md':              { cat: 'fe/html-css-js', slug: 'animated-website' },
  'FE/HTML,CSS,JS/DOM과 이벤트.md':                      { cat: 'fe/html-css-js', slug: 'dom-and-event' },
  'FE/HTML,CSS,JS/자바스크립트 기초.md':                  { cat: 'fe/html-css-js', slug: 'javascript-basics' },
  'FE/HTML,CSS,JS/자바스크립트 기초 문법 및 활용.md':       { cat: 'fe/html-css-js', slug: 'javascript-basic-syntax' },
  'FE/HTML,CSS,JS/자바스크립트 실행.md':                  { cat: 'fe/html-css-js', slug: 'javascript-execution' },
  'FE/HTML,CSS,JS/자바스크립트 제어 흐름.md':              { cat: 'fe/html-css-js', slug: 'javascript-control-flow' },
  'FE/HTML,CSS,JS/실행 컨텍스트.md':                     { cat: 'fe/html-css-js', slug: 'execution-context' },

  // FE / React
  'FE/React/React.md':                                  { cat: 'fe/react', slug: 'react' },

  // JDBC
  'JDBC/JDBCConnection.md':                             { cat: 'jdbc', slug: 'jdbc-connection' },
  'JDBC/JDBC Template.md':                              { cat: 'jdbc', slug: 'jdbc-template' },
  'JDBC/커넥션 풀.md':                                   { cat: 'jdbc', slug: 'connection-pool' },
  'JDBC/트랜잭션.md':                                    { cat: 'jdbc', slug: 'transaction' },

  // JPA
  'JPA/01.JPA.md':                                      { cat: 'jpa', slug: 'jpa-intro', order: 1 },
  'JPA/02.연관관계.md':                                  { cat: 'jpa', slug: 'association', order: 2 },
  'JPA/03.값 타입.md':                                   { cat: 'jpa', slug: 'value-type', order: 3 },
  'JPA/04.연관관계 관리.md':                              { cat: 'jpa', slug: 'association-management', order: 4 },
  'JPA/05.프록시.md':                                    { cat: 'jpa', slug: 'proxy', order: 5 },

  // Java
  'Java/자바.md':                                        { cat: 'java', slug: 'java-overview' },
  'Java/객체 지향 프로그래밍.md':                          { cat: 'java', slug: 'object-oriented-programming' },
  'Java/예외 처리.md':                                    { cat: 'java', slug: 'exception-handling' },
  'Java/컬렉션 프레임워크.md':                             { cat: 'java', slug: 'collection-framework' },

  // Spring
  'Spring/SpringFramework.md':                          { cat: 'spring', slug: 'spring-framework' },
  'Spring/Spring Boot.md':                              { cat: 'spring', slug: 'spring-boot' },
  'Spring/WebSocket.md':                                { cat: 'spring', slug: 'websocket' },
  'Spring/검증.md':                                      { cat: 'spring', slug: 'validation' },
  'Spring/Spring MVC/MVC.md':                           { cat: 'spring/spring-mvc', slug: 'mvc' },
  'Spring/Spring MVC/요청 매핑.md':                      { cat: 'spring/spring-mvc', slug: 'request-mapping' },
  'Spring/Spring Security/Spring Security.md':          { cat: 'spring/spring-security', slug: 'spring-security' },
  'Spring/Spring Security/JWT.md':                      { cat: 'spring/spring-security', slug: 'jwt' },

  // 네트워크
  '네트워크/컴퓨터 네트워크 기본.md':                       { cat: 'network', slug: 'computer-network-basics' },
  '네트워크/애플리케이션 계층.md':                          { cat: 'network', slug: 'application-layer' },
  '네트워크/전송 계층.md':                                 { cat: 'network', slug: 'transport-layer' },
  '네트워크/네트워크 계층.md':                              { cat: 'network', slug: 'network-layer' },
  '네트워크/링크 계층.md':                                 { cat: 'network', slug: 'link-layer' },
  '네트워크/HTTP.md':                                     { cat: 'network', slug: 'http' },
  '네트워크/Multimedia networking.md':                    { cat: 'network', slug: 'multimedia-networking' },

  // 데이터베이스
  '데이터베이스/데이터베이스 기초.md':                       { cat: 'database', slug: 'database-basics' },
  '데이터베이스/데이터베이스 구성.md':                       { cat: 'database', slug: 'database-structure' },
  '데이터베이스/데이터베이스 구현.md':                       { cat: 'database', slug: 'database-implementation' },
  '데이터베이스/데이터 모델링.md':                          { cat: 'database', slug: 'data-modeling' },
  '데이터베이스/SQL 기본.md':                              { cat: 'database', slug: 'sql-basics' },
  '데이터베이스/JOIN.md':                                  { cat: 'database', slug: 'join' },
  '데이터베이스/SUBQUERY.md':                              { cat: 'database', slug: 'subquery' },
  '데이터베이스/SQL로 다수의 테이블 제어.md':                { cat: 'database', slug: 'sql-multi-table' },
  '데이터베이스/그룹 함수 & 윈도우 함수.md':                  { cat: 'database', slug: 'group-window-functions' },
  '데이터베이스/집합연산자와 계층형 질의.md':                  { cat: 'database', slug: 'set-operators-hierarchical' },

  // 도커
  '도커/Docker.md':                                       { cat: 'docker', slug: 'docker-intro' },
  '도커/Docker 실습.md':                                   { cat: 'docker', slug: 'docker-practice' },
  '도커/운영환경.md':                                      { cat: 'docker', slug: 'production-environment' },

  // 운영체제
  '운영체제/운영체제 개요.md':                              { cat: 'os', slug: 'os-overview' },
  '운영체제/컴퓨터 시스템의 구조.md':                        { cat: 'os', slug: 'computer-system-structure' },
  '운영체제/프로세스 관리.md':                              { cat: 'os', slug: 'process-management' },
  '운영체제/CPU scheduling.md':                            { cat: 'os', slug: 'cpu-scheduling' },
  '운영체제/Process Synchronization.md':                   { cat: 'os', slug: 'process-synchronization' },
  '운영체제/메모리 관리.md':                                { cat: 'os', slug: 'memory-management' },
  '운영체제/Virtual Memory.md':                            { cat: 'os', slug: 'virtual-memory' },
  '운영체제/File System.md':                               { cat: 'os', slug: 'file-system' },
  '운영체제/Multithreading.md':                            { cat: 'os', slug: 'multithreading' },
};

// --- helpers ---
function ensureDir(p) {
  fs.mkdirSync(p, { recursive: true });
}

function decodeImagePath(raw) {
  // Replace url-encoded slash, then decode the rest
  let s = raw.replace(/%2F/gi, '/');
  try { s = decodeURIComponent(s); } catch {}
  return s;
}

// Match markdown image: ![alt](url) where url contains "images/" or "images%2F"
const IMAGE_RE = /!\[([^\]]*)\]\(([^)\s]*?(?:images[/%2F]|images%2F)[^)\s]+)\)/gi;

// Resolve original image absolute path given decoded relative ref (e.g. "images/HTTP-...webp")
function resolveOriginalImage(srcDir, decodedRef) {
  // ref may be "images/foo.webp" or "./images/foo.webp"
  const cleaned = decodedRef.replace(/^\.\//, '');
  return path.join(srcDir, cleaned);
}

// --- main pipeline ---
const docsOut = path.join(DST, 'docs');
const imagesOut = path.join(DST, 'images');
const metaOut = path.join(DST, '_meta');

// Wipe previous run
for (const dir of [docsOut, imagesOut, metaOut]) {
  fs.rmSync(dir, { recursive: true, force: true });
  ensureDir(dir);
}

const report = {
  posts: 0,
  images: 0,
  missingImages: [],
  unmatched: [],
};

// 1. Process posts
for (const [origRel, meta] of Object.entries(POSTS)) {
  const origPath = path.join(SRC, origRel);
  if (!fs.existsSync(origPath)) {
    report.unmatched.push(origRel);
    continue;
  }
  const srcDir = path.dirname(origPath);
  let content = fs.readFileSync(origPath, 'utf8');

  // Track unique images per post → assign sequence
  const seen = new Map(); // decodedRef -> newName
  let seq = 0;

  content = content.replace(IMAGE_RE, (full, alt, url) => {
    const decoded = decodeImagePath(url);
    let newName;
    if (seen.has(decoded)) {
      newName = seen.get(decoded);
    } else {
      seq += 1;
      // ext from decoded
      const ext = path.extname(decoded).toLowerCase() || '.png';
      newName = `${meta.slug}-${String(seq).padStart(2, '0')}${ext}`;
      seen.set(decoded, newName);

      // Copy file
      const origImgPath = resolveOriginalImage(srcDir, decoded);
      if (fs.existsSync(origImgPath)) {
        fs.copyFileSync(origImgPath, path.join(imagesOut, newName));
        report.images += 1;
      } else {
        report.missingImages.push({ post: origRel, ref: decoded, resolved: origImgPath });
      }
    }
    return `![${alt}](images/${newName})`;
  });

  // Write new md
  const outDir = path.join(docsOut, meta.cat);
  ensureDir(outDir);
  const outPath = path.join(outDir, `${meta.slug}.md`);
  fs.writeFileSync(outPath, content, 'utf8');
  report.posts += 1;
}

// 2. Copy intro.md and category index.md to _meta/ for reference
const introSrc = path.join(SRC, 'intro.md');
if (fs.existsSync(introSrc)) {
  fs.copyFileSync(introSrc, path.join(metaOut, 'intro.md'));
}

const CATEGORY_DIR_MAP = {
  'AI': 'ai',
  'AWS': 'aws',
  'FE': 'fe',
  'JDBC': 'jdbc',
  'JPA': 'jpa',
  'Java': 'java',
  'Spring': 'spring',
  '네트워크': 'network',
  '데이터베이스': 'database',
  '도커': 'docker',
  '운영체제': 'os',
};

for (const [origDir, slug] of Object.entries(CATEGORY_DIR_MAP)) {
  const indexPath = path.join(SRC, origDir, 'index.md');
  if (fs.existsSync(indexPath)) {
    const dst = path.join(metaOut, `${slug.replace('/', '-')}-index.md`);
    fs.copyFileSync(indexPath, dst);
  }
}

// 3. Report
console.log('Conversion complete.');
console.log(`  Posts written: ${report.posts}`);
console.log(`  Images copied: ${report.images}`);
if (report.unmatched.length) {
  console.log(`  Unmatched (mapping references missing file):`);
  report.unmatched.forEach(p => console.log(`    - ${p}`));
}
if (report.missingImages.length) {
  console.log(`  Missing images (referenced in md but file not found):`);
  report.missingImages.forEach(m => console.log(`    - [${m.post}] ${m.ref}`));
}

fs.writeFileSync(path.join(DST, '_report.json'), JSON.stringify(report, null, 2));
