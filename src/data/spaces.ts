import type { SpaceItem, SpaceReserver } from "@/domain/space";

export type { SpaceItem, SpaceReserver } from "@/domain/space";

const AVATARS = [
  "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=160&q=80",
  "https://images.unsplash.com/photo-1463453091185-61582044d556?auto=format&fit=crop&w=160&q=80",
];

const MAX_RESERVER_SAMPLES = 15;

function reservers(count: number, offset = 0): SpaceReserver[] {
  return Array.from({ length: Math.min(count, MAX_RESERVER_SAMPLES) }, (_, index) => ({
    id: `reserver-${offset}-${index}`,
    imageUrl: AVATARS[(offset + index) % AVATARS.length],
  }));
}


export const SAMPLE_SPACES: SpaceItem[] = [
  {
    id: "el-plato",
    name: "El Plato",
    address: "서울 강남구 논현로24길 29 청대선실 이람빌딩 503호",
    tagline: "고즈넉한 양재천 골목에서 바르셀로나를 경험하세요.",
    description: "스페인 바르셀로나의 분위기와 요리를 담은 다이닝 공간입니다.",
    images: [
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    ],
    contact: "0212345678",
    onlineLink: "",
    totalLikeCount: 128,
    lastReservedAt: "2025-11-27T10:20:00.000Z",
    recentReservers: reservers(15, 0),
    notice: [
      "엘 플라토를 찾아 주셔서 감사합니다. 이번 주에는 제철 재료로 구성한 스페인 디너 코스를 운영하며, 주말 디너는 예약 손님을 우선으로 안내합니다.",
      "알레르기가 있으시면 예약 메시지에 미리 남겨 주시고, 주차는 건물 인근 공영주차장을 이용해 주세요. 6인 이상 단체 예약은 메신저로 문의해 주시면 좌석과 코스를 맞춰 드리겠습니다.",
    ],
  },
  {
    id: "atelier-nori",
    name: "Atelier Nori",
    address: "서울 용산구 이태원로54길 18",
    tagline: "한남동의 작은 코스 다이닝.",
    description: "제철 재료로 구성하는 프렌치 코스 레스토랑입니다.",
    images: [
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
    ],
    contact: "027654321",
    onlineLink: "",
    totalLikeCount: 42,
    lastReservedAt: "2025-11-26T14:05:00.000Z",
    recentReservers: reservers(8, 2),
    notice: [
      "아틀리에 노리는 한 테이블씩 천천히 진행하는 코스 다이닝입니다. 런치 라스트 오더는 오후 1시 30분이며, 디너 예약은 2인 기준으로 안내합니다.",
      "와인 페어링이 필요하시면 메신저로 미리 요청해 주세요. 예약 당일 오전 확인 메시지를 보내드리니 답장을 남겨 주시면 감사하겠습니다.",
    ],
  },
  {
    id: "hana-table",
    name: "Hana Table",
    address: "서울 마포구 연남로1길 45",
    tagline: "연남동의 캐주얼 한식 다이닝.",
    description: "제철 한식과 자연주를 함께 즐기는 공간입니다.",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    ],
    contact: "023334444",
    onlineLink: "",
    totalLikeCount: 19,
    lastReservedAt: "2025-11-25T09:40:00.000Z",
    recentReservers: reservers(11, 1),
    notice: [
      "하나 테이블은 점심·저녁 모두 예약제로 운영합니다. 점심 코스는 11:30부터 입장이 가능하고, 아이 동반은 평일 런치에만 안내하고 있습니다.",
      "자리 이동이 어려우니 약속 시간에 맞춰 방문해 주시고, 당일 취소가 필요하면 메신저로 꼭 남겨 주세요.",
    ],
  },
  {
    id: "olive-room",
    name: "Olive Room",
    address: "서울 성동구 서울숲2길 28",
    tagline: "서울숲 근처의 이탈리안 비스트로.",
    description: "파스타와 피자를 중심으로 한 편안한 저녁 공간입니다.",
    images: [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1466978913421-dad2ebd01d17?auto=format&fit=crop&w=1200&q=80",
    ],
    contact: "024445555",
    onlineLink: "",
    totalLikeCount: 7,
    lastReservedAt: "2025-11-24T18:15:00.000Z",
    recentReservers: reservers(4, 4),
    notice: [
      "올리브 룸은 날씨에 따라 테라스 좌석을 열고, 피자 화덕은 저녁 5시부터 가동합니다. 반려견은 테라스에서만 동반할 수 있습니다.",
      "생일 케이크는 하루 전 주문해 주시고, 주말 웨이팅이 걱정되면 메신저로 미리 문의해 주세요.",
    ],
  },
  {
    id: "seoul-grain",
    name: "Seoul Grain",
    address: "서울 종로구 삼청로 88",
    tagline: "삼청동의 곡물 브런치 카페.",
    description: "통곡물과 계절 과일을 활용한 브런치를 선보입니다.",
    images: [
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1559339352-11d035aa65de?auto=format&fit=crop&w=1200&q=80",
    ],
    contact: "025556666",
    onlineLink: "",
    totalLikeCount: 1,
    lastReservedAt: "2025-11-22T11:00:00.000Z",
    recentReservers: reservers(1, 6),
    notice: [
      "서울 그레인은 오전 10시부터 브런치를 시작하며, 주말 브런치는 타임제로 운영합니다. 글루텐 프리 메뉴가 필요하면 별도로 요청해 주세요.",
      "노트북 자리는 평일에만 이용할 수 있고, 단체 예약은 10인까지 가능합니다.",
    ],
  },
  {
    id: "moon-harbor",
    name: "Moon Harbor",
    address: "서울 영등포구 여의동로 234",
    tagline: "여의도 한강뷰 시푸드 바.",
    description: "해산물과 와인을 즐기는 나이트 다이닝입니다.",
    images: [
      "https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80",
    ],
    contact: "026667777",
    onlineLink: "",
    totalLikeCount: 86,
    lastReservedAt: "2025-11-27T12:45:00.000Z",
    recentReservers: reservers(13, 3),
    notice: [
      "문 하버는 일몰 시간대 창가 좌석 예약이 빠르게 마감됩니다. 오이스터 해피아워는 평일 5–7시에 진행되며, 드레스 코드는 스마트 캐주얼입니다.",
      "창가 지정이 필요하면 예약 시 요청해 주시고, 비 소식에는 실내 좌석으로 안내드립니다.",
    ],
  },
  {
    id: "bamboo-kitchen",
    name: "Bamboo Kitchen",
    address: "서울 관악구 신림로 112",
    tagline: "신림의 담백한 중식 키친.",
    description: "수제 만두와 계절 볶음 요리를 내는 작은 중식당입니다.",
    images: [
      "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    ],
    contact: "027778888",
    onlineLink: "",
    totalLikeCount: 31,
    lastReservedAt: "2025-11-23T16:30:00.000Z",
    recentReservers: reservers(9, 5),
    notice: [
      "밤부 키친은 점심 특선과 저녁 코스를 따로 운영합니다. 만두는 하루 한정으로 준비되며, 매운맛 단계는 주문 시 알려 주세요.",
      "포장은 마감 30분 전까지만 가능하고, 생일 이벤트는 메신저로 하루 전 신청해 주세요.",
    ],
  },
];

export function getSpaceById(id: string) {
  return SAMPLE_SPACES.find((space) => space.id === id) ?? null;
}
