import type { FeedbackInfo, FeedbackListResp, IDsUint32Req } from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  DeleteFeedback = '/zzhshopR2-api/admin/feedback/delete',
  GetFeedbackList = '/zzhshopR2-api/admin/feedback/list',
  UpdateFeedback = '/zzhshopR2-api/admin/feedback/update',
}

/**
 *  @description: 意见反馈列表
 */
export const getFeedbackList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<FeedbackListResp>>(
    Api.GetFeedbackList,
    params,
  );
};

/**
 *  @description: 处理意见反馈
 */
export const updateFeedback = (params: FeedbackInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateFeedback, params);
};

/**
 *  @description: 删除意见反馈
 */
export const deleteFeedback = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteFeedback, params);
};
