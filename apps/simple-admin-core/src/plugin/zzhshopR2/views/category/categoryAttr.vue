<script lang="ts" setup>
import type {
  CategoryAttributeInfo,
  CategoryTreeNode,
} from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  message,
  Modal,
  Switch,
  Table,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import {
  createCategoryAttribute,
  deleteCategoryAttribute,
  getCategoryAttributeList,
  updateCategoryAttribute,
} from '../../api/categoryAttribute';
import AttrForm from './attrForm.vue';

defineOptions({
  name: 'ZzhshopR2CategoryAttr',
});

/** 基础必须属性预设：开关默认开启(必填) */
const basePresets: { name: string; values: string[] }[] = [
  { name: '尺码', values: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', '均码'] },
  { name: '颜色', values: ['黑色', '白色', '灰色', '红色', '蓝色', '绿色', '黄色', '粉色'] },
  { name: '材质', values: ['棉', '聚酯纤维', '麻', '皮革', '牛仔布'] },
  { name: '风格', values: ['通勤', '韩版', '休闲', '街头', '文艺'] },
  { name: '适用年龄', values: ['18-24周岁', '25-29周岁', '30-34周岁', '35-39周岁', '40周岁以上'] },
];

const category = ref<CategoryTreeNode>({});
const categoryIds = ref<number[]>([]);
const loading = ref(false);
const list = ref<CategoryAttributeInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');
const selectedKeys = ref<number[]>([]);
const addingBase = ref(false);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: AttrForm,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '属性名', dataIndex: 'name', minWidth: 140 },
  { title: '类目ID', dataIndex: 'category_id', width: 90 },
  { title: '开关', dataIndex: 'is_switch', width: 90 },
  { title: '权重', dataIndex: 'weigh', width: 80 },
  { title: '创建时间', dataIndex: 'createtime', width: 170 },
  { title: '更新时间', dataIndex: 'updatetime', width: 170 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '操作', dataIndex: 'action', width: 120, fixed: 'right' as const },
];

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function load() {
  loading.value = true;
  try {
    const res = await getCategoryAttributeList({
      page: page.value,
      page_size: pageSize.value,
      category_ids: categoryIds.value,
      status: statusFilter.value || undefined,
    });
    list.value = res.data.data ?? [];
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
}

function onTabChange() {
  page.value = 1;
  load();
}

function onPageChange(p: number) {
  page.value = p;
  load();
}

/** 开关切换：必填属性 */
async function onToggleSwitch(record: CategoryAttributeInfo) {
  const newValue = record.is_switch === 1 ? 0 : 1;
  const res = await updateCategoryAttribute({
    id: record.id,
    is_switch: newValue,
  });
  if (res.code === 0) {
    record.is_switch = newValue;
  }
}

function openForm(record?: CategoryAttributeInfo) {
  formModalApi.setData({
    record: record
      ? { ...record }
      : { category_id: category.value.id, status: 'normal' },
    isUpdate: !!record,
    reload: load,
  });
  formModalApi.open();
}

async function handleDelete(ids: number[]) {
  const result = await deleteCategoryAttribute({ ids });
  if (result.code === 0) {
    message.success($t('common.successful'));
    await load();
  }
}

function handleBatchDelete() {
  if (selectedKeys.value.length === 0) {
    message.warning('请先勾选要删除的属性');
    return;
  }
  Modal.confirm({
    title: $t('common.deleteConfirm'),
    content: `将删除勾选的 ${selectedKeys.value.length} 个属性`,
    okType: 'danger',
    onOk: () => handleDelete(selectedKeys.value),
  });
}

/** 一键添加基础必须属性（已存在的跳过） */
async function addBaseAttrs() {
  addingBase.value = true;
  try {
    const res = await getCategoryAttributeList({
      page: 1,
      page_size: 200,
      category_ids: categoryIds.value,
    });
    const existNames = new Set((res.data.data ?? []).map((a) => a.name));
    const missing = basePresets.filter((p) => !existNames.has(p.name));
    if (missing.length === 0) {
      message.info('基础必须属性已存在，无需添加');
      return;
    }
    for (const preset of missing) {
      await createCategoryAttribute({
        category_id: category.value.id,
        name: preset.name,
        value: JSON.stringify(
          preset.values.map((name, i) => ({ key: i, name })),
        ),
        is_switch: 1,
        status: 'normal',
      });
    }
    message.success(`已添加 ${missing.length} 个基础必须属性`);
    await load();
  } finally {
    addingBase.value = false;
  }
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData() as {
        category: CategoryTreeNode;
        categoryIds: number[];
      };
      category.value = data.category ?? {};
      categoryIds.value = data.categoryIds ?? [];
      page.value = 1;
      statusFilter.value = '';
      selectedKeys.value = [];
      modalApi.setState({
        title: `[${category.value.name ?? ''}] 类目及子类目 属性`,
      });
      load();
    }
  },
});
</script>

<template>
  <Modal class="w-[80%]" :footer="false">
    <FormModal />
    <Tabs v-model:active-key="statusFilter" class="mb-2" @change="onTabChange">
      <TabPane key="" tab="全部" />
      <TabPane key="normal" tab="正常" />
      <TabPane key="hidden" tab="隐藏" />
    </Tabs>

    <div class="mb-3 flex gap-2">
      <Button type="primary" @click="openForm()">
        {{ $t('common.create') }}
      </Button>
      <Button :loading="addingBase" @click="addBaseAttrs">
        添加基础必须属性
      </Button>
      <Button danger @click="handleBatchDelete">
        {{ $t('common.delete') }}
      </Button>
    </div>

    <Table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
      }"
      :row-selection="{
        selectedRowKeys: selectedKeys,
        onChange: (keys: any) => (selectedKeys = keys),
      }"
      :scroll="{ x: 1100 }"
      row-key="id"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'is_switch'">
          <Switch
            :checked="record.is_switch === 1"
            checked-children="必填"
            un-checked-children="选填"
            @change="onToggleSwitch(record)"
          />
        </template>
        <template v-else-if="column.dataIndex === 'createtime'">
          {{ fmtTime(record.createtime) }}
        </template>
        <template v-else-if="column.dataIndex === 'updatetime'">
          {{ fmtTime(record.updatetime) }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Tag :color="record.status === 'normal' ? 'green' : 'default'">
            {{ record.status === 'normal' ? '正常' : '隐藏' }}
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <Button size="small" type="link" @click="openForm(record)">
            {{ $t('common.edit') }}
          </Button>
          <Button
            danger
            size="small"
            type="link"
            @click="handleDelete([record.id])"
          >
            {{ $t('common.delete') }}
          </Button>
        </template>
      </template>
    </Table>
  </Modal>
</template>
