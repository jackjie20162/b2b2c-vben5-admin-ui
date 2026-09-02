import type { BaseDataResp } from '#/api/model/baseModel';
import { requestClient } from '#/api/request';

enum Api {
  List = '/api/travel/products',
  Detail = '/api/travel/products',
}

export interface TravelProduct {
  id: number;
  tenantId: number;
  merchantId: number;
  code: string;
  title: string;
  slug: string;
  destination: string;
  description: string;
  currency: string;
  minPrice: number;
  status: string;
}

export interface TravelProductListResp {
  items: TravelProduct[];
  total: number;
}

export interface TravelProductListParams {
  keyword?: string;
  destination?: string;
  page?: number;
  pageSize?: number;
}

export const getTravelProductList = (params: TravelProductListParams) =>
  requestClient.get<BaseDataResp<TravelProductListResp>>(Api.List, { params });

export const getTravelProductDetail = (id: number) =>
  requestClient.get<BaseDataResp<TravelProduct>>(`${Api.Detail}/${id}`);
