<script lang="ts" setup>
import type {
  GoodsCreateFullReq,
  GoodsInfo,
  GoodsSkuInfo,
  GoodsSpuInfo,
  GoodsUpdateFullReq,
} from '../../api/model/zzhshopR2Model';

import { computed, reactive, ref, watch } from 'vue';

import { useVbenModal } from '@vben/common-ui';
import { $t } from '@vben/locales';

import {
  Button,
  Input,
  InputNumber,
  message,
  Space,
  TabPane,
  Tabs,
  Tag,
} from 'ant-design-vue';

import { useVbenForm } from '#/adapter/form';
import ImageUpload from '#/components/form/ImageUpload.vue';

import { createGoods, getGoodsDetail, updateGoods } from '../../api/goods';
import {
  afterFormSchemas,
  basicFormSchemas,
  freightFormSchemas,
  mediaFormSchemas,
  payFormSchemas,
} from './schema';

defineOptions({
  name: 'ZzhshopR2GoodsForm',
});

const record = ref();
const isUpdate = ref(false);
const gridApi = ref();
const activeTab = ref('basic');

// ===== 分段表单（基础信息 / 图文描述 / 支付信息 / 物流信息 / 售后信息） =====
const formOptions = {
  showDefaultActions: false,
  layout: 'vertical',
} as const;

const [BasicForm, basicFormApi] = useVbenForm({
  ...formOptions,
  schema: [...(basicFormSchemas.schema as any)],
});
const [MediaForm, mediaFormApi] = useVbenForm({
  ...formOptions,
  schema: [...(mediaFormSchemas.schema as any)],
});
const [PayForm, payFormApi] = useVbenForm({
  ...formOptions,
  schema: [...(payFormSchemas.schema as any)],
});
const [FreightForm, freightFormApi] = useVbenForm({
  ...formOptions,
  schema: [...(freightFormSchemas.schema as any)],
});
const [AfterForm, afterFormApi] = useVbenForm({
  ...formOptions,
  schema: [...(afterFormSchemas.schema as any)],
});

/** 页签与表单的对应关系，按顺序校验与取值 */
const formSegments = [
  { key: 'basic', label: '基础信息', api: basicFormApi },
  { key: 'media', label: '图文描述', api: mediaFormApi },
  { key: 'pay', label: '支付信息', api: payFormApi },
  { key: 'freight', label: '物流信息', api: freightFormApi },
  { key: 'after', label: '售后信息', api: afterFormApi },
];

// ===== 多规格编辑器状态（销售信息页签） =====
interface SpecGroup {
  /** 属性名，如：颜色 */
  name: string;
  /** 属性值列表，如：白色、红色 */
  items: string[];
  /** 输入中的新属性值 */
  newItem: string;
}

const specGroups = ref<SpecGroup[]>([]);
/** SKU 填写数据，key 为规格组合（difference），如 "白色,XL" */
const skuDataMap = reactive<Record<string, Partial<GoodsSkuInfo>>>({});
/** 批量填充值 */
const batch = reactive<Partial<GoodsSkuInfo>>({});

/** 有效属性组（名称非空且有属性值） */
const validGroups = computed(() =>
  specGroups.value.filter((g) => g.name.trim() && g.items.length > 0),
);

/** SKU 行 = 各属性组属性值的笛卡尔积 */
const skuRows = computed(() => {
  let diffs: string[] = [''];
  for (const g of validGroups.value) {
    const next: string[] = [];
    for (const d of diffs) {
      for (const item of g.items) next.push(d ? `${d},${item}` : item);
    }
    diffs = next;
  }
  if (diffs.length === 1 && diffs[0] === '') return [];
  return diffs.map((difference) => ({ difference }));
});

// 保证每个 SKU 行都有可绑定的数据对象
watch(
  skuRows,
  (rows) => {
    for (const row of rows) {
      if (!skuDataMap[row.difference]) skuDataMap[row.difference] = {};
    }
  },
  { immediate: true },
);

function addGroup() {
  specGroups.value.push({ name: '', items: [], newItem: '' });
}

function removeGroup(index: number) {
  specGroups.value.splice(index, 1);
}

function addItem(groupIndex: number) {
  const group = specGroups.value[groupIndex]!;
  const item = group.newItem.trim();
  if (!item) return;
  if (group.items.includes(item)) {
    message.warning('该属性值已存在');
    return;
  }
  group.items.push(item);
  group.newItem = '';
}

function removeItem(groupIndex: number, itemIndex: number) {
  specGroups.value[groupIndex]!.items.splice(itemIndex, 1);
}

function applyBatch() {
  const fields: (keyof GoodsSkuInfo)[] = [
    'market_price',
    'price',
    'stock',
    'weigh',
    'sn',
  ];
  for (const row of skuRows.value) {
    const data = skuDataMap[row.difference]!;
    for (const field of fields) {
      const value = batch[field];
      if (value !== undefined && value !== null && value !== '') {
        (data as any)[field] = value;
      }
    }
  }
}

// ===== 值转换工具 =====

/** 相册字段入库为 JSON 数组字符串，编辑时解析为数组供上传组件回显 */
function parseImages(value: unknown): string[] {
  if (Array.isArray(value)) return value as string[];
  if (typeof value === 'string' && value.trim()) {
    try {
      const parsed = JSON.parse(value);
      if (Array.isArray(parsed)) return parsed.filter((i) => !!i);
    } catch {
      return value.split(',').filter((i) => !!i);
    }
  }
  return [];
}

/** 逗号分隔字符串 → 数组（多选组件回显） */
function splitList(value: unknown): string[] {
  if (Array.isArray(value)) return value.map(String);
  if (typeof value === 'string' && value.trim()) {
    return value.split(',').filter((i) => !!i);
  }
  return [];
}

/** 数组/字符串 → 逗号分隔字符串（入库格式） */
function toCommaString(value: unknown): string {
  if (Array.isArray(value)) return value.map(String).join(',');
  if (typeof value === 'string') return value;
  return '';
}

/** 组装一体化提交载荷：goods 主表 + spus 属性 + skus 明细 */
function buildPayload(values: Record<string, any>) {
  const goods: GoodsInfo = {
    ...values,
    shop_category_id: toCommaString(values.shop_category_id),
    payment_type: toCommaString(values.payment_type),
    after_sale: toCommaString(values.after_sale),
    images: JSON.stringify(parseImages(values.images)),
  };
  // 隐藏字段 id 不会出现在表单 values 中，编辑时从 record 回填
  if (isUpdate.value && record.value?.id) {
    goods.id = record.value.id;
  }
  const spus: GoodsSpuInfo[] = validGroups.value.map((g) => ({
    name: g.name.trim(),
    item: g.items.join(','),
  }));
  let skus: GoodsSkuInfo[];
  if (spus.length > 0) {
    skus = skuRows.value.map((row) => {
      const d = skuDataMap[row.difference] || {};
      return {
        difference: row.difference,
        thumbnail: d.thumbnail || '',
        market_price: d.market_price,
        price: d.price,
        stock: d.stock,
        weigh: d.weigh,
        sn: d.sn,
      };
    });
  } else {
    // 未填属性时按单规格商品生成默认 SKU（后端要求 spus/skus 非空）
    spus.push({ name: '规格', item: '默认' });
    skus = [
      {
        difference: '默认',
        market_price: goods.price,
        price: goods.price,
        stock: 0,
      },
    ];
  }
  return { goods, spus, skus };
}

function validateSkus(): string {
  if (validGroups.value.length === 0) return '';
  for (const row of skuRows.value) {
    const d = skuDataMap[row.difference] || {};
    if (d.price === undefined || d.price === null) {
      return `请填写规格「${row.difference}」的现价`;
    }
    if (d.stock === undefined || d.stock === null) {
      return `请填写规格「${row.difference}」的库存`;
    }
  }
  return '';
}

/** 编辑时拉取详情，回显各页签表单 + 属性组 + SKU 明细 */
async function loadDetail(id: number) {
  const result = await getGoodsDetail(id);
  if (result.code !== 0 || !result.data) return;
  const { goods, spus = [], skus = [] } = result.data;
  await basicFormApi.setValues({
    ...goods,
    shop_category_id: splitList(goods?.shop_category_id),
  });
  await mediaFormApi.setValues({
    image: goods?.image,
    images: parseImages(goods?.images),
    description: goods?.description,
    content: goods?.content,
  });
  await payFormApi.setValues({
    stock: goods?.stock,
    payment_type: splitList(goods?.payment_type),
  });
  await freightFormApi.setValues({ freight_id: goods?.freight_id });
  await afterFormApi.setValues({
    after_sale: splitList(goods?.after_sale),
    after_sale_content: goods?.after_sale_content,
    grounding: goods?.grounding,
    status: goods?.status,
  });
  specGroups.value = spus.map((s) => ({
    name: s.name || '',
    items: (s.item || '').split(',').filter((i) => !!i),
    newItem: '',
  }));
  for (const key of Object.keys(skuDataMap)) delete skuDataMap[key];
  for (const sku of skus) {
    if (!sku.difference) continue;
    skuDataMap[sku.difference] = {
      thumbnail: sku.thumbnail || '',
      market_price: sku.market_price,
      price: sku.price,
      stock: sku.stock,
      weigh: sku.weigh,
      sn: sku.sn,
    };
  }
}

/** 打开弹窗时初始化：先重置各分段表单，再回显或带入行数据 */
async function initForms() {
  for (const seg of formSegments) {
    // formApi 无 resetValues，正确方法为 resetForm
    await seg.api.resetForm();
  }
  if (isUpdate.value && record.value?.id) {
    await loadDetail(record.value.id);
  } else if (record.value && Object.keys(record.value).length > 0) {
    await basicFormApi.setValues(record.value);
  }
}

const [Modal, modalApi] = useVbenModal({
  fullscreenButton: true,
  fullscreen: true,
  onCancel() {
    modalApi.close();
  },
  onConfirm: async () => {
    // 逐页签校验，失败时切换到对应页签
    for (const seg of formSegments) {
      const validationResult = await seg.api.validate();
      if (!validationResult.valid) {
        activeTab.value = seg.key;
        return;
      }
    }
    const skuError = validateSkus();
    if (skuError) {
      activeTab.value = 'sale';
      message.warning(skuError);
      return;
    }
    const valuesList = await Promise.all(
      formSegments.map((seg) => seg.api.getValues()),
    );
    const merged = Object.assign({}, ...valuesList);
    const payload = buildPayload(merged);
    modalApi.setState({ confirmLoading: true });
    try {
      const result = isUpdate.value
        ? await updateGoods(payload as GoodsUpdateFullReq)
        : await createGoods(payload as GoodsCreateFullReq);
      if (result.code === 0) {
        message.success($t('common.successful'));
        gridApi.value?.reload();
        modalApi.close();
      }
    } finally {
      modalApi.setState({ confirmLoading: false });
    }
  },
  onOpenChange(isOpen: boolean) {
    isUpdate.value = modalApi.getData()?.isUpdate;
    record.value = isOpen ? modalApi.getData()?.record || {} : {};
    gridApi.value = isOpen ? modalApi.getData()?.gridApi : null;
    if (isOpen) {
      activeTab.value = 'basic';
      // 重置规格编辑器
      specGroups.value = [];
      for (const key of Object.keys(skuDataMap)) delete skuDataMap[key];
      Object.assign(batch, {
        market_price: undefined,
        price: undefined,
        stock: undefined,
        weigh: undefined,
        sn: undefined,
      });
      initForms();
    }
    modalApi.setState({
      title: isUpdate.value ? '编辑商品' : '新增商品',
    });
  },
});

defineExpose(modalApi);
</script>
<template>
  <Modal>
    <Tabs v-model:active-key="activeTab" class="goods-tabs" size="large">
      <TabPane key="basic" force-render tab="基础信息">
        <div class="pane-body">
          <BasicForm />
        </div>
      </TabPane>

      <TabPane key="sale" force-render tab="销售信息">
        <div class="pane-body pane-body--wide">
          <div class="section-title">规格属性</div>
          <div
            v-for="(group, gi) in specGroups"
            :key="gi"
            class="spec-group"
          >
            <div class="spec-group__header">
              <Input
                v-model:value="group.name"
                class="spec-group__name"
                placeholder="属性名，如：颜色"
              />
              <Button danger ghost size="small" @click="removeGroup(gi)">
                删除属性
              </Button>
            </div>
            <div class="spec-group__items">
              <Tag
                v-for="(item, ii) in group.items"
                :key="ii"
                class="spec-tag"
                closable
                color="processing"
                @close="removeItem(gi, ii)"
              >
                {{ item }}
              </Tag>
              <Space.Compact size="small">
                <Input
                  v-model:value="group.newItem"
                  placeholder="属性值，回车添加"
                  style="width: 150px"
                  @press-enter="addItem(gi)"
                />
                <Button type="primary" ghost @click="addItem(gi)">+</Button>
              </Space.Compact>
            </div>
          </div>
          <Button class="add-group-btn" type="dashed" @click="addGroup">
            + 新增属性
          </Button>

          <template v-if="skuRows.length > 0">
            <div class="section-title">规格明细</div>
            <div class="batch-bar">
              <span class="batch-bar__label">批量填充</span>
              <InputNumber
                v-model:value="batch.market_price"
                :min="0"
                :precision="2"
                placeholder="原价"
                size="small"
                style="width: 100px"
              />
              <InputNumber
                v-model:value="batch.price"
                :min="0"
                :precision="2"
                placeholder="现价"
                size="small"
                style="width: 100px"
              />
              <InputNumber
                v-model:value="batch.stock"
                :min="0"
                :precision="0"
                placeholder="库存"
                size="small"
                style="width: 100px"
              />
              <Input
                v-model:value="batch.weigh"
                placeholder="重量"
                size="small"
                style="width: 100px"
              />
              <Input
                v-model:value="batch.sn"
                placeholder="编码"
                size="small"
                style="width: 100px"
              />
              <Button size="small" type="primary" @click="applyBatch">
                应用到全部
              </Button>
            </div>
            <div class="sku-table-wrap">
              <table class="sku-table">
                <thead>
                  <tr>
                    <th v-for="g in validGroups" :key="g.name">
                      {{ g.name }}
                    </th>
                    <th>规格图</th>
                    <th>原价</th>
                    <th><span class="required">*</span> 现价</th>
                    <th><span class="required">*</span> 库存</th>
                    <th>重量</th>
                    <th>编码</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="row in skuRows" :key="row.difference">
                    <td
                      v-for="(spec, si) in row.difference.split(',')"
                      :key="si"
                    >
                      {{ spec }}
                    </td>
                    <td>
                      <ImageUpload
                        v-model:value="skuDataMap[row.difference]!.thumbnail"
                        :max-number="1"
                        :max-size="5"
                        provider="local"
                      />
                    </td>
                    <td>
                      <InputNumber
                        v-model:value="
                          skuDataMap[row.difference]!.market_price
                        "
                        :min="0"
                        :precision="2"
                        style="width: 100px"
                      />
                    </td>
                    <td>
                      <InputNumber
                        v-model:value="skuDataMap[row.difference]!.price"
                        :min="0"
                        :precision="2"
                        style="width: 100px"
                      />
                    </td>
                    <td>
                      <InputNumber
                        v-model:value="skuDataMap[row.difference]!.stock"
                        :min="0"
                        :precision="0"
                        style="width: 100px"
                      />
                    </td>
                    <td>
                      <Input
                        v-model:value="skuDataMap[row.difference]!.weigh"
                        style="width: 90px"
                      />
                    </td>
                    <td>
                      <Input
                        v-model:value="skuDataMap[row.difference]!.sn"
                        style="width: 110px"
                      />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </template>
          <div v-else class="sale-tip">
            未添加属性时按单规格商品保存；添加属性后自动生成规格组合明细
          </div>
        </div>
      </TabPane>

      <TabPane key="media" force-render tab="图文描述">
        <div class="pane-body">
          <MediaForm />
        </div>
      </TabPane>

      <TabPane key="pay" force-render tab="支付信息">
        <div class="pane-body">
          <PayForm />
        </div>
      </TabPane>

      <TabPane key="freight" force-render tab="物流信息">
        <div class="pane-body">
          <FreightForm />
        </div>
      </TabPane>

      <TabPane key="after" force-render tab="售后信息">
        <div class="pane-body">
          <AfterForm />
        </div>
      </TabPane>
    </Tabs>
  </Modal>
</template>
<style scoped>
.goods-tabs {
  padding: 0 8px;
}

.pane-body {
  max-width: 720px;
  margin: 0 auto;
  padding: 20px 24px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--card));
  color: hsl(var(--card-foreground));
  box-shadow: 0 1px 4px rgb(0 0 0 / 4%);
}

.pane-body--wide {
  max-width: 1080px;
}

.section-title {
  position: relative;
  margin-bottom: 14px;
  padding-left: 10px;
  font-weight: 600;
  font-size: 15px;
}

.section-title::before {
  content: '';
  position: absolute;
  left: 0;
  top: 3px;
  bottom: 3px;
  width: 3px;
  border-radius: 2px;
  background: hsl(var(--primary));
}

.spec-group {
  margin-bottom: 12px;
  padding: 12px 14px;
  border: 1px solid hsl(var(--border));
  border-radius: 8px;
  background: hsl(var(--muted));
}

.spec-group__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 10px;
}

.spec-group__name {
  max-width: 220px;
}

.spec-group__items {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
}

.spec-tag {
  margin: 0;
}

.add-group-btn {
  margin-bottom: 20px;
}

.batch-bar {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-bottom: 12px;
  padding: 10px 12px;
  border-radius: 8px;
  background: hsl(var(--muted));
}

.batch-bar__label {
  font-weight: 500;
  color: hsl(var(--muted-foreground));
}

.sku-table-wrap {
  overflow-x: auto;
}

.sku-table {
  width: 100%;
  border-collapse: collapse;
}

.sku-table td,
.sku-table th {
  padding: 8px;
  border: 1px solid hsl(var(--border));
  text-align: left;
  white-space: nowrap;
}

.sku-table th {
  background: hsl(var(--muted));
  font-weight: 500;
}

.required {
  color: #f5222d;
}

.sale-tip {
  padding: 16px 0;
  color: hsl(var(--muted-foreground));
}
</style>
