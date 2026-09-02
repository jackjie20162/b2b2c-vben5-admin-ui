import type { BaseDataResp } from '#/api/model/baseModel';
import { requestClient } from '#/api/request';

enum Api {
  Create = '/api/travel/orders',
  Detail = '/api/travel/orders',
}

export interface TravelCreateOrderReq {
  productId: number;
  packageId: number;
  date: string;
  timeSlot?: string;
  quantity: number;
  customerEmail?: string;
  reservationKey: string;
}

export interface TravelOrder {
  id: number;
  orderNo: string;
  status: string;
  totalAmount: number;
  currency: string;
}

export const createTravelOrder = (params: TravelCreateOrderReq) =>
  requestClient.post<BaseDataResp<TravelOrder>>(Api.Create, params);

export const getTravelOrder = (orderNo: string) =>
  requestClient.get<BaseDataResp<TravelOrder>>(`${Api.Detail}/${orderNo}`);
