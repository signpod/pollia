export interface TourApiFestivalItem {
  addr1: string;
  addr2: string;
  areacode: string;
  booktour: string;
  cat1: string;
  cat2: string;
  cat3: string;
  contentid: string;
  contenttypeid: string;
  createdtime: string;
  eventstartdate: string;
  eventenddate: string;
  firstimage: string;
  firstimage2: string;
  cpyrhtDivCd: string;
  mapx: string;
  mapy: string;
  mlevel: string;
  modifiedtime: string;
  sigungucode: string;
  tel: string;
  title: string;
}

export interface TourApiResponse<T> {
  response: {
    header: {
      resultCode: string;
      resultMsg: string;
    };
    body: {
      items: {
        item: T[];
      };
      numOfRows: number;
      pageNo: number;
      totalCount: number;
    };
  };
}

export interface FestivalData {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  month: string;
  dateRange: string;
  location: string;
  eventType: string;
  startDate: string;
  endDate: string;
  address: string;
  tel: string;
}

export interface GetFestivalsRequest {
  areaCode?: string;
  pageNo?: number;
  numOfRows?: number;
}

export interface GetFestivalsResponse {
  data: FestivalData[];
  totalCount: number;
  pageNo: number;
  numOfRows: number;
}
