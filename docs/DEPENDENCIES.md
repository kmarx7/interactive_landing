# 라이브러리 선택과 공식 문서

2026-11-23 npm registry에서 버전과 Next peer 요구사항을 확인했다. Node 22.22.3에서 설치·TypeScript·단위/DOM 테스트·Next 프로덕션 빌드를 수행한다. 실제 의존 버전은 package-lock.json에 고정한다.

| 선택                                              | 이유 / 공식 자료                                                                                                                |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- |
| Next 16.4.6 + React 19.3.1                        | [공식 설치 문서](https://nextjs.org/docs/app/getting-started/installation), registry peer React ^19 허용                        |
| TypeScript 5.9.3                                  | strict schema와 editor 계약                                                                                                     |
| Zod 4.6.7                                         | [safeParse](https://zod.dev/basics), enum record의 부분 오버라이드는 partialRecord 사용                                         |
| Tailwind 4.3.5 + CSS variables                    | editor token과 랜딩 theme의 분리                                                                                                |
| Radix Dialog 1.3.1                                | focus trap, keyboard dismissal, 접근성 title / description                                                                      |
| Motion 14.14.0                                    | [reduced motion](https://motion.dev/docs/react-use-reduced-motion), [MotionConfig](https://motion.dev/docs/react-motion-config) |
| Vitest + fake-indexeddb + Testing Library + jsdom | 데이터 검증, 트랜잭션 오류, 실제 React 편집 흐름 검증                                                                           |
| Playwright                                        | 실제 브라우저 E2E 사양. 현재 환경의 포트 제한으로 미실행                                                                        |

GSAP, Three.js, R3F, 외부 DB, AI SDK는 해당 기능이 필요해지는 단계에서 도입한다. 설치 초기 optional peer 해결 오류를 확인했다. 최종 점검에서 jest-dom 8이 Vitest 5를 요구하는 충돌을 찾아 jest-dom 6.9.1로 맞췄으며, 이후 일반 npm install이 성공했다. legacy peer 옵션 없이 설치 가능한 조합과 lockfile을 제공한다. 기본 Turbopack은 이 실행 환경의 내부 포트 제한과 충돌해 build 스크립트는 Next에서 지원하는 webpack 옵션을 사용한다.
