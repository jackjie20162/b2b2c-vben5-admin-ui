<script lang="ts" setup>
import type { OrderDetailResp } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Descriptions, DescriptionsItem, Spin, Table, Tag } from 'ant-design-vue';

import { getOrderDetail } from '../../api/order';
import { formatUnixTime, renderOrderState } from './schema';

defineOptions({
  name: 'ZzhshopR2OrderDetail',
});

const loading = ref(false);
const detail = ref<OrderDetailResp>();

const goodsColumns = [
  { title: '商品', dataIndex: 'title' },
  { title: '规格', dataIndex: 'difference' },
  { title: '单价', dataIndex: 'price' },
  { title: '数量', dataIndex: 'number' },
  { title: '实付', dataIndex: 'actual_payment' },
];

function formatTime(value?: number) {
  return formatUnixTime({ cellValue: value });
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  footer: false,
  onCancel() {
    modalApi.close();
  },
  async onOpenChange(isOpen: boolean) {
    if (!isOpen) {
      return;
    }
    const record = modalApi.getData()?.record;
    if (!record?.id) {
      return;
    }
    loading.value = true;
    try {
      const res = await getOrderDetail(record.id);
      detail.value = res.data;
    } finally {
      loading.value = false;
    }
    modalApi.setState({ title: `订单详情 - ${record.order_no ?? ''}` });
  },
});

defineExpose(modalApi);
</script>
<template>
  <Modal>
    <Spin :spinning="loading">
      <Descriptions
        v-if="detail?.order"
        bordered
        size="small"
        :column="2"
        style="margin-bottom: 16px"
      >
        <DescriptionsItem label="订单号">
          {{ detail.order.order_no }}
        </DescriptionsItem>
        <DescriptionsItem label="订单状态">
          <component :is="renderOrderState(detail.order.state ?? '')" />
        </DescriptionsItem>
        <DescriptionsItem label="用户ID">
          {{ detail.order.user_id }}
        </DescriptionsItem>
        <DescriptionsItem label="店铺ID">
          {{ detail.order.shop_id }}
        </DescriptionsItem>
        <DescriptionsItem label="下单时间">
          {{ formatTime(detail.order.createtime) }}
        </DescriptionsItem>
        <DescriptionsItem label="支付时间">
          {{ formatTime(detail.order.paymenttime) }}
        </DescriptionsItem>
        <DescriptionsItem label="发货时间">
          {{ formatTime(detail.order.delivertime) }}
        </DescriptionsItem>
        <DescriptionsItem label="收货时间">
          {{ formatTime(detail.order.taketime) }}
        </DescriptionsItem>
        <DescriptionsItem label="快递公司">
          {{ detail.order.express_name || '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="快递单号">
          {{ detail.order.express_no || '-' }}
        </DescriptionsItem>
        <DescriptionsItem label="订单备注" :span="2">
          {{ detail.order.remarks || '-' }}
        </DescriptionsItem>
      </Descriptions>

      <Table
        v-if="detail?.goods"
        :columns="goodsColumns"
        :data-source="detail.goods as any"
        :pagination="false"
        row-key="id"
        size="small"
      >
        <template #bodyCell="{ column, record }">
          <template v-if="column.dataIndex === 'title'">
            <img
              v-if="record.image"
              :src="record.image"
              style="height: 32px; width: 32px; object-fit: cover; vertical-align: middle; margin-right: 8px"
            />
            {{ record.title }}
          </template>
          <template v-if="column.dataIndex === 'price'">
            <Tag color="red">￥{{ record.price }}</Tag>
          </template>
          <template v-if="column.dataIndex === 'actual_payment'">
            ￥{{ record.actual_payment }}
          </template>
        </template>
      </Table>
    </Spin>
  </Modal>
</template>
