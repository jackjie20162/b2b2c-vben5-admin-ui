<script lang="ts" setup>
import type { CategoryInfo } from '../../api/model/zzhshopR2Model';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import { Badge, Button, message, Modal, Radio, RadioGroup, Switch } from 'ant-design-vue';
import { isPlainObject } from 'remeda';

import { useVbenVxeGrid } from '#/adapter/vxe-table';
import { type ActionItem, TableAction } from '#/components/table/table-action';

import { deleteCategory, getCategoryList, updateCategory } from '../../api/category';
import CategoryForm from './categoryForm.vue';

defineOptions({
  name: 'ZzhshopR2ArticleCategory',
});

type ArticleCategoryNode = CategoryInfo & { children?: ArticleCategoryNode[] };

const statusFilter = ref<'all' | 'hidden' | 'normal'>('all');
const expandAll = ref(true);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: CategoryForm,
});

/** 客户端将扁平分类按 pid 组装为树 */
function buildTree(items: CategoryInfo[]): ArticleCategoryNode[] {
  const map = new Map<number, ArticleCategoryNode>();
  for (const item of items) {
    map.set(item.id!, { ...item, children: [] });
  }
  const roots: ArticleCategoryNode[] = [];
  for (const node of map.values()) {
    const parent = node.pid ? map.get(node.pid) : undefined;
    if (parent) {
      parent.children!.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** 按状态过滤树：自身匹配保留整棵子树，否则仅保留含匹配后代的分支 */
function filterTree(nodes: ArticleCategoryNode[], status: string): ArticleCategoryNode[] {
  const result: ArticleCategoryNode[] = [];
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

const gridOptions: VxeGridProps<ArticleCategoryNode> = {
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
    { type: 'checkbox', width: 60 },
    { title: 'ID', field: 'id', width: 80 },
    { title: '分类名称', field: 'name', minWidth: 240, treeNode: true },
    {
      title: '图片',
      field: 'image',
      width: 90,
      slots: {
        default: ({ row }) =>
          row.image
            ? h('img', { src: row.image, style: { height: '40px', width: '40px', objectFit: 'cover' } })
            : h('span'),
      },
    },
    {
      title: '状态',
      field: 'status',
      width: 90,
      slots: {
        default: ({ row }) =>
          h(Badge, {
            status: row.status === 'normal' ? 'success' : 'default',
            text: row.status === 'normal' ? '正常' : '隐藏',
          }),
      },
    },
    {
      title: '导航显示',
      field: 'isnav',
      width: 100,
      slots: {
        default: (e) =>
          h(Switch, {
            checked: e.row.isnav === 1,
            onClick: () => {
              const newValue = e.row.isnav === 1 ? 0 : 1;
              updateCategory({ id: e.row.id, isnav: newValue }).then(() => {
                e.row.isnav = newValue;
              });
            },
          }),
      },
    },
    { title: '权重', field: 'weigh', width: 90 },
    {
      title: $t('common.action'),
      fixed: 'right',
      field: 'action',
      width: 200,
      slots: {
        default: ({ row }) =>
          h(TableAction, {
            actions: [
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
        const res = await getCategoryList({ page: 1, page_size: 1000, type: 'article' });
        const data = buildTree(res.data.data ?? []);
        return statusFilter.value === 'all'
          ? data
          : filterTree(data, statusFilter.value);
      },
    },
  },
};

const [Grid, gridApi] = useVbenVxeGrid({ gridOptions });

function openFormModal(record?: any) {
  if (isPlainObject(record)) {
    formModalApi.setData({
      record: { ...record },
      isUpdate: true,
      gridApi,
    });
  } else {
    formModalApi.setData({
      record: {},
      isUpdate: false,
      gridApi,
    });
  }
  formModalApi.open();
}

/** 添加下级分类：预置 pid */
function openChildModal(row: any) {
  formModalApi.setData({
    record: { pid: row.id },
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
  const rows = gridApi.grid.getCheckboxRecords() as ArticleCategoryNode[];
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
    <Grid>
      <template #toolbar-buttons>
        <div class="page-head">
          <div class="page-title">分类管理</div>
          <div class="page-sub">用于管理客户端文章栏目，支持多级分类</div>
        </div>
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
          <Button type="primary" @click="openFormModal()">
            添加
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

<style scoped>
.page-head {
  margin-right: 16px;
}

.page-title {
  font-size: 15px;
  font-weight: 600;
  color: hsl(var(--foreground));
}

.page-sub {
  margin-top: 2px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}
</style>
