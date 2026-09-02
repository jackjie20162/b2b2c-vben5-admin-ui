<script lang="ts" setup>
import type { IconInfo } from '../../../api/model/zzhshopR2Model';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, message, Modal, TabPane, Tabs } from 'ant-design-vue';
import { isPlainObject } from 'remeda';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { type ActionItem, TableAction } from '#/components/table/table-action';

import { deleteIcon, getIconList } from '../../../api/diy';
import IconForm from './form.vue';
import { searchFormSchemas, tableColumns } from './schema';

defineOptions({
  name: 'ZzhshopR2IconManagement',
});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: IconForm,
});

const showDeleteButton = ref<boolean>(false);
const statusTab = ref<string>('all');

const gridEvents: VxeGridListeners<any> = {
  checkboxChange(e) {
    showDeleteButton.value = e.$table.getCheckboxRecords().length > 0;
  },
  checkboxAll(e) {
    showDeleteButton.value = e.$table.getCheckboxRecords().length > 0;
  },
};

const formOptions: VbenFormProps = {
  collapsed: false,
  schema: [...(searchFormSchemas.schema as any)],
  showCollapseButton: true,
  submitOnEnter: false,
};

const gridOptions: VxeGridProps<IconInfo> = {
  checkboxConfig: {
    highlight: true,
  },
  toolbarConfig: {
    slots: {
      buttons: 'toolbar-buttons',
    },
  },
  columns: [
    ...(tableColumns.columns as any),
    {
      title: $t('common.action'),
      fixed: 'right',
      field: 'action',
      width: 100,
      slots: {
        default: ({ row }) =>
          h(TableAction, {
            actions: [
              {
                label: '',
                type: 'link',
                size: 'small',
                tooltip: $t('common.edit'),
                icon: 'clarity:note-edit-line',
                onClick: openFormModal.bind(null, row),
              },
              {
                icon: 'ant-design:delete-outlined',
                type: 'link',
                color: 'error',
                tooltip: $t('common.delete'),
                popConfirm: {
                  title: $t('common.deleteConfirm'),
                  placement: 'left',
                  confirm: batchDelete.bind(null, [row.id]),
                },
              },
            ] as ActionItem[],
          }),
      },
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {},
  proxyConfig: {
    ajax: {
      query: async ({ page }, formValues) => {
        const params: Record<string, any> = {
          page: page.currentPage,
          page_size: page.pageSize,
          ...formValues,
        };
        if (statusTab.value !== 'all') {
          params.status = statusTab.value;
        }
        const res = await getIconList(params);
        return res.data;
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({
  formOptions,
  gridOptions,
  gridEvents,
});

function handleStatusChange() {
  gridApi.reload();
}

function openFormModal(record: any) {
  if (isPlainObject(record)) {
    formModalApi.setData({
      record,
      isUpdate: true,
      gridApi,
    });
  } else {
    formModalApi.setData({
      record: null,
      isUpdate: false,
      gridApi,
    });
  }
  formModalApi.open();
}

function handleBatchDelete() {
  Modal.confirm({
    title: $t('common.deleteConfirm'),
    async onOk() {
      const ids = gridApi.grid.getCheckboxRecords().map((item: any) => item.id);
      await batchDelete(ids);
    },
  });
}

async function batchDelete(ids: any[]) {
  const result = await deleteIcon({ ids });
  if (result.code === 0) {
    message.success($t('common.successful'));
    await gridApi.reload();
    showDeleteButton.value = false;
  }
}
</script>

<template>
  <Page auto-content-height>
    <FormModal />
    <Grid>
      <template #toolbar-buttons>
        <Tabs
          v-model:active-key="statusTab"
          class="status-tabs"
          size="small"
          @change="handleStatusChange"
        >
          <TabPane key="all" tab="全部" />
          <TabPane key="normal" tab="正常" />
          <TabPane key="hidden" tab="隐藏" />
        </Tabs>
      </template>

      <template #toolbar-tools>
        <Button
          v-show="showDeleteButton"
          class="mr-2"
          danger
          type="primary"
          @click="handleBatchDelete"
        >
          {{ $t('common.delete') }}
        </Button>
        <Button type="primary" @click="openFormModal">
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

<style scoped>
.status-tabs {
  margin-bottom: -16px;
}

.status-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}
</style>
