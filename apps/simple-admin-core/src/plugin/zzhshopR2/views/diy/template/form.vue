<script lang="ts" setup>
import type { PageInfo } from '../../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { createPage, updatePage } from '../../../api/diy';

defineOptions({
  name: 'ZzhshopR2TemplateForm',
});

const record = ref();
const isUpdate = ref(false);
const onSaved = ref<() => void>();

async function onSubmit(values: Record<string, any>) {
  // 模板固定为 systpl 类型
  const payload = { ...values, type: 'systpl' } as PageInfo;
  const result = isUpdate.value
    ? await updatePage(payload)
    : await createPage(payload);
  if (result.code === 0) {
    message.success($t('common.successful'));
    onSaved.value?.();
  }
}

const [Form, formApi] = useVbenForm({
  handleSubmit: onSubmit,
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
      label: '模板名称',
      component: 'Input',
      rules: 'required',
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
    onSaved.value = isOpen ? modalApi.getData()?.onSaved : null;
    if (isOpen) {
      formApi.setValues(record.value);
    }
    modalApi.setState({
      title: isUpdate.value ? '编辑模板' : '新建模板',
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
