<script lang="ts" setup>
import type { CategoryAttributeInfo } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Input,
  InputNumber,
  message,
  Radio,
  RadioGroup,
  Switch,
} from 'ant-design-vue';

import {
  createCategoryAttribute,
  updateCategoryAttribute,
} from '../../api/categoryAttribute';

defineOptions({
  name: 'ZzhshopR2CategoryAttrForm',
});

const id = ref<number>();
const categoryId = ref<number>();
const name = ref('');
const isSwitch = ref(false);
const weigh = ref(0);
const status = ref('normal');
const values = ref<string[]>([]);
const isUpdate = ref(false);
const reload = ref<() => Promise<void>>();

/** 解析属性值 JSON：[{key,name}] 或纯字符串数组 */
function parseValues(raw?: string): string[] {
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    if (Array.isArray(arr)) {
      return arr.map((item: any) =>
        typeof item === 'string' ? item : (item?.name ?? ''),
      );
    }
  } catch {
    // 非 JSON 时按空处理
  }
  return [];
}

function addValue() {
  values.value.push('');
}

function removeValue(index: number) {
  values.value.splice(index, 1);
}

async function onConfirm() {
  if (!name.value.trim()) {
    message.warning('请填写属性名');
    return;
  }
  const validValues = values.value
    .map((v) => v.trim())
    .filter((v) => v !== '');
  const payload: CategoryAttributeInfo = {
    category_id: categoryId.value,
    name: name.value.trim(),
    value: JSON.stringify(
      validValues.map((v, i) => ({ key: i, name: v })),
    ),
    is_switch: isSwitch.value ? 1 : 0,
    weigh: weigh.value,
    status: status.value,
  };
  const result = isUpdate.value
    ? await updateCategoryAttribute({ ...payload, id: id.value })
    : await createCategoryAttribute(payload);
  if (result.code === 0) {
    message.success($t('common.successful'));
    await reload.value?.();
    modalApi.close();
  }
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onConfirm,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData() as {
        isUpdate: boolean;
        record: CategoryAttributeInfo;
        reload: () => Promise<void>;
      };
      isUpdate.value = data.isUpdate;
      reload.value = data.reload;
      const record = data.record ?? {};
      id.value = record.id;
      categoryId.value = record.category_id;
      name.value = record.name ?? '';
      isSwitch.value = record.is_switch === 1;
      weigh.value = record.weigh ?? 0;
      status.value = record.status ?? 'normal';
      values.value =
        record.id === undefined ? [''] : parseValues(record.value);
      if (values.value.length === 0) values.value = [''];
      modalApi.setState({
        title: isUpdate.value ? '编辑属性' : '添加属性',
      });
    }
  },
});
</script>

<template>
  <Modal>
    <div class="flex flex-col gap-4 p-2">
      <div class="flex items-center">
        <div class="w-28 text-right">属性名：</div>
        <Input
          v-model:value="name"
          class="flex-1"
          placeholder="如：尺码、颜色、材质"
        />
      </div>
      <div class="flex items-center">
        <div class="w-28 text-right">必填开关：</div>
        <Switch
          v-model:checked="isSwitch"
          checked-children="必填"
          un-checked-children="选填"
        />
        <span class="ml-2 text-xs text-gray-400">
          开启后为发布商品时的基础必须属性
        </span>
      </div>
      <div class="flex items-center">
        <div class="w-28 text-right">权重：</div>
        <InputNumber v-model:value="weigh" :min="0" style="width: 160px" />
      </div>
      <div class="flex items-center">
        <div class="w-28 text-right">状态：</div>
        <RadioGroup v-model:value="status" button-style="solid">
          <Radio value="normal">正常</Radio>
          <Radio value="hidden">隐藏</Radio>
        </RadioGroup>
      </div>
      <div class="flex items-start">
        <div class="w-28 pt-1 text-right">配置属性：</div>
        <div class="flex-1">
          <Button class="mb-2" size="small" type="primary" @click="addValue">
            + 增加
          </Button>
          <div
            v-for="(_, index) in values"
            :key="index"
            class="mb-2 flex items-center gap-2"
          >
            <Input
              v-model:value="values[index]"
              placeholder="属性值，如：XXS、黑色"
              style="width: 240px"
            />
            <Button danger size="small" @click="removeValue(index)">
              删除
            </Button>
          </div>
        </div>
      </div>
    </div>
  </Modal>
</template>
