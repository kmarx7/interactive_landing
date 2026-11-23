# 작업 목록과 구현 현황

## 완료된 로컬 기반

- [x] Phase 0: PRD / architecture / schema / contracts / test strategy
- [x] Next.js + React + TypeScript + Tailwind 기본 구성
- [x] 프로젝트 CRUD, 복제, 검색, IndexedDB 저장
- [x] 자동 저장 / 수동 저장 / 실패 표시 / 종료 전 보호
- [x] JSON 다운로드 / 검증 복원 / 버전 거부 / ID 충돌 보호
- [x] Undo / Redo, 섹션 선택 / 편집 / 추가 / 복제 / 삭제 / 정렬
- [x] Edit / Preview, desktop / tablet / mobile
- [x] 30종 style metadata, 대표 3종 적용, 검색 / 필터 / favorite / 명암 / 화면 미리보기
- [x] 6종 palette, semantic color HEX / RGB / HSL / picker / alpha / reset
- [x] 대비 경고, typography / layout / shape / motion 설정
- [x] 31종 인터랙션 + Hero 초기 2D 동작
- [x] Simulation Core + Drag / Robot / String
- [x] 3종 주제 template, 공통 runtime

## 후속 기능 브랜치

- [ ] `feature/style-catalog`: PDF 대조, 나머지 27종 실제 디자인, preview도 해당 variant runtime 사용
- [ ] `feature/component-contracts`: 블록별 discriminated schema, 개별 module / variants / 예외 / 접근성 전수 테스트
- [ ] `feature/motion-engine`: 자식 stagger, 글자 text reveal, sticky와 scroll progress 정밀화
- [ ] `feature/asset-library`: 로컬 asset blob 저장과 이미지/영상 업로드, ZIP 백업
- [ ] `feature/static-export`: 편집기 없는 runtime 번들, CSS / JS / asset 포함 정적 웹사이트
- [ ] `feature/next-export`: 배포 가능한 Next.js 코드 생성
- [ ] `feature/3d-adapters`: 동적 React Three Fiber, Robot 3D, 성능 / cleanup
- [ ] `feature/storybook`: 블록·테마·empty·error·responsive stories
- [ ] `feature/accessibility-audit`: 완전한 WCAG 감사, 투명도·그라디언트 합성 대비
- [ ] `feature/ai-assistant`: 별도 승인 후 server credential, 스키마 기반 생성

사용자 원문의 개발 단계가 Phase 2 도중 끊겨 후속 일정은 임의로 완료 처리하지 않았다. 요구된 32종 인터랙션의 목록은 실제 31종이며 Hero를 포함해 32종 블록으로 등록했다.
