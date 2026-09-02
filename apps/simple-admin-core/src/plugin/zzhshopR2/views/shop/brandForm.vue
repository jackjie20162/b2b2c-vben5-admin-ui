<script lang="ts" setup>
import type { BrandInfo } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { createBrand, updateBrand } from '../../api/brand';
import { brandFormSchemas } from './schema';

defineOptions({
  name: 'ZzhshopR2BrandForm',
});

const record = ref();
const isUpdate = ref(false);
const gridApi = ref();

async function onSubmit(values: Record<string, any>) {
  const payload = { ...values } as BrandInfo;
  const result = isUpdate.value
    ? await updateBrand(payload)
    : await createBrand(payload);
  if (result.code === 0) {
    message.success($t('common.successful'));
    gridApi.value.reload();
  }
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [...(brandFormSchemas.schema as any)],
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
      // 先重置再回显，避免上次编辑的残留值影响新增
      formApi.resetForm().then(() => formApi.setValues({ ...record.value }));
    }
    modalApi.setState({
      title: isUpdate.value ? '编辑品牌' : '添加品牌',
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
