"use server";

import type {
  FestivalData,
  GetFestivalsRequest,
  GetFestivalsResponse,
  TourApiFestivalItem,
  TourApiResponse,
} from "@/types/dto/festival";

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const TOUR_API_SERVICE_KEY = process.env.TOUR_API_SERVICE_KEY;

const MONTH_NAMES: Record<string, string> = {
  "01": "JAN",
  "02": "FEB",
  "03": "MAR",
  "04": "APR",
  "05": "MAY",
  "06": "JUN",
  "07": "JUL",
  "08": "AUG",
  "09": "SEP",
  "10": "OCT",
  "11": "NOV",
  "12": "DEC",
};

function formatDate(dateStr: string): { month: string; day: string } {
  const month = dateStr.slice(4, 6);
  const day = dateStr.slice(6, 8);
  return {
    month: MONTH_NAMES[month] ?? month,
    day: day.replace(/^0/, ""),
  };
}

function formatDateRange(startDate: string, endDate: string): string {
  const start = formatDate(startDate);
  const end = formatDate(endDate);

  if (start.month === end.month) {
    return `${start.day}-${end.day}`;
  }
  return `${start.month} ${start.day}`;
}

function extractLocationShort(addr: string): string {
  const parts = addr.split(" ");
  if (parts.length >= 2) {
    return `${parts[0]} ${parts[1]}`;
  }
  return parts[0] ?? addr;
}

function transformFestivalItem(item: TourApiFestivalItem): FestivalData {
  const startDate = formatDate(item.eventstartdate);

  return {
    id: item.contentid,
    title: item.title,
    description: `${item.addr1} ${item.addr2 ?? ""}`.trim(),
    imageUrl:
      item.firstimage ||
      "https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?w=600&h=400&fit=crop",
    month: startDate.month,
    dateRange: formatDateRange(item.eventstartdate, item.eventenddate),
    location: extractLocationShort(item.addr1),
    eventType: "축제",
    startDate: item.eventstartdate,
    endDate: item.eventenddate,
    address: `${item.addr1} ${item.addr2 ?? ""}`.trim(),
    tel: item.tel ?? "",
  };
}

export async function getFestival(festivalId: string): Promise<FestivalData | null> {
  if (!TOUR_API_SERVICE_KEY) {
    console.error("TOUR_API_SERVICE_KEY is not set");
    throw new Error("API 키가 설정되지 않았습니다.");
  }

  // 검색 결과와 Detail API들을 병렬로 호출
  const [cachedFestival, detailData, introData] = await Promise.all([
    getFestivalFromSearch(festivalId),
    fetchDetailWithOverview(festivalId),
    fetchDetailIntro(festivalId),
  ]);

  // 둘 다 없으면 null
  if (!cachedFestival && !detailData) {
    return null;
  }

  // 기본 데이터 (검색 결과 우선)
  const baseFestival = cachedFestival || detailData;
  if (!baseFestival) return null;

  const result = { ...baseFestival };

  // Detail API에서 overview가 있으면 description 업데이트
  if (detailData?.description && detailData.description !== baseFestival.address) {
    result.description = detailData.description;
  }

  // DetailIntro API에서 추가 정보 병합
  if (introData) {
    if (introData.eventstartdate) {
      result.startDate = introData.eventstartdate;
    }
    if (introData.eventenddate) {
      result.endDate = introData.eventenddate;
    }
    if (introData.sponsor1tel) {
      result.tel = introData.sponsor1tel;
    }
    if (introData.eventstartdate && introData.eventenddate) {
      result.dateRange = formatDateRange(introData.eventstartdate, introData.eventenddate);
      result.month = formatDate(introData.eventstartdate).month;
    }
  }

  return result;
}

async function fetchDetailWithOverview(festivalId: string): Promise<FestivalData | null> {
  try {
    const commonData = await fetchDetailCommon(festivalId);
    if (!commonData) return null;

    return {
      id: commonData.contentid,
      title: commonData.title,
      description: commonData.overview || "",
      imageUrl: commonData.firstimage || "",
      month: "",
      dateRange: "",
      location: extractLocationShort(commonData.addr1 || ""),
      eventType: "축제",
      startDate: "",
      endDate: "",
      address: `${commonData.addr1 || ""} ${commonData.addr2 || ""}`.trim(),
      tel: commonData.tel || "",
    };
  } catch {
    return null;
  }
}

async function getFestivalFromSearch(festivalId: string): Promise<FestivalData | null> {
  try {
    // 여러 페이지에서 검색
    const results = await Promise.all([
      getFestivalsWithCache({ numOfRows: 50, pageNo: 1 }),
      getFestivalsWithCache({ numOfRows: 50, pageNo: 2 }),
    ]);

    for (const result of results) {
      const festival = result.data.find(f => f.id === festivalId);
      if (festival) {
        return festival;
      }
    }
    return null;
  } catch {
    return null;
  }
}

async function getFestivalsWithCache(request: GetFestivalsRequest): Promise<GetFestivalsResponse> {
  // 오늘 날짜를 고정하여 캐시 키 일관성 유지
  const today = new Date();
  const eventStartDate = `${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, "0")}${String(today.getDate()).padStart(2, "0")}`;

  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "Pollia",
    _type: "json",
    eventStartDate,
    numOfRows: String(request.numOfRows ?? 50),
    pageNo: String(request.pageNo ?? 1),
    arrange: "A",
  });

  const url = `${TOUR_API_BASE_URL}/searchFestival2?serviceKey=${TOUR_API_SERVICE_KEY}&${params.toString()}`;

  const response = await fetch(url, {
    next: { revalidate: 86400, tags: ["festivals"] },
  });

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  const data: TourApiResponse<TourApiFestivalItem> = await response.json();

  if (data.response.header.resultCode !== "0000") {
    throw new Error(`API error: ${data.response.header.resultMsg}`);
  }

  const items = data.response.body.items?.item ?? [];
  const festivals = Array.isArray(items)
    ? items.map(transformFestivalItem)
    : [transformFestivalItem(items)];

  return {
    data: festivals,
    totalCount: data.response.body.totalCount,
    pageNo: data.response.body.pageNo,
    numOfRows: data.response.body.numOfRows,
  };
}

async function fetchDetailCommon(contentId: string) {
  // serviceKey는 인코딩하지 않고 직접 추가 (공공데이터 API 특성)
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "Pollia",
    _type: "json",
    contentId,
  });

  const url = `${TOUR_API_BASE_URL}/detailCommon2?serviceKey=${TOUR_API_SERVICE_KEY}&${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();

    // XML 응답인 경우 (API 에러 시 XML 반환하는 경우가 있음)
    if (text.startsWith("<?xml") || text.startsWith("<")) {
      return null;
    }

    const data = JSON.parse(text);

    if (data.response?.header?.resultCode !== "0000") {
      return null;
    }

    const items = data.response?.body?.items?.item;
    if (!items) {
      return null;
    }

    return Array.isArray(items) ? items[0] : items;
  } catch (error) {
    console.error("fetchDetailCommon error:", error);
    return null;
  }
}

async function fetchDetailIntro(contentId: string) {
  const params = new URLSearchParams({
    MobileOS: "ETC",
    MobileApp: "Pollia",
    _type: "json",
    contentId,
    contentTypeId: "15",
  });

  const url = `${TOUR_API_BASE_URL}/detailIntro2?serviceKey=${TOUR_API_SERVICE_KEY}&${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      return null;
    }

    const text = await response.text();

    if (text.startsWith("<?xml") || text.startsWith("<")) {
      return null;
    }

    const data = JSON.parse(text);

    if (data.response?.header?.resultCode !== "0000") {
      return null;
    }

    const items = data.response?.body?.items?.item;
    if (!items) return null;

    return Array.isArray(items) ? items[0] : items;
  } catch {
    return null;
  }
}

export async function getFestivals(request?: GetFestivalsRequest): Promise<GetFestivalsResponse> {
  if (!TOUR_API_SERVICE_KEY) {
    console.error("TOUR_API_SERVICE_KEY is not set");
    throw new Error("API 키가 설정되지 않았습니다.");
  }

  const today = new Date();
  const eventStartDate = today.toISOString().slice(0, 10).replace(/-/g, "");

  const params = new URLSearchParams({
    MobileOS: "WEB",
    MobileApp: "Pollia",
    _type: "json",
    eventStartDate,
    numOfRows: String(request?.numOfRows ?? 12),
    pageNo: String(request?.pageNo ?? 1),
    arrange: "A",
  });

  if (request?.areaCode) {
    params.append("areaCode", request.areaCode);
  }

  const url = `${TOUR_API_BASE_URL}/searchFestival2?serviceKey=${TOUR_API_SERVICE_KEY}&${params.toString()}`;

  try {
    const response = await fetch(url, {
      next: { revalidate: 3600 },
    });

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`);
    }

    const data: TourApiResponse<TourApiFestivalItem> = await response.json();

    if (data.response.header.resultCode !== "0000") {
      throw new Error(`API error: ${data.response.header.resultMsg}`);
    }

    const items = data.response.body.items?.item ?? [];

    const festivals = Array.isArray(items)
      ? items.map(transformFestivalItem)
      : [transformFestivalItem(items)];

    return {
      data: festivals,
      totalCount: data.response.body.totalCount,
      pageNo: data.response.body.pageNo,
      numOfRows: data.response.body.numOfRows,
    };
  } catch (error) {
    console.error("getFestivals error:", error);
    throw new Error("축제 정보를 불러올 수 없습니다.");
  }
}
