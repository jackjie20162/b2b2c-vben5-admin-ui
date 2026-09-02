<script lang="ts" setup>
import type { OrderInfo } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { deliverOrder } from '../../api/order';
import { deliverFormSchemas } from './schema';

defineOptions({
  name: 'ZzhshopR2OrderDeliver',
});

const record = ref<any>();
const gridApi = ref();

async function onSubmit(values: Record<string, any>) {
  // 发货：填写快递信息并将订单置为待收货(state=3)
  const params: OrderInfo = {
    id: record.value?.id,
    express_name: values.express_name,
    express_no: values.express_no,
    state: '3',
    delivertime: Math.floor(Date.now() / 1000),
  };
  const result = await deliverOrder(params);
  if (result.code === 0) {
    message.success($t('common.successful'));
    gridApi.value.reload();
  }
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
  schema: [...(deliverFormSchemas.schema as any)],
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
    record.value = isOpen ? modalApi.getData()?.record || {} : {};
    gridApi.value = isOpen ? modalApi.getData()?.gridApi : null;
    if (isOpen) {
      formApi.setValues({ id: record.value?.id });
    }
    modalApi.setState({
      title: `订单发货 - ${record.value?.order_no ?? ''}`,
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
