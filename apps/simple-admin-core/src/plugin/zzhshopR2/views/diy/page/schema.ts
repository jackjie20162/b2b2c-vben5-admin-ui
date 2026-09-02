import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';

/** unix 秒时间戳格式化 */
export function formatUnixTime({ cellValue }: { cellValue: any }) {
  return cellValue ? new Date(Number(cellValue) * 1000).toLocaleString() : '';
}

export const pageTypeMap: Record<string, string> = {
  index: 'APP首页',
  page: '单页',
  shop: '店铺',
  systpl: '首页模板',
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
      title: '页面名称',
      field: 'name',
      minWidth: 180,
    },
    {
      title: '所属店铺',
      field: 'shop_id',
      width: 100,
    },
    {
      title: '类型',
      field: 'type',
      width: 110,
      slots: {
        default: ({ row }) =>
          h(
            Tag,
            { color: row.type === 'index' ? 'blue' : 'default' },
            { default: () => pageTypeMap[row.type] ?? row.type },
          ),
      },
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
      label: '页面名称',
      component: 'Input',
    },
    {
      fieldName: 'type',
      label: '类型',
      component: 'Select',
      componentProps: {
        options: Object.entries(pageTypeMap).map(([value, label]) => ({
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
      fieldName: 'name',
      label: '页面名称',
      component: 'Input',
      rules: z.string().min(1).max(100),
    },
    {
      fieldName: 'shop_id',
      label: '所属店铺ID',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        min: 0,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'type',
      label: '类型',
      component: 'Select',
      defaultValue: 'page',
      componentProps: {
        options: Object.entries(pageTypeMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
    {
      fieldName: 'cover',
      label: '封面图',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
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
