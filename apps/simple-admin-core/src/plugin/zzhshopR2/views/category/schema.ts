import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Badge, Switch, Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';

import { getCategoryList, updateCategory } from '../../api/category';

export const tableColumns: VxeGridProps = {
  columns: [
    {
      type: 'checkbox',
      width: 60,
    },
    {
      title: 'ID',
      field: 'id',
      width: 80,
    },
    {
      title: '分类名称',
      field: 'name',
      minWidth: 240,
      treeNode: true,
    },
    {
      title: '类型',
      field: 'type',
      width: 90,
      slots: {
        default: ({ row }) =>
          h(
            Tag,
            { color: row.type === 'goods' ? 'blue' : 'cyan' },
            { default: () => (row.type === 'goods' ? '商品' : '文章') },
          ),
      },
    },
    {
      title: '图片',
      field: 'image',
      width: 90,
      slots: {
        default: ({ row }) =>
          row.image
            ? h('img', { src: row.image, style: { height: '40px', width: '40px', objectFit: 'cover' } })
            : h('span'),
      },
    },
    {
      title: '状态',
      field: 'status',
      width: 90,
      slots: {
        default: ({ row }) =>
          h(Badge, {
            status: row.status === 'normal' ? 'success' : 'default',
            text: row.status === 'normal' ? '正常' : '隐藏',
          }),
      },
    },
    {
      title: '导航显示',
      field: 'isnav',
      width: 100,
      slots: {
        default: (e) =>
          h(Switch, {
            checked: e.row.isnav === 1,
            onClick: () => {
              const newValue = e.row.isnav === 1 ? 0 : 1;
              updateCategory({ id: e.row.id, isnav: newValue }).then(() => {
                e.row.isnav = newValue;
              });
            },
          }),
      },
    },
    {
      title: '权重',
      field: 'weigh',
      width: 90,
    },
  ],
};

export const searchFormSchemas: VbenFormProps = {
  schema: [],
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
      fieldName: 'pid',
      label: '上级分类',
      component: 'ApiSelect',
      defaultValue: 0,
      componentProps: {
        api: () => getCategoryList({ page: 1, page_size: 1000 }),
        resultField: 'data.data',
        labelField: 'name',
        valueField: 'id',
      },
    },
    {
      fieldName: 'type',
      label: '分类类型',
      component: 'Input',
      defaultValue: 'goods',
      dependencies: {
        show: false,
        triggerFields: ['type'],
      },
    },
    {
      fieldName: 'name',
      label: '分类名称',
      component: 'Input',
      rules: z.string().min(1).max(50),
    },
    {
      fieldName: 'name_spacer',
      label: '拼音',
      component: 'Input',
    },
    {
      fieldName: 'image',
      label: '分类图片',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
    },
    {
      fieldName: 'flag',
      label: '标志',
      component: 'Input',
    },
    {
      fieldName: 'isnav',
      label: '导航显示',
      component: 'RadioButtonGroup',
      defaultValue: 1,
      componentProps: {
        options: [
          { label: '显示', value: 1 },
          { label: '隐藏', value: 0 },
        ],
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

export function renderStatusTag(status: string) {
  return h(
    Tag,
    { color: status === 'normal' ? 'green' : 'default' },
    { default: () => (status === 'normal' ? '正常' : '隐藏') },
  );
}
