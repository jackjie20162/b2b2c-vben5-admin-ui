import type { BaseDataResp } from '#/api/model/baseModel';
import { requestClient } from '#/api/request';

enum Api {
  Check = '/api/travel/inventory/check',
}

export interface TravelInventoryCheckReq {
  packageId: number;
  date: string;
  timeSlot?: string;
  quantity: number;
}

export interface TravelInventoryCheckResp {
  available: boolean;
  remaining: number;
  unitPrice: number;
  currency: string;
}

export const checkTravelInventory = (params: TravelInventoryCheckReq) =>
  requestClient.post<BaseDataResp<TravelInventoryCheckResp>>(Api.Check, params);
