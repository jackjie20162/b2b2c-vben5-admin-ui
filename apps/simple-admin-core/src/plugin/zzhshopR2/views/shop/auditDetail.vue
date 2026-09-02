<script lang="ts" setup>
import type { AuthInfo } from '../../api/model/zzhshopR2Model';

import { ref } from 'vue';

import { useVbenModal } from '@vben/common-ui';

import {
  Button,
  Descriptions,
  DescriptionsItem,
  message,
  Modal,
  Space,
  Tag,
  Textarea,
} from 'ant-design-vue';

import { getAuthDetail, updateAuth } from '../../api/auth';
import { shopStateMap, shopVerifyMap } from './schema';

defineOptions({
  name: 'ZzhshopR2ShopAuditDetail',
});

const detail = ref<AuthInfo>({});
const loading = ref(false);
const gridApi = ref();
const rejecting = ref(false);
const refuseReason = ref('');

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

async function load(id: number) {
  loading.value = true;
  try {
    const res = await getAuthDetail(id);
    detail.value = res.data.data ?? {};
  } finally {
    loading.value = false;
  }
}

const [ModalBox, modalApi] = useVbenModal({
  fullscreenButton: false,
  footer: false,
  onCancel() {
    modalApi.close();
  },
  onOpenChange(isOpen: boolean) {
    if (isOpen) {
      gridApi.value = modalApi.getData()?.gridApi;
      rejecting.value = false;
      refuseReason.value = '';
      load(modalApi.getData()?.id);
    }
  },
});

/** 审核通过 */
function handleApprove() {
  Modal.confirm({
    title: '审核通过',
    content: `确认通过「${detail.value.shopname ?? ''}」的入驻申请？`,
    async onOk() {
      await updateAuth({ id: detail.value.id, verify: '3' });
      message.success('审核成功');
      gridApi.value?.reload();
      modalApi.close();
    },
  });
}

/** 审核拒绝 */
async function handleReject() {
  if (!refuseReason.value.trim()) {
    message.warning('请填写拒绝理由');
    return;
  }
  await updateAuth({
    id: detail.value.id,
    verify: '4',
    refuse: refuseReason.value,
  });
  message.success('已拒绝该申请');
  gridApi.value?.reload();
  modalApi.close();
}
</script>

<template>
  <ModalBox title="入驻申请详情">
    <Descriptions :column="2" bordered size="small">
      <DescriptionsItem label="店铺名称">
        {{ detail.shopname || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="店铺类型">
        {{ shopStateMap[detail.state ?? ''] ?? detail.state }}
      </DescriptionsItem>
      <DescriptionsItem label="企业名·姓名">
        {{ detail.name || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="统一信用·身份证号">
        {{ detail.number || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="手机号">
        {{ detail.mobile || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="微信号">
        {{ detail.wechat || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="省市">
        {{ detail.city || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="创店时间">
        {{ fmtTime(detail.createtime) }}
      </DescriptionsItem>
      <DescriptionsItem label="审核状态" :span="2">
        <Tag
          :color="
            detail.verify === '3'
              ? 'green'
              : detail.verify === '4'
                ? 'red'
                : 'default'
          "
        >
          {{ shopVerifyMap[detail.verify ?? ''] ?? detail.verify }}
        </Tag>
      </DescriptionsItem>
      <DescriptionsItem label="店铺简介" :span="2">
        {{ detail.bio || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="店铺介绍" :span="2">
        {{ detail.content || '-' }}
      </DescriptionsItem>
      <DescriptionsItem label="证件图片" :span="2">
        <img
          v-if="detail.image"
          :src="detail.image"
          class="detail-img"
          alt="credential"
        />
        <span v-else>-</span>
      </DescriptionsItem>
      <DescriptionsItem label="商标证书" :span="2">
        <img
          v-if="detail.trademark"
          :src="detail.trademark"
          class="detail-img"
          alt="trademark"
        />
        <span v-else>-</span>
      </DescriptionsItem>
      <DescriptionsItem v-if="detail.verify === '4'" label="拒绝理由" :span="2">
        {{ detail.refuse || '-' }}
      </DescriptionsItem>
    </Descriptions>

    <div class="audit-actions">
      <Space>
        <Button type="primary" @click="handleApprove">通过</Button>
        <Button danger @click="rejecting = !rejecting">拒绝</Button>
      </Space>
      <div v-if="rejecting" class="reject-box">
        <Textarea
          v-model:value="refuseReason"
          :rows="3"
          placeholder="请填写拒绝理由"
        />
        <Button danger size="small" type="primary" @click="handleReject">
          确认拒绝
        </Button>
      </div>
    </div>
  </ModalBox>
</template>

<style scoped>
.detail-img {
  max-width: 160px;
  max-height: 160px;
  margin-right: 8px;
  object-fit: cover;
  border-radius: 4px;
}

.audit-actions {
  margin-top: 16px;
}

.reject-box {
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  margin-top: 12px;
}
</style>
