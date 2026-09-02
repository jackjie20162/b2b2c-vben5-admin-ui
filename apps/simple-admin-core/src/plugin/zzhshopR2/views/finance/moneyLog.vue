<script lang="ts" setup>
import type { MoneyLogDetailResp, MoneyLogInfo } from '../../api/finance';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  Input,
  message,
  Modal,
  Table,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { adjustMoneyLog, getMoneyLogDetail, getMoneyLogList } from '../../api/finance';

defineOptions({
  name: 'ZzhshopR2MoneyLog',
});

const InputSearch = Input.Search;

const typeMap: Record<string, { color: string; label: string }> = {
  groups: { color: 'purple', label: '拼团交易' },
  groups_refund: { color: 'purple', label: '拼团退款' },
  pay: { color: 'blue', label: '商品交易' },
  recharge: { color: 'green', label: '充值' },
  refund: { color: 'orange', label: '退款' },
  sys: { color: 'default', label: '系统业务' },
  withdraw: { color: 'red', label: '提现' },
};

const loading = ref(false);
const list = ref<MoneyLogInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const keyword = ref('');
const typeFilter = ref('');

// 资金详情弹窗
const detailVisible = ref(false);
const detail = ref<MoneyLogDetailResp>();

const columns = [
  { title: 'Id', dataIndex: 'id', width: 70 },
  { title: 'UID', dataIndex: 'user_id', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 120 },
  { title: '变更余额', dataIndex: 'money', width: 100 },
  { title: '变更前余额', dataIndex: 'before', width: 100 },
  { title: '变更后余额', dataIndex: 'after', width: 100 },
  { title: '备注', dataIndex: 'memo', ellipsis: true },
  { title: '业务类型', dataIndex: 'type', width: 100 },
  { title: '业务ID', dataIndex: 'service_ids', width: 100 },
  { title: '创建时间', dataIndex: 'createtime', width: 170 },
  { title: '操作', dataIndex: 'action', width: 90 },
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

async function load() {
  loading.value = true;
  try {
    const res = await getMoneyLogList({
      page: page.value,
      page_size: pageSize.value,
      username: keyword.value || undefined,
      type: typeFilter.value || undefined,
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

// 校准数据：对齐 PHP 资金账单-校准按钮
function handleAdjust() {
  Modal.confirm({
    content: '将核对已完成退款单的店铺/买家账单差异并自动扣回，确认执行？',
    onOk: async () => {
      const res = await adjustMoneyLog();
      message.success(res.data.msg || '校准完成');
      load();
    },
    title: '校准数据',
  });
}

async function openDetail(row: MoneyLogInfo) {
  if (!row.id) return;
  detail.value = undefined;
  detailVisible.value = true;
  const res = await getMoneyLogDetail({ id: row.id });
  detail.value = res.data;
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <Modal v-model:open="detailVisible" :footer="null" title="资金详情" width="680px">
      <Descriptions v-if="detail?.log" :column="2" bordered size="small">
        <DescriptionsItem label="Id">{{ detail.log.id }}</DescriptionsItem>
        <DescriptionsItem label="用户名">
          {{ detail.log.username ?? '-' }}（UID {{ detail.log.user_id }}）
        </DescriptionsItem>
        <DescriptionsItem label="变更余额">
          <span :class="(detail.log.money ?? 0) >= 0 ? 'money-plus' : 'money-minus'">
            {{ (detail.log.money ?? 0) >= 0 ? '+' : '' }}{{ money(detail.log.money) }}
          </span>
        </DescriptionsItem>
        <DescriptionsItem label="变更前/后">
          {{ money(detail.log.before) }} → {{ money(detail.log.after) }}
        </DescriptionsItem>
        <DescriptionsItem label="业务类型">
          <Tag :color="typeMap[detail.log.type ?? '']?.color ?? 'default'">
            {{ typeMap[detail.log.type ?? '']?.label ?? detail.log.type ?? '-' }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem label="业务ID">{{ detail.log.service_ids || '-' }}</DescriptionsItem>
        <DescriptionsItem label="备注" :span="2">{{ detail.log.memo || '-' }}</DescriptionsItem>
        <DescriptionsItem label="创建时间" :span="2">
          {{ fmtTime(detail.log.createtime) }}
        </DescriptionsItem>
      </Descriptions>

      <div v-if="detail?.orders && detail.orders.length > 0" class="detail-block">
        <div class="detail-sub">关联订单</div>
        <div v-for="o in detail.orders" :key="o.order_no" class="order-card">
          <div class="order-head">
            <b>{{ o.order_no }}</b>
            <span v-if="o.shopname">店铺：{{ o.shopname }}</span>
            <span>支付时间：{{ fmtTime(o.paymenttime) }}</span>
          </div>
          <div v-for="(g, i) in o.goods" :key="i" class="goods-line">
            <img v-if="g.image" :src="g.image" class="goods-img" />
            <span class="goods-title">{{ g.title }}</span>
            <span class="goods-meta">¥{{ money(g.price) }} × {{ g.number }}</span>
          </div>
        </div>
      </div>

      <div v-else-if="detail?.withdraw" class="detail-block">
        <div class="detail-sub">关联提现单</div>
        <Descriptions :column="2" bordered size="small">
          <DescriptionsItem label="金额">{{ money(detail.withdraw.money) }}</DescriptionsItem>
          <DescriptionsItem label="手续费">{{ money(detail.withdraw.handingfee) }}</DescriptionsItem>
          <DescriptionsItem label="状态">{{ detail.withdraw.status ?? '-' }}</DescriptionsItem>
          <DescriptionsItem label="提现账户">{{ detail.withdraw.account ?? '-' }}</DescriptionsItem>
          <DescriptionsItem label="订单号">{{ detail.withdraw.orderid || '-' }}</DescriptionsItem>
          <DescriptionsItem label="流水号">{{ detail.withdraw.transactionid || '-' }}</DescriptionsItem>
          <DescriptionsItem label="转账时间" :span="2">
            {{ fmtTime(detail.withdraw.transfertime) }}
          </DescriptionsItem>
        </Descriptions>
      </div>

      <div v-else-if="detail" class="no-action">无关联业务数据</div>
    </Modal>

    <div class="fin-page">
      <div class="page-head">
        <div class="page-title">资金账单</div>
        <div class="page-sub">用于查看平台商品交易、充值、提现、退款</div>
      </div>

      <Tabs v-model:active-key="typeFilter" class="state-tabs" @change="onTabChange">
        <TabPane key="" tab="全部" />
        <TabPane key="pay" tab="商品交易" />
        <TabPane key="groups" tab="拼团交易" />
        <TabPane key="recharge" tab="充值" />
        <TabPane key="withdraw" tab="提现" />
        <TabPane key="refund" tab="退款" />
        <TabPane key="sys" tab="系统业务" />
      </Tabs>

      <div class="toolbar">
        <Button @click="load">刷新</Button>
        <Button type="primary" style="background: #fa8c16; border-color: #fa8c16" @click="handleAdjust">
          校准数据
        </Button>
        <div class="toolbar-right">
          <InputSearch
            v-model:value="keyword"
            allow-clear
            placeholder="搜索"
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
        :scroll="{ x: 1300 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'money'">
            <span :class="(record.money ?? 0) >= 0 ? 'money-plus' : 'money-minus'">
              {{ (record.money ?? 0) >= 0 ? '+' : '' }}{{ money(record.money) }}
            </span>
          </template>
          <template v-else-if="column.dataIndex === 'before'">
            {{ money(record.before) }}
          </template>
          <template v-else-if="column.dataIndex === 'after'">
            {{ money(record.after) }}
          </template>
          <template v-else-if="column.dataIndex === 'type'">
            <Tag :color="typeMap[record.type]?.color ?? 'default'">
              {{ typeMap[record.type]?.label ?? record.type ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <Button size="small" type="link" @click="openDetail(record)">
              资金详情
            </Button>
          </template>
        </template>
      </Table>
    </div>
  </Page>
</template>

<style scoped>
.fin-page {
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

.toolbar-right {
  margin-left: auto;
}

.money-plus {
  color: #52c41a;
}

.money-minus {
  color: #f5222d;
}

.detail-block {
  margin-top: 16px;
}

.detail-sub {
  margin-bottom: 8px;
  font-weight: 600;
}

.order-card {
  padding: 8px;
  margin-bottom: 8px;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}

.order-head {
  display: flex;
  gap: 12px;
  margin-bottom: 6px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.goods-line {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 4px 0;
  font-size: 12px;
}

.goods-img {
  width: 32px;
  height: 32px;
  object-fit: cover;
  border-radius: 4px;
}

.goods-title {
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.goods-meta {
  color: hsl(var(--muted-foreground));
}

.no-action {
  padding: 12px 0;
  color: hsl(var(--muted-foreground));
}
</style>
