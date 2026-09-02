import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

/** 订单状态:1=待支付,2=待发货,3=待收货,4=待评价,5=售后订单,6=已完成,7=已取消 */
export const orderStateMap: Record<string, { color: string; label: string }> = {
  '1': { color: 'orange', label: '待支付' },
  '2': { color: 'blue', label: '待发货' },
  '3': { color: 'cyan', label: '待收货' },
  '4': { color: 'purple', label: '待评价' },
  '5': { color: 'red', label: '售后订单' },
  '6': { color: 'green', label: '已完成' },
  '7': { color: 'default', label: '已取消' },
};

export function renderOrderState(state: string) {
  const item = orderStateMap[state];
  return h(
    Tag,
    { color: item?.color ?? 'default' },
    { default: () => item?.label ?? state },
  );
}

/** unix 秒时间戳格式化 */
export function formatUnixTime({ cellValue }: { cellValue: any }) {
  return cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : '';
}

export const tableColumns: VxeGridProps = {
  columns: [
    {
      title: 'ID',
      field: 'id',
      width: 70,
    },
    {
      title: '订单号',
      field: 'order_no',
      minWidth: 180,
    },
    {
      title: '用户ID',
      field: 'user_id',
      width: 90,
    },
    {
      title: '店铺ID',
      field: 'shop_id',
      width: 90,
    },
    {
      title: '订单状态',
      field: 'state',
      width: 110,
      slots: {
        default: ({ row }) => renderOrderState(row.state),
      },
    },
    {
      title: '快递公司',
      field: 'express_name',
      width: 120,
    },
    {
      title: '快递单号',
      field: 'express_no',
      width: 150,
    },
    {
      title: '下单时间',
      field: 'createtime',
      width: 170,
      formatter: formatUnixTime,
    },
    {
      title: '支付时间',
      field: 'paymenttime',
      width: 170,
      formatter: formatUnixTime,
    },
  ],
};

export const searchFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'order_no',
      label: '订单号',
      component: 'Input',
    },
    {
      fieldName: 'user_id',
      label: '用户ID',
      component: 'InputNumber',
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'state',
      label: '订单状态',
      component: 'Select',
      componentProps: {
        options: Object.entries(orderStateMap).map(([value, item]) => ({
          label: item.label,
          value: Number(value),
        })),
      },
    },
  ],
};

/** 评论评价:0=好评,1=中评,2=差评 */
export const commentStateMap: Record<string, { color: string; label: string }> =
  {
    '0': { color: 'green', label: '好评' },
    '1': { color: 'orange', label: '中评' },
    '2': { color: 'red', label: '差评' },
  };

export const commentFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'id',
      label: 'ID',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['id'],
      },
    },
    {
      fieldName: 'user_id',
      label: '用户ID',
      component: 'InputNumber',
      rules: 'required',
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'shop_id',
      label: '店铺ID',
      component: 'InputNumber',
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'goods_id',
      label: '商品ID',
      component: 'InputNumber',
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'order_type',
      label: '业务类型',
      component: 'Select',
      defaultValue: 'goods',
      componentProps: {
        options: [
          { label: '普通订单', value: 'goods' },
          { label: '拼团订单', value: 'groups' },
          { label: '秒杀订单', value: 'seckill' },
        ],
      },
    },
    {
      fieldName: 'state',
      label: '评价',
      component: 'Select',
      defaultValue: '0',
      componentProps: {
        options: [
          { label: '好评', value: '0' },
          { label: '中评', value: '1' },
          { label: '差评', value: '2' },
        ],
      },
    },
    {
      fieldName: 'content',
      label: '评论内容',
      component: 'Textarea',
      rules: 'required',
    },
    {
      fieldName: 'images',
      label: '图片组(逗号分隔)',
      component: 'Textarea',
    },
    {
      fieldName: 'score',
      label: '综合评分',
      component: 'InputNumber',
      componentProps: {
        max: 5,
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'score_describe',
      label: '描述相符',
      component: 'InputNumber',
      componentProps: {
        max: 5,
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'score_service',
      label: '服务相符',
      component: 'InputNumber',
      componentProps: {
        max: 5,
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'score_deliver',
      label: '发货相符',
      component: 'InputNumber',
      componentProps: {
        max: 5,
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'score_logistics',
      label: '物流相符',
      component: 'InputNumber',
      componentProps: {
        max: 5,
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'switch',
      label: '匿名评论',
      component: 'Select',
      defaultValue: 0,
      componentProps: {
        options: [
          { label: '否', value: 0 },
          { label: '是', value: 1 },
        ],
      },
    },
  ],
};

export const deliverFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'id',
      label: 'ID',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['id'],
      },
    },
    {
      fieldName: 'express_name',
      label: '快递公司',
      component: 'Input',
      rules: 'required',
    },
    {
      fieldName: 'express_no',
      label: '快递单号',
      component: 'Input',
      rules: 'required',
    },
  ],
};
