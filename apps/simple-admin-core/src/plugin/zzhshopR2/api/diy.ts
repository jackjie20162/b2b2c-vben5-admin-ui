import type {
  GlobalStyleInfo,
  IconInfo,
  IconListResp,
  IDsUint32Req,
  LinkInfo,
  LinkListResp,
  PageInfo,
  PageListResp,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  CreateIcon = '/zzhshopR2-api/admin/icon/create',
  CreateLink = '/zzhshopR2-api/admin/link/create',
  CreatePage = '/zzhshopR2-api/admin/page/create',
  DeleteIcon = '/zzhshopR2-api/admin/icon/delete',
  DeleteLink = '/zzhshopR2-api/admin/link/delete',
  DeletePage = '/zzhshopR2-api/admin/page/delete',
  GetIconList = '/zzhshopR2-api/admin/icon/list',
  GetLinkList = '/zzhshopR2-api/admin/link/list',
  GetPageDetail = '/zzhshopR2-api/admin/page',
  GetPageList = '/zzhshopR2-api/admin/page/list',
  GetStyle = '/zzhshopR2-api/admin/style/get',
  SaveStyle = '/zzhshopR2-api/admin/style/save',
  UpdateIcon = '/zzhshopR2-api/admin/icon/update',
  UpdateLink = '/zzhshopR2-api/admin/link/update',
  UpdatePage = '/zzhshopR2-api/admin/page/update',
}

// ===== 装修页面/模板 =====

/**
 *  @description: 装修页面列表（type 过滤页面/模板，支持逗号多值）
 */
export const getPageList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<PageListResp>>(
    Api.GetPageList,
    params,
  );
};

/**
 *  @description: 新建装修页面/模板
 */
export const createPage = (params: PageInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreatePage,
    params,
  );
};

/**
 *  @description: 更新装修页面/模板
 */
export const updatePage = (params: PageInfo) => {
  return requestClient.post<BaseResp>(Api.UpdatePage, params);
};

/**
 *  @description: 删除装修页面/模板
 */
export const deletePage = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeletePage, params);
};

/**
 *  @description: 装修页面详情
 */
export const getPageDetail = (id: number) => {
  return requestClient.get<BaseDataResp<PageInfo>>(
    `${Api.GetPageDetail}/${id}`,
  );
};

// ===== 全局样式 =====

/**
 *  @description: 获取全局样式
 */
export const getGlobalStyle = () => {
  return requestClient.get<BaseDataResp<GlobalStyleInfo>>(Api.GetStyle);
};

/**
 *  @description: 保存全局样式
 */
export const saveGlobalStyle = (params: GlobalStyleInfo) => {
  return requestClient.post<BaseResp>(Api.SaveStyle, params);
};

// ===== 链接 =====

/**
 *  @description: 链接列表
 */
export const getLinkList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<LinkListResp>>(
    Api.GetLinkList,
    params,
  );
};

/**
 *  @description: 新增链接
 */
export const createLink = (params: LinkInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateLink,
    params,
  );
};

/**
 *  @description: 更新链接
 */
export const updateLink = (params: LinkInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateLink, params);
};

/**
 *  @description: 删除链接
 */
export const deleteLink = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteLink, params);
};

// ===== 图标 =====

/**
 *  @description: 图标列表
 */
export const getIconList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<IconListResp>>(
    Api.GetIconList,
    params,
  );
};

/**
 *  @description: 新增图标
 */
export const createIcon = (params: IconInfo) => {
  return requestClient.post<BaseDataResp<{ id: number }>>(
    Api.CreateIcon,
    params,
  );
};

/**
 *  @description: 更新图标
 */
export const updateIcon = (params: IconInfo) => {
  return requestClient.post<BaseResp>(Api.UpdateIcon, params);
};

/**
 *  @description: 删除图标
 */
export const deleteIcon = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteIcon, params);
};
