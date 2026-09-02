<script lang="ts" setup>
import type { AuthInfo } from '../../api/model/zzhshopR2Model';

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

import { deleteAuth, getAuthList } from '../../api/auth';
import AuditDetail from './auditDetail.vue';
import { shopStateMap, shopVerifyMap } from './schema';

defineOptions({
  name: 'ZzhshopR2ShopAudit',
});

const InputSearch = Input.Search;

const loading = ref(false);
const list = ref<AuthInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const verifyFilter = ref('');
const keyword = ref('');
const selectedKeys = ref<number[]>([]);

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: AuditDetail,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '企业名·姓名', dataIndex: 'name', width: 140, ellipsis: true },
  { title: '证件', dataIndex: 'image', width: 80 },
  { title: '店铺类型', dataIndex: 'state', width: 100 },
  { title: '店铺名称', dataIndex: 'shopname', minWidth: 150, ellipsis: true },
  { title: '店铺头像', dataIndex: 'avatar', width: 80 },
  { title: '统一信用·身份证号', dataIndex: 'number', width: 180, ellipsis: true },
  { title: '手机号', dataIndex: 'mobile', width: 130 },
  { title: '微信号', dataIndex: 'wechat', width: 120, ellipsis: true },
  { title: '审核状态', dataIndex: 'verify', width: 110 },
  { title: '操作', dataIndex: 'action', width: 120 },
];

async function load() {
  loading.value = true;
  try {
    const res = await getAuthList({
      page: page.value,
      page_size: pageSize.value,
      shopname: keyword.value || undefined,
      verify: verifyFilter.value || undefined,
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

function openDetail(record: AuthInfo) {
  detailModalApi.setData({
    id: record.id,
    gridApi: { reload: load },
  });
  detailModalApi.open();
}

function handleDelete(ids: number[]) {
  Modal.confirm({
    title: '删除入驻申请',
    content: `确认删除选中的 ${ids.length} 条申请？删除后不可恢复`,
    okType: 'danger',
    onOk: async () => {
      await deleteAuth({ ids });
      message.success('删除成功');
      load();
    },
  });
}

function handleBatchDelete() {
  if (selectedKeys.value.length === 0) {
    message.warning('请先勾选要删除的申请');
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
    <DetailModal />

    <div class="list-panel">
      <div class="page-head">
        <div class="page-title">新店铺审核</div>
        <div class="page-sub">用于管理申请入驻店铺</div>
      </div>

      <Tabs
        v-model:active-key="verifyFilter"
        class="state-tabs"
        @change="onTabChange"
      >
        <TabPane key="" tab="全部" />
        <TabPane key="0" tab="已提交资质" />
        <TabPane key="1" tab="完善店铺" />
        <TabPane key="2" tab="审核中" />
        <TabPane key="3" tab="通过" />
        <TabPane key="4" tab="未通过" />
      </Tabs>

      <div class="toolbar">
        <Button @click="load">刷新</Button>
        <Button danger @click="handleBatchDelete">删除</Button>
        <div class="toolbar-right">
          <InputSearch
            v-model:value="keyword"
            allow-clear
            placeholder="搜索店铺名称"
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
        :scroll="{ x: 1400 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'image'">
            <img
              v-if="record.image"
              :src="record.image"
              class="cell-img"
              alt="credential"
            />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.dataIndex === 'state'">
            <Tag>{{ shopStateMap[record.state] ?? record.state }}</Tag>
          </template>
          <template v-else-if="column.dataIndex === 'avatar'">
            <img
              v-if="record.avatar"
              :src="record.avatar"
              class="cell-img"
              alt="avatar"
            />
            <span v-else>-</span>
          </template>
          <template v-else-if="column.dataIndex === 'verify'">
            <Tag
              :color="
                record.verify === '3'
                  ? 'green'
                  : record.verify === '4'
                    ? 'red'
                    : 'default'
              "
            >
              {{ shopVerifyMap[record.verify] ?? record.verify }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <Button size="small" type="link" @click="openDetail(record)">
              查看
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

.cell-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
