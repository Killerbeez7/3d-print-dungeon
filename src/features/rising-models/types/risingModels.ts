export type RisingModelsPeriod = 7 | 30;

export interface FetchRisingModelsOptions {
  period: RisingModelsPeriod;
  limit?: number;
}
