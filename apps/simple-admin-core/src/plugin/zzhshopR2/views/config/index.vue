<script lang="ts" setup>
import type { ConfigFieldDef, ConfigTabDef } from './configSchema';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Alert,
  Button,
  Checkbox,
  CheckboxGroup,
  Input,
  message,
  Radio,
  RadioGroup,
  Select,
  Switch,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { getConfig, saveConfig } from '../../api/config';
import { configTabs, defaultClientConfig } from './configSchema';

defineOptions({
  name: 'ZzhshopR2ClientConfig',
});

const CONFIG_KEY = 'client';

const activeTab = ref('system');
const saving = ref(false);
const cfg = ref<Record<string, Record<string, any>>>(defaultClientConfig());

const currentTab = computed<ConfigTabDef>(
  () => configTabs.find((t) => t.key === activeTab.value) ?? configTabs[0],
);

function getVal(field: ConfigFieldDef) {
  return cfg.value[field.group]?.[field.key];
}

function setVal(field: ConfigFieldDef, value: any) {
  if (!cfg.value[field.group]) cfg.value[field.group] = {};
  cfg.value[field.group][field.key] = value;
}

async function loadConfig() {
  const res = await getConfig(CONFIG_KEY);
  if (res.code === 0 && res.data?.value) {
    try {
      const parsed = JSON.parse(res.data.value);
      const base = defaultClientConfig();
      for (const group of Object.keys(base)) {
        base[group] = { ...base[group], ...(parsed?.[group] ?? {}) };
      }
      // 保留默认分组之外的其它分组数据
      for (const group of Object.keys(parsed ?? {})) {
        if (!base[group]) base[group] = parsed[group];
      }
      cfg.value = base;
    } catch {
      // JSON 无效时使用默认配置
    }
  }
}

async function handleSave() {
  saving.value = true;
  try {
    const res = await saveConfig({
      key: CONFIG_KEY,
      value: JSON.stringify(cfg.value),
    });
    if (res.code === 0) {
      message.success($t('common.successful'));
    }
  } finally {
    saving.value = false;
  }
}

onMounted(loadConfig);
</script>

<template>
  <Page auto-content-height>
    <div class="cfg-container">
      <div class="cfg-header">
        <div class="cfg-title">系统设置</div>
        <div class="cfg-desc">
          订单的取消、自动收货、售后退款启动定时任务后生效！全局配置实时同步客户端，用户重启客户端后生效
        </div>
      </div>
      <Tabs v-model:active-key="activeTab">
        <TabPane v-for="tab in configTabs" :key="tab.key" :tab="tab.title" />
      </Tabs>

      <div class="cfg-body">
        <Alert
          v-if="currentTab.alert"
          :message="currentTab.alert"
          class="cfg-alert"
          show-icon
          type="warning"
        />
        <div class="cfg-thead">
          <div class="cfg-label">配置项</div>
          <div class="cfg-ctrl">参数</div>
        </div>
        <div
          v-for="field in currentTab.fields"
          :key="`${field.group}-${field.key}`"
          class="cfg-row"
        >
          <div class="cfg-label">{{ field.label }}</div>
          <div class="cfg-ctrl">
            <Switch
              v-if="field.type === 'switch'"
              :checked="getVal(field) === 'Y'"
              @change="(v: any) => setVal(field, v ? 'Y' : 'N')"
            />
            <Select
              v-else-if="field.type === 'select'"
              :options="field.options"
              :value="getVal(field)"
              style="width: 260px"
              @update:value="(v: any) => setVal(field, v)"
            />
            <RadioGroup
              v-else-if="field.type === 'radio'"
              :value="getVal(field)"
              @update:value="(v: any) => setVal(field, v)"
            >
              <Radio
                v-for="opt in field.options"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </Radio>
            </RadioGroup>
            <CheckboxGroup
              v-else-if="field.type === 'checkbox'"
              :value="getVal(field)"
              @update:value="(v: any) => setVal(field, v)"
            >
              <Checkbox
                v-for="opt in field.options"
                :key="opt.value"
                :value="opt.value"
              >
                {{ opt.label }}
              </Checkbox>
            </CheckboxGroup>
            <div v-else-if="field.type === 'color'" class="cfg-color-wrap">
              <Input
                :placeholder="field.placeholder"
                :value="getVal(field)"
                style="width: 160px"
                @update:value="(v: string) => setVal(field, v)"
              />
              <input
                :value="getVal(field)"
                class="cfg-color"
                type="color"
                @input="(e: any) => setVal(field, e.target.value)"
              />
            </div>
            <div v-else-if="field.type === 'image'" class="cfg-image-wrap">
              <Input
                :placeholder="field.placeholder"
                :value="getVal(field)"
                style="max-width: 480px"
                @update:value="(v: string) => setVal(field, v)"
              />
              <img
                v-if="getVal(field)"
                :src="getVal(field)"
                alt="preview"
                class="cfg-image"
              />
            </div>
            <Input
              v-else
              :placeholder="field.placeholder"
              :value="getVal(field)"
              style="max-width: 480px"
              @update:value="(v: string) => setVal(field, v)"
            />
            <div v-if="field.tip" class="cfg-tip">{{ field.tip }}</div>
          </div>
        </div>
      </div>

      <div class="cfg-footer">
        <Button :loading="saving" type="primary" @click="handleSave">
          保存配置
        </Button>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.cfg-container {
  padding: 16px;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
}

.cfg-header {
  margin-bottom: 12px;
}

.cfg-title {
  font-size: 16px;
  font-weight: 600;
}

.cfg-desc {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.cfg-alert {
  margin-bottom: 12px;
}

.cfg-thead,
.cfg-row {
  display: flex;
  gap: 16px;
  padding: 10px 8px;
  border-bottom: 1px solid hsl(var(--border));
}

.cfg-thead {
  font-weight: 600;
  background: hsl(var(--muted));
}

.cfg-label {
  flex: 0 0 220px;
  padding-top: 4px;
}

.cfg-ctrl {
  flex: 1;
  min-width: 0;
}

.cfg-tip {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.cfg-color-wrap,
.cfg-image-wrap {
  display: flex;
  gap: 8px;
  align-items: center;
}

.cfg-color {
  width: 32px;
  height: 32px;
  padding: 2px;
  cursor: pointer;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}

.cfg-image {
  width: 48px;
  height: 48px;
  object-fit: cover;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}

.cfg-footer {
  display: flex;
  justify-content: flex-end;
  padding-top: 12px;
}
</style>
