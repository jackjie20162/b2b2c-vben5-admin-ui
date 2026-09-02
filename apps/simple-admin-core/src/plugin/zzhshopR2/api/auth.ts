import type { AuthInfo, AuthListResp, IDsUint32Req } from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  DeleteAuth = '/zzhshopR2-api/admin/auth/delete',
  GetAuthDetail = '/zzhshopR2-api/admin/auth/',
  GetAuthList = '/zzhshopR2-api/admin/auth/list',
  UpdateAuth = '/zzhshopR2-api/admin/auth/update',
}

/**
 *  @description: 新店铺审核列表
 */
export const getAuthList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<AuthListResp>>(
    Api.GetAuthList,
    params,
  );
};

/**
 *  @description: 新店铺审核详情
 */
export const getAuthDetail = (id: number) => {
  return requestClient.get<BaseDataResp<AuthInfo>>(`${Api.GetAuthDetail}${id}`);
};

/**
 *  @description: 更新入驻审核
 */
export const updateAuth = (params: AuthInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateAuth, params);
};

/**
 *  @description: 删除入驻审核
 */
export const deleteAuth = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteAuth, params);
};
