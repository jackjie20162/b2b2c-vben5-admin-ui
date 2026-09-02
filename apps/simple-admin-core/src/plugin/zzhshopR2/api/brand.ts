import type { BrandInfo, BrandListResp, IDsUint32Req } from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateBrand = '/zzhshopR2-api/admin/brand/create',
  DeleteBrand = '/zzhshopR2-api/admin/brand/delete',
  GetBrandList = '/zzhshopR2-api/admin/brand/list',
  UpdateBrand = '/zzhshopR2-api/admin/brand/update',
}

/**
 *  @description: 品牌列表
 */
export const getBrandList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<BrandListResp>>(
    Api.GetBrandList,
    params,
  );
};

/**
 *  @description: 新增品牌
 */
export const createBrand = (params: BrandInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateBrand,
    params,
  );
};

/**
 *  @description: 更新品牌
 */
export const updateBrand = (params: BrandInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateBrand, params);
};

/**
 *  @description: 删除品牌
 */
export const deleteBrand = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteBrand, params);
};
