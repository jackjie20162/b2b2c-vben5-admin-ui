import type { IDsUint32Req, ShopInfo, ShopListResp } from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateShop = '/zzhshopR2-api/admin/shop/create',
  DeleteShop = '/zzhshopR2-api/admin/shop/delete',
  GetShopList = '/zzhshopR2-api/admin/shop/list',
  UpdateShop = '/zzhshopR2-api/admin/shop/update',
}

/**
 *  @description: 店铺列表
 */
export const getShopList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<ShopListResp>>(
    Api.GetShopList,
    params,
  );
};

/**
 *  @description: 新增店铺
 */
export const createShop = (params: ShopInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateShop,
    params,
  );
};

/**
 *  @description: 更新店铺
 */
export const updateShop = (params: ShopInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateShop, params);
};

/**
 *  @description: 删除店铺
 */
export const deleteShop = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteShop, params);
};
