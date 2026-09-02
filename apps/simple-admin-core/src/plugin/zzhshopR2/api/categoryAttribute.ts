import type {
  CategoryAttributeInfo,
  CategoryAttributeListResp,
  IDsUint32Req,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateCategoryAttribute = '/zzhshopR2-api/admin/categoryattr/create',
  DeleteCategoryAttribute = '/zzhshopR2-api/admin/categoryattr/delete',
  GetCategoryAttributeList = '/zzhshopR2-api/admin/categoryattr/list',
  UpdateCategoryAttribute = '/zzhshopR2-api/admin/categoryattr/update',
}

/**
 *  @description: 类目属性列表
 */
export const getCategoryAttributeList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<CategoryAttributeListResp>>(
    Api.GetCategoryAttributeList,
    params,
  );
};

/**
 *  @description: 新增类目属性
 */
export const createCategoryAttribute = (params: CategoryAttributeInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateCategoryAttribute,
    params,
  );
};

/**
 *  @description: 更新类目属性
 */
export const updateCategoryAttribute = (params: CategoryAttributeInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateCategoryAttribute, params);
};

/**
 *  @description: 删除类目属性
 */
export const deleteCategoryAttribute = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteCategoryAttribute, params);
};
