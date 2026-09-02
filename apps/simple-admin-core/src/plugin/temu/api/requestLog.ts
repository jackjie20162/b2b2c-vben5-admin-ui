import type {
  TemuRequestLogListResp,
} from './model/temuModel';

import type { BaseDataResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  GetRequestLogList = '/temu/v2/logs',
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

export const getRequestLogList = (params: Record<string, any>) => {
  const query = buildQuery(params);
  return requestClient.get<BaseDataResp<TemuRequestLogListResp>>(
    `${Api.GetRequestLogList}${query ? `?${query}` : ''}`,
    {
      headers: TEMU_ADMIN_TOKEN
        ? { 'X-Admin-Token': TEMU_ADMIN_TOKEN }
        : {},
    },
  );
};
