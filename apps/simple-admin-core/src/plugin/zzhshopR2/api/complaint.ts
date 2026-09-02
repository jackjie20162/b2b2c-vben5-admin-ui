import type { ComplaintInfo, ComplaintListResp, IDsUint32Req } from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  DeleteComplaint = '/zzhshopR2-api/admin/complaint/delete',
  GetComplaintList = '/zzhshopR2-api/admin/complaint/list',
  UpdateComplaint = '/zzhshopR2-api/admin/complaint/update',
}

/**
 *  @description: 投诉举报列表
 */
export const getComplaintList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<ComplaintListResp>>(
    Api.GetComplaintList,
    params,
  );
};

/**
 *  @description: 处理投诉举报
 */
export const updateComplaint = (params: ComplaintInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateComplaint, params);
};

/**
 *  @description: 删除投诉举报
 */
export const deleteComplaint = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteComplaint, params);
};
