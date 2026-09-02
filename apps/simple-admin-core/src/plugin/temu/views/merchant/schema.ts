import type { VbenFormProps } from '@vben/common-ui';

import type { VxeGridProps } from '#/adapter/vxe-table';

import { h } from 'vue';

import { Tag } from 'ant-design-vue';

import { z } from '#/adapter/form';

import type { TemuMerchantInfo } from '../../api/model/temuModel';

function formatTime(value?: number) {
  if (!value) {
    return '-';
  }
  const d = new Date(Number(value) * 1000);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

export const temuMerchantStatusMap: Record<string, string> = {
  enabled: 'enabled',
  disabled: 'disabled',
};

export const tableColumns: VxeGridProps<TemuMerchantInfo> = {
  columns: [
    { type: 'checkbox', width: 60 },
    { title: 'ID', field: 'id', width: 80 },
    { title: 'Name', field: 'name', minWidth: 180 },
    { title: 'API Key', field: 'api_key', minWidth: 240 },
    {
      title: 'Expire At',
      field: 'key_expire_at',
      width: 170,
      slots: {
        default: ({ row }) => formatTime(row.key_expire_at),
      },
    },
    { title: 'Upstream URL', field: 'upstream_base_url', minWidth: 220 },
    { title: 'Max Concurrent', field: 'default_max_concurrent', width: 100 },
    { title: 'QPS', field: 'default_rate_limit_per_sec', width: 100 },
    { title: 'Burst', field: 'default_burst', width: 90 },
    {
      title: 'Status',
      field: 'status',
      width: 90,
      slots: {
        default: ({ row }) =>
          h(
            Tag,
            { color: row.status === 'enabled' ? 'green' : 'red' },
            {
              default: () =>
                temuMerchantStatusMap[row.status ?? ''] ?? row.status ?? '-',
            },
          ),
      },
    },
  ],
};

export const searchFormSchemas: VbenFormProps = {
  schema: [
    { fieldName: 'name', label: 'Name', component: 'Input' },
    { fieldName: 'api_key', label: 'API Key', component: 'Input' },
    {
      fieldName: 'status',
      label: 'Status',
      component: 'Select',
      componentProps: {
        options: Object.entries(temuMerchantStatusMap).map(([value, label]) => ({
          label,
          value,
        })),
      },
    },
  ],
};

export const dataFormSchemas: VbenFormProps = {
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
      fieldName: 'name',
      label: 'Name',
      component: 'Input',
      rules: z.string().min(1).max(100),
    },
    {
      fieldName: 'api_key',
      label: 'API Key',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['api_key'],
      },
    },
    {
      fieldName: 'api_secret',
      label: 'Secret',
      component: 'Input',
      dependencies: {
        show: false,
        triggerFields: ['api_secret'],
      },
    },
    {
      fieldName: 'key_expire_at',
      label: 'Expire At',
      component: 'DatePicker',
      componentProps: {
        showTime: true,
        format: 'YYYY-MM-DD HH:mm:ss',
        valueFormat: 'x',
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'upstream_base_url',
      label: 'Upstream URL',
      component: 'Input',
      rules: z.string().min(1).max(255),
    },
    {
      fieldName: 'default_max_concurrent',
      label: 'Max Concurrent',
      component: 'InputNumber',
      defaultValue: 10,
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'default_rate_limit_per_sec',
      label: 'QPS',
      component: 'InputNumber',
      defaultValue: 0,
      componentProps: {
        min: 0,
        step: 0.1,
        precision: 2,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'default_burst',
      label: 'Burst',
      component: 'InputNumber',
      defaultValue: 10,
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'default_breaker_threshold',
      label: 'Breaker Threshold',
      component: 'InputNumber',
      defaultValue: 5,
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'default_breaker_cooldown_sec',
      label: 'Breaker Cooldown',
      component: 'InputNumber',
      defaultValue: 30,
      componentProps: {
        min: 1,
        style: { width: '100%' },
      },
    },
    {
      fieldName: 'status',
      label: 'Status',
      component: 'RadioButtonGroup',
      defaultValue: 'enabled',
      componentProps: {
        options: [
          { label: 'enabled', value: 'enabled' },
          { label: 'disabled', value: 'disabled' },
        ],
      },
    },
  ],
};
