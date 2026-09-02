<script lang="ts" setup>
import type { GoodsInfo } from '../../api/model/zzhshopR2Model';

import type { VxeGridListeners, VxeGridProps } from '#/adapter/vxe-table';

import { h, onMounted, ref } from 'vue';

import { Page, useVbenModal, type VbenFormProps } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, message, Modal, TabPane, Tabs } from 'ant-design-vue';
import { isPlainObject } from 'remeda';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { type ActionItem, TableAction } from '#/components/table/table-action';

import { getCategoryList } from '../../api/category';
import { deleteGoods, getGoodsList } from '../../api/goods';
import GoodsForm from './form.vue';
import {
  categoryNameMap,
  searchFormSchemas,
  tableColumns,
} from './schema';

defineOptions({
  name: 'ZzhshopR2GoodsManagement',
});

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: GoodsForm,
});

const showDeleteButton = ref<boolean>(false);

/** 上架状态页签：all=全部宝贝，1=出售中宝贝，0=仓库中宝贝 */
const groundingTab = ref<'0' | '1' | 'all'>('all');

function handleGroundingChange() {
  gridApi.reload();
}

/** 加载分类名称映射，供列表分类列展示 */
onMounted(async () => {
  const res = await getCategoryList({ page: 1, page_size: 1000 });
  for (const item of res?.data?.data || []) {
    if (item.id !== undefined) {
      categoryNameMap[item.id] = item.name || '';
    }
  }
});

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

const gridOptions: VxeGridProps<GoodsInfo> = {
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
        if (groundingTab.value !== 'all') {
          params.grounding = Number(groundingTab.value);
        }
        const res = await getGoodsList(params);
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
  const result = await deleteGoods({ ids });
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
          v-model:active-key="groundingTab"
          class="grounding-tabs"
          size="small"
          @change="handleGroundingChange"
        >
          <TabPane key="all" tab="全部宝贝" />
          <TabPane key="1" tab="出售中宝贝" />
          <TabPane key="0" tab="仓库中宝贝" />
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
.grounding-tabs {
  margin-bottom: -16px;
}

.grounding-tabs :deep(.ant-tabs-nav) {
  margin: 0;
}
</style>
