<script lang="ts" setup>
import type {
  CategoryTreeNode,
  GoodsInfo,
} from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import { Badge, Table, Tag } from 'ant-design-vue';

import { getGoodsList } from '../../api/goods';

defineOptions({
  name: 'ZzhshopR2CategoryGoods',
});

const category = ref<CategoryTreeNode>({});
const categoryIds = ref<number[]>([]);
const mode = ref<'goods' | 'groups'>('goods');
const loading = ref(false);
const list = ref<GoodsInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '图片', dataIndex: 'image', width: 80 },
  { title: '商品名称', dataIndex: 'title', minWidth: 220, ellipsis: true },
  { title: '价格', dataIndex: 'price', width: 100 },
  { title: '销量', dataIndex: 'sales', width: 90 },
  { title: '上架', dataIndex: 'grounding', width: 90 },
  { title: '活动类型', dataIndex: 'activity_type', width: 100 },
  { title: '状态', dataIndex: 'status', width: 90 },
];

const activityMap: Record<string, string> = {
  bargain: '砍价',
  goods: '普通',
  groups: '拼团',
  seckill: '秒杀',
};

async function load() {
  loading.value = true;
  try {
    const res = await getGoodsList({
      page: page.value,
      page_size: pageSize.value,
      category_ids: categoryIds.value,
      activity_type: mode.value === 'groups' ? 'groups' : undefined,
    });
    list.value = res.data.data ?? [];
    total.value = res.data.total;
  } finally {
    loading.value = false;
  }
}

function onPageChange(p: number) {
  page.value = p;
  load();
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData() as {
        category: CategoryTreeNode;
        categoryIds: number[];
        mode: 'goods' | 'groups';
      };
      category.value = data.category ?? {};
      categoryIds.value = data.categoryIds ?? [];
      mode.value = data.mode ?? 'goods';
      page.value = 1;
      modalApi.setState({
        title: `[${category.value.name ?? ''}] 类目及子类目 ${
          mode.value === 'groups' ? '拼团' : '商品'
        }`,
      });
      load();
    }
  },
});
</script>

<template>
  <Modal class="w-[70%]" :footer="false">
    <Table
      :columns="columns"
      :data-source="list"
      :loading="loading"
      :pagination="{
        current: page,
        pageSize,
        total,
        showSizeChanger: false,
        onChange: onPageChange,
      }"
      :scroll="{ x: 900 }"
      row-key="id"
      size="middle"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'image'">
          <img
            v-if="record.image"
            :src="record.image"
            style="height: 40px; width: 40px; object-fit: cover"
          />
        </template>
        <template v-else-if="column.dataIndex === 'price'">
          ￥{{ record.price }}
        </template>
        <template v-else-if="column.dataIndex === 'grounding'">
          <Tag :color="record.grounding === 1 ? 'green' : 'default'">
            {{ record.grounding === 1 ? '上架' : '下架' }}
          </Tag>
        </template>
        <template v-else-if="column.dataIndex === 'activity_type'">
          {{ activityMap[record.activity_type] ?? record.activity_type }}
        </template>
        <template v-else-if="column.dataIndex === 'status'">
          <Badge
            :status="record.status === 'normal' ? 'success' : 'default'"
            :text="record.status === 'normal' ? '正常' : '隐藏'"
          />
        </template>
      </template>
    </Table>
  </Modal>
</template>
