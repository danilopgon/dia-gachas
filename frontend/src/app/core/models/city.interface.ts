export interface ICity {
  id: string;
  name: string;
  provinceId: string;
  province: IProvince;
}

export interface IProvince {
  id: string;
  name: string;
  City: ICity[];
}
