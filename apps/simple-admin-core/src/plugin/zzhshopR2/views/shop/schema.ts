import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';

/** unix 秒时间戳格式化 */
export function formatUnixTime({ cellValue }: { cellValue: any }) {
  return cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : '';
}

export const shopStateMap: Record<string, string> = {
  '0': '个人',
  '1': '企业',
  '2': '旗舰',
};

export const shopVerifyMap: Record<string, string> = {
  '0': '提交资质',
  '1': '提交店铺',
  '2': '提交审核',
  '3': '已通过',
  '4': '未通过',
};

export const tableColumns: VxeGridProps = {
  columns: [
    {
      type: 'checkbox',
      width: 60,
    },
    {
      title: 'ID',
      field: 'id',
      width: 70,
    },
    {
      title: '店铺头像',
      field: 'avatar',
      width: 90,
      slots: {
        default: ({ row }) =>
          row.avatar
            ? h('img', { src: row.avatar, style: { height: '48px', width: '48px', objectFit: 'cover', borderRadius: '4px' } })
            : h('span'),
      },
    },
    {
      title: '店铺名称',
      field: 'shopname',
      minWidth: 180,
    },
    {
      title: '店铺类型',
      field: 'state',
      width: 100,
      slots: {
        default: ({ row }) =>
          h(Tag, {}, { default: () => shopStateMap[row.state] ?? row.state }),
      },
    },
    {
      title: '自营',
      field: 'isself',
      width: 80,
      slots: {
        default: ({ row }) =>
          row.isself === 1
            ? h(Tag, { color: 'blue' }, { default: () => '自营' })
            : h(Tag, {}, { default: () => '非自营' }),
      },
    },
    {
      title: '审核状态',
      field: 'verify',
      width: 110,
      slots: {
        default: ({ row }) =>
          h(
            Tag,
            { color: row.verify === '3' ? 'green' : row.verify === '4' ? 'red' : 'default' },
            { default: () => shopVerifyMap[row.verify] ?? row.verify },
          ),
      },
    },
    {
      title: '省市',
      field: 'city',
      width: 120,
    },
    {
      title: '等级',
      field: 'level',
      width: 80,
    },
    {
      title: '创店时间',
      field: 'createtime',
      width: 170,
      formatter: formatUnixTime,
    },
  ],
};

export const searchFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'shopname',
      label: '店铺名称',
      component: 'Input',
    },
    {
      fieldName: 'state',
      label: '店铺类型',
      component: 'Select',
      componentProps: {
        options: Object.entries(shopStateMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      fieldName: 'verify',
      label: '审核状态',
      component: 'Select',
      componentProps: {
        options: Object.entries(shopVerifyMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
  ],
};

export const dataFormSchemas: VbenFormProps = {
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
      fieldName: 'shopname',
      label: '店铺名称',
      component: 'Input',
      rules: z.string().min(1).max(100),
    },
    {
      fieldName: 'user_id',
      label: '会员ID',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'avatar',
      label: '店铺头像',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
    },
    {
      fieldName: 'state',
      label: '店铺类型',
      component: 'RadioButtonGroup',
      defaultValue: '0',
      componentProps: {
        options: [
          { label: '个人', value: '0' },
          { label: '企业', value: '1' },
          { label: '旗舰', value: '2' },
        ],
      },
    },
    {
      fieldName: 'level',
      label: '店铺等级',
      component: 'InputNumber',
      defaultValue: 1,
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'isself',
      label: '是否自营',
      component: 'RadioButtonGroup',
      defaultValue: 0,
      componentProps: {
        options: [
          { label: '自营', value: 1 },
          { label: '非自营', value: 0 },
        ],
      },
    },
    {
      fieldName: 'islive',
      label: '直播权限',
      component: 'RadioButtonGroup',
      defaultValue: 0,
      componentProps: {
        options: [
          { label: '开通', value: 1 },
          { label: '关闭', value: 0 },
        ],
      },
    },
    {
      fieldName: 'verify',
      label: '审核状态',
      component: 'Select',
      defaultValue: '3',
      componentProps: {
        options: Object.entries(shopVerifyMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      fieldName: 'city',
      label: '省市',
      component: 'Input',
    },
    {
      fieldName: 'return_address',
      label: '退货地址',
      component: 'Input',
    },
    {
      fieldName: 'keywords',
      label: '关键字',
      component: 'Input',
    },
    {
      fieldName: 'bio',
      label: '店铺简介',
      component: 'Textarea',
      componentProps: {
        rows: 2,
      },
    },
    {
      fieldName: 'description',
      label: '描述',
      component: 'Textarea',
      componentProps: {
        rows: 2,
      },
    },
    {
      fieldName: 'weigh',
      label: '权重',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'RadioButtonGroup',
      defaultValue: 'normal',
      componentProps: {
        options: [
          { label: '正常', value: 'normal' },
          { label: '隐藏', value: 'hidden' },
        ],
      },
    },
  ],
};

/** 地址表单 */
export const addressFormSchemas: VbenFormProps = {
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
      rules: z.number().min(1),
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'name',
      label: '收货人',
      component: 'Input',
      rules: z.string().min(1).max(50),
    },
    {
      fieldName: 'mobile',
      label: '手机号',
      component: 'Input',
      rules: z.string().min(1).max(20),
    },
    {
      fieldName: 'country',
      label: '国家',
      component: 'Input',
      defaultValue: '中国',
    },
    {
      fieldName: 'province',
      label: '省份',
      component: 'Input',
    },
    {
      fieldName: 'city',
      label: '城市',
      component: 'Input',
    },
    {
      fieldName: 'citycode',
      label: '市级代码',
      component: 'InputNumber',
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'district',
      label: '区·县',
      component: 'Input',
    },
    {
      fieldName: 'adcode',
      label: '县级代码',
      component: 'InputNumber',
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'address',
      label: '详细地区',
      component: 'Textarea',
      componentProps: {
        rows: 2,
      },
    },
  ],
};

/** 店铺服务表单 */
export const serviceFormSchemas: VbenFormProps = {
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
      fieldName: 'name',
      label: '服务名称',
      component: 'Input',
      rules: z.string().min(1).max(100),
    },
    {
      fieldName: 'description',
      label: '服务描述',
      component: 'Textarea',
      componentProps: {
        rows: 3,
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'RadioButtonGroup',
      defaultValue: 'normal',
      componentProps: {
        options: [
          { label: '正常', value: 'normal' },
          { label: '隐藏', value: 'hidden' },
        ],
      },
    },
  ],
};

/** 品牌表单 */
export const brandFormSchemas: VbenFormProps = {
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
      fieldName: 'name',
      label: '品牌名称',
      component: 'Input',
      rules: z.string().min(1).max(100),
    },
    {
      fieldName: 'category_id',
      label: '类目ID(逗号分隔)',
      component: 'Input',
    },
    {
      fieldName: 'image',
      label: '品牌图片',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
    },
    {
      fieldName: 'content',
      label: '品牌介绍',
      component: 'Textarea',
      componentProps: {
        rows: 3,
      },
    },
    {
      fieldName: 'weigh',
      label: '权重',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'state',
      label: '状态值',
      component: 'RadioButtonGroup',
      defaultValue: '0',
      componentProps: {
        options: [
          { label: '审核中', value: '0' },
          { label: '已审核', value: '1' },
        ],
      },
    },
    {
      fieldName: 'status',
      label: '状态',
      component: 'RadioButtonGroup',
      defaultValue: 'normal',
      componentProps: {
        options: [
          { label: '正常', value: 'normal' },
          { label: '隐藏', value: 'hidden' },
        ],
      },
    },
  ],
};
