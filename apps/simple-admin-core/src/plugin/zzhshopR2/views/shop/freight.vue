<script lang="ts" setup>
import type { ShopFreightInfo } from '../../api/model/zzhshopR2Model';

import { onMounted, ref } from 'vue';

import { Page } from '@vben/common-ui';

import { Alert, Button, Table, TabPane, Tabs, Tag } from 'ant-design-vue';

import { getFreightList } from '../../api/freight';

defineOptions({
  name: 'ZzhshopR2Freight',
});

const deliveryMap: Record<string, string> = {
  '0': '24小时内',
  '1': '48小时内',
  '2': '72小时内',
};

const valuationMap: Record<string, string> = {
  '0': '按件数',
  '1': '按重量',
  '2': '按体积',
};

const loading = ref(false);
const list = ref<ShopFreightInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '模板名称', dataIndex: 'name', minWidth: 180, ellipsis: true },
  { title: '所属店铺', dataIndex: 'shop_id', width: 100 },
  { title: '发货时间', dataIndex: 'delivery', width: 110 },
  { title: '是否包邮', dataIndex: 'isdelivery', width: 120 },
  { title: '计价方式', dataIndex: 'valuation', width: 100 },
  { title: '创建时间', dataIndex: 'createtime', width: 170 },
  { title: '更新时间', dataIndex: 'updatetime', width: 170 },
  { title: '状态', dataIndex: 'status', width: 90 },
];

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function load() {
  loading.value = true;
  try {
    const res = await getFreightList({
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

onMounted(() => {
  load();
});
</script>

<template>
  <Page auto-content-height>
    <div class="list-panel">
      <Alert
        message="后台运费模板仅提供基本查看，如需要添加或修改请到商家后台添加！"
        type="success"
        show-icon
        class="freight-alert"
      />

      <div class="page-head">
        <div class="page-title">运费模板</div>
        <div class="page-sub">用于查看店铺运费模板配置</div>
      </div>

      <Tabs
        v-model:active-key="statusFilter"
        class="state-tabs"
        @change="onTabChange"
      >
        <TabPane key="" tab="全部" />
        <TabPane key="normal" tab="正常" />
        <TabPane key="hidden" tab="隐藏" />
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
          <template v-if="column.dataIndex === 'delivery'">
            {{ deliveryMap[record.delivery] ?? record.delivery ?? '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'isdelivery'">
            <Tag :color="record.isdelivery === '1' ? 'green' : 'default'">
              {{ record.isdelivery === '1' ? '卖家包邮' : '自定义运费' }}
            </Tag>
          </template>
          <template v-else-if="column.dataIndex === 'valuation'">
            {{ valuationMap[record.valuation] ?? record.valuation ?? '-' }}
          </template>
          <template v-else-if="column.dataIndex === 'createtime'">
            {{ fmtTime(record.createtime) }}
          </template>
          <template v-else-if="column.dataIndex === 'updatetime'">
            {{ fmtTime(record.updatetime) }}
          </template>
          <template v-else-if="column.dataIndex === 'status'">
            <Tag :color="record.status === 'normal' ? 'green' : 'default'">
              {{ record.status === 'normal' ? '正常' : '隐藏' }}
            </Tag>
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

.freight-alert {
  margin: 12px 16px 0;
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
</style>
