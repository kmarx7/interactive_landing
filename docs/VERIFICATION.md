# 검증 기록 — 2026-11-23

## 검증된 흐름

대시보드 생성 → Zod 검증 → IndexedDB 트랜잭션 완료 → 편집 → Undo/Redo → 스타일 적용 → 저장 → 목록 이탈 / 재열기 → 같은 콘텐츠 표시.

서버 API를 사용하지 않는 로컬 앱이며 브라우저와 IndexedDB 사이의 경계를 검증한다.

| 검사                                             | 결과      | 근거                                                                |
| ------------------------------------------------ | --------- | ------------------------------------------------------------------- |
| 스키마 / 템플릿 / 블록 기본값                    | 통과      | 세 템플릿, 32종 블록 모두 파싱 / JSON roundtrip                     |
| 손상 / 버전 / 미등록 타입 / URL / 색상 / 중복 ID | 통과      | 입력 거부 및 데이터 유지 테스트                                     |
| IndexedDB CRUD / 오류                            | 통과      | 저장·변경·삭제, quota 오류에서 거부, 이후 저장 복구                 |
| 손상된 저장 항목                                 | 통과      | 목록에서 건너뛰고 원본을 삭제하지 않는지 확인                       |
| History                                          | 통과      | Undo/Redo, 새 명령의 redo 제거, 80개 제한                           |
| React 편집 흐름                                  | 통과      | Testing Library + jsdom에서 생성·편집·Undo/Redo·저장·재열기·탭 실행 |
| 저장 실패 UI                                     | 통과      | 실패 표시, 편집본 유지, 저장 실패 시 목록 이탈 차단                 |
| 입력 중 종료 / 단축키 저장                       | 통과      | blur 전 dirty 표시, beforeunload 경고, focused draft commit 후 저장 |
| 스타일 / 모양 / 색상                             | 통과      | 콘텐츠 보존, 토큰과 명시 override 분리, HEX·RGB·HSL 입력 검증       |
| 앵커                                             | 통과      | 복제 시 ID 유일성, 세 템플릿의 첫 CTA가 실제 섹션을 가리킴          |
| Simulation                                       | 통과      | 목표 접근, 에너지 감쇠, 중복 loop 방지, pause/reset/dispose 정리    |
| 테스트 합계                                      | 60개 통과 | Vitest 4개 파일                                                     |
| TypeScript                                       | 통과      | strict `tsc --noEmit`, Next build type validation                   |
| 프로덕션 번들                                    | 통과      | Next 16.4.6, webpack, `/`와 `/_not-found` 사전 렌더링               |

## 브라우저 검증 제한

- 개발 서버 실행은 `listen EPERM 127.0.0.1:3000`으로 거부됐다.
- Turbopack의 내부 포트도 거부되어 공식 webpack 빌드 옵션을 사용했다.
- 정적 렌더의 시각 검토를 위해 ego-browser 실행을 시도했으나 macOS 앱 서비스 연결이 거부되어 시작하지 못했다.
- 따라서 실제 브라우저에서의 레이아웃, 포인터/터치, 오디오, 미디어 재생, 모바일 화면, 실제 다운로드와 파일 선택 E2E는 미검증이다. DOM 통합 테스트가 이를 대신 검증했다고 주장하지 않는다.
- Playwright 사양 `tests/studio.spec.ts`를 제공한다. 사용자 환경에서 `npm run dev` 후 `npm run test:e2e`로 확인할 수 있다.

## Git 운영

원본 작업 폴더의 `.git`은 세션에서 읽기 전용이므로 수정하지 않았다. 쓰기 가능한 별도 임시 체크아웃에서 docs 기준 main과 `feature/ils-studio-v1.1` 구현 브랜치를 준비했다. push 결과는 최종 응답과 원격 branch ref로 확인한다. 배포는 수행하지 않는다.

## 미완성 범위

나머지 27종 실제 스타일, 블록별 고급 변형과 전수 접근성 테스트, Storybook, 실제 3D, 외부 실시간 데이터, asset 파일 저장, ZIP·독립 웹사이트·Next.js 출력, AI는 후속이다. 상세 작업은 ROADMAP.md에 기록한다.
