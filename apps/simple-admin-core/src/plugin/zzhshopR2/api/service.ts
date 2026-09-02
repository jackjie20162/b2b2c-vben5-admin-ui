import type {
  IDsUint32Req,
  ShopServiceInfo,
  ShopServiceListResp,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateService = '/zzhshopR2-api/admin/service/create',
  DeleteService = '/zzhshopR2-api/admin/service/delete',
  GetServiceList = '/zzhshopR2-api/admin/service/list',
  UpdateService = '/zzhshopR2-api/admin/service/update',
}

/**
 *  @description: 店铺服务列表
 */
export const getServiceList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<ShopServiceListResp>>(
    Api.GetServiceList,
    params,
  );
};

/**
 *  @description: 新增店铺服务
 */
export const createService = (params: ShopServiceInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateService,
    params,
  );
};

/**
 *  @description: 更新店铺服务
 */
export const updateService = (params: ShopServiceInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateService, params);
};

/**
 *  @description: 删除店铺服务
 */
export const deleteService = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteService, params);
};
