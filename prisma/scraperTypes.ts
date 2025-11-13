export type RawCampusArea = {
  descr: string;
  descrshort: string;
}

export type RawEateryType = {
  descr: string;
  descrshort: string;
}

export type RawPayMethod = {
  descr: string;
  descrshort: string;
}

export type RawDiningItem = {
  descr: string;
  category: string;
  item: string;
  healthy: boolean;
  showCategory: boolean;
}

export type RawDiningCuisine = {
  name: string;
  nameshort: string;
  descr: null | string;
}

export type RawCoordinates = {
  latitude: number;
  longitude: number;
}

export type RawOperatingHourEventMenuItem = {
  item: string;
  healthy: boolean;
  sortIdx: number;
}

export type RawOperatingHourEventMenuCategory = {
  category: string;
  sortIdx: number;
  items: RawOperatingHourEventMenuItem[];
}

export type RawOperatingHourEvent = {
  descr: string;
  startTimestamp: number;
  endTimestamp: number;
  start: string;
  end: string;
  menu: RawOperatingHourEventMenuCategory[];
  calSummary: string;
}

export type RawOperatingHour = {
  date: Date;
  status: string;
  events: RawOperatingHourEvent[];
}

export type RawEatery = {
  id: number;
  slug: string;
  name: string;
  nameshort: string;
  about: string;
  aboutshort: string;
  nutrition: string | null;
  cornellDining: boolean;
  opHoursCalc: string;
  opHoursCalcDescr: string;
  opHoursDescr: string;
  googleCalendarId: string;
  onlineOrdering: boolean;
  onlineOrderUrl: string | null;
  contactPhone: string | null;
  contactEmail: string | null;
  serviceUnitId: number | null;
  campusArea: RawCampusArea;
  latitude: number;
  longitude: number;
  location: string;
  coordinates: RawCoordinates;
  operatingHours: RawOperatingHour[];
  eateryTypes: RawEateryType[];
  diningCuisines: RawDiningCuisine[];
  payMethods: RawPayMethod[];
  diningItems: RawDiningItem[];
  announcements: string[];
  icon: string;
}

export type RawScrapedData = {
  status: string;
  data: {
    eateries: RawEatery[];
  }
  message: string | null;
  meta: {
    copyright: string,
    responseDttm: string
  }
}

export type RawStaticEatery = {
  id: number;
  slug: string;
  name: string;
  nameshort: string;
  about: string;
  aboutshort?: string;
  cornellDining?: boolean;
  contactPhone?: string | null;
  contactEmail?: string | null;
  latitude: number;
  longitude: number;
  location: string;
  campusArea: {
    descr: string;
    descrshort: string;
  };
  eateryTypes: Array<{
    descr: string;
    descrshort: string;
  }>;
  onlineOrdering?: boolean;
  onlineOrderUrl?: string | null;
  operatingHours: Array<{
    weekday: string;
    events: Array<{
      descr: string;
      start: string;
      end: string;
      menu: Array<{
        category: string;
        sortIdx: number;
        items: Array<{
          item: string;
          healthy: boolean;
          sortIdx: number;
        }>;
      }>;
    }>;
  }>;
  payMethods: Array<{
    descr: string;
    descrshort: string;
  }>;
  announcements?: string[];
  diningItems?: Array<{
    item: string;
    healthy: boolean;
    category: string;
  }>;
};
