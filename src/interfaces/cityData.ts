export interface CityDataPayload {
  localidade: string;
  uf: string;
  active: boolean;
}

export interface City extends CityDataPayload {
  id: number;
}
