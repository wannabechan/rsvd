export type SpaceNoticeBlock =
  | { type: "paragraph"; text: string }
  | { type: "bullets"; items: string[] };

export type SpaceItem = {
  id: string;
  name: string;
  address: string;
  tagline: string;
  description: string;
  thumbnailImage: string;
  contact: string;
  onlineLink: string;
  totalLikeCount: number;
  latestCommentPreview: string | null;
  notice: SpaceNoticeBlock[];
};

export const SAMPLE_SPACES: SpaceItem[] = [
  {
    id: "el-plato",
    name: "El Plato",
    address: "서울 강남구 논현로24길 29 청대선실 이람빌딩 503호",
    tagline: "고즈넉한 양재천 골목에서 바르셀로나를 경험하세요.",
    description:
      "스페인 바르셀로나의 분위기와 요리를 담은 다이닝 공간입니다. 예약 후 방문해 주세요.",
    thumbnailImage:
      "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1200&q=80",
    contact: "0212345678",
    onlineLink: "",
    totalLikeCount: 5,
    latestCommentPreview: "손님들과 함께 성장해온 el p...",
    notice: [
      {
        type: "paragraph",
        text: "엘 플라토를 찾아 주셔서 감사합니다. 이번 주에는 제철 재료로 구성한 스페인 디너 코스를 운영합니다. 방문 전 아래 안내를 확인해 주세요.",
      },
      {
        type: "bullets",
        items: [
          "주말 디너는 예약 손님 우선으로 안내합니다.",
          "알레르기 정보는 예약 메시지에 미리 남겨 주세요.",
          "주차는 건물 인근 공영주차장을 이용해 주세요.",
        ],
      },
      {
        type: "paragraph",
        text: "단체 예약(6인 이상)은 메신저로 문의해 주시면 좌석과 코스를 맞춰 드리겠습니다.",
      },
    ],
  },
  {
    id: "atelier-nori",
    name: "Atelier Nori",
    address: "서울 용산구 이태원로54길 18",
    tagline: "한남동의 작은 코스 다이닝.",
    description: "제철 재료로 구성하는 프렌치 코스 레스토랑입니다.",
    thumbnailImage:
      "https://images.unsplash.com/photo-1414235077428-338989a2e8c0?auto=format&fit=crop&w=1200&q=80",
    contact: "027654321",
    onlineLink: "",
    totalLikeCount: 2,
    latestCommentPreview: "조용하고 따뜻한 저녁이었어요",
    notice: [
      {
        type: "paragraph",
        text: "아틀리에 노리는 한 테이블씩 천천히 진행하는 코스 다이닝입니다. 오늘의 구성은 제철 채소와 해산물을 중심으로 준비합니다.",
      },
      {
        type: "bullets",
        items: [
          "런치 라스트 오더는 오후 1시 30분입니다.",
          "디너 예약은 2인 기준으로 안내합니다.",
          "와인 페어링은 메신저로 사전 요청해 주세요.",
        ],
      },
      {
        type: "paragraph",
        text: "노쇼 방지를 위해 예약 당일 오전 확인 메시지를 보내드리니, 답장을 남겨 주시면 감사하겠습니다.",
      },
    ],
  },
];

export function getSpaceById(id: string) {
  return SAMPLE_SPACES.find((space) => space.id === id) ?? null;
}
