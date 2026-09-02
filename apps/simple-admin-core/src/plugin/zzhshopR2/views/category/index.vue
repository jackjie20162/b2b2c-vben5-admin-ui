<script lang="ts" setup>
import type { CategoryTreeNode } from '../../api/model/zzhshopR2Model';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Button, message, Modal, Radio, RadioGroup } from 'ant-design-vue';
import { isPlainObject } from 'remeda';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { type ActionItem, TableAction } from '#/components/table/table-action';

import { deleteCategory, getCategoryTree } from '../../api/category';
import CategoryAttr from './categoryAttr.vue';
import CategoryGoods from './categoryGoods.vue';
import CategoryForm from './form.vue';
import { tableColumns } from './schema';

defineOptions({
  name: 'ZzhshopR2CategoryManagement',
});

/** 电商类目页固定为商品分类（文章分类在内容管理维护） */
const categoryType = 'goods';
const statusFilter = ref<'all' | 'hidden' | 'normal'>('all');
const expandAll = ref(true);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: CategoryForm,
});

const [AttrModal, attrModalApi] = useVbenModal({
  connectedComponent: CategoryAttr,
});

const [GoodsModal, goodsModalApi] = useVbenModal({
  connectedComponent: CategoryGoods,
});

/** 收集节点及全部子类目 ID */
function collectIds(node: CategoryTreeNode): number[] {
  const ids = [node.id!];
  for (const child of node.children ?? []) {
    ids.push(...collectIds(child));
  }
  return ids;
}

/** 类目属性弹窗 */
function openAttr(rows: CategoryTreeNode[]) {
  if (rows.length === 0) {
    message.warning('请先勾选分类');
    return;
  }
  const ids = [...new Set(rows.flatMap((r) => collectIds(r)))];
  attrModalApi.setData({
    category:
      rows.length === 1
        ? rows[0]
        : { name: rows.map((r) => r.name).join('、') },
    categoryIds: ids,
  });
  attrModalApi.open();
}

/** 商品/拼团弹窗 */
function openGoods(rows: CategoryTreeNode[], mode: 'goods' | 'groups') {
  if (rows.length === 0) {
    message.warning('请先勾选分类');
    return;
  }
  const ids = [...new Set(rows.flatMap((r) => collectIds(r)))];
  goodsModalApi.setData({
    category:
      rows.length === 1
        ? rows[0]
        : { name: rows.map((r) => r.name).join('、') },
    categoryIds: ids,
    mode,
  });
  goodsModalApi.open();
}

function checkedRows() {
  return gridApi.grid.getCheckboxRecords() as CategoryTreeNode[];
}

/** 按状态过滤树：自身匹配保留整棵子树，否则仅保留含匹配后代的分支 */
function filterTree(nodes: CategoryTreeNode[], status: string): CategoryTreeNode[] {
  const result: CategoryTreeNode[] = [];
  for (const node of nodes) {
    if (node.status === status) {
      result.push(node);
      continue;
    }
    const children = node.children ? filterTree(node.children, status) : [];
    if (children.length > 0) {
      result.push({ ...node, children });
    }
  }
  return result;
}

const gridOptions: VxeGridProps<CategoryTreeNode> = {
  treeConfig: {
    transform: false,
    rowField: 'id',
    childrenField: 'children',
    expandAll: true,
  },
  toolbarConfig: {
    slots: {
      buttons: 'toolbar-buttons',
    },
  },
  checkboxConfig: {
    highlight: true,
  },
  columns: [
    ...(tableColumns.columns as any),
    {
      title: $t('common.action'),
      fixed: 'right',
      field: 'action',
      width: 360,
      slots: {
        default: ({ row }) =>
          h(TableAction, {
            actions: [
              {
                label: '属性',
                type: 'link',
                size: 'small',
                color: 'error',
                icon: 'ant-design:profile-outlined',
                onClick: openAttr.bind(null, [row]),
              },
              {
                label: '商品',
                type: 'link',
                size: 'small',
                icon: 'ant-design:shopping-outlined',
                onClick: openGoods.bind(null, [row], 'goods'),
              },
              {
                label: '拼团',
                type: 'link',
                size: 'small',
                color: 'warning',
                icon: 'ant-design:team-outlined',
                onClick: openGoods.bind(null, [row], 'groups'),
              },
              {
                label: $t('common.edit'),
                type: 'link',
                size: 'small',
                icon: 'clarity:note-edit-line',
                onClick: openFormModal.bind(null, row),
              },
              {
                label: '添加下级',
                type: 'link',
                size: 'small',
                icon: 'ant-design:plus-outlined',
                onClick: openChildModal.bind(null, row),
              },
              {
                icon: 'ant-design:delete-outlined',
                type: 'link',
                color: 'error',
                tooltip: $t('common.delete'),
                popConfirm: {
                  title: $t('common.deleteConfirm'),
                  placement: 'left',
                  confirm: handleDelete.bind(null, row),
                },
              },
            ] as ActionItem[],
          }),
      },
    },
  ],
  height: 'auto',
  keepSource: true,
  pagerConfig: {
    enabled: false,
  },
  proxyConfig: {
    ajax: {
      query: async () => {
        const res = await getCategoryTree(categoryType);
        const data = res.data.data;
        return statusFilter.value === 'all'
          ? data
          : filterTree(data, statusFilter.value);
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function openFormModal(record: any) {
  if (isPlainObject(record)) {
    formModalApi.setData({
      record: { ...record, type: categoryType },
      isUpdate: true,
      gridApi,
    });
  } else {
    formModalApi.setData({
      record: { type: categoryType },
      isUpdate: false,
      gridApi,
    });
  }
  formModalApi.open();
}

/** 添加下级分类：预置 pid 与类型 */
function openChildModal(row: any) {
  formModalApi.setData({
    record: { pid: row.id, type: categoryType },
    isUpdate: false,
    gridApi,
  });
  formModalApi.open();
}

async function handleDelete(row: any) {
  const result = await deleteCategory({ ids: [row.id] });
  if (result.code === 0) {
    message.success($t('common.successful'));
    await gridApi.reload();
  }
}

/** 批量删除勾选分类 */
function handleBatchDelete() {
  const rows = gridApi.grid.getCheckboxRecords() as CategoryTreeNode[];
  if (rows.length === 0) {
    message.warning('请先勾选要删除的分类');
    return;
  }
  Modal.confirm({
    title: $t('common.deleteConfirm'),
    content: `将删除勾选的 ${rows.length} 个分类`,
    okType: 'danger',
    onOk: async () => {
      const result = await deleteCategory({ ids: rows.map((r) => r.id!) });
      if (result.code === 0) {
        message.success($t('common.successful'));
        await gridApi.reload();
      }
    },
  });
}

/** 展开/收起全部树节点 */
function toggleExpand() {
  expandAll.value = !expandAll.value;
  gridApi.grid.setAllTreeExpand(expandAll.value);
}

function handleStatusChange(event: any) {
  statusFilter.value = event.target.value;
  gridApi.reload();
}
</script>

<template>
  <Page auto-content-height>
    <FormModal />
    <AttrModal />
    <GoodsModal />
    <Grid>
      <template #toolbar-buttons>
        <RadioGroup
          v-model:value="statusFilter"
          button-style="solid"
          @change="handleStatusChange"
        >
          <Radio value="all">全部</Radio>
          <Radio value="normal">正常</Radio>
          <Radio value="hidden">隐藏</Radio>
        </RadioGroup>
      </template>

      <template #toolbar-tools>
        <div class="flex gap-2">
          <Button type="primary" @click="openFormModal">
            {{ $t('common.create') }}
          </Button>
          <Button danger @click="openAttr(checkedRows())">类目属性</Button>
          <Button type="primary" @click="openGoods(checkedRows(), 'goods')">
            全部商品
          </Button>
          <Button type="primary" @click="openGoods(checkedRows(), 'groups')">
            全部拼团
          </Button>
          <Button danger @click="handleBatchDelete">
            {{ $t('common.delete') }}
          </Button>
          <Button @click="toggleExpand">
            {{ expandAll ? '收起列表' : '展开列表' }}
          </Button>
        </div>
      </template>
    </Grid>
  </Page>
</template>
