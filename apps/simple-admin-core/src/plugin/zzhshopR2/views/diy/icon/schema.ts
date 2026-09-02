import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';

/** unix 秒时间戳格式化 */
export function formatUnixTime({ cellValue }: { cellValue: any }) {
  return cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : '';
}

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
      title: '类名',
      field: 'class',
      minWidth: 180,
    },
    {
      title: '图标',
      field: 'icon_preview',
      width: 90,
      slots: {
        default: ({ row }) =>
          row.class ? h('span', { class: row.class }) : h('span'),
      },
    },
    {
      title: '名称',
      field: 'name',
      minWidth: 150,
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
      fieldName: 'name',
      label: '名称',
      component: 'Input',
    },
    {
      fieldName: 'class',
      label: '类名',
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
      fieldName: 'name',
      label: '图标名称',
      component: 'Input',
      rules: z.string().min(1).max(100),
    },
    {
      fieldName: 'class',
      label: '图标类名',
      component: 'Input',
      rules: z.string().min(1).max(100),
      componentProps: {
        placeholder: '如 wlIcon-home',
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
