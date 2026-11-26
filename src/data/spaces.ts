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
  },
];
