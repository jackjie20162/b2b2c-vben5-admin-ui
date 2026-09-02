import type {
  GoodsCreateFullReq,
  GoodsDetailResp,
  GoodsListResp,
  GoodsUpdateFullReq,
  IDsUint32Req,
} from './model/zzhshopR2Model';

import type {
  BaseDataResp,
  BaseResp,
} from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateGoods = '/zzhshopR2-api/admin/goods/create',
  DeleteGoods = '/zzhshopR2-api/admin/goods/delete',
  GetGoodsDetail = '/zzhshopR2-api/admin/goods',
  GetGoodsList = '/zzhshopR2-api/admin/goods/list',
  UpdateGoods = '/zzhshopR2-api/admin/goods/update',
}

/**
 *  @description: 商品列表（管理端）
 */
export const getGoodsList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<GoodsListResp>>(
    Api.GetGoodsList,
    params,
  );
};

/**
 *  @description: 新增商品（商品 + SPU规格 + SKU明细）
 */
export const createGoods = (params: GoodsCreateFullReq) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateGoods,
    params,
  );
};

/**
 *  @description: 更新商品（spus/skus 均为空时仅更新主表）
 */
export const updateGoods = (params: GoodsUpdateFullReq) => {
  return requestClient.post<BaseResp>(Api.UpdateGoods, params);
};

/**
 *  @description: 删除商品
 */
export const deleteGoods = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteGoods, params);
};

/**
 *  @description: 商品详情（含SKU）
 */
export const getGoodsDetail = (id: number) => {
  return requestClient.get<BaseDataResp<GoodsDetailResp>>(
    `${Api.GetGoodsDetail}/${id}`,
  );
};
