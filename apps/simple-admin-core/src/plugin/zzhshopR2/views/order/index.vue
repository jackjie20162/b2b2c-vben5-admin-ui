<script lang="ts" setup>
import type { AdminOrderItem } from '../../api/model/zzhshopR2Model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { createIconifyIcon } from '@vben/icons';

import {
  Alert,
  Button,
  Checkbox,
  Empty,
  Input,
  message,
  Modal,
  Pagination,
  Spin,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { deleteOrder, getOrderList } from '../../api/order';
import OrderDeliver from './deliver.vue';
import OrderDetail from './detail.vue';
import { orderStateMap } from './schema';

defineOptions({
  name: 'ZzhshopR2OrderGoods',
});

const ReloadIcon = createIconifyIcon('ant-design:reload-outlined');
const DeleteIcon = createIconifyIcon('ant-design:delete-outlined');
const CartIcon = createIconifyIcon('ant-design:shopping-cart-outlined');
const InputSearch = Input.Search;

const loading = ref(false);
const list = ref<AdminOrderItem[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const stateFilter = ref('');
const keyword = ref('');
const selectedIds = ref<number[]>([]);

// 查看物流弹窗
const logisticsVisible = ref(false);
const logisticsOrder = ref<AdminOrderItem['order']>();

const stateTabs = [
  { key: '', label: '全部' },
  { key: '1', label: '待支付' },
  { key: '2', label: '待发货' },
  { key: '3', label: '待收货' },
  { key: '4', label: '待评价' },
  { key: '6', label: '已完成' },
  { key: '7', label: '已取消' },
];

const stateDotColor: Record<string, string> = {
  blue: '#1677ff',
  cyan: '#13c2c2',
  default: '#8c8c8c',
  green: '#52c41a',
  orange: '#faad14',
  purple: '#722ed1',
  red: '#f5222d',
};

function stateLabel(state?: string) {
  return orderStateMap[state ?? '']?.label ?? state ?? '-';
}

function stateDot(state?: string) {
  return stateDotColor[orderStateMap[state ?? '']?.color ?? 'default'] ?? '#8c8c8c';
}

function fmtTime(ts?: number) {
  if (!ts) return '';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

function money(v?: number) {
  return (v ?? 0).toFixed(2);
}

function orderPayment(item: AdminOrderItem) {
  return (item.goods ?? []).reduce((s, g) => s + (g.actual_payment ?? 0), 0);
}

function orderFreight(item: AdminOrderItem) {
  return (item.goods ?? []).reduce((s, g) => s + (g.freight_price ?? 0), 0);
}

function shopName(item: AdminOrderItem) {
  return item.goods?.[0]?.shop_name ?? '';
}

async function load() {
  loading.value = true;
  selectedIds.value = [];
  try {
    const res = await getOrderList({
      page: page.value,
      page_size: pageSize.value,
      state: stateFilter.value || undefined,
      order_no: keyword.value || undefined,
    });
    total.value = res.data.total;
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

function onPageChange(p: number, ps: number) {
  page.value = p;
  pageSize.value = ps;
  load();
}

function isSelected(id?: number) {
  return selectedIds.value.includes(id ?? 0);
}

function toggleSelect(id: number, checked: boolean) {
  selectedIds.value = checked
    ? [...selectedIds.value, id]
    : selectedIds.value.filter((v) => v !== id);
}

function batchDelete() {
  if (selectedIds.value.length === 0) {
    message.warning('请先勾选要删除的订单');
    return;
  }
  Modal.confirm({
    title: '删除订单',
    content: `确认删除勾选的 ${selectedIds.value.length} 个订单吗？`,
    okType: 'danger',
    onOk: async () => {
      await deleteOrder(selectedIds.value);
      message.success('删除成功');
      load();
    },
  });
}

const [DetailModal, detailModalApi] = useVbenModal({
  connectedComponent: OrderDetail,
});

const [DeliverModal, deliverModalApi] = useVbenModal({
  connectedComponent: OrderDeliver,
});

function openDetail(item: AdminOrderItem) {
  detailModalApi.setData({ record: item.order });
  detailModalApi.open();
}

function openDeliver(item: AdminOrderItem) {
  // deliver.vue 通过 gridApi.reload 刷新列表，这里注入 load
  deliverModalApi.setData({ record: item.order, gridApi: { reload: load } });
  deliverModalApi.open();
}

function openLogistics(item: AdminOrderItem) {
  logisticsOrder.value = item.order;
  logisticsVisible.value = true;
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <DetailModal />
    <DeliverModal />
    <Modal v-model:open="logisticsVisible" title="查看物流" :footer="null">
      <p>快递公司：{{ logisticsOrder?.express_name || '-' }}</p>
      <p>快递单号：{{ logisticsOrder?.express_no || '-' }}</p>
    </Modal>

    <div class="order-page">
      <Alert type="success" show-icon banner>
        <template #message>
          重要提示：后台订单列表仅供查看，如需发货、修改订单信息请到商家后台操作！
        </template>
      </Alert>

      <div class="page-head">
        <div class="page-title">商品订单</div>
        <div class="page-sub">仅用户监管商城订单，具体操作请在商家中心管理</div>
      </div>

      <Tabs v-model:active-key="stateFilter" class="state-tabs" @change="onTabChange">
        <TabPane v-for="t in stateTabs" :key="t.key" :tab="t.label" />
      </Tabs>

      <div class="toolbar">
        <Button type="primary" title="刷新" @click="load">
          <template #icon><ReloadIcon /></template>
        </Button>
        <Button danger :disabled="selectedIds.length === 0" @click="batchDelete">
          <template #icon><DeleteIcon /></template>
          删除
        </Button>
        <InputSearch
          v-model:value="keyword"
          placeholder="搜索订单号"
          allow-clear
          style="width: 260px"
          @search="onSearch"
        />
      </div>

      <div class="order-wrap">
        <table class="order-grid head-grid">
          <colgroup>
            <col />
            <col style="width: 110px" />
            <col style="width: 70px" />
            <col style="width: 110px" />
            <col style="width: 140px" />
            <col style="width: 120px" />
          </colgroup>
          <thead>
            <tr>
              <th>商品</th>
              <th>单价</th>
              <th>数量</th>
              <th>买家</th>
              <th>实际支付</th>
              <th>状态</th>
            </tr>
          </thead>
        </table>

        <Spin :spinning="loading">
          <div v-for="item in list" :key="item.order?.id" class="order-card">
            <div class="order-head">
              <Checkbox
                :checked="isSelected(item.order?.id)"
                @change="(e: any) => toggleSelect(item.order?.id ?? 0, e.target.checked)"
              />
              <span class="oh-item">
                订单号：<b>{{ item.order?.order_no }}</b>
              </span>
              <span class="oh-item">创建时间：{{ fmtTime(item.order?.createtime) }}</span>
              <span class="oh-shop"><CartIcon /> {{ shopName(item) || '-' }}</span>
            </div>

            <table class="order-grid body-grid">
              <colgroup>
                <col />
                <col style="width: 110px" />
                <col style="width: 70px" />
                <col style="width: 110px" />
                <col style="width: 140px" />
                <col style="width: 120px" />
              </colgroup>
              <tbody>
                <tr v-for="(g, gi) in item.goods" :key="g.id ?? gi">
                  <td class="c-goods">
                    <img v-if="g.image" :src="g.image" class="g-img" />
                    <div class="g-info">
                      <div class="g-title">{{ g.title }}</div>
                      <div class="g-sku">{{ g.difference }}</div>
                    </div>
                  </td>
                  <td class="c-price">
                    <div
                      v-if="g.market_price && g.market_price !== g.price"
                      class="p-market"
                    >
                      ￥{{ money(g.market_price) }}
                    </div>
                    <div class="p-now">￥{{ money(g.price) }}</div>
                  </td>
                  <td class="c-num">x{{ g.number }}</td>
                  <td v-if="gi === 0" :rowspan="item.goods.length" class="c-buyer">
                    <span class="buyer-link">{{ item.buyer || '-' }}</span>
                  </td>
                  <td v-if="gi === 0" :rowspan="item.goods.length" class="c-pay">
                    <b>￥{{ money(orderPayment(item)) }}</b>
                    <div class="pay-freight">
                      (含运费：￥{{ money(orderFreight(item)) }})
                    </div>
                  </td>
                  <td v-if="gi === 0" :rowspan="item.goods.length" class="c-state">
                    <div class="state-badge">
                      <span class="dot" :style="{ background: stateDot(item.order?.state) }"></span>
                      {{ stateLabel(item.order?.state) }}
                    </div>
                    <a class="state-link" @click="openDetail(item)">订单详情</a>
                    <a
                      v-if="item.order?.express_no"
                      class="state-link"
                      @click="openLogistics(item)"
                    >
                      查看物流
                    </a>
                    <a
                      v-if="item.order?.state === '2'"
                      class="state-link"
                      @click="openDeliver(item)"
                    >
                      发货
                    </a>
                  </td>
                </tr>
                <tr v-if="!item.goods || item.goods.length === 0">
                  <td colspan="6" class="empty-goods">暂无商品信息</td>
                </tr>
              </tbody>
            </table>
          </div>

          <Empty v-if="!loading && list.length === 0" style="padding: 40px 0" />
        </Spin>

        <div class="pager">
          <Pagination
            :current="page"
            :page-size="pageSize"
            :total="total"
            show-size-changer
            @change="onPageChange"
          />
        </div>
      </div>
    </div>
  </Page>
</template>

<style scoped>
/* 颜色统一使用 vben 主题令牌 hsl(var(--x))，兼容明暗两种主题 */
.order-page {
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

.order-wrap {
  flex: 1;
  padding: 0 16px 16px;
}

.order-grid {
  width: 100%;
  table-layout: fixed;
  border-collapse: collapse;
}

.head-grid th {
  padding: 12px 8px;
  font-weight: 500;
  text-align: center;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
}

.order-card {
  margin-bottom: 16px;
  border: 1px solid hsl(var(--border));
}

.order-head {
  display: flex;
  gap: 24px;
  align-items: center;
  padding: 10px 12px;
  background: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
}

.oh-item {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.oh-shop {
  display: inline-flex;
  gap: 6px;
  align-items: center;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.body-grid td {
  padding: 12px 8px;
  vertical-align: middle;
  text-align: center;
  border: 1px solid hsl(var(--border));
}

.c-goods {
  display: flex;
  gap: 10px;
  align-items: center;
  text-align: left;
}

.g-img {
  width: 48px;
  height: 64px;
  object-fit: cover;
  border: 1px solid hsl(var(--border));
}

.g-title {
  font-size: 13px;
  color: hsl(var(--foreground));
}

.g-sku {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.p-market {
  text-decoration: line-through;
  color: hsl(var(--muted-foreground));
}

.c-num {
  color: hsl(var(--muted-foreground));
}

.buyer-link {
  color: hsl(var(--primary));
}

.pay-freight {
  margin-top: 4px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.state-badge {
  display: flex;
  gap: 6px;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  color: hsl(var(--foreground));
}

.state-badge .dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
}

.state-link {
  display: block;
  margin-top: 6px;
  font-size: 12px;
}

.empty-goods {
  color: hsl(var(--muted-foreground));
}

.pager {
  display: flex;
  justify-content: flex-end;
  padding: 12px 0;
}
</style>
