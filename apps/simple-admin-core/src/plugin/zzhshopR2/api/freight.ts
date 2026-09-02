import type { ShopFreightListResp } from './model/zzhshopR2Model';

import type { BaseDataResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  GetFreightList = '/zzhshopR2-api/admin/freight/list',
}

/**
 *  @description: 运费模板列表（管理端）
 */
export const getFreightList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<ShopFreightListResp>>(
    Api.GetFreightList,
    params,
  );
};
