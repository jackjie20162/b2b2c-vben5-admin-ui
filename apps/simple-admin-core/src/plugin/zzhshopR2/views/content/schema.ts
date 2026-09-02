import type { VbenFormProps } from '@vben/common-ui';

import { z } from '#/adapter/form';

import { getCategoryList } from '../../api/category';

/** 标志多选项（存储为逗号分隔字符串，表单内以数组交互） */
export const FLAG_OPTIONS = [
  { label: '热门', value: 'hot' },
  { label: '首页', value: 'index' },
  { label: '推荐', value: 'recommend' },
];

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
      fieldName: 'category_id',
      label: '文章栏目',
      component: 'ApiTreeSelect',
      componentProps: {
        api: () => getCategoryList({ page: 1, page_size: 1000, type: 'article' }),
        resultField: 'data.data',
        labelField: 'name',
        valueField: 'id',
        parentKeyField: 'pid',
        showSearch: true,
      },
      rules: 'required',
    },
    {
      fieldName: 'title',
      label: '标题',
      component: 'Input',
      rules: z.string().min(1).max(250),
    },
    {
      fieldName: 'flag',
      label: '标志(多选)',
      component: 'CheckboxGroup',
      componentProps: {
        options: FLAG_OPTIONS,
      },
    },
    {
      fieldName: 'image',
      label: '图片',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
    },
    {
      fieldName: 'description',
      label: '描述',
      component: 'Textarea',
      componentProps: {
        rows: 3,
      },
    },
    {
      fieldName: 'content',
      label: '内容',
      component: 'Textarea',
      componentProps: {
        rows: 8,
      },
    },
    {
      fieldName: 'keywords',
      label: '关键字',
      component: 'Input',
    },
    {
      fieldName: 'views',
      label: '点击',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        min: 0,
        style: { width: '100%' },
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
