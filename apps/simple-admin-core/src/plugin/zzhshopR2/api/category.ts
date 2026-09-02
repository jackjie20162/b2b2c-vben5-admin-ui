import type {
  CategoryInfo,
  CategoryListResp,
  CategoryTreeResp,
  IDsUint32Req,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateCategory = '/zzhshopR2-api/admin/category/create',
  DeleteCategory = '/zzhshopR2-api/admin/category/delete',
  GetCategoryList = '/zzhshopR2-api/admin/category/list',
  GetCategoryTree = '/zzhshopR2-api/admin/category/tree',
  UpdateCategory = '/zzhshopR2-api/admin/category/update',
}

/**
 *  @description: 分类列表
 */
export const getCategoryList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<CategoryListResp>>(
    Api.GetCategoryList,
    params,
  );
};

/**
 *  @description: 分类树
 */
export const getCategoryTree = (type: string) => {
  return requestClient.get<BaseDataResp<CategoryTreeResp>>(
    `${Api.GetCategoryTree}/${type}`,
  );
};

/**
 *  @description: 新增分类
 */
export const createCategory = (params: CategoryInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateCategory,
    params,
  );
};

/**
 *  @description: 更新分类
 */
export const updateCategory = (params: CategoryInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateCategory, params);
};

/**
 *  @description: 删除分类
 */
export const deleteCategory = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteCategory, params);
};
