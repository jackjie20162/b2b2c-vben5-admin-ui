<script lang="ts" setup>
import type { FeedbackInfo } from '../../api/model/zzhshopR2Model';

import { computed, ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Descriptions,
  DescriptionsItem,
  Image,
  message,
  Rate,
  Tag,
  Textarea,
} from 'ant-design-vue';

import { updateFeedback } from '../../api/feedback';

defineOptions({
  name: 'ZzhshopR2FeedbackDetail',
});

const record = ref<FeedbackInfo>({});
const receipt = ref('');
const reloadFn = ref<(() => void) | null>(null);

const editable = computed(() => record.value.status === 'normal');

const imageList = computed(() => {
  if (!record.value.images) return [];
  return record.value.images.split(',').filter((s) => s.trim() !== '');
});

// device 为 JSON 字符串，解析失败则原文展示
const deviceRows = computed<{ label: string; value: string }[]>(() => {
  const raw = record.value.device;
  if (!raw) return [];
  try {
    const obj = JSON.parse(raw);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.entries(obj).map(([k, v]) => ({
        label: k,
        value: String(v),
      }));
    }
  } catch {
    // ignore parse error，走原文展示
  }
  return [{ label: '设备详情', value: raw }];
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
      await updateFeedback({
        id: record.value.id,
        receipt: receipt.value.trim(),
        status: 'hidden',
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
        record: FeedbackInfo;
        reload: () => void;
      };
      record.value = data?.record || {};
      reloadFn.value = data?.reload || null;
      receipt.value = record.value.receipt ?? '';
      const canEdit = record.value.status === 'normal';
      modalApi.setState({
        title: canEdit ? '处理反馈' : '反馈详情',
        confirmText: canEdit ? '提交处理' : '关闭',
      });
    }
  },
});
</script>

<template>
  <Modal class="w-[60%]">
    <Descriptions :column="2" bordered size="small">
      <DescriptionsItem label="反馈用户">
        {{ record.user_nickname || '-' }}（uid: {{ record.user_id }}）
      </DescriptionsItem>
      <DescriptionsItem label="反馈时间">
        {{ fmtTime(record.createtime) }}
      </DescriptionsItem>
      <DescriptionsItem label="评分">
        <Rate :value="record.score ?? 0" disabled />
      </DescriptionsItem>
      <DescriptionsItem label="状态">
        <Tag :color="record.status === 'normal' ? 'red' : 'green'">
          {{ record.status === 'normal' ? '未受理' : '已受理' }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem label="联系方式">
        {{ record.contact || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="设备信息">
        <div v-if="deviceRows.length > 0" class="device-info">
          <div v-for="row in deviceRows" :key="row.label">
            <span class="device-label">{{ row.label }}：</span>
            {{ row.value }}
          </div>
        </div>
        <span v-else>-</span>
      </DescriptionsItem>
      <DescriptionsItem :span="2" label="反馈内容">
        <div class="content-text">{{ record.content || '-' }}</div>
      </DescriptionsItem>
      <DescriptionsItem :span="2" label="反馈图片">
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
          placeholder="请填写处理结果，提交后该反馈将标记为已受理"
        />
        <div v-else class="content-text">{{ record.receipt || '-' }}</div>
      </DescriptionsItem>
    </Descriptions>
  </Modal>
</template>

<style scoped>
.device-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
}

.device-label {
  color: hsl(var(--muted-foreground));
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
