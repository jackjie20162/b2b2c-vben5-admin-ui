<script lang="ts" setup>
import type { ArticleInfo, CategoryInfo } from '../../api/model/zzhshopR2Model';

import { computed, onMounted, ref } from 'vue';

import { Page, useVbenModal } from '@vben/common-ui';

import {
  Button,
  Card,
  Checkbox,
  Input,
  message,
  Modal,
  Table,
  TabPane,
  Tabs,
  Tag,
  Tree,
} from 'ant-design-vue';

import { deleteArticle, getArticleList } from '../../api/article';
import { getCategoryList } from '../../api/category';
import ArticleForm from './articleForm.vue';

defineOptions({
  name: 'ZzhshopR2Article',
});

const InputSearch = Input.Search;

// 标志：对齐 PHP flag 集合（逗号分隔存储）
const flagMap: Record<string, { color: string; label: string }> = {
  hot: { color: 'orange', label: '热门' },
  index: { color: 'blue', label: '首页' },
  recommend: { color: 'green', label: '推荐' },
};

const loading = ref(false);
const list = ref<ArticleInfo[]>([]);
const total = ref(0);
const page = ref(1);
const pageSize = ref(10);
const statusFilter = ref('');
const keyword = ref('');
const selectedKeys = ref<number[]>([]);

// 左侧文章栏目树
const categoryTree = ref<(CategoryInfo & { children?: CategoryInfo[] })[]>([]);
const checkedKeys = ref<number[]>([]);
const expandedKeys = ref<number[]>([]);
const checkAll = ref(false);
const expandAll = ref(false);

const [FormModal, formModalApi] = useVbenModal({
  connectedComponent: ArticleForm,
});

const columns = [
  { title: 'ID', dataIndex: 'id', width: 70 },
  { title: '文章类目', dataIndex: 'category_name', width: 110 },
  { title: '标题', dataIndex: 'title', minWidth: 220, ellipsis: true },
  { title: '标志', dataIndex: 'flag', width: 170 },
  { title: '图片', dataIndex: 'image', width: 80 },
  { title: '点击', dataIndex: 'views', width: 80 },
  { title: '创建时间', dataIndex: 'createtime', width: 160 },
  { title: '更新时间', dataIndex: 'updatetime', width: 160 },
  { title: '状态', dataIndex: 'status', width: 90 },
  { title: '操作', dataIndex: 'action', width: 140 },
];

const allCategoryIds = computed(() => {
  const ids: number[] = [];
  const walk = (nodes: CategoryInfo[]) => {
    for (const n of nodes) {
      if (n.id !== undefined) ids.push(n.id);
      walk((n as any).children ?? []);
    }
  };
  walk(categoryTree.value);
  return ids;
});

function fmtTime(ts?: number) {
  if (!ts) return '-';
  const d = new Date(Number(ts) * 1000);
  const p = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())} ${p(d.getHours())}:${p(d.getMinutes())}:${p(d.getSeconds())}`;
}

/** 客户端将扁平分类按 pid 组装为树 */
function buildTree(items: CategoryInfo[]) {
  const map = new Map<number, any>();
  for (const item of items) {
    map.set(item.id!, { ...item, children: [] });
  }
  const roots: any[] = [];
  for (const node of map.values()) {
    const parent = node.pid ? map.get(node.pid) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

async function loadCategories() {
  const res = await getCategoryList({ page: 1, page_size: 1000, type: 'article' });
  categoryTree.value = buildTree(res.data.data ?? []);
}

async function load() {
  loading.value = true;
  try {
    const res = await getArticleList({
      page: page.value,
      page_size: pageSize.value,
      category_ids: checkedKeys.value.length > 0 ? checkedKeys.value : undefined,
      title: keyword.value || undefined,
      status: statusFilter.value || undefined,
    });
    total.value = res.data.total ?? 0;
    list.value = res.data.data ?? [];
    selectedKeys.value = [];
  } finally {
    loading.value = false;
  }
}

function onTabChange() {
  page.value = 1;
  load();
}

function onSearch() {
  page.value = 1;
  load();
}

function onTableChange(pagination: any) {
  page.value = pagination.current;
  pageSize.value = pagination.pageSize;
  load();
}

function onTreeCheck(checked: any) {
  checkedKeys.value = Array.isArray(checked) ? checked : (checked.checked ?? []);
  page.value = 1;
  load();
}

/** 选中全部栏目 */
function onCheckAllChange(event: any) {
  checkedKeys.value = event.target.checked ? [...allCategoryIds.value] : [];
  page.value = 1;
  load();
}

/** 展开/收起全部栏目 */
function onExpandAllChange(event: any) {
  expandedKeys.value = event.target.checked ? [...allCategoryIds.value] : [];
}

function openForm(record?: ArticleInfo) {
  formModalApi.setData({
    record: record ?? {},
    isUpdate: !!record,
    gridApi: { reload: load },
  });
  formModalApi.open();
}

/** 工具栏编辑：仅在勾选单条时可用 */
function handleEditSelected() {
  if (selectedKeys.value.length !== 1) return;
  const row = list.value.find((item) => item.id === selectedKeys.value[0]);
  if (row) openForm(row);
}

function handleDelete(ids: number[]) {
  Modal.confirm({
    title: '删除文章',
    content: `确认删除选中的 ${ids.length} 篇文章？删除后不可恢复`,
    okType: 'danger',
    onOk: async () => {
      await deleteArticle({ ids });
      message.success('删除成功');
      load();
    },
  });
}

function handleBatchDelete() {
  if (selectedKeys.value.length === 0) {
    message.warning('请先勾选要删除的文章');
    return;
  }
  handleDelete(selectedKeys.value);
}

onMounted(() => {
  loadCategories();
  load();
});
</script>

<template>
  <Page auto-content-height>
    <FormModal />

    <div class="article-page">
      <!-- 左侧：文章栏目树 -->
      <Card class="tree-card" size="small" title="文章栏目">
        <div class="tree-tip">点击指定栏目获取内容列表</div>
        <div class="tree-checks">
          <Checkbox v-model:checked="checkAll" @change="onCheckAllChange">
            选中全部
          </Checkbox>
          <Checkbox v-model:checked="expandAll" @change="onExpandAllChange">
            展开全部
          </Checkbox>
        </div>
        <Tree
          v-model:checked-keys="checkedKeys"
          v-model:expanded-keys="expandedKeys"
          checkable
          :field-names="{ key: 'id', title: 'name', children: 'children' }"
          :tree-data="categoryTree"
          @check="onTreeCheck"
        />
      </Card>

      <!-- 右侧：文章列表 -->
      <div class="list-panel">
        <div class="page-head">
          <div class="page-title">文章列表</div>
          <div class="page-sub">
            用于管理客户端的新闻、协议、帮助、及智能客服相关解答
          </div>
        </div>

        <Tabs v-model:active-key="statusFilter" class="state-tabs" @change="onTabChange">
          <TabPane key="" tab="全部" />
          <TabPane key="normal" tab="正常" />
          <TabPane key="hidden" tab="隐藏" />
        </Tabs>

        <div class="toolbar">
          <Button @click="load">刷新</Button>
          <Button type="primary" @click="openForm()">添加</Button>
          <Button :disabled="selectedKeys.length !== 1" @click="handleEditSelected">
            编辑
          </Button>
          <Button danger @click="handleBatchDelete">删除</Button>
          <div class="toolbar-right">
            <InputSearch
              v-model:value="keyword"
              allow-clear
              placeholder="搜索标题"
              style="width: 220px"
              @search="onSearch"
            />
          </div>
        </div>

        <Table
          v-model:selected-row-keys="selectedKeys"
          :columns="columns"
          :data-source="list"
          :loading="loading"
          :pagination="{
            current: page,
            pageSize,
            total,
            showSizeChanger: true,
          }"
          :row-selection="{ selectedRowKeys: selectedKeys, onChange: (keys: any) => (selectedKeys = keys) }"
          :scroll="{ x: 1300 }"
          row-key="id"
          size="middle"
          @change="onTableChange"
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.dataIndex === 'flag'">
              <template v-if="record.flag">
                <Tag
                  v-for="f in String(record.flag).split(',')"
                  :key="f"
                  :color="flagMap[f]?.color ?? 'default'"
                >
                  {{ flagMap[f]?.label ?? f }}
                </Tag>
              </template>
              <span v-else>-</span>
            </template>
            <template v-else-if="column.dataIndex === 'image'">
              <img
                v-if="record.image"
                :src="record.image"
                class="cell-img"
                alt="article"
              />
              <span v-else>-</span>
            </template>
            <template v-else-if="column.dataIndex === 'createtime'">
              {{ fmtTime(record.createtime) }}
            </template>
            <template v-else-if="column.dataIndex === 'updatetime'">
              {{ fmtTime(record.updatetime) }}
            </template>
            <template v-else-if="column.dataIndex === 'status'">
              <Tag :color="record.status === 'normal' ? 'green' : 'default'">
                {{ record.status === 'normal' ? '正常' : '隐藏' }}
              </Tag>
            </template>
            <template v-else-if="column.dataIndex === 'action'">
              <Button size="small" type="link" @click="openForm(record)">
                编辑
              </Button>
              <Button danger size="small" type="link" @click="handleDelete([record.id])">
                删除
              </Button>
            </template>
          </template>
        </Table>
      </div>
    </div>
  </Page>
</template>

<style scoped>
.article-page {
  display: flex;
  gap: 12px;
  height: 100%;
  overflow: hidden;
}

.tree-card {
  flex-shrink: 0;
  width: 280px;
  overflow: auto;
}

.tree-tip {
  margin-bottom: 8px;
  font-size: 12px;
  color: hsl(var(--muted-foreground));
}

.tree-checks {
  display: flex;
  gap: 12px;
  padding-bottom: 8px;
  margin-bottom: 8px;
  border-bottom: 1px solid hsl(var(--border));
}

.list-panel {
  display: flex;
  flex: 1;
  flex-direction: column;
  min-width: 0;
  overflow: auto;
  background: hsl(var(--background));
}

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

.toolbar {
  display: flex;
  gap: 8px;
  align-items: center;
  padding: 12px 16px;
}

.toolbar-right {
  margin-left: auto;
}

.cell-img {
  width: 40px;
  height: 40px;
  object-fit: cover;
  border-radius: 4px;
}
</style>
