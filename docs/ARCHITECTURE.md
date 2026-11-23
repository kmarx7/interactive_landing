# 아키텍처와 데이터 흐름

단일 Next.js App Router 프로젝트. 브라우저의 상태·렌더러·저장소로 구동한다. 인증·서버 DB·외부 API가 필요하지 않아 API route는 없다.

| 영역                 | 파일                                         | 책임                                                   |
| -------------------- | -------------------------------------------- | ------------------------------------------------------ |
| Content / Schema     | lib/schema.ts                                | Project → Page → Section, Asset, DataBinding, Zod 검증 |
| Design               | lib/catalog.ts                               | Style, Palette, Semantic Token, font, 대비 계산        |
| Behavior / Rendering | components/page-renderer.tsx                 | 타입별 인터랙션 런타임과 공통 섹션 렌더링              |
| Motion               | components/motion-section.tsx                | Motion preset, trigger, repeat, reduced motion         |
| Simulation           | lib/simulation.ts, components/simulation.tsx | 실행 루프와 adapter / SVG / pointer / keyboard         |
| Persistence          | lib/storage.ts                               | DB 생성, 완료 기준 트랜잭션, 저장·삭제·목록·백업       |
| Editor               | components/editor.tsx, inspector.tsx         | 편집 명령, 선택, history, viewport, inspector          |
| Project manager      | components/studio.tsx                        | 프로젝트 CRUD, 복원, 대시보드                          |

## 스키마 v1

Project: schemaVersion=1, UUID, name, createdAt, updatedAt, page, theme, assets, dataBindings.
Page: title, description, sections.
Section: id, type, label, content, design, motion, interaction, accessibility.
Theme: styleId, paletteId, mode, overrides, headingFont, bodyFont, maxWidth, motionPreset, gradient.

타입은 등록된 32개 enum에 제한한다. 콘텐츠는 일반 문자열로 React에 렌더링한다. HTML 삽입이나 eval을 사용하지 않는다. 링크는 HTTP(S), mailto, tel, 페이지 anchor만 허용한다. 임의 확장 속성을 strict 스키마로 거부한다. 지원하지 않는 schemaVersion은 거부한다. 마이그레이션이 필요한 차기 버전은 parseProject 앞에 별도 버전 라우터를 추가한다.

## 편집과 저장

검증된 프로젝트 snapshot을 change 명령으로 historyReducer에 전달한다. 텍스트 편집은 blur/Enter로 commit하며 한 명령 단위로 기록한다. 과거 최대 80개, 새 편집은 redo를 비운다. 650ms debounce 후 저장하며 수동 저장도 같은 promise queue로 직렬화한다. 저장된 snapshot과 현재 snapshot이 같을 때만 saved를 표시한다. 목록 이탈은 현재 snapshot을 저장한 후 실행한다. 미저장 브라우저 종료는 beforeunload로 알린다.

## Simulation Core

input → adapter.update(dt) → state output → React/SVG. 시간차는 50ms로 제한한다. start/pause/reset/dispose를 제공한다. dispose가 animation frame을 취소하며 Music String은 사용자가 누른 뒤에만 AudioContext를 만들고 unmount에서 닫는다. 새 adapter는 동일한 state/update 계약을 구현한다.

## 알려진 확장 지점

현재 인터랙션 렌더러는 하나의 파일에 타입별 분기와 공통 UI 기반을 둔다. 기능별 복잡도가 커질 때 블록 모듈을 registry entry로 분리한다. 3D와 정적 출력 runtime은 렌더러 계약이 안정된 뒤 도입한다. 프로젝트는 편집 데이터만 보관하고 인터랙션의 일시적 재생/선택 상태는 runtime에 유지한다.
