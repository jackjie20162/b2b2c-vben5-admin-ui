<script lang="ts" setup>
import type { ArticleInfo } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { message } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { createArticle, updateArticle } from '../../api/article';
import { dataFormSchemas } from './schema';

defineOptions({
  name: 'ZzhshopR2ArticleForm',
});

const record = ref();
const isUpdate = ref(false);
const gridApi = ref();

async function onSubmit(values: Record<string, any>) {
  // flag 表单内为数组，存储为逗号分隔字符串
  const payload = {
    ...values,
    flag: Array.isArray(values.flag) ? values.flag.join(',') : (values.flag ?? ''),
  } as ArticleInfo;
  const result = isUpdate.value
    ? await updateArticle(payload)
    : await createArticle(payload);
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
      // 先重置再回显，避免上次编辑的残留值影响新增
      const values = { ...record.value };
      values.flag =
        typeof values.flag === 'string' && values.flag !== ''
          ? values.flag.split(',')
          : [];
      formApi.resetForm().then(() => formApi.setValues(values));
    }
    modalApi.setState({
      title: isUpdate.value ? '编辑文章' : '添加文章',
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
