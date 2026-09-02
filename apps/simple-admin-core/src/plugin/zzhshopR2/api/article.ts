import type {
  ArticleInfo,
  ArticleListReq,
  ArticleListResp,
  IDsUint32Req,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateArticle = '/zzhshopR2-api/admin/article/create',
  DeleteArticle = '/zzhshopR2-api/admin/article/delete',
  GetArticle = '/zzhshopR2-api/admin/article',
  GetArticleList = '/zzhshopR2-api/admin/article/list',
  UpdateArticle = '/zzhshopR2-api/admin/article/update',
}

/**
 *  @description: 文章列表
 */
export const getArticleList = (params: ArticleListReq) => {
  return requestClient.post<BaseDataResp<ArticleListResp>>(
    Api.GetArticleList,
    params,
  );
};

/**
 *  @description: 文章详情
 */
export const getArticleById = (id: number) => {
  return requestClient.get<BaseDataResp<ArticleInfo>>(`${Api.GetArticle}/${id}`);
};

/**
 *  @description: 新增文章
 */
export const createArticle = (params: ArticleInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateArticle,
    params,
  );
};

/**
 *  @description: 更新文章
 */
export const updateArticle = (params: ArticleInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateArticle, params);
};

/**
 *  @description: 删除文章
 */
export const deleteArticle = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteArticle, params);
};
