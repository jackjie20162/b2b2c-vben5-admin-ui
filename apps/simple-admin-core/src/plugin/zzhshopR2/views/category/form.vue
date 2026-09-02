<script lang="ts" setup>
import type { CategoryInfo } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { createCategory, updateCategory } from '../../api/category';
import { dataFormSchemas } from './schema';

defineOptions({
  name: 'ZzhshopR2CategoryForm',
});

const record = ref();
const isUpdate = ref(false);
const gridApi = ref();

async function onSubmit(values: Record<string, any>) {
  const result = isUpdate.value
    ? await updateCategory(values as CategoryInfo)
    : await createCategory(values as CategoryInfo);
  if (result.code === 0) {
    message.success($t('common.successful'));
    gridApi.value.reload();
  }
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [...(dataFormSchemas.schema as any)],
  showDefaultActions: false,
  layout: 'vertical',
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
      // 先重置再回显，避免上次编辑的残留值影响新增（formApi 无 resetValues，正确方法为 resetForm）
      formApi.resetForm().then(() => formApi.setValues(record.value));
    }
    modalApi.setState({
      title: isUpdate.value ? '编辑分类' : '新增分类',
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
