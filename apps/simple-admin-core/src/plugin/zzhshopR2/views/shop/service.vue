<script lang="ts" setup>
import type { ShopServiceInfo } from '../../api/model/zzhshopR2Model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  Button,
  Input,
  message,
  Modal,
  Table,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { deleteService, getServiceList } from '../../api/service';
import ServiceForm from './serviceForm.vue';

defineOptions({
  name: 'ZzhshopR2Service',
});

const InputSearch = Input.Search;

const loading = ref(false);
const list = ref<ShopServiceInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');
const keyword = ref('');
const selectedKeys = ref<number[]>([]);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ServiceForm,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '服务名称', dataIndex: 'name', width: 180 },
  { title: '服务描述', dataIndex: 'description', minWidth: 260, ellipsis: true },
  { title: '创建时间', dataIndex: 'createtime', width: 170 },
  { title: '更新时间', dataIndex: 'updatetime', width: 170 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '操作', dataIndex: 'action', width: 130 },
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
    const res = await getServiceList({
      page: page.value,
      page_size: pageSize.value,
      name: keyword.value || undefined,
      status: statusFilter.value || undefined,
    });
    total.value = res.data.total ?? 0;
    list.value = res.data.data ?? [];
    selectedKeys.value = [];
  } finally {
    loading.value = false;
  }
}

function onTabChange() {
  page.value = 1;
  load();
}

function onSearch() {
  page.value = 1;
  load();
}

function onTableChange(pagination: any) {
  page.value = pagination.current;
  pageSize.value = pagination.pageSize;
  load();
}

function openForm(record?: ShopServiceInfo) {
  formModalApi.setData({
    record: record ?? {},
    isUpdate: !!record,
    gridApi: { reload: load },
  });
  formModalApi.open();
}

function handleEditSelected() {
  if (selectedKeys.value.length !== 1) return;
  const row = list.value.find((item) => item.id === selectedKeys.value[0]);
  if (row) openForm(row);
}

function handleDelete(ids: number[]) {
  Modal.confirm({
    title: '删除服务项目',
    content: `确认删除选中的 ${ids.length} 个服务项目？删除后不可恢复`,
    okType: 'danger',
    onOk: async () => {
      await deleteService({ ids });
      message.success('删除成功');
      load();
    },
  });
}

function handleBatchDelete() {
  if (selectedKeys.value.length === 0) {
    message.warning('请先勾选要删除的服务项目');
    return;
  }
  handleDelete(selectedKeys.value);
}

onMounted(() => {
  load();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal />

    <div class="list-panel">
      <div class="page-head">
        <div class="page-title">服务管理</div>
        <div class="page-sub">用于管理店铺服务项目</div>
      </div>

      <Tabs
        v-model:active-key="statusFilter"
        class="state-tabs"
        @change="onTabChange"
      >
        <TabPane key="" tab="全部" />
        <TabPane key="normal" tab="正常" />
        <TabPane key="hidden" tab="隐藏" />
      </Tabs>

      <div class="toolbar">
        <Button @click="load">刷新</Button>
        <Button type="primary" @click="openForm()">添加</Button>
        <Button
          :disabled="selectedKeys.length !== 1"
          @click="handleEditSelected"
        >
          编辑
        </Button>
        <Button danger @click="handleBatchDelete">删除</Button>
        <div class="toolbar-right">
          <InputSearch
            v-model:value="keyword"
            allow-clear
            placeholder="搜索服务名称"
            style="width: 220px"
            @search="onSearch"
          />
        </div>
      </div>

      <Table
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
        }"
        :row-selection="{
          selectedRowKeys: selectedKeys,
          onChange: (keys: any) => (selectedKeys = keys),
        }"
        :scroll="{ x: 1100 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'createtime'">
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
              编辑
            </Button>
            <Button
              danger
              size="small"
              type="link"
              @click="handleDelete([record.id])"
            >
              删除
            </Button>
          </template>
        </template>
      </Table>
    </div>
  </Page>
</template>

<style scoped>
.list-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
}

.page-head {
  padding: 16px 16px 8px;
  background: hsl(var(--muted));
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.page-sub {
  margin-top: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.state-tabs {
  padding: 0 16px;
  background: hsl(var(--muted));
}

.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
}

.toolbar-right {
  margin-left: auto;
}
</style>
