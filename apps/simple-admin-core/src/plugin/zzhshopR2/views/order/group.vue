<script lang="ts" setup>
import type { GroupsOrderInfo } from '../../api/model/zzhshopR2Model';

import { computed, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import {
  Alert,
  Button,
  Input,
  message,
  Modal,
  Table,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { deleteGroupsOrder, getGroupsOrderList } from '../../api/groupsOrder';

defineOptions({
  name: 'ZzhshopR2OrderGroup',
});

const ReloadIcon = createIconifyIcon('ant-design:reload-outlined');
const DeleteIcon = createIconifyIcon('ant-design:delete-outlined');
const InputSearch = Input.Search;

const loading = ref(false);
const list = ref<GroupsOrderInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const stateFilter = ref('');
const keyword = ref('');
const selectedIds = ref<number[]>([]);

const stateTabs = [
  { key: '', label: '全部' },
  { key: '1', label: '待支付' },
  { key: '2', label: '待成团' },
  { key: '3', label: '待发货' },
  { key: '4', label: '待收货' },
  { key: '5', label: '待评论' },
  { key: '6', label: '已完成' },
  { key: '7', label: '已取消' },
];

// 拼团订单状态:1=待支付,2=待成团,3=待发货,4=待收货,5=待评论,6=已完成,7=已取消
const groupsStateMap: Record<string, { color: string; label: string }> = {
  '1': { color: 'orange', label: '待支付' },
  '2': { color: 'blue', label: '待成团' },
  '3': { color: 'cyan', label: '待发货' },
  '4': { color: 'purple', label: '待收货' },
  '5': { color: 'geekblue', label: '待评论' },
  '6': { color: 'green', label: '已完成' },
  '7': { color: 'default', label: '已取消' },
};

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '订单号', dataIndex: 'order_no', width: 180 },
  { title: '用户ID', dataIndex: 'user_id', width: 90 },
  { title: '店铺ID', dataIndex: 'shop_id', width: 90 },
  { title: '快递公司', dataIndex: 'express_name', width: 120 },
  { title: '快递单号', dataIndex: 'express_no', width: 160 },
  { title: '订单状态', dataIndex: 'state', width: 110 },
  { title: '创建时间', dataIndex: 'createtime', width: 170 },
  { title: '操作', dataIndex: 'action', width: 90 },
];

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function load() {
  loading.value = true;
  selectedIds.value = [];
  try {
    const res = await getGroupsOrderList({
      page: page.value,
      page_size: pageSize.value,
      state: stateFilter.value || undefined,
      order_no: keyword.value || undefined,
    });
    total.value = res.data.total ?? 0;
    list.value = res.data.data ?? [];
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

const rowSelection = computed(() => ({
  selectedRowKeys: selectedIds.value,
  onChange: (keys: number[]) => {
    selectedIds.value = keys;
  },
}));

function batchDelete() {
  if (selectedIds.value.length === 0) {
    message.warning('请先勾选要删除的拼团订单');
    return;
  }
  Modal.confirm({
    content: `确认删除勾选的 ${selectedIds.value.length} 个拼团订单吗？`,
    okType: 'danger',
    onOk: async () => {
      await deleteGroupsOrder({ ids: selectedIds.value });
      message.success('删除成功');
      load();
    },
    title: '删除拼团订单',
  });
}

function deleteOne(record: GroupsOrderInfo) {
  if (!record.id) return;
  Modal.confirm({
    content: `确认删除拼团订单「${record.order_no ?? record.id}」吗？`,
    okType: 'danger',
    onOk: async () => {
      await deleteGroupsOrder({ ids: [record.id ?? 0] });
      message.success('删除成功');
      load();
    },
    title: '删除拼团订单',
  });
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <div class="group-page">
      <Alert show-icon banner type="success">
        <template #message>
          重要提示：后台订单列表仅供查看，如需发货、修改订单信息请到商家后台操作！
        </template>
      </Alert>

      <div class="page-head">
        <div class="page-title">拼团订单</div>
        <div class="page-sub">仅用户监管商城拼团订单，具体操作请在商家中心管理</div>
      </div>

      <Tabs v-model:active-key="stateFilter" class="state-tabs" @change="onTabChange">
        <TabPane v-for="t in stateTabs" :key="t.key" :tab="t.label" />
      </Tabs>

      <div class="toolbar">
        <Button title="刷新" type="primary" @click="load">
          <template #icon><ReloadIcon /></template>
        </Button>
        <Button :disabled="selectedIds.length === 0" danger @click="batchDelete">
          <template #icon><DeleteIcon /></template>
          删除
        </Button>
        <InputSearch
          v-model:value="keyword"
          allow-clear
          placeholder="搜索订单号"
          style="width: 260px"
          @search="onSearch"
        />
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
        :row-selection="rowSelection"
        :scroll="{ x: 1200 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'state'">
            <Tag :color="groupsStateMap[record.state]?.color ?? 'default'">
              {{ groupsStateMap[record.state]?.label ?? record.state ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <Button danger size="small" type="link" @click="deleteOne(record)">
              删除
            </Button>
          </template>
        </template>
      </Table>
    </div>
  </Page>
</template>

<style scoped>
.group-page {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: auto;
  background: hsl(var(--background));
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

.toolbar .ant-input-search {
  margin-left: auto;
}
</style>
