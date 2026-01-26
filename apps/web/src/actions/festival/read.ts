"use server";

import type {
  FestivalData,
  GetFestivalsRequest,
  GetFestivalsResponse,
  TourApiFestivalItem,
  TourApiResponse,
} from "@/types/dto/festival";

const TOUR_API_BASE_URL = "https://apis.data.go.kr/B551011/KorService2";
const TOUR_API_KEY = process.env.TOUR_API_SERVICE_KEY;

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

export async function getFestivals(request?: GetFestivalsRequest): Promise<GetFestivalsResponse> {
  if (!TOUR_API_KEY) {
    console.error("TOUR_API_SERVICE_KEY is not set");
    throw new Error("API 키가 설정되지 않았습니다.");
  }

  const today = new Date();
  const eventStartDate = today.toISOString().slice(0, 10).replace(/-/g, "");

  const params = new URLSearchParams({
    serviceKey: TOUR_API_KEY,
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

  const url = `${TOUR_API_BASE_URL}/searchFestival2?${params.toString()}`;

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
