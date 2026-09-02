import type {
  AdminOrderListResp,
  OrderDetailResp,
  OrderInfo,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  DeleteOrder = '/zzhshopR2-api/admin/order/delete',
  DeliverOrder = '/zzhshopR2-api/admin/order/deliver',
  GetOrderDetail = '/zzhshopR2-api/admin/order',
  GetOrderList = '/zzhshopR2-api/admin/order/list',
}

/**
 *  @description: 订单列表（管理端：订单+商品明细+买家）
 */
export const getOrderList = (params: Record<string, any>) => {
  return requestClient.post<BaseDataResp<AdminOrderListResp>>(
    Api.GetOrderList,
    params,
  );
};

/**
 *  @description: 订单详情（订单+商品明细）
 */
export const getOrderDetail = (id: number) => {
  return requestClient.get<BaseDataResp<OrderDetailResp>>(
    `${Api.GetOrderDetail}/${id}`,
  );
};

/**
 *  @description: 订单发货（填写快递信息并更新订单状态）
 */
export const deliverOrder = (params: OrderInfo) => {
  return requestClient.post<BaseResp>(Api.DeliverOrder, params);
};

/**
 *  @description: 批量删除订单
 */
export const deleteOrder = (ids: number[]) => {
  return requestClient.post<BaseResp>(Api.DeleteOrder, { ids });
};
