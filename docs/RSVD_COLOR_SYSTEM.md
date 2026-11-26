# RSVD 웹사이트 컬러 시스템

- 버전: 1.0
- 작성일: 2026-11-26
- 적용 범위: 웹사이트 및 메신저형 예약 UI의 라이트 테마
- 목적: 단골 손님과 애정하는 레스토랑이 직접 대화하고 예약하는 경험
- 디자인 방향: 따뜻한 아이보리 배경, 딥그린 중심, 절제된 피치 포인트

## 개발 에이전트 적용 지침

이 문서를 컬러의 기준으로 사용한다. 아래 HEX 값과 의미를 유지하고, 컴포넌트에서는 CSS 변수를 참조한다. 프로젝트에 이미 토큰 체계가 있으면 기존 이름에 대응시키되 색상 값은 유지한다. 다크 모드는 이 문서의 범위에 포함하지 않는다.

## 기본 컬러표

| 토큰 | 컬러 | HEX | 용도 |
| --- | --- | --- | --- |
| `--rsvd-brand` | 딥그린 | `#24594B` | 로고, 주요 버튼, 선택 표시 |
| `--rsvd-brand-strong` | 다크그린 | `#193F35` | 주요 버튼 hover·active |
| `--rsvd-bg` | 웜 아이보리 | `#F7F6F2` | 페이지 및 채팅 기본 배경 |
| `--rsvd-surface` | 화이트 | `#FFFFFF` | 카드, 입력창, 팝업, 레스토랑 말풍선 |
| `--rsvd-text` | 차콜 | `#242A27` | 제목, 본문, 메시지 |
| `--rsvd-text-muted` | 그레이그린 | `#64716A` | 설명, 시간, 보조 정보 |
| `--rsvd-border` | 라이트그레이 | `#DFE5DF` | 장식 구분선, 카드 및 입력창 기본 테두리 |
| `--rsvd-tint` | 페일그린 | `#E3EEE6` | 내 말풍선, 선택된 날짜·시간 배경 |
| `--rsvd-accent` | 소프트피치 | `#F1D2BF` | 단골 배지, 환영 메시지의 작은 강조 영역 |
| `--rsvd-success` | 포레스트그린 | `#28724F` | 예약 확정 텍스트 및 아이콘 |
| `--rsvd-danger` | 뮤트레드 | `#B4433D` | 입력 오류, 취소·실패 안내 |
| `--rsvd-on-brand` | 화이트 | `#FFFFFF` | 딥그린 버튼 및 어두운 영역 위 텍스트·로고 |

## CSS 변수

프로젝트의 전역 스타일에 등록한다.

```css
:root {
  color-scheme: light;

  /* Base palette */
  --rsvd-brand: #24594B;
  --rsvd-brand-strong: #193F35;
  --rsvd-bg: #F7F6F2;
  --rsvd-surface: #FFFFFF;
  --rsvd-text: #242A27;
  --rsvd-text-muted: #64716A;
  --rsvd-border: #DFE5DF;
  --rsvd-tint: #E3EEE6;
  --rsvd-accent: #F1D2BF;
  --rsvd-success: #28724F;
  --rsvd-danger: #B4433D;
  --rsvd-on-brand: #FFFFFF;

  /* Semantic aliases */
  --rsvd-action-bg: var(--rsvd-brand);
  --rsvd-action-hover-bg: var(--rsvd-brand-strong);
  --rsvd-action-text: var(--rsvd-on-brand);
  --rsvd-selected-bg: var(--rsvd-tint);
  --rsvd-selected-text: var(--rsvd-brand);
  --rsvd-chat-self-bg: var(--rsvd-tint);
  --rsvd-chat-restaurant-bg: var(--rsvd-surface);
  --rsvd-chat-text: var(--rsvd-text);
  --rsvd-badge-bg: var(--rsvd-accent);
  --rsvd-badge-text: var(--rsvd-text);
  --rsvd-focus: var(--rsvd-brand);
  --rsvd-disabled-bg: var(--rsvd-border);
  --rsvd-disabled-text: var(--rsvd-text-muted);
}
```

## 컴포넌트별 적용

| 요소·상태 | 배경 | 텍스트·아이콘 | 추가 표시 |
| --- | --- | --- | --- |
| 페이지·채팅 화면 | `--rsvd-bg` | `--rsvd-text` | 넓은 기본 면적에 적용 |
| 레스토랑 카드·팝업 | `--rsvd-surface` | `--rsvd-text` | `--rsvd-border`로 구분 |
| 예약하기·메시지 보내기 | `--rsvd-action-bg` | `--rsvd-action-text` | 주요 행동에 집중 사용 |
| 주요 버튼 hover·active | `--rsvd-action-hover-bg` | `--rsvd-action-text` | 동일한 색 체계 유지 |
| 보조 버튼 | `--rsvd-surface` | `--rsvd-brand` | 브랜드 색 테두리 |
| 날짜·시간 선택 전 | `--rsvd-surface` | `--rsvd-text` | 기본 테두리 |
| 날짜·시간 선택 후 | `--rsvd-selected-bg` | `--rsvd-selected-text` | 브랜드 테두리·체크 등으로 선택 명시 |
| 손님이 보낸 메시지 | `--rsvd-chat-self-bg` | `--rsvd-chat-text` | 오른쪽 정렬 |
| 레스토랑이 보낸 메시지 | `--rsvd-chat-restaurant-bg` | `--rsvd-chat-text` | 왼쪽 정렬 및 발신자 표시 |
| 메시지 시간·보조 설명 | 주변 배경 유지 | `--rsvd-text-muted` | 충분히 읽을 수 있는 크기 사용 |
| 단골 배지 | `--rsvd-badge-bg` | `--rsvd-badge-text` | 작은 면적에 사용 |
| 예약 확정 상태 | `--rsvd-surface` | `--rsvd-success` | ‘예약 확정’ 문구·아이콘 병기 |
| 오류·취소·실패 상태 | `--rsvd-surface` | `--rsvd-danger` | 구체적인 상태 문구 병기 |
| 비활성 버튼 | `--rsvd-disabled-bg` | `--rsvd-disabled-text` | 실제 disabled 속성 적용 |
| 입력창 기본 | `--rsvd-surface` | `--rsvd-text` | 기본 테두리 및 명시적 라벨 |
| 입력창 오류 | `--rsvd-surface` | `--rsvd-text` | 테두리·오류 안내에 `--rsvd-danger` |

‘손님/레스토랑’ 말풍선 색상은 손님용 화면 기준이다. 레스토랑 운영자 화면에서는 발신자 기준 의미를 먼저 정의한 뒤 일관되게 적용한다.

## 사용 규칙

1. 아이보리와 화이트가 화면의 주된 면적을 차지하도록 한다. 딥그린은 주요 행동과 선택 상태에 집중한다.
2. 피치는 단골 배지와 작은 환영 포인트에만 사용한다. 주요 버튼의 색상으로 사용하지 않는다.
3. 밝은 피치·페일그린 배경에는 차콜 또는 지정된 딥그린 글자를 사용한다. 흰색 본문을 올리지 않는다.
4. 기본 구분선은 밝은 장식용 색이다. 선택·포커스·오류처럼 반드시 식별되어야 하는 경계에는 각각 브랜드 색 또는 오류 색을 사용한다.
5. 키보드 포커스는 `outline: 2px solid var(--rsvd-focus)`와 `outline-offset: 3px`를 기본으로 한다. 실제 배경 위에서 식별되는지 확인한다.
6. 확정·오류·선택 상태는 색상뿐 아니라 문구와 아이콘으로도 구별한다. 취소 상태와 입력 오류는 같은 색을 쓰더라도 문구로 구분한다.
7. 흰색 말풍선은 아이보리 배경과의 차이가 작으므로 배치·여백·발신자 표시를 함께 사용한다.
8. 밝은 영역의 로고는 딥그린 단색, 어두운 영역의 로고는 화이트 단색을 사용한다.
9. 레스토랑 사진에는 일괄적인 그린 필터를 씌우지 않는다. 매장의 고유한 색과 분위기를 유지한다.
10. 새로운 컬러를 임의로 추가하지 않는다. 기존 토큰으로 표현할 수 없는 상태가 필요하면 역할을 정의한 뒤 컬러 시스템을 함께 갱신한다.

## 적용 확인 항목

- 모든 컴포넌트가 HEX 직접 입력 대신 위 토큰 또는 대응되는 프로젝트 토큰을 참조하는가?
- 예약 버튼의 기본·hover·focus·disabled 상태가 구별되는가?
- 내 메시지와 레스토랑 메시지가 색상 외의 배치와 발신자 정보로도 구분되는가?
- 본문·보조 텍스트·상태 문구를 실제 크기와 배경 조합에서 읽을 수 있는가?
- 선택 상태와 오류 상태를 색상을 구별하지 못해도 이해할 수 있는가?
- 작은 모바일 화면에서도 컬러 포인트가 대화 내용이나 예약 정보를 압도하지 않는가?

이 문서는 팔레트와 사용 규칙을 정의한다. 실제 구현의 접근성·가독성 검증 결과를 의미하지는 않는다.
