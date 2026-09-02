import type {
  GroupsOrderListReq,
  GroupsOrderListResp,
  IDsUint32Req,
} from './model/zzhshopR2Model';

import type { BaseDataResp, BaseResp } from '#/api/model/baseModel';

import { requestClient } from '#/api/request';

enum Api {
  DeleteGroupsOrder = '/zzhshopR2-api/admin/groups/order/delete',
  GetGroupsOrderList = '/zzhshopR2-api/admin/groups/order/list',
}

/**
 *  @description: 拼团订单列表
 */
export const getGroupsOrderList = (params: GroupsOrderListReq) => {
  return requestClient.post<BaseDataResp<GroupsOrderListResp>>(
    Api.GetGroupsOrderList,
    params,
  );
};

/**
 *  @description: 删除拼团订单
 */
export const deleteGroupsOrder = (params: IDsUint32Req) => {
  return requestClient.post<BaseResp>(Api.DeleteGroupsOrder, params);
};
