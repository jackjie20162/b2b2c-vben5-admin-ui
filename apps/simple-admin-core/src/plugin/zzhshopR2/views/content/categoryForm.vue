<script lang="ts" setup>
import type { CategoryInfo } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { createCategory, getCategoryList, updateCategory } from '../../api/category';

defineOptions({
  name: 'ZzhshopR2ArticleCategoryForm',
});

const record = ref();
const isUpdate = ref(false);
const gridApi = ref();

async function onSubmit(values: Record<string, any>) {
  // 内容管理下的分类固定为文章分类
  const payload = { ...values, type: 'article' } as CategoryInfo;
  const result = isUpdate.value
    ? await updateCategory(payload)
    : await createCategory(payload);
  if (result.code === 0) {
    message.success($t('common.successful'));
    gridApi.value.reload();
  }
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  showDefaultActions: false,
  layout: 'vertical',
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
      component: 'ApiTreeSelect',
      defaultValue: 0,
      componentProps: {
        api: () => getCategoryList({ page: 1, page_size: 1000, type: 'article' }),
        resultField: 'data.data',
        labelField: 'name',
        valueField: 'id',
        parentKeyField: 'pid',
        showSearch: true,
      },
    },
    {
      fieldName: 'name',
      label: '分类名称',
      component: 'Input',
      rules: 'required',
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
});

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    const validationResult = await formApi.validate();
    if (validationResult.valid) {
      await formApi.submitForm();
      modalApi.close();
    }
  },
  onOpenChange(isOpen: boolean) {
    isUpdate.value = modalApi.getData()?.isUpdate;
    record.value = isOpen ? modalApi.getData()?.record || {} : {};
    gridApi.value = isOpen ? modalApi.getData()?.gridApi : null;
    if (isOpen) {
      // 先重置再回显，避免上次编辑的残留值影响新增
      formApi.resetForm().then(() => formApi.setValues(record.value));
    }
    modalApi.setState({
      title: isUpdate.value ? '编辑分类' : '添加分类',
    });
  },
});

defineExpose(modalApi);
</script>
<template>
  <Modal>
    <Form />
  </Modal>
</template>
