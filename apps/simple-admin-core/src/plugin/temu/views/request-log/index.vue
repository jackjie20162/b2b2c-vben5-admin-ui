<script lang="ts" setup>
import type { TemuRequestLogInfo } from '../../api/model/temuModel';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Button, Descriptions, Drawer, Input, Table, Tag } from 'ant-design-vue';

import { getRequestLogList } from '../../api/requestLog';

defineOptions({
  name: 'TemuRequestLogList',
});

const InputSearch = Input.Search;

const loading = ref(false);
const list = ref<TemuRequestLogInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const detailVisible = ref(false);
const currentRow = ref<TemuRequestLogInfo | null>(null);

const columns: any[] = [
  { title: 'ID', dataIndex: 'id', width: 80 },
  { title: 'Merchant ID', dataIndex: 'merchant_id', width: 100 },
  { title: 'API Key', dataIndex: 'api_key', width: 220, ellipsis: true },
  { title: 'Interface', dataIndex: 'interface_code', minWidth: 180, ellipsis: true },
  { title: 'Method', dataIndex: 'method', width: 100 },
  { title: 'Path', dataIndex: 'path', minWidth: 220, ellipsis: true },
  { title: 'Status', dataIndex: 'status_code', width: 90 },
  { title: 'Upstream', dataIndex: 'upstream_status', width: 90 },
  { title: 'Blocked', dataIndex: 'blocked_reason', width: 140 },
  { title: 'Latency(ms)', dataIndex: 'latency_ms', width: 100 },
  { title: 'Time', dataIndex: 'createtime', width: 180 },
  { title: 'Action', dataIndex: 'action', width: 90, fixed: 'right' as const },
];

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function normalizeRow(row: TemuRequestLogInfo) {
  return {
    ...row,
    blocked_reason: row.blocked_reason || '',
    createtime: row.createtime || 0,
  };
}

async function load() {
  loading.value = true;
  try {
    const res = await getRequestLogList({
      page: page.value,
      page_size: pageSize.value,
      keyword: keyword.value || undefined,
    });
    total.value = res.data.total ?? 0;
    list.value = (res.data.data ?? []).map(normalizeRow);
  } finally {
    loading.value = false;
  }
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

function openDetail(row: TemuRequestLogInfo) {
  currentRow.value = row;
  detailVisible.value = true;
}

function statusTag(code?: number) {
  const value = Number(code || 0);
  if (value >= 500) return 'red';
  if (value >= 400) return 'orange';
  if (value >= 200) return 'green';
  return 'blue';
}

onMounted(() => {
  load();
});
</script>

<template>
  <Page auto-content-height>
    <div class="page-head">
      <div class="page-title">Temu Request Logs</div>
      <div class="page-sub">Browse request status, latency, and block reason.</div>
    </div>

    <div class="toolbar">
      <Button @click="load">Refresh</Button>
      <div class="toolbar-right">
        <InputSearch
          v-model:value="keyword"
          allow-clear
          placeholder="Search API Key / Interface / Path"
          style="width: 280px"
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
      :scroll="{ x: 1450 }"
      row-key="id"
      size="middle"
      @change="onTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'createtime'">
          {{ fmtTime(record.createtime) }}
        </template>
        <template v-else-if="column.dataIndex === 'blocked_reason'">
          <Tag :color="record.blocked_reason ? 'red' : 'green'">
            {{ record.blocked_reason || 'normal' }}
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'status_code'">
          <Tag :color="statusTag(record.status_code)">{{ record.status_code || '-' }}</Tag>
        </template>
        <template v-else-if="column.dataIndex === 'merchant_id'">
          {{ record.merchant_id || '-' }}
        </template>
        <template v-else-if="column.dataIndex === 'latency_ms'">
          {{ record.latency_ms || 0 }}
        </template>
        <template v-else-if="column.dataIndex === 'upstream_status'">
          {{ record.upstream_status || '-' }}
        </template>
        <template v-else-if="column.dataIndex === 'action'">
          <Button type="link" size="small" @click="openDetail(record)">View</Button>
        </template>
      </template>
    </Table>

    <Drawer v-model:open="detailVisible" title="Log Detail" width="560" destroy-on-close>
      <Descriptions v-if="currentRow" bordered :column="1" size="small">
        <Descriptions.Item label="Time">{{ fmtTime(currentRow.createtime) }}</Descriptions.Item>
        <Descriptions.Item label="Merchant ID">{{ currentRow.merchant_id || '-' }}</Descriptions.Item>
        <Descriptions.Item label="API Key">{{ currentRow.api_key || '-' }}</Descriptions.Item>
        <Descriptions.Item label="Interface">{{ currentRow.interface_code || '-' }}</Descriptions.Item>
        <Descriptions.Item label="Method">{{ currentRow.method || '-' }}</Descriptions.Item>
        <Descriptions.Item label="Path">{{ currentRow.path || '-' }}</Descriptions.Item>
        <Descriptions.Item label="Status">{{ currentRow.status_code || '-' }}</Descriptions.Item>
        <Descriptions.Item label="Upstream">{{ currentRow.upstream_status || '-' }}</Descriptions.Item>
        <Descriptions.Item label="Blocked">{{ currentRow.blocked_reason || '-' }}</Descriptions.Item>
        <Descriptions.Item label="Latency">{{ currentRow.latency_ms || 0 }} ms</Descriptions.Item>
      </Descriptions>
    </Drawer>
  </Page>
</template>

<style scoped>
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

.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
  background: hsl(var(--muted));
}

.toolbar-right {
  margin-left: auto;
}
</style>
