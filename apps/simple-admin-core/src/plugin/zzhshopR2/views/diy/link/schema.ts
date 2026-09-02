import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';

/** unix 秒时间戳格式化 */
export function formatUnixTime({ cellValue }: { cellValue: any }) {
  return cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : '';
}

export const linkTypeMap: Record<string, string> = {
  activity: '活动',
  page: '自定义页面',
  product: '商品',
  system: '系统',
  user: '用户中心',
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
      title: '页面类型',
      field: 'type',
      width: 120,
      slots: {
        default: ({ row }) =>
          h(Tag, {}, { default: () => linkTypeMap[row.type] ?? row.type }),
      },
    },
    {
      title: '页面标题',
      field: 'title',
      minWidth: 180,
    },
    {
      title: '路径',
      field: 'route',
      minWidth: 220,
    },
    {
      title: '创建时间',
      field: 'createtime',
      width: 170,
      formatter: formatUnixTime,
    },
    {
      title: '更新时间',
      field: 'updatetime',
      width: 170,
      formatter: formatUnixTime,
    },
    {
      title: '权重',
      field: 'weigh',
      width: 80,
    },
    {
      title: '状态',
      field: 'status',
      width: 90,
      slots: {
        default: ({ row }) =>
          row.status === 'hidden'
            ? h(Tag, { color: 'red' }, { default: () => '隐藏' })
            : h(Tag, { color: 'green' }, { default: () => '正常' }),
      },
    },
  ],
};

export const searchFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'title',
      label: '页面标题',
      component: 'Input',
    },
    {
      fieldName: 'route',
      label: '路径',
      component: 'Input',
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
      fieldName: 'type',
      label: '页面类型',
      component: 'Select',
      defaultValue: 'system',
      componentProps: {
        options: Object.entries(linkTypeMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      fieldName: 'title',
      label: '页面标题',
      component: 'Input',
      rules: z.string().min(1).max(100),
    },
    {
      fieldName: 'route',
      label: '页面路径',
      component: 'Input',
      rules: z.string().min(1).max(255),
      componentProps: {
        placeholder: '如 /pages/goods/detail',
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
