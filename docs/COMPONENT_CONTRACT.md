# 컴포넌트 계약

## 공통 입력

모든 블록은 Zod Section을 받는다. Content는 eyebrow/title/body/button/url/items/mediaUrl/deadline. Design은 정렬·여백·컬럼·gap·radius·타이포그래피·border·shadow·반응형 visibility·색상 override. Motion은 preset·duration·delay·intensity·easing·trigger·repeat. Interaction은 autoplay·simulation adapter·target. Accessibility는 section label.

## 등록과 렌더링

`componentTypes`는 허용 타입 집합, `registry`는 이름·카테고리·설명, `createSection`은 검증 가능한 기본값, `InteractiveContent`는 runtime 동작을 제공한다. 각 섹션 wrapper는 공통 theme, responsive, motion, accessibility 정책을 받는다. 미리보기와 향후 출력은 PageRenderer를 재사용해야 한다.

## 변형과 상태

현재 대표 style 3종·palette 6종·light/dark를 지원한다. items 기반 블록은 공통 item 구조를 사용한다. 탭/캐러셀/스토리는 현재 index, checklist는 선택 ID 목록, 폼은 입력/결과를 runtime state로 관리한다. simulation variant는 drag/robot/string이다. 내용이 없는 item 기반 블록은 empty 상태를 표시하며 비디오 URL 누락 시 설정 안내를 표시한다. URL·수치·스키마 오류는 입력 단계에서 거부한다.

## 접근성

실제 button/input/details/nav/video 요소를 쓴다. 탭은 role과 방향키 탐색을 제공한다. draggable simulation은 방향키 대안이 있다. 레이어 재정렬은 버튼 대안이 있다. 탭·체크리스트·CTA·캐러셀의 포커스 표시를 theme token으로 제공한다. 미리보기에서만 runtime 입력을 활성화한다. 다이얼로그는 Radix focus trap과 제목/설명을 사용한다.

## 초기 구현의 한계

- Scene은 실제 3D가 아닌 2D SVG이다.
- Telemetry는 편집 가능한 예제 수치이며 live network가 아니다.
- Leader/Follower는 목표점을 따라가는 2D 제어이다.
- Graph/Hotspot은 기본 노드 배치와 선택 상세를 제공한다.
- Step/File Viewer는 콘텐츠 단계 보기이며 파일 파서가 아니다.
- 영상은 직접 영상 파일 URL 기반이며 YouTube embed parser는 없다.
- 모션 stagger/text-reveal은 현재 블록 단위 전환이며 글자/자식별 시퀀스는 후속이다.
- 스타일별 컴포넌트 변형·모션 조합의 전수 테스트는 후속이다.
