<script lang="ts" setup>
import type { GlobalStyleInfo } from '../../../api/model/zzhshopR2Model';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, message, TabPane, Tabs } from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';

import { getGlobalStyle, saveGlobalStyle } from '../../../api/diy';

defineOptions({
  name: 'ZzhshopR2StyleManagement',
});

const activeTab = ref<string>('category');
const saving = ref(false);

const fontColorOptions = [
  { label: '浅色', value: 'light' },
  { label: '深色', value: 'dark' },
];

const [Form, formApi] = useVbenForm({
  schema: [
    {
      fieldName: 'tab',
      label: 'tab',
      component: 'Input',
      defaultValue: 'category',
      dependencies: {
        show: false,
        triggerFields: ['tab'],
      },
    },
    // 类目页
    {
      fieldName: 'category_style',
      label: '类目页样式',
      component: 'Select',
      defaultValue: '4',
      componentProps: {
        options: [
          { label: '经典', value: '1' },
          { label: '潮流', value: '2' },
          { label: '简约', value: '3' },
          { label: '分类导航', value: '4' },
        ],
      },
      dependencies: {
        show: (values) => values.tab === 'category',
        triggerFields: ['tab'],
      },
    },
    // 发现页
    {
      fieldName: 'find_nav_color',
      label: '导航背景色',
      component: 'Input',
      componentProps: {
        placeholder: '如 #ff4632',
      },
      dependencies: {
        show: (values) => values.tab === 'find',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'find_font_color',
      label: '字体颜色',
      component: 'RadioButtonGroup',
      componentProps: {
        options: fontColorOptions,
      },
      dependencies: {
        show: (values) => values.tab === 'find',
        triggerFields: ['tab'],
      },
    },
    // 拼团栏页
    {
      fieldName: 'groups_nav_image',
      label: '导航背景图',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
      dependencies: {
        show: (values) => values.tab === 'groups',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'groups_nav_color',
      label: '导航背景色',
      component: 'Input',
      componentProps: {
        placeholder: '如 #fed295',
      },
      dependencies: {
        show: (values) => values.tab === 'groups',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'groups_font_color',
      label: '字体颜色',
      component: 'RadioButtonGroup',
      componentProps: {
        options: fontColorOptions,
      },
      dependencies: {
        show: (values) => values.tab === 'groups',
        triggerFields: ['tab'],
      },
    },
    // 购物车
    {
      fieldName: 'cart_nav_image',
      label: '导航背景图',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
      dependencies: {
        show: (values) => values.tab === 'cart',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'cart_nav_color',
      label: '导航背景色',
      component: 'Input',
      componentProps: {
        placeholder: '如 #ffffff',
      },
      dependencies: {
        show: (values) => values.tab === 'cart',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'cart_font_color',
      label: '字体颜色',
      component: 'RadioButtonGroup',
      componentProps: {
        options: fontColorOptions,
      },
      dependencies: {
        show: (values) => values.tab === 'cart',
        triggerFields: ['tab'],
      },
    },
    // 用户中心
    {
      fieldName: 'user_nav_color',
      label: '导航背景色',
      component: 'Input',
      componentProps: {
        placeholder: '如 #ffeccc',
      },
      dependencies: {
        show: (values) => values.tab === 'user',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'user_nav_image',
      label: '导航背景图',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
      dependencies: {
        show: (values) => values.tab === 'user',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'user_bg_color',
      label: '背景色',
      component: 'Input',
      componentProps: {
        placeholder: '如 #ffeccc',
      },
      dependencies: {
        show: (values) => values.tab === 'user',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'user_bg_image',
      label: '背景图',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
      dependencies: {
        show: (values) => values.tab === 'user',
        triggerFields: ['tab'],
      },
    },
    {
      fieldName: 'user_font_color',
      label: '字体颜色',
      component: 'RadioButtonGroup',
      componentProps: {
        options: fontColorOptions,
      },
      dependencies: {
        show: (values) => values.tab === 'user',
        triggerFields: ['tab'],
      },
    },
  ],
  showDefaultActions: false,
  layout: 'vertical',
  wrapperClass: 'grid-cols-2',
});

function handleTabChange(key: string) {
  formApi.setValues({ tab: key });
}

async function handleSave() {
  saving.value = true;
  try {
    const values = await formApi.getValues();
    delete values.tab;
    const result = await saveGlobalStyle(values as GlobalStyleInfo);
    if (result.code === 0) {
      message.success($t('common.successful'));
    }
  } finally {
    saving.value = false;
  }
}

async function loadStyle() {
  const res = await getGlobalStyle();
  if (res.code === 0 && res.data) {
    await formApi.setValues({ ...res.data, tab: activeTab.value });
  }
}

onMounted(() => {
  loadStyle();
});
</script>

<template>
  <Page auto-content-height>
    <div class="style-container">
      <Tabs
        v-model:active-key="activeTab"
        @change="(key: any) => handleTabChange(String(key))"
      >
        <TabPane key="category" tab="类目页" />
        <TabPane key="groups" tab="拼团栏页" />
        <TabPane key="find" tab="发现页" />
        <TabPane key="cart" tab="购物车" />
        <TabPane key="user" tab="用户中心" />
      </Tabs>
      <Form />
      <div class="style-footer">
        <Button :loading="saving" type="primary" @click="handleSave">
          保存样式
        </Button>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.style-container {
  max-width: 720px;
  padding: 16px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.style-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 8px;
  border-top: 1px solid hsl(var(--border));
}
</style>
