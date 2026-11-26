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
    address: "서울 강남구 논현로24길 29",
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
];
