<script lang="ts" setup>
import type { RefundInfo } from '../../api/model/zzhshopR2Model';

import { computed, createVNode, onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

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

import { auditRefund, deleteRefund, getRefundList } from '../../api/refund';

defineOptions({
  name: 'ZzhshopR2OrderRefund',
});

const ReloadIcon = createIconifyIcon('ant-design:reload-outlined');
const DeleteIcon = createIconifyIcon('ant-design:delete-outlined');
const TextArea = Input.TextArea;

const loading = ref(false);
const list = ref<RefundInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const stateFilter = ref('');
const selectedIds = ref<number[]>([]);
const refuseText = ref('');

// Tab 顺序对齐 PHP：申请退款/卖家同意/买家已退货/卖家拒绝/申请平台介入/成功退款/退款已关闭/退款返还中/退款失败
const stateTabs = [
  { key: '', label: '全部' },
  { key: '0', label: '申请退款' },
  { key: '1', label: '卖家同意' },
  { key: '6', label: '买家已退货' },
  { key: '2', label: '卖家拒绝' },
  { key: '3', label: '申请平台介入' },
  { key: '4', label: '成功退款' },
  { key: '5', label: '退款已关闭' },
  { key: '7', label: '退款返还中' },
  { key: '8', label: '退款失败' },
];

// 退款状态:0=申请退款,1=卖家同意,2=卖家拒绝,3=申请平台介入,4=成功退款,5=退款已关闭,6=买家已退货,7=退款返还中,8=退款失败
const refundStateMap: Record<string, { color: string; label: string }> = {
  '0': { color: 'blue', label: '申请退款' },
  '1': { color: 'cyan', label: '卖家同意' },
  '2': { color: 'red', label: '卖家拒绝' },
  '3': { color: 'orange', label: '申请平台介入' },
  '4': { color: 'green', label: '成功退款' },
  '5': { color: 'default', label: '退款已关闭' },
  '6': { color: 'purple', label: '买家已退货' },
  '7': { color: 'geekblue', label: '退款返还中' },
  '8': { color: 'volcano', label: '退款失败' },
};

// 业务类型:goods=普通订单,groups=拼团订单,seckill=秒杀订单
const orderTypeMap: Record<string, { color: string; label: string }> = {
  goods: { color: 'blue', label: '普通订单' },
  groups: { color: 'purple', label: '拼团订单' },
  seckill: { color: 'red', label: '秒杀订单' },
};

// 物流状态:0=未收到货,1=已收到货
const expressTypeMap: Record<string, { color: string; label: string }> = {
  '0': { color: 'orange', label: '未收到货' },
  '1': { color: 'green', label: '已收到货' },
};

// 退款类型:0=仅退款,1=退货退款
const refundTypeMap: Record<string, { color: string; label: string }> = {
  '0': { color: 'blue', label: '仅退款' },
  '1': { color: 'purple', label: '退货退款' },
};

// 退货理由:0=不喜欢,1=空包裹,2=一直未送达,3=颜色/尺码不符,4=质量问题,5=少件漏发,6=假冒品牌
const reasonMap: Record<string, string> = {
  '0': '不喜欢',
  '1': '空包裹',
  '2': '一直未送达',
  '3': '颜色/尺码不符',
  '4': '质量问题',
  '5': '少件漏发',
  '6': '假冒品牌',
};

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '退款产品', dataIndex: 'goods_ids', width: 110 },
  { title: '业务类型', dataIndex: 'order_type', width: 100 },
  { title: '物流状态', dataIndex: 'express_type', width: 100 },
  { title: '退款金额', dataIndex: 'price', width: 100 },
  { title: '退款类型', dataIndex: 'type', width: 100 },
  { title: '退货理由', dataIndex: 'reason', width: 120 },
  { title: '图片', dataIndex: 'images', width: 150 },
  { title: '快递公司', dataIndex: 'express_name', width: 110 },
  { title: '快递号', dataIndex: 'express_no', width: 150 },
  { title: '退款状态', dataIndex: 'state', width: 120 },
  { title: '创建时间', dataIndex: 'createtime', width: 170 },
  { title: '操作', dataIndex: 'action', width: 160 },
];

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function money(v?: number) {
  return (v ?? 0).toFixed(2);
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
    const res = await getRefundList({
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

function batchDelete() {
  if (selectedIds.value.length === 0) {
    message.warning('请先勾选要删除的退款单');
    return;
  }
  Modal.confirm({
    content: `确认删除勾选的 ${selectedIds.value.length} 个退款单吗？`,
    okType: 'danger',
    onOk: async () => {
      await deleteRefund({ ids: selectedIds.value });
      message.success('删除成功');
      load();
    },
    title: '删除退款单',
  });
}

// 平台介入审核：判定退款合理
function auditAgree(record: RefundInfo) {
  if (!record.id) return;
  Modal.confirm({
    content: '确认判定该退款申请合理并执行退款吗？',
    onOk: async () => {
      await auditRefund({ refund_id: record.id ?? 0, agree: true });
      message.success('审核成功');
      load();
    },
    title: '退款审核',
  });
}

// 平台介入审核：判定退款不合理
function auditRefuse(record: RefundInfo) {
  if (!record.id) return;
  refuseText.value = '';
  Modal.confirm({
    content: createVNode('div', {}, [
      createVNode('p', {}, '判定该退款申请不合理，请填写拒绝原因：'),
      createVNode(TextArea, {
        placeholder: '请输入拒绝原因',
        rows: 3,
        'onUpdate:value': (v: string) => {
          refuseText.value = v;
        },
      }),
    ]),
    okType: 'danger',
    okText: '确认拒绝',
    onOk: async () => {
      if (!refuseText.value.trim()) {
        message.warning('请输入拒绝原因');
        return Promise.reject();
      }
      await auditRefund({
        refund_id: record.id ?? 0,
        agree: false,
        refuse_content: refuseText.value,
      });
      message.success('审核成功');
      load();
    },
    title: '退款审核',
  });
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <div class="refund-page">
      <div class="page-head">
        <div class="page-title">退款管理</div>
        <div class="page-sub">用于监管商城退款单，申请平台介入时需人工审核</div>
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
        :scroll="{ x: 1650 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'goods_ids'">
            {{ record.goods_ids || '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'order_type'">
            <Tag :color="orderTypeMap[record.order_type]?.color ?? 'default'">
              {{ orderTypeMap[record.order_type]?.label ?? record.order_type ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'express_type'">
            <Tag :color="expressTypeMap[record.express_type]?.color ?? 'default'">
              {{ expressTypeMap[record.express_type]?.label ?? record.express_type ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'price'">
            <span class="money-text">￥{{ money(record.price) }}</span>
          </template>
          <template v-else-if="column.dataIndex === 'type'">
            <Tag :color="refundTypeMap[record.type]?.color ?? 'default'">
              {{ refundTypeMap[record.type]?.label ?? record.type ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'reason'">
            {{ reasonMap[record.reason] ?? record.reason ?? '-' }}
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
          <template v-else-if="column.dataIndex === 'express_name'">
            {{ record.express_name || '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'express_no'">
            {{ record.express_no || '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'state'">
            <Tag :color="refundStateMap[record.state]?.color ?? 'default'">
              {{ refundStateMap[record.state]?.label ?? record.state ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <template v-if="record.state === '3'">
              <Button size="small" type="link" @click="auditAgree(record)">
                退款合理
              </Button>
              <Button danger size="small" type="link" @click="auditRefuse(record)">
                退款不合理
              </Button>
            </template>
            <span v-else class="no-action">-</span>
          </template>
        </template>
      </Table>
    </div>
  </Page>
</template>

<style scoped>
.refund-page {
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

.money-text {
  color: #f5222d;
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

.no-action {
  color: hsl(var(--muted-foreground));
}
</style>
