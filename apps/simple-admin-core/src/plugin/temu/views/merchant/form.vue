<script lang="ts" setup>
import type { TemuMerchantInfo } from '../../api/model/temuModel';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { createMerchant, updateMerchant } from '../../api/merchant';
import { dataFormSchemas } from './schema';

defineOptions({
  name: 'TemuMerchantForm',
});

const record = ref<TemuMerchantInfo>({});
const isUpdate = ref(false);
const gridApi = ref<any>(null);

async function onSubmit(values: Record<string, any>) {
  const payload = { ...values };
  if (payload.key_expire_at) {
    payload.key_expire_at = Math.floor(Number(payload.key_expire_at) / 1000);
  }
  const result = isUpdate.value
    ? await updateMerchant(payload as TemuMerchantInfo)
    : await createMerchant(payload as TemuMerchantInfo);

  if (result.code === 0) {
    message.success($t('common.successful'));
    await gridApi.value?.reload?.();
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
    isUpdate.value = !!modalApi.getData()?.isUpdate;
    record.value = isOpen ? modalApi.getData()?.record || {} : {};
    gridApi.value = isOpen ? modalApi.getData()?.gridApi : null;
    if (isOpen) {
      formApi.setValues({
        ...record.value,
        key_expire_at: record.value.key_expire_at
          ? Number(record.value.key_expire_at) * 1000
          : undefined,
      });
    }
    modalApi.setState({
      title: isUpdate.value ? '编辑商户Key' : '新增商户Key',
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
