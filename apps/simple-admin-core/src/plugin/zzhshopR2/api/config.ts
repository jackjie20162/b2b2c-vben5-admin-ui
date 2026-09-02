import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

/** 通用配置键值（value 为 JSON 字符串） */
export interface ConfigInfo {
  key?: string;
  value?: string;
}

enum Api {
  GetConfig = '/zzhshopR2-api/admin/config/get',
  SaveConfig = '/zzhshopR2-api/admin/config/save',
}

/**
 *  @description: 按 key 获取商城配置
 */
export const getConfig = (key: string) => {
  return requestClient.get<BaseDataResp<ConfigInfo>>(Api.GetConfig, {
    params: { key },
  });
};

/**
 *  @description: 按 key 保存商城配置
 */
export const saveConfig = (params: ConfigInfo) => {
  return requestClient.post<BaseResp>(Api.SaveConfig, params);
};
