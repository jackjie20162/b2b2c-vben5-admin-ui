import type {
  AuditRefundReq,
  IDsUint32Req,
  RefundInfo,
  RefundListReq,
  RefundListResp,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  AuditRefund = '/zzhshopR2-api/admin/refund/audit',
  DeleteRefund = '/zzhshopR2-api/admin/refund/delete',
  GetRefund = '/zzhshopR2-api/admin/refund',
  GetRefundList = '/zzhshopR2-api/admin/refund/list',
}

/**
 *  @description: 退款列表
 */
export const getRefundList = (params: RefundListReq) => {
  return requestClient.post<BaseDataResp<RefundListResp>>(
    Api.GetRefundList,
    params,
  );
};

/**
 *  @description: 退款详情
 */
export const getRefundById = (id: number) => {
  return requestClient.get<BaseDataResp<RefundInfo>>(`${Api.GetRefund}/${id}`);
};

/**
 *  @description: 平台介入审核退款
 */
export const auditRefund = (params: AuditRefundReq) => {
  return requestClient.post<BaseResp>(Api.AuditRefund, params);
};

/**
 *  @description: 删除退款单
 */
export const deleteRefund = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteRefund, params);
};
