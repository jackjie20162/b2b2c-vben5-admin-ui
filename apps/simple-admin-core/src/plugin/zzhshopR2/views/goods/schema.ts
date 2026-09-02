import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h, reactive } from 'vue';

import { Switch, Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';

import { getCategoryList } from '../../api/category';
import { getFreightList } from '../../api/freight';
import { updateGoods } from '../../api/goods';
import { getShopList } from '../../api/shop';

/** unix 秒时间戳格式化 */
function formatUnixTime({ cellValue }: { cellValue: any }) {
  return cellValue
    ? new Date(Number(cellValue) * 1000).toLocaleString()
    : '';
}

/** 解析商品相册 JSON 字符串为图片数组 */
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

/** 分类 id → 名称映射，由列表页加载分类后填充 */
export const categoryNameMap = reactive<Record<number, string>>({});

export const tableColumns: VxeGridProps = {
  columns: [
    {
      type: 'checkbox',
      width: 60,
    },
    {
      title: 'ID',
      field: 'id',
      width: 70,
    },
    {
      title: '商品分类',
      field: 'category_id',
      width: 110,
      slots: {
        default: ({ row }) =>
          h('span', categoryNameMap[row.category_id] || '-'),
      },
    },
    {
      title: '宝贝标题',
      field: 'title',
      minWidth: 240,
    },
    {
      title: '宝贝主图',
      field: 'image',
      width: 80,
      slots: {
        default: ({ row }) =>
          row.image
            ? h('img', {
                src: row.image,
                style: {
                  height: '48px',
                  width: '48px',
                  objectFit: 'cover',
                  borderRadius: '4px',
                },
              })
            : h('span'),
      },
    },
    {
      title: '宝贝相册',
      field: 'images',
      width: 180,
      slots: {
        default: ({ row }) =>
          h(
            'div',
            { style: { display: 'flex', gap: '4px', flexWrap: 'wrap' } },
            parseImages(row.images)
              .slice(0, 4)
              .map((src) =>
                h('img', {
                  src,
                  style: {
                    height: '32px',
                    width: '32px',
                    objectFit: 'cover',
                    borderRadius: '3px',
                  },
                }),
              ),
          ),
      },
    },
    {
      title: '店铺内分类',
      field: 'shop_category_id',
      width: 130,
      slots: {
        default: ({ row }) => {
          const names = String(row.shop_category_id || '')
            .split(',')
            .filter(Boolean)
            .map((id) => categoryNameMap[Number(id)])
            .filter(Boolean);
          return h('span', names.length > 0 ? names.join('，') : '-');
        },
      },
    },
    {
      title: '产品价格',
      field: 'price',
      width: 100,
      slots: {
        default: ({ row }) =>
          h(
            Tag,
            { color: 'red' },
            { default: () => `￥${Number(row.price ?? 0).toFixed(2)}` },
          ),
      },
    },
    {
      title: '点击',
      field: 'views',
      width: 80,
    },
    {
      title: '销量',
      field: 'sales',
      width: 80,
    },
    {
      title: '评论',
      field: 'comment',
      width: 80,
    },
    {
      title: '好评',
      field: 'praise',
      width: 80,
    },
    {
      title: '收藏',
      field: 'like',
      width: 80,
    },
    {
      title: '上架状态',
      field: 'grounding',
      width: 100,
      slots: {
        default: (e) =>
          h(Switch, {
            checked: e.row.grounding === 1,
            onClick: () => {
              const newValue = e.row.grounding === 1 ? 0 : 1;
              updateGoods({
                goods: { id: e.row.id, grounding: newValue },
              }).then(() => {
                e.row.grounding = newValue;
              });
            },
          }),
      },
    },
    {
      title: '创建时间',
      field: 'createtime',
      width: 170,
      formatter: formatUnixTime,
    },
    {
      title: '更新时间',
      field: 'updatetime',
      width: 170,
      formatter: formatUnixTime,
    },
  ],
};

export const searchFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'title',
      label: '商品标题',
      component: 'Input',
    },
    {
      fieldName: 'category_id',
      label: '商品分类',
      component: 'ApiSelect',
      componentProps: {
        api: () => getCategoryList({ page: 1, page_size: 1000 }),
        resultField: 'data.data',
        labelField: 'name',
        valueField: 'id',
      },
    },
  ],
};

/** 支付方式选项（payment_type，逗号分隔入库） */
export const PAYMENT_TYPE_OPTIONS = [
  { label: '余额支付', value: 'balance' },
  { label: '微信支付', value: 'wechat' },
  { label: '支付宝', value: 'alipay' },
  { label: '银联支付', value: 'union' },
];

/** 售后服务选项（after_sale，逗号分隔入库） */
export const AFTER_SALE_OPTIONS = [
  { label: '七天无理由退换', value: '7day_return' },
  { label: '坏单包赔', value: 'broken' },
  { label: '正品保障', value: 'genuine' },
  { label: '品质保障', value: 'quality' },
  { label: '售后服务', value: 'after_sale' },
];

// ===== 编辑表单：按页签拆分 =====

/** 基础信息 */
export const basicFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'id',
      label: 'ID',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['id'],
      },
    },
    {
      fieldName: 'title',
      label: '商品标题',
      component: 'Input',
      rules: z.string().min(1).max(200),
    },
    {
      fieldName: 'shop_id',
      label: '所属店铺',
      component: 'ApiSelect',
      componentProps: {
        api: () => getShopList({ page: 1, page_size: 1000 }),
        resultField: 'data.data',
        labelField: 'shopname',
        valueField: 'id',
      },
    },
    {
      fieldName: 'category_id',
      label: '商品类目',
      component: 'ApiSelect',
      componentProps: {
        api: () => getCategoryList({ page: 1, page_size: 1000 }),
        resultField: 'data.data',
        labelField: 'name',
        valueField: 'id',
      },
    },
    {
      fieldName: 'shop_category_id',
      label: '店铺内分类',
      component: 'ApiSelect',
      help: '可多选，入库为逗号分隔字符串',
      componentProps: {
        api: () => getCategoryList({ page: 1, page_size: 1000 }),
        resultField: 'data.data',
        labelField: 'name',
        valueField: 'id',
        mode: 'multiple',
      },
    },
    {
      fieldName: 'price',
      label: '商品价格',
      component: 'InputNumber',
      help: '填写规格明细后以 SKU 最低价为准',
      componentProps: {
        min: 0,
        precision: 2,
        style: { width: '100%' },
      },
      rules: 'required',
    },
    {
      fieldName: 'weigh',
      label: '排序权重',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        style: { width: '100%' },
      },
    },
  ],
};

/** 图文描述 */
export const mediaFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'image',
      label: '商品主图',
      component: 'ImageUpload',
      componentProps: {
        maxNumber: 1,
        maxSize: 5,
        provider: 'local',
      },
    },
    {
      fieldName: 'images',
      label: '商品相册',
      component: 'ImageUpload',
      help: '支持上传多张商品图片，保存为 JSON 数组',
      componentProps: {
        maxNumber: 9,
        maxSize: 5,
        multiple: true,
        provider: 'local',
      },
    },
    {
      fieldName: 'description',
      label: '商品描述',
      component: 'Textarea',
      componentProps: {
        rows: 2,
      },
    },
    {
      fieldName: 'content',
      label: '商品详情',
      component: 'Editor',
      componentProps: {
        uploadProvider: 'local',
      },
    },
  ],
};

/** 支付信息 */
export const payFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'stock',
      label: '库存计算方式',
      component: 'RadioButtonGroup',
      defaultValue: 'payment',
      componentProps: {
        options: [
          { label: '下单减库存', value: 'payment' },
          { label: '付款减库存', value: 'porder' },
        ],
      },
    },
    {
      fieldName: 'payment_type',
      label: '支付方式',
      component: 'CheckboxGroup',
      help: '不勾选则默认支持全部支付方式',
      componentProps: {
        options: PAYMENT_TYPE_OPTIONS,
      },
    },
  ],
};

/** 物流信息 */
export const freightFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'freight_id',
      label: '运费模板',
      component: 'ApiSelect',
      help: '包邮模板运费为 0；自定义模板按件数/重量/体积计价',
      componentProps: {
        api: () => getFreightList({ page: 1, page_size: 1000 }),
        resultField: 'data.data',
        labelField: 'name',
        valueField: 'id',
      },
    },
  ],
};

/** 售后信息 */
export const afterFormSchemas: VbenFormProps = {
  schema: [
    {
      fieldName: 'after_sale',
      label: '售后服务',
      component: 'CheckboxGroup',
      componentProps: {
        options: AFTER_SALE_OPTIONS,
      },
    },
    {
      fieldName: 'after_sale_content',
      label: '售后说明',
      component: 'Textarea',
      componentProps: {
        rows: 3,
      },
    },
    {
      fieldName: 'grounding',
      label: '上架状态',
      component: 'RadioButtonGroup',
      defaultValue: 1,
      componentProps: {
        options: [
          { label: '出售中宝贝', value: 1 },
          { label: '仓库中宝贝', value: 0 },
        ],
      },
    },
    {
      fieldName: 'status',
      label: '显示状态',
      component: 'RadioButtonGroup',
      defaultValue: 'normal',
      componentProps: {
        options: [
          { label: '正常', value: 'normal' },
          { label: '隐藏', value: 'hidden' },
        ],
      },
    },
  ],
};
