<script lang="ts" setup>
import type { ComplaintInfo } from '../../api/model/zzhshopR2Model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions,
  DescriptionsItem,
  Image,
  message,
  Tag,
  Textarea,
} from 'ant-design-vue';

import { updateComplaint } from '../../api/complaint';

defineOptions({
  name: 'ZzhshopR2ComplaintDetail',
});

const record = ref<ComplaintInfo>({});
const receipt = ref('');
const reloadFn = ref<(() => void) | null>(null);

const editable = computed(() => record.value.state === 'normal');

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

const imageList = computed(() => {
  if (!record.value.images) return [];
  return record.value.images.split(',').filter((s) => s.trim() !== '');
});

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: false,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    if (!editable.value) {
      modalApi.close();
      return;
    }
    if (!receipt.value.trim()) {
      message.warning('请填写处理回执');
      return;
    }
    modalApi.setState({ confirmLoading: true });
    try {
      await updateComplaint({
        id: record.value.id,
        receipt: receipt.value.trim(),
        state: 'hidden',
      });
      message.success('处理成功');
      reloadFn.value?.();
      modalApi.close();
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      const data = modalApi.getData() as {
        record: ComplaintInfo;
        reload: () => void;
      };
      record.value = data?.record || {};
      reloadFn.value = data?.reload || null;
      receipt.value = record.value.receipt ?? '';
      const canEdit = record.value.state === 'normal';
      modalApi.setState({
        title: canEdit ? '处理投诉' : '投诉详情',
        confirmText: canEdit ? '提交处理' : '关闭',
      });
    }
  },
});
</script>

<template>
  <Modal class="w-[60%]">
    <Descriptions :column="2" bordered size="small">
      <DescriptionsItem label="举报类型">
        <Tag color="blue">{{ typeMap[record.type ?? ''] ?? record.type }}</Tag>
      </DescriptionsItem>
      <DescriptionsItem label="举报理由">
        <Tag color="orange">
          {{ reasonMap[record.reason ?? ''] ?? record.reason }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem label="举报人">
        {{ record.user_nickname || '-' }}（uid: {{ record.user_id }}）
      </DescriptionsItem>
      <DescriptionsItem label="举报时间">
        {{ fmtTime(record.createtime) }}
      </DescriptionsItem>
      <DescriptionsItem label="受理状态">
        <Tag :color="record.state === 'normal' ? 'red' : 'green'">
          {{ record.state === 'normal' ? '未受理' : '已受理' }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem label="被举报对象">
        <template v-if="record.type === '1'">
          <div class="target-goods">
            <Image
              v-if="record.goods_image"
              :src="record.goods_image"
              :width="48"
              :height="48"
              class="cell-img"
            />
            <span>
              {{ record.goods_title || `商品ID: ${record.complaint_goods_id}` }}
            </span>
          </div>
        </template>
        <template v-else-if="record.type === '2'">
          店铺ID: {{ record.complaint_shop_id ?? '-' }}
        </template>
        <template v-else>
          会员ID: {{ record.complaint_user_id ?? '-' }}
        </template>
      </DescriptionsItem>
      <DescriptionsItem :span="2" label="举报内容">
        <div class="content-text">{{ record.content || '-' }}</div>
      </DescriptionsItem>
      <DescriptionsItem :span="2" label="凭证图片">
        <div v-if="imageList.length > 0" class="image-gallery">
          <Image.PreviewGroup :src-list="imageList">
            <Image
              v-for="(img, idx) in imageList"
              :key="idx"
              :src="img"
              :width="72"
              :height="72"
              class="cell-img"
            />
          </Image.PreviewGroup>
        </div>
        <span v-else>-</span>
      </DescriptionsItem>
      <DescriptionsItem :span="2" label="处理回执">
        <Textarea
          v-if="editable"
          v-model:value="receipt"
          :rows="3"
          placeholder="请填写处理结果，提交后该投诉将标记为已受理"
        />
        <div v-else class="content-text">{{ record.receipt || '-' }}</div>
      </DescriptionsItem>
    </Descriptions>
  </Modal>
</template>

<style scoped>
.target-goods {
  display: flex;
  gap: 8px;
  align-items: center;
}

.image-gallery {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.content-text {
  white-space: pre-wrap;
  word-break: break-all;
}

.cell-img {
  object-fit: cover;
  border-radius: 4px;
}
</style>
