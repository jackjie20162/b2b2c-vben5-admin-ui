import type {
  AddressInfo,
  AddressListResp,
  IDsUint32Req,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateAddress = '/zzhshopR2-api/admin/address/create',
  DeleteAddress = '/zzhshopR2-api/admin/address/delete',
  GetAddressList = '/zzhshopR2-api/admin/address/list',
  UpdateAddress = '/zzhshopR2-api/admin/address/update',
}

/**
 *  @description: 地址列表
 */
export const getAddressList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<AddressListResp>>(
    Api.GetAddressList,
    params,
  );
};

/**
 *  @description: 新增地址
 */
export const createAddress = (params: AddressInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateAddress,
    params,
  );
};

/**
 *  @description: 更新地址
 */
export const updateAddress = (params: AddressInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateAddress, params);
};

/**
 *  @description: 删除地址
 */
export const deleteAddress = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteAddress, params);
};
