# 테스트 전략

단순 렌더링 복제 대신 데이터 손실과 편집 신뢰성 경계를 우선한다.

1. Vitest: 모든 템플릿과 기본 블록 스키마, 손상/버전/미등록 타입/URL/중복 ID 거부, history branching, IndexedDB CRUD / 유효성 / 손상 항목 보존.
2. Simulation: adapter가 시간이 지날 때 목표점에 접근하고 string energy가 감쇠하는지 검증.
3. Browser: 프로젝트 생성 → 편집 → undo/redo → style 변경 → 저장 → reload/재열기 → 내용 보존 → JSON backup → restore. 잘못된 파일이 기존 프로젝트에 영향을 주지 않는지 확인.
4. Runtime: 미리보기 탭, 체크리스트, FAQ, simulator input, device switch.
5. TypeScript strict와 Next production build.

E2E 사양은 `tests/studio.spec.ts`에 보관한다. 자동 UI 테스트는 각 테스트의 격리된 브라우저 context를 사용한다. 사용자 데이터가 있는 브라우저 전체 저장소를 지우지 않는다. 대표 화면의 시각 검토는 ego-browser로 수행한다. 검증 결과와 미검증 범위는 `docs/VERIFICATION.md`에 기록한다.
