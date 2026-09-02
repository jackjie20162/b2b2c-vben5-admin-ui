<script lang="ts" setup>
import type { FeedbackInfo } from '../../api/model/zzhshopR2Model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import { Button, Image, message, Modal, Table, TabPane, Tabs, Tag } from 'ant-design-vue';

import { deleteFeedback, getFeedbackList } from '../../api/feedback';
import FeedbackDetail from './feedbackDetail.vue';

defineOptions({
  name: 'ZzhshopR2Feedback',
});

const loading = ref(false);
const list = ref<FeedbackInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: FeedbackDetail,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '用户', dataIndex: 'user_nickname', width: 130 },
  { title: '反馈内容', dataIndex: 'content', minWidth: 220, ellipsis: true },
  { title: '图片', dataIndex: 'images', width: 90 },
  { title: '联系方式', dataIndex: 'contact', width: 140 },
  { title: '评分', dataIndex: 'score', width: 80 },
  { title: '反馈时间', dataIndex: 'createtime', width: 170 },
  { title: '状态', dataIndex: 'status', width: 100 },
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

async function load() {
  loading.value = true;
  try {
    const res = await getFeedbackList({
      page: page.value,
      page_size: pageSize.value,
      status: statusFilter.value || undefined,
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

function openDetail(record: FeedbackInfo) {
  detailModalApi.setData({ record, reload: load });
  detailModalApi.open();
}

function handleDelete(ids: number[]) {
  Modal.confirm({
    title: '删除反馈',
    content: `确认删除选中的 ${ids.length} 条反馈记录？删除后不可恢复`,
    okType: 'danger',
    onOk: async () => {
      await deleteFeedback({ ids });
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
        <div class="page-title">意见反馈</div>
        <div class="page-sub">查看用户意见反馈，填写处理回执后标记为已受理</div>
      </div>

      <Tabs
        v-model:active-key="statusFilter"
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
        :scroll="{ x: 1200 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'user_nickname'">
            {{ record.user_nickname || '-' }}
            <span class="cell-sub">（uid: {{ record.user_id }}）</span>
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
          <template v-else-if="column.dataIndex === 'contact'">
            {{ record.contact || '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'score'">
            <Tag color="gold">{{ record.score ?? 0 }}分</Tag>
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <Tag :color="record.status === 'normal' ? 'red' : 'green'">
              {{ record.status === 'normal' ? '未受理' : '已受理' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <Button
              v-if="record.status === 'normal'"
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
