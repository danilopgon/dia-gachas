export interface ICity {
  id: string;
  name: string;
  province: IProvince;
}

export interface IProvince {
  id: string;
  name: string;
}
