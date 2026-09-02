<script lang="ts" setup>
import type { WithdrawInfo } from '../../api/finance';

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

import { auditWithdraw, deleteWithdraw, getWithdrawList } from '../../api/finance';

defineOptions({
  name: 'ZzhshopR2Withdraw',
});

const InputSearch = Input.Search;
const TextArea = Input.TextArea;

const statusMap: Record<string, { color: string; label: string }> = {
  created: { color: 'processing', label: '申请中' },
  rejected: { color: 'error', label: '已拒绝' },
  successed: { color: 'success', label: '成功' },
};

// 提现方式：对齐 PHP 银行/支付渠道编码
const typeMap: Record<string, string> = {
  ABC: '农业银行',
  BOC: '中国银行',
  BOB: '北京银行',
  CCB: '建设银行',
  CEB: '光大银行',
  CIB: '兴业银行',
  CITIC: '中信银行',
  CMB: '招商银行',
  CMBC: '民生银行',
  COMM: '交通银行',
  GDB: '广发银行',
  ICBC: '工商银行',
  PAB: '平安银行',
  PSBC: '邮储银行',
  SPDB: '浦发银行',
  alipay: '支付宝',
  wechat: '微信',
};

const loading = ref(false);
const list = ref<WithdrawInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');
const keyword = ref('');
const selectedKeys = ref<number[]>([]);

// 拒绝弹窗
const refuseVisible = ref(false);
const refuseRow = ref<WithdrawInfo>();
const refuseMemo = ref('');
const auditing = ref(false);

// 详情弹窗
const detailVisible = ref(false);
const detailRow = ref<WithdrawInfo>();

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '会员ID', dataIndex: 'user_id', width: 80 },
  { title: '用户名', dataIndex: 'username', width: 110 },
  { title: '金额', dataIndex: 'money', width: 90 },
  { title: '手续费', dataIndex: 'handingfee', width: 80 },
  { title: '税费', dataIndex: 'taxes', width: 70 },
  { title: '类型', dataIndex: 'type', width: 90 },
  { title: '提现账户', dataIndex: 'account', width: 160, ellipsis: true },
  { title: '转账时间', dataIndex: 'transfertime', width: 160 },
  { title: '添加时间', dataIndex: 'createtime', width: 160 },
  { title: '更新时间', dataIndex: 'updatetime', width: 160 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '操作', dataIndex: 'action', width: 170 },
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
    const res = await getWithdrawList({
      page: page.value,
      page_size: pageSize.value,
      status: statusFilter.value || undefined,
      username: keyword.value || undefined,
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

function handleAgree(row: WithdrawInfo) {
  Modal.confirm({
    content: '确认点击同意，通过提现申请？',
    onOk: async () => {
      await auditWithdraw({ id: row.id, action: 'agree' });
      message.success('审核通过');
      load();
    },
    title: '同意提现申请',
  });
}

function openRefuse(row: WithdrawInfo) {
  refuseRow.value = row;
  refuseMemo.value = '';
  refuseVisible.value = true;
}

async function handleRefuse() {
  if (!refuseRow.value?.id) return;
  auditing.value = true;
  try {
    await auditWithdraw({
      id: refuseRow.value.id,
      action: 'refuse',
      memo: refuseMemo.value,
    });
    message.success('已拒绝，金额退回用户余额');
    refuseVisible.value = false;
    load();
  } finally {
    auditing.value = false;
  }
}

function handleDelete() {
  if (selectedKeys.value.length === 0) {
    message.warning('请先勾选要删除的记录');
    return;
  }
  Modal.confirm({
    content: `确认删除选中的 ${selectedKeys.value.length} 条提现记录？`,
    onOk: async () => {
      await deleteWithdraw({ ids: selectedKeys.value });
      message.success('删除成功');
      load();
    },
    title: '删除提现记录',
  });
}

function openDetail(row: WithdrawInfo) {
  detailRow.value = row;
  detailVisible.value = true;
}

onMounted(load);
</script>

<template>
  <Page auto-content-height>
    <Modal
      v-model:open="refuseVisible"
      :confirm-loading="auditing"
      title="拒绝提现申请"
      @ok="handleRefuse"
    >
      <p class="refuse-tip">
        拒绝后提现金额（含手续费）将退回用户余额，并写入资金账单。
      </p>
      <TextArea
        v-model:value="refuseMemo"
        :rows="3"
        placeholder="请填写拒绝原因"
      />
    </Modal>

    <Modal v-model:open="detailVisible" :footer="null" title="提现详情" width="640px">
      <Descriptions v-if="detailRow" :column="2" bordered size="small">
        <DescriptionsItem label="ID">{{ detailRow.id }}</DescriptionsItem>
        <DescriptionsItem label="用户名">
          {{ detailRow.username ?? '-' }}（会员ID {{ detailRow.user_id }}）
        </DescriptionsItem>
        <DescriptionsItem label="金额">{{ money(detailRow.money) }}</DescriptionsItem>
        <DescriptionsItem label="手续费">{{ money(detailRow.handingfee) }}</DescriptionsItem>
        <DescriptionsItem label="税费">{{ money(detailRow.taxes) }}</DescriptionsItem>
        <DescriptionsItem label="类型">
          {{ typeMap[detailRow.type ?? ''] ?? detailRow.type ?? '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="提现账户" :span="2">
          {{ detailRow.account || '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="订单号">{{ detailRow.orderid || '-' }}</DescriptionsItem>
        <DescriptionsItem label="流水号">{{ detailRow.transactionid || '-' }}</DescriptionsItem>
        <DescriptionsItem label="备注" :span="2">{{ detailRow.memo || '-' }}</DescriptionsItem>
        <DescriptionsItem label="转账时间">{{ fmtTime(detailRow.transfertime) }}</DescriptionsItem>
        <DescriptionsItem label="添加时间">{{ fmtTime(detailRow.createtime) }}</DescriptionsItem>
        <DescriptionsItem label="状态">
          <Tag :color="statusMap[detailRow.status ?? '']?.color ?? 'default'">
            {{ statusMap[detailRow.status ?? '']?.label ?? detailRow.status ?? '-' }}
          </Tag>
        </DescriptionsItem>
        <DescriptionsItem label="更新时间">{{ fmtTime(detailRow.updatetime) }}</DescriptionsItem>
      </Descriptions>
    </Modal>

    <div class="fin-page">
      <div class="page-head">
        <div class="page-title">用户提现</div>
        <div class="page-sub">用于管理用户提现审核、同意、拒绝</div>
      </div>

      <Tabs v-model:active-key="statusFilter" class="state-tabs" @change="onTabChange">
        <TabPane key="" tab="全部" />
        <TabPane key="created" tab="申请中" />
        <TabPane key="successed" tab="成功" />
        <TabPane key="rejected" tab="已拒绝" />
      </Tabs>

      <div class="toolbar">
        <Button @click="load">刷新</Button>
        <Button danger :disabled="selectedKeys.length === 0" @click="handleDelete">
          删除
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
        v-model:selected-row-keys="selectedKeys"
        :columns="columns"
        :data-source="list"
        :loading="loading"
        :pagination="{
          current: page,
          pageSize,
          total,
          showSizeChanger: true,
        }"
        :row-selection="{ selectedRowKeys: selectedKeys, onChange: (keys: any) => (selectedKeys = keys) }"
        :scroll="{ x: 1500 }"
        row-key="id"
        size="middle"
        @change="onTableChange"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'money'">
            <b>{{ money(record.money) }}</b>
          </template>
          <template v-else-if="column.dataIndex === 'handingfee'">
            {{ money(record.handingfee) }}
          </template>
          <template v-else-if="column.dataIndex === 'taxes'">
            {{ money(record.taxes) }}
          </template>
          <template v-else-if="column.dataIndex === 'type'">
            {{ typeMap[record.type] ?? record.type ?? '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'transfertime'">
            {{ fmtTime(record.transfertime) }}
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'updatetime'">
            {{ fmtTime(record.updatetime) }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <Tag :color="statusMap[record.status]?.color ?? 'default'">
              {{ statusMap[record.status]?.label ?? record.status ?? '-' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'action'">
            <template v-if="record.status === 'created'">
              <Button size="small" type="primary" @click="handleAgree(record)">
                同意
              </Button>
              <Button danger size="small" @click="openRefuse(record)">
                拒绝
              </Button>
            </template>
            <Button size="small" type="link" @click="openDetail(record)">
              详情
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

.refuse-tip {
  margin-bottom: 8px;
  color: hsl(var(--muted-foreground));
}
</style>
