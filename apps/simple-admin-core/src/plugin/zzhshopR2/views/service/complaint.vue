<script lang="ts" setup>
import type { ComplaintInfo } from '../../api/model/zzhshopR2Model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Image, message, Modal, Table, TabPane, Tabs, Tag } from 'ant-design-vue';

import { deleteComplaint, getComplaintList } from '../../api/complaint';
import ComplaintDetail from './complaintDetail.vue';

defineOptions({
  name: 'ZzhshopR2Complaint',
});

const loading = ref(false);
const list = ref<ComplaintInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const stateFilter = ref('');

const typeMap: Record<string, string> = {
  0: '用户举报',
  1: '商品举报',
  2: '店铺举报',
};

const reasonMap: Record<string, string> = {
  0: '虚假交易',
  1: '诈骗欺诈',
  2: '收到空包裹',
  3: '假冒盗版',
  4: '泄露信息',
  5: '违禁物品',
  6: '未按成交价交易',
  7: '未按约定时间发货',
  8: '垃圾营销',
  9: '涉黄信息',
  10: '不实信息',
  11: '人身攻击',
  12: '违法信息',
  13: '诈骗信息',
};

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: ComplaintDetail,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '举报类型', dataIndex: 'type', width: 100 },
  { title: '举报人', dataIndex: 'user_nickname', width: 130 },
  { title: '举报理由', dataIndex: 'reason', width: 130 },
  { title: '举报内容', dataIndex: 'content', minWidth: 200, ellipsis: true },
  { title: '被举报对象', dataIndex: 'target', minWidth: 160, ellipsis: true },
  { title: '图片', dataIndex: 'images', width: 90 },
  { title: '举报时间', dataIndex: 'createtime', width: 170 },
  { title: '受理状态', dataIndex: 'state', width: 100 },
  { title: '操作', dataIndex: 'action', width: 130 },
];

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function splitImages(images?: string): string[] {
  if (!images) return [];
  return images.split(',').filter((s) => s.trim() !== '');
}

function targetText(record: ComplaintInfo) {
  if (record.type === '1') {
    return record.goods_title
      ? `商品: ${record.goods_title}`
      : `商品ID: ${record.complaint_goods_id ?? '-'}`;
  }
  if (record.type === '2') return `店铺ID: ${record.complaint_shop_id ?? '-'}`;
  return `会员ID: ${record.complaint_user_id ?? '-'}`;
}

async function load() {
  loading.value = true;
  try {
    const res = await getComplaintList({
      page: page.value,
      page_size: pageSize.value,
      state: stateFilter.value || undefined,
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

function onTableChange(pagination: any) {
  page.value = pagination.current;
  pageSize.value = pagination.pageSize;
  load();
}

function openDetail(record: ComplaintInfo) {
  detailModalApi.setData({ record, reload: load });
  detailModalApi.open();
}

function handleDelete(ids: number[]) {
  Modal.confirm({
    title: '删除投诉',
    content: `确认删除选中的 ${ids.length} 条投诉记录？删除后不可恢复`,
    okType: 'danger',
    onOk: async () => {
      await deleteComplaint({ ids });
      message.success('删除成功');
      load();
    },
  });
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
        <div class="page-title">投诉管理</div>
        <div class="page-sub">处理用户投诉举报，填写处理回执后受理完成</div>
      </div>

      <Tabs
        v-model:active-key="stateFilter"
        class="state-tabs"
        @change="onTabChange"
      >
        <TabPane key="" tab="全部" />
        <TabPane key="normal" tab="未受理" />
        <TabPane key="hidden" tab="已受理" />
      </Tabs>

      <div class="toolbar">
        <Button @click="load">刷新</Button>
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
        :scroll="{ x: 1300 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'type'">
            <Tag color="blue">{{ typeMap[record.type] ?? record.type }}</Tag>
          </template>
          <template v-else-if="column.dataIndex === 'user_nickname'">
            {{ record.user_nickname || '-' }}
            <span class="cell-sub">（uid: {{ record.user_id }}）</span>
          </template>
          <template v-else-if="column.dataIndex === 'reason'">
            <Tag color="orange">{{ reasonMap[record.reason] ?? record.reason }}</Tag>
          </template>
          <template v-else-if="column.dataIndex === 'target'">
            {{ targetText(record) }}
          </template>
          <template v-else-if="column.dataIndex === 'images'">
            <Image.PreviewGroup :src-list="splitImages(record.images)">
              <Image
                v-if="splitImages(record.images)[0]"
                :src="splitImages(record.images)[0]"
                :width="40"
                :height="40"
                class="cell-img"
              />
              <span v-else>-</span>
            </Image.PreviewGroup>
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'state'">
            <Tag :color="record.state === 'normal' ? 'red' : 'green'">
              {{ record.state === 'normal' ? '未受理' : '已受理' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <Button
              v-if="record.state === 'normal'"
              size="small"
              type="link"
              @click="openDetail(record)"
            >
              处理
            </Button>
            <Button v-else size="small" type="link" @click="openDetail(record)">
              查看
            </Button>
            <Button
              danger
              size="small"
              type="link"
              @click="handleDelete([record.id!])"
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

.cell-sub {
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.cell-img {
  object-fit: cover;
  border-radius: 4px;
}
</style>
