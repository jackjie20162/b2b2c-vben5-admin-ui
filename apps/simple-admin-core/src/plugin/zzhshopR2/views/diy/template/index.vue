<script lang="ts" setup>
import type { PageInfo } from '../../../api/model/zzhshopR2Model';

import { onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Card,
  Col,
  Empty,
  message,
  Modal,
  Row,
  Spin,
} from 'ant-design-vue';

import { deletePage, getPageList } from '../../../api/diy';
import PageEditor from '../page/editor.vue';
import TemplateForm from './form.vue';

defineOptions({
  name: 'ZzhshopR2TemplateManagement',
});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: TemplateForm,
});

const loading = ref(false);
const templates = ref<PageInfo[]>([]);
const editorRecord = ref<null | PageInfo>(null);

async function loadTemplates() {
  loading.value = true;
  try {
    const res = await getPageList({ page: 1, page_size: 200, type: 'systpl' });
    templates.value = res.data?.data || [];
  } finally {
    loading.value = false;
  }
}

function formatUnixTime(value?: number) {
  return value ? new Date(Number(value) * 1000).toLocaleString() : '';
}

function openFormModal(record?: PageInfo) {
  if (record) {
    formModalApi.setData({
      record,
      isUpdate: true,
      onSaved: loadTemplates,
    });
  } else {
    formModalApi.setData({
      record: null,
      isUpdate: false,
      onSaved: loadTemplates,
    });
  }
  formModalApi.open();
}

function openEditor(record: PageInfo) {
  editorRecord.value = record;
}

function handleEditorClose() {
  editorRecord.value = null;
  loadTemplates();
}

function handleEditorSaved() {
  loadTemplates();
}

function handleDelete(record: PageInfo) {
  Modal.confirm({
    title: $t('common.deleteConfirm'),
    async onOk() {
      const result = await deletePage({ ids: [record.id as number] });
      if (result.code === 0) {
        message.success($t('common.successful'));
        await loadTemplates();
      }
    },
  });
}

onMounted(() => {
  loadTemplates();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal />
    <PageEditor
      v-if="editorRecord"
      :record="editorRecord"
      @close="handleEditorClose"
      @saved="handleEditorSaved"
    />
    <div class="template-toolbar">
      <Button type="primary" @click="openFormModal()">
        {{ $t('common.create') }}
      </Button>
    </div>
    <Spin :spinning="loading">
      <Empty v-if="templates.length === 0" class="template-empty" />
      <Row v-else :gutter="[16, 16]">
        <Col
          v-for="item in templates"
          :key="item.id"
          :lg="4"
          :md="6"
          :sm="8"
          :xs="12"
        >
          <Card hoverable class="template-card">
            <template #cover>
              <div class="template-cover">
                <img v-if="item.cover" :src="item.cover" alt="cover" />
                <span v-else class="template-cover-placeholder">
                  {{ item.name }}
                </span>
              </div>
            </template>
            <Card.Meta
              :title="item.name"
              :description="formatUnixTime(item.updatetime)"
            />
            <template #actions>
              <Button type="link" size="small" @click="openEditor(item)">
                DIY设计
              </Button>
              <Button
                type="link"
                size="small"
                @click="openFormModal(item)"
              >
                {{ $t('common.edit') }}
              </Button>
              <Button danger type="link" size="small" @click="handleDelete(item)">
                {{ $t('common.delete') }}
              </Button>
            </template>
          </Card>
        </Col>
      </Row>
    </Spin>
  </Page>
</template>

<style scoped>
.template-toolbar {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 16px;
}

.template-empty {
  padding: 64px 0;
}

.template-card {
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
}

.template-cover {
  display: flex;
  align-items: center;
  justify-content: center;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: hsl(var(--muted));
}

.template-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.template-cover-placeholder {
  color: hsl(var(--muted-foreground));
  font-size: 14px;
}
</style>
