<script lang="ts" setup>
import type { ShopInfo } from '../../api/model/zzhshopR2Model';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, message, Modal, TabPane, Tabs } from 'ant-design-vue';
import { isPlainObject } from 'remeda';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { type ActionItem, TableAction } from '#/components/table/table-action';

import { deleteShop, getShopList } from '../../api/shop';
import ShopForm from './form.vue';
import { searchFormSchemas, tableColumns } from './schema';

defineOptions({
  name: 'ZzhshopR2ShopList',
});

const stateFilter = ref<string>('');

function onTabChange() {
  gridApi.formApi.setValues({ state: stateFilter.value || undefined });
  gridApi.query();
}

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ShopForm,
});

const showDeleteButton = ref<boolean>(false);

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

const gridOptions: VxeGridProps<ShopInfo> = {
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
        const res = await getShopList({
          page: page.currentPage,
          page_size: page.pageSize,
          ...formValues,
        });
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
  const result = await deleteShop({ ids });
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
    <div class="page-head">
      <div class="page-title">店铺列表</div>
      <div class="page-sub">用于管理平台入驻的全部商家店铺</div>
    </div>

    <Tabs
      v-model:active-key="stateFilter"
      class="state-tabs"
      @change="onTabChange"
    >
      <TabPane key="" tab="全部" />
      <TabPane key="0" tab="个人" />
      <TabPane key="1" tab="企业" />
      <TabPane key="2" tab="旗舰" />
    </Tabs>

    <Grid>
      <template #toolbar-buttons>
        <Button
          v-show="showDeleteButton"
          danger
          type="primary"
          @click="handleBatchDelete"
        >
          {{ $t('common.delete') }}
        </Button>
      </template>

      <template #toolbar-tools>
        <Button type="primary" @click="openFormModal">
          {{ $t('common.create') }}
        </Button>
      </template>
    </Grid>
  </Page>
</template>

<style scoped>
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
</style>
