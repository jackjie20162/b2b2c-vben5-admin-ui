import type {
  CommentInfo,
  CommentListReq,
  CommentListResp,
  IDsUint32Req,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateComment = '/zzhshopR2-api/admin/comment/create',
  DeleteComment = '/zzhshopR2-api/admin/comment/delete',
  GetComment = '/zzhshopR2-api/admin/comment',
  GetCommentList = '/zzhshopR2-api/admin/comment/list',
  UpdateComment = '/zzhshopR2-api/admin/comment/update',
}

/**
 *  @description: 评论列表
 */
export const getCommentList = (params: CommentListReq) => {
  return requestClient.post<BaseDataResp<CommentListResp>>(
    Api.GetCommentList,
    params,
  );
};

/**
 *  @description: 评论详情
 */
export const getCommentById = (id: number) => {
  return requestClient.get<BaseDataResp<CommentInfo>>(`${Api.GetComment}/${id}`);
};

/**
 *  @description: 新增评论
 */
export const createComment = (params: CommentInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateComment,
    params,
  );
};

/**
 *  @description: 更新评论
 */
export const updateComment = (params: CommentInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateComment, params);
};

/**
 *  @description: 删除评论
 */
export const deleteComment = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteComment, params);
};
