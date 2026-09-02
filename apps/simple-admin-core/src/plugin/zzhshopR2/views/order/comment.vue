<script lang="ts" setup>
import type { CommentInfo } from '../../api/model/zzhshopR2Model';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import {
  Button,
  message,
  Modal,
  Table,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { deleteComment, getCommentList } from '../../api/comment';
import CommentForm from './commentForm.vue';
import { commentStateMap } from './schema';

defineOptions({
  name: 'ZzhshopR2OrderComment',
});

const ReloadIcon = createIconifyIcon('ant-design:reload-outlined');
const PlusIcon = createIconifyIcon('ant-design:plus-outlined');
const EditIcon = createIconifyIcon('ant-design:edit-outlined');
const DeleteIcon = createIconifyIcon('ant-design:delete-outlined');

const loading = ref(false);
const list = ref<CommentInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const stateFilter = ref('');
const selectedIds = ref<number[]>([]);

// 业务类型:goods=普通订单,groups=拼团订单,seckill=秒杀订单
const orderTypeMap: Record<string, { color: string; label: string }> = {
  goods: { color: 'blue', label: '普通订单' },
  groups: { color: 'purple', label: '拼团订单' },
  seckill: { color: 'red', label: '秒杀订单' },
};

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '用户昵称', dataIndex: 'user_nickname', width: 110 },
  { title: '店铺名称', dataIndex: 'shop_name', width: 120 },
  { title: '商品标题', dataIndex: 'goods_title', ellipsis: true, width: 160 },
  { title: '业务类型', dataIndex: 'order_type', width: 100 },
  { title: '评价', dataIndex: 'state', width: 80 },
  { title: '图片组', dataIndex: 'images', width: 150 },
  { title: '综合评分', dataIndex: 'score', width: 90 },
  { title: '描述相符', dataIndex: 'score_describe', width: 90 },
  { title: '服务相符', dataIndex: 'score_service', width: 90 },
  { title: '发货相符', dataIndex: 'score_deliver', width: 90 },
  { title: '物流相符', dataIndex: 'score_logistics', width: 90 },
  { title: '匿名评论', dataIndex: 'switch', width: 90 },
  { title: '创建时间', dataIndex: 'createtime', width: 170 },
  { title: '操作', dataIndex: 'action', width: 130 },
];

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function splitImages(images?: string) {
  return (images ?? '')
    .split(',')
    .map((v) => v.trim())
    .filter((v) => v !== '');
}

async function load() {
  loading.value = true;
  selectedIds.value = [];
  try {
    const res = await getCommentList({
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

const rowSelection = computed(() => ({
  selectedRowKeys: selectedIds.value,
  onChange: (keys: number[]) => {
    selectedIds.value = keys;
  },
}));

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: CommentForm,
});

function openCreate() {
  formModalApi.setData({ isUpdate: false, record: {}, gridApi: { reload: load } });
  formModalApi.open();
}

function openEdit(record?: CommentInfo) {
  const target =
    record ?? list.value.find((v) => v.id === selectedIds.value[0]);
  if (!target) {
    message.warning('请先勾选一条要编辑的评论');
    return;
  }
  formModalApi.setData({ isUpdate: true, record: target, gridApi: { reload: load } });
  formModalApi.open();
}

function batchDelete() {
  if (selectedIds.value.length === 0) {
    message.warning('请先勾选要删除的评论');
    return;
  }
  Modal.confirm({
    content: `确认删除勾选的 ${selectedIds.value.length} 条评论吗？`,
    okType: 'danger',
    onOk: async () => {
      await deleteComment({ ids: selectedIds.value });
      message.success('删除成功');
      load();
    },
    title: '删除评论',
  });
}

function deleteOne(record: CommentInfo) {
  if (!record.id) return;
  Modal.confirm({
    content: `确认删除评论「${record.id}」吗？`,
    okType: 'danger',
    onOk: async () => {
      await deleteComment({ ids: [record.id ?? 0] });
      message.success('删除成功');
      load();
    },
    title: '删除评论',
  });
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <FormModal />

    <div class="comment-page">
      <div class="page-head">
        <div class="page-title">评论管理</div>
        <div class="page-sub">用于监管商城商品评论，删除后不可恢复</div>
      </div>

      <Tabs v-model:active-key="stateFilter" class="state-tabs" @change="onTabChange">
        <TabPane key="" tab="全部" />
        <TabPane key="0" tab="好评" />
        <TabPane key="1" tab="中评" />
        <TabPane key="2" tab="差评" />
      </Tabs>

      <div class="toolbar">
        <Button title="刷新" type="primary" @click="load">
          <template #icon><ReloadIcon /></template>
        </Button>
        <Button type="primary" @click="openCreate">
          <template #icon><PlusIcon /></template>
          添加
        </Button>
        <Button :disabled="selectedIds.length !== 1" @click="openEdit()">
          <template #icon><EditIcon /></template>
          编辑
        </Button>
        <Button :disabled="selectedIds.length === 0" danger @click="batchDelete">
          <template #icon><DeleteIcon /></template>
          删除
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
          showSizeChanger: true,
        }"
        :row-selection="rowSelection"
        :scroll="{ x: 1750 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'user_nickname'">
            {{ record.user_nickname || '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'shop_name'">
            {{ record.shop_name || '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'goods_title'">
            {{ record.goods_title || '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'order_type'">
            <Tag :color="orderTypeMap[record.order_type]?.color ?? 'default'">
              {{ orderTypeMap[record.order_type]?.label ?? record.order_type ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'state'">
            <Tag :color="commentStateMap[record.state]?.color ?? 'default'">
              {{ commentStateMap[record.state]?.label ?? record.state ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'images'">
            <div v-if="splitImages(record.images).length > 0" class="img-group">
              <img
                v-for="(url, i) in splitImages(record.images).slice(0, 3)"
                :key="i"
                :src="url"
                class="thumb"
              />
            </div>
            <span v-else>-</span>
          </template>
          <template v-else-if="column.dataIndex === 'switch'">
            {{ record.switch === 1 ? '是' : '否' }}
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <Button size="small" type="link" @click="openEdit(record)">
              编辑
            </Button>
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
.comment-page {
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

.img-group {
  display: flex;
  gap: 4px;
}

.thumb {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}
</style>
