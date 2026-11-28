/**
 * Profile interest regions (관심지역) — select down to 구 (or 시/군 leaf).
 * Keep free of React/Next/DOM.
 */

export const INTEREST_REGIONS_MAX = 5;

export type RegionNode = {
  name: string;
  children?: readonly RegionNode[];
};

function districts(...names: string[]): RegionNode[] {
  return names.map((name) => ({ name }));
}

function cityWithGus(name: string, gus: string[]): RegionNode {
  return { name, children: districts(...gus) };
}

/** Korea admin tree used by the interest-region picker. */
export const INTEREST_REGION_TREE: readonly RegionNode[] = [
  {
    name: "서울특별시",
    children: districts(
      "종로구",
      "중구",
      "용산구",
      "성동구",
      "광진구",
      "동대문구",
      "중랑구",
      "성북구",
      "강북구",
      "도봉구",
      "노원구",
      "은평구",
      "서대문구",
      "마포구",
      "양천구",
      "강서구",
      "구로구",
      "금천구",
      "영등포구",
      "동작구",
      "관악구",
      "서초구",
      "강남구",
      "송파구",
      "강동구",
    ),
  },
  {
    name: "부산광역시",
    children: districts(
      "중구",
      "서구",
      "동구",
      "영도구",
      "부산진구",
      "동래구",
      "남구",
      "북구",
      "해운대구",
      "사하구",
      "금정구",
      "강서구",
      "연제구",
      "수영구",
      "사상구",
      "기장군",
    ),
  },
  {
    name: "대구광역시",
    children: districts(
      "중구",
      "동구",
      "서구",
      "남구",
      "북구",
      "수성구",
      "달서구",
      "달성군",
      "군위군",
    ),
  },
  {
    name: "인천광역시",
    children: districts(
      "중구",
      "동구",
      "미추홀구",
      "연수구",
      "남동구",
      "부평구",
      "계양구",
      "서구",
      "강화군",
      "옹진군",
    ),
  },
  {
    name: "광주광역시",
    children: districts("동구", "서구", "남구", "북구", "광산구"),
  },
  {
    name: "대전광역시",
    children: districts("동구", "중구", "서구", "유성구", "대덕구"),
  },
  {
    name: "울산광역시",
    children: districts("중구", "남구", "동구", "북구", "울주군"),
  },
  {
    name: "세종특별자치시",
    children: districts("세종시"),
  },
  {
    name: "경기도",
    children: [
      cityWithGus("수원시", ["장안구", "권선구", "팔달구", "영통구"]),
      cityWithGus("성남시", ["수정구", "중원구", "분당구"]),
      cityWithGus("안양시", ["만안구", "동안구"]),
      cityWithGus("부천시", ["원미구", "소사구", "오정구"]),
      cityWithGus("안산시", ["상록구", "단원구"]),
      cityWithGus("고양시", ["덕양구", "일산동구", "일산서구"]),
      cityWithGus("용인시", ["처인구", "기흥구", "수지구"]),
      ...districts(
        "과천시",
        "광명시",
        "광주시",
        "군포시",
        "김포시",
        "남양주시",
        "동두천시",
        "시흥시",
        "오산시",
        "의왕시",
        "의정부시",
        "이천시",
        "파주시",
        "평택시",
        "포천시",
        "하남시",
        "화성시",
        "양주시",
        "여주시",
        "연천군",
        "가평군",
        "양평군",
      ),
    ],
  },
  {
    name: "강원특별자치도",
    children: districts(
      "춘천시",
      "원주시",
      "강릉시",
      "동해시",
      "태백시",
      "속초시",
      "삼척시",
      "홍천군",
      "횡성군",
      "영월군",
      "평창군",
      "정선군",
      "철원군",
      "화천군",
      "양구군",
      "인제군",
      "고성군",
      "양양군",
    ),
  },
  {
    name: "충청북도",
    children: [
      cityWithGus("청주시", ["상당구", "서원구", "흥덕구", "청원구"]),
      ...districts(
        "충주시",
        "제천시",
        "보은군",
        "옥천군",
        "영동군",
        "증평군",
        "진천군",
        "괴산군",
        "음성군",
        "단양군",
      ),
    ],
  },
  {
    name: "충청남도",
    children: [
      cityWithGus("천안시", ["동남구", "서북구"]),
      ...districts(
        "공주시",
        "보령시",
        "아산시",
        "서산시",
        "논산시",
        "계룡시",
        "당진시",
        "금산군",
        "부여군",
        "서천군",
        "청양군",
        "홍성군",
        "예산군",
        "태안군",
      ),
    ],
  },
  {
    name: "전북특별자치도",
    children: [
      cityWithGus("전주시", ["완산구", "덕진구"]),
      ...districts(
        "군산시",
        "익산시",
        "정읍시",
        "남원시",
        "김제시",
        "완주군",
        "진안군",
        "무주군",
        "장수군",
        "임실군",
        "순창군",
        "고창군",
        "부안군",
      ),
    ],
  },
  {
    name: "전라남도",
    children: districts(
      "목포시",
      "여수시",
      "순천시",
      "나주시",
      "광양시",
      "담양군",
      "곡성군",
      "구례군",
      "고흥군",
      "보성군",
      "화순군",
      "장흥군",
      "강진군",
      "해남군",
      "영암군",
      "무안군",
      "함평군",
      "영광군",
      "장성군",
      "완도군",
      "진도군",
      "신안군",
    ),
  },
  {
    name: "경상북도",
    children: [
      cityWithGus("포항시", ["남구", "북구"]),
      ...districts(
        "경주시",
        "김천시",
        "안동시",
        "구미시",
        "영주시",
        "영천시",
        "상주시",
        "문경시",
        "경산시",
        "의성군",
        "청송군",
        "영양군",
        "영덕군",
        "청도군",
        "고령군",
        "성주군",
        "칠곡군",
        "예천군",
        "봉화군",
        "울진군",
        "울릉군",
      ),
    ],
  },
  {
    name: "경상남도",
    children: [
      cityWithGus("창원시", ["의창구", "성산구", "마산합포구", "마산회원구", "진해구"]),
      ...districts(
        "진주시",
        "통영시",
        "사천시",
        "김해시",
        "밀양시",
        "거제시",
        "양산시",
        "의령군",
        "함안군",
        "창녕군",
        "고성군",
        "남해군",
        "하동군",
        "산청군",
        "함양군",
        "거창군",
        "합천군",
      ),
    ],
  },
  {
    name: "제주특별자치도",
    children: districts("제주시", "서귀포시"),
  },
];

export function formatInterestRegionLabel(path: readonly string[]): string {
  return path.map((part) => part.trim()).filter(Boolean).join(" ");
}

export function findRegionNode(
  path: readonly string[],
): RegionNode | undefined {
  let nodes: readonly RegionNode[] | undefined = INTEREST_REGION_TREE;
  let current: RegionNode | undefined;
  for (const part of path) {
    current = nodes?.find((node) => node.name === part);
    if (!current) {
      return undefined;
    }
    nodes = current.children;
  }
  return current;
}

export function listRegionChildren(
  path: readonly string[] = [],
): readonly RegionNode[] {
  if (path.length === 0) {
    return INTEREST_REGION_TREE;
  }
  return findRegionNode(path)?.children ?? [];
}

export function isRegionLeaf(path: readonly string[]): boolean {
  const node = findRegionNode(path);
  return Boolean(node && (!node.children || node.children.length === 0));
}

export function isValidInterestRegionLabel(label: string): boolean {
  const parts = label.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2) {
    return false;
  }
  return isRegionLeaf(parts);
}

export function normalizeInterestRegions(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }
  const seen = new Set<string>();
  const next: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") {
      continue;
    }
    const label = formatInterestRegionLabel(item.trim().split(/\s+/));
    if (!isValidInterestRegionLabel(label) || seen.has(label)) {
      continue;
    }
    seen.add(label);
    next.push(label);
    if (next.length >= INTEREST_REGIONS_MAX) {
      break;
    }
  }
  return next;
}

export function interestRegionsEqual(a: readonly string[], b: readonly string[]): boolean {
  if (a.length !== b.length) {
    return false;
  }
  return a.every((label, index) => label === b[index]);
}

/** Compact address/label text for substring matching. */
function compactRegionText(value: string): string {
  return value.replace(/\s+/g, "");
}

/**
 * Parent admin name → short token found in free-form addresses
 * (e.g. 서울특별시 → 서울, 수원시 → 수원).
 */
export function regionMatchToken(part: string): string {
  const trimmed = part.trim();
  if (!trimmed) {
    return "";
  }
  if (/(구|군)$/.test(trimmed)) {
    return trimmed;
  }
  return trimmed
    .replace(/(특별자치시|특별자치도|광역시|특별시)$/g, "")
    .replace(/(시|도)$/g, "");
}

/** True when address is inside the selected interest region (구/군 leaf). */
export function spaceMatchesInterestRegion(
  address: string,
  regionLabel: string,
): boolean {
  const parts = regionLabel.trim().split(/\s+/).filter(Boolean);
  if (parts.length < 2 || !isValidInterestRegionLabel(regionLabel)) {
    return false;
  }
  const haystack = compactRegionText(address);
  if (!haystack) {
    return false;
  }

  const leaf = parts[parts.length - 1];
  if (!haystack.includes(compactRegionText(leaf))) {
    return false;
  }

  if (parts.length >= 3) {
    const cityToken = regionMatchToken(parts[parts.length - 2]);
    if (cityToken && !haystack.includes(cityToken)) {
      return false;
    }
  }

  const sidoToken = regionMatchToken(parts[0]);
  if (sidoToken && !haystack.includes(sidoToken)) {
    return false;
  }

  return true;
}

/** True when address matches any configured interest region. */
export function spaceMatchesAnyInterestRegion(
  address: string,
  regionLabels: readonly string[],
): boolean {
  const regions = normalizeInterestRegions(regionLabels);
  if (regions.length === 0) {
    return false;
  }
  return regions.some((label) => spaceMatchesInterestRegion(address, label));
}
