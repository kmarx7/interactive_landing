# Interactive Landing Studio

코딩 없이 랜딩페이지를 만들고, 편집하고, 브라우저에 보관하는 로컬 웹 스튜디오.

## 실행

Node.js 22 이상을 권장합니다.

```sh
npm ci
npm run dev
```

http://127.0.0.1:3000 에서 실행합니다. 로그인·API 키·외부 서비스가 필요하지 않습니다.

```sh
npm run typecheck
npm test
npm run build
npm run test:e2e
```

브라우저 테스트는 개발 서버가 실행 중인 상태에서 실행합니다. 최초 실행 시 `npx playwright install chromium`이 필요할 수 있습니다.

## 현재 제공

- 프로젝트 생성 / 열기 / 검색 / 이름 변경 / 복제 / 삭제
- IndexedDB 트랜잭션 기반 자동·수동 저장과 실패 표시
- 버전 및 구조 검증을 거치는 JSON 백업·복원 (기존 프로젝트 덮어쓰기 없음)
- 섹션 편집 / 추가 / 복제 / 정렬 / 삭제 / Undo·Redo
- Desktop·Tablet·Mobile, Edit·Preview
- 완성된 대표 스타일 3종과 30종 카탈로그 (나머지는 준비 중)
- 독립적인 6종 팔레트, light·dark, Semantic Color 편집, HEX·RGB·HSL·alpha, 대비 경고
- 타이포그래피 / 레이아웃 / 모양 / 모션 / 접근성 설정
- 31종 요청 인터랙션과 Hero를 포함한 32종 블록의 초기 2D 렌더러
- Physical AI, SOMSSI, SaaS 템플릿이 같은 렌더러를 공유
- 공통 Simulation Core와 Drag·Robot·String 어댑터

## 데이터 보관

프로젝트는 현재 브라우저, 현재 origin의 IndexedDB에 저장됩니다. 브라우저 데이터 삭제나 다른 브라우저 사용 시 자동 복구되지 않습니다. JSON 백업을 정기적으로 내려받으세요. JSON의 외부 미디어는 URL만 포함합니다. 가져오기에는 5MB 제한이 있습니다. 손상된 저장 항목은 목록에서 건너뛰되 삭제하지 않습니다.

## 범위와 후속 개발

이 버전은 실행 가능한 로컬 기반입니다. 모든 마스터 요구사항의 완료를 의미하지 않습니다. ZIP·정적 사이트·Next.js 프로젝트 출력, 실제 3D 씬, AI 생성, 외부 실시간 데이터 연결, Storybook 및 모든 블록별 심화 변형/개별 테스트는 후속 작업입니다. Live Telemetry는 예제 데이터임을 표시합니다. 디자인 참고 PDF는 아직 제공되지 않았습니다. 상세 현황은 [개발 작업 목록](docs/ROADMAP.md)을 확인하세요.

## 개발 정책

기능 단위 `feature/<name>` 브랜치를 사용합니다. 검증한 변경만 커밋하고 요청된 원격 저장소에 push합니다. 외부 서비스 연결과 배포는 별도 요청이 필요합니다.

[제품 요구사항](docs/PRD.md) · [아키텍처](docs/ARCHITECTURE.md) · [컴포넌트 계약](docs/COMPONENT_CONTRACT.md) · [테스트 전략](docs/TEST_STRATEGY.md)
