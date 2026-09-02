import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

/** 资金账单条目 */
export interface MoneyLogInfo {
  id?: number;
  user_id?: number;
  username?: string;
  money?: number;
  before?: number;
  after?: number;
  memo?: string;
  type?: string;
  service_ids?: string;
  createtime?: number;
}

export interface MoneyLogListReq {
  page: number;
  page_size: number;
  user_id?: number;
  username?: string;
  type?: string;
  memo?: string;
}

export interface MoneyLogListResp {
  total: number;
  data?: MoneyLogInfo[];
}

/** 用户提现条目 */
export interface WithdrawInfo {
  id?: number;
  user_id?: number;
  username?: string;
  money?: number;
  handingfee?: number;
  taxes?: number;
  type?: string;
  account?: string;
  memo?: string;
  orderid?: string;
  transactionid?: string;
  status?: string;
  transfertime?: number;
  createtime?: number;
  updatetime?: number;
}

export interface WithdrawListReq {
  page: number;
  page_size: number;
  user_id?: number;
  status?: string;
  type?: string;
  account?: string;
  username?: string;
}

export interface WithdrawListResp {
  total: number;
  data?: WithdrawInfo[];
}

/** 关联订单商品摘要 */
export interface OrderGoodsBrief {
  title?: string;
  image?: string;
  price?: number;
  number?: number;
}

/** 关联订单摘要 */
export interface OrderBrief {
  order_no?: string;
  shopname?: string;
  createtime?: number;
  paymenttime?: number;
  goods?: OrderGoodsBrief[];
}

/** 关联提现单摘要 */
export interface WithdrawBrief {
  money?: number;
  handingfee?: number;
  taxes?: number;
  type?: string;
  account?: string;
  orderid?: string;
  transactionid?: string;
  memo?: string;
  status?: string;
  transfertime?: number;
}

/** 资金详情响应 */
export interface MoneyLogDetailResp {
  log?: MoneyLogInfo;
  orders?: OrderBrief[];
  withdraw?: WithdrawBrief;
}

/** 删除提现记录请求 */
export interface DeleteWithdrawReq {
  ids: number[];
}

/** 提现审核请求：agree=同意, refuse=拒绝 */
export interface AuditWithdrawReq {
  id?: number;
  action?: string;
  memo?: string;
}

enum Api {
  MoneyLogAdjust = '/zzhshopR2-api/admin/money/log/adjust',
  MoneyLogDetail = '/zzhshopR2-api/admin/money/log/detail',
  MoneyLogList = '/zzhshopR2-api/admin/money/log/list',
  WithdrawAudit = '/zzhshopR2-api/admin/withdraw/audit',
  WithdrawDelete = '/zzhshopR2-api/admin/withdraw/delete',
  WithdrawList = '/zzhshopR2-api/admin/withdraw/list',
}

/**
 *  @description: 资金账单列表
 */
export const getMoneyLogList = (params: MoneyLogListReq) => {
  return requestClient.post<BaseDataResp<MoneyLogListResp>>(
    Api.MoneyLogList,
    params,
  );
};

/**
 *  @description: 用户提现列表
 */
export const getWithdrawList = (params: WithdrawListReq) => {
  return requestClient.post<BaseDataResp<WithdrawListResp>>(
    Api.WithdrawList,
    params,
  );
};

/**
 *  @description: 提现审核（同意/拒绝，拒绝自动退回余额）
 */
export const auditWithdraw = (params: AuditWithdrawReq) => {
  return requestClient.post<BaseResp>(Api.WithdrawAudit, params);
};

/**
 *  @description: 资金详情（账单 + 关联业务数据）
 */
export const getMoneyLogDetail = (params: { id: number }) => {
  return requestClient.post<BaseDataResp<MoneyLogDetailResp>>(
    Api.MoneyLogDetail,
    params,
  );
};

/**
 *  @description: 校准数据（对齐 PHP 资金账单-校准）
 */
export const adjustMoneyLog = () => {
  return requestClient.post<BaseDataResp<BaseResp>>(Api.MoneyLogAdjust, {});
};

/**
 *  @description: 删除提现记录
 */
export const deleteWithdraw = (params: DeleteWithdrawReq) => {
  return requestClient.post<BaseResp>(Api.WithdrawDelete, params);
};
