import type {
  IDsUint32Req,
  TemuMerchantInfo,
  TemuMerchantListResp,
} from './model/temuModel';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateMerchant = '/temu/v2/merchants',
  DeleteMerchant = '/temu/v2/merchants',
  GetMerchantList = '/temu/v2/merchants',
  UpdateMerchant = '/temu/v2/merchants',
}

const TEMU_ADMIN_TOKEN = import.meta.env.VITE_TEMU_ADMIN_TOKEN || '';

function buildQuery(params: Record<string, any>) {
  const query = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === '') {
      return;
    }
    query.set(key, String(value));
  });
  return query.toString();
}

export const getMerchantList = (params: Record<string, any>) => {
  const query = buildQuery(params);
  return requestClient.get<BaseDataResp<TemuMerchantListResp>>(
    `${Api.GetMerchantList}${query ? `?${query}` : ''}`,
    {
      headers: TEMU_ADMIN_TOKEN
        ? { 'X-Admin-Token': TEMU_ADMIN_TOKEN }
        : {},
    },
  );
};

export const createMerchant = (params: TemuMerchantInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateMerchant,
    params,
    {
      headers: TEMU_ADMIN_TOKEN
        ? { 'X-Admin-Token': TEMU_ADMIN_TOKEN }
        : {},
    },
  );
};

export const updateMerchant = (params: TemuMerchantInfo) => {
  return requestClient.post<BaseResp>(`${Api.UpdateMerchant}/${params.id}/update`, params, {
    headers: TEMU_ADMIN_TOKEN
      ? { 'X-Admin-Token': TEMU_ADMIN_TOKEN }
      : {},
  });
};

export const deleteMerchant = (params: IDsUint32Req) => {
  const id = params.ids[0];
  return requestClient.post<BaseResp>(`${Api.DeleteMerchant}/${id}/delete`, { id }, {
    headers: TEMU_ADMIN_TOKEN
      ? { 'X-Admin-Token': TEMU_ADMIN_TOKEN }
      : {},
  });
};
