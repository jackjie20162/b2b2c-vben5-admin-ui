<script lang="ts" setup>
import type { PageInfo } from '../../../api/model/zzhshopR2Model';
import type { DiyComponentDef } from './diyComponents';

import { computed, onMounted, ref } from 'vue';

import { IconifyIcon } from '@vben/icons';
import { $t } from '@vben/locales';

import {
  Button,
  Input,
  message,
  Select,
  Spin,
  Switch,
  TabPane,
  Tabs,
} from 'ant-design-vue';

import { getPageDetail, updatePage } from '../../../api/diy';
import {
  cloneComponentDef,
  dataKeyLabelMap,
  defaultPageConfig,
  diyGroups,
  moduleStyleCatalog,
  paramsKeyLabelMap,
} from './diyComponents';

defineOptions({
  name: 'ZzhshopR2PageEditor',
});

const props = defineProps<{ record: PageInfo }>();
const emit = defineEmits<{ close: []; saved: [] }>();

const loading = ref(false);
const saving = ref(false);
const device = ref('iPhoneX');
const signal = ref('WIFI');
const pageName = ref('');
const pageCover = ref('');
const pageConf = ref<any>(defaultPageConfig());
const items = ref<any[]>([]);
const selected = ref<'page' | number>('page');
const rightTab = ref('data');
const newStyleKey = ref<string>();

const comp = computed(() =>
  typeof selected.value === 'number' ? items.value[selected.value] : null,
);

const styleAddOptions = computed(() =>
  Object.entries(moduleStyleCatalog)
    .filter(([key]) => !comp.value || !(key in (comp.value.style ?? {})))
    .map(([value, label]) => ({ label, value })),
);

const nowTime = computed(() => {
  const d = new Date();
  return `${d.getHours()}:${String(d.getMinutes()).padStart(2, '0')}`;
});

const deviceWidthMap: Record<string, string> = {
  huaweiMate30: '360px',
  iPhoneX: '375px',
  iPhoneXmax: '414px',
  iPhone7: '375px',
  iPhone7plus: '414px',
  OPPORenoAce: '360px',
  vivoNEX3: '360px',
  xiaomi9Pro: '360px',
};

const phoneWidth = computed(() => deviceWidthMap[device.value] ?? '375px');

const hasBangs = computed(() =>
  ['huaweiMate30', 'iPhoneX', 'iPhoneXmax', 'OPPORenoAce', 'vivoNEX3', 'xiaomi9Pro'].includes(device.value),
);

function dataLabel(key: string) {
  return dataKeyLabelMap[key] ?? key;
}

function paramsLabel(key: string) {
  return paramsKeyLabelMap[key] ?? key;
}

function isHintKey(key: string) {
  return key === 'tips' || key === 'title';
}

function isImageKey(key: string) {
  return key === 'image' || key === 'iconImage';
}

function isColorValue(value: any) {
  return typeof value === 'string' && value.startsWith('#');
}

async function load() {
  loading.value = true;
  try {
    const res = await getPageDetail(props.record.id as number);
    if (res.code !== 0) return;
    const detail = res.data;
    pageName.value = detail?.name ?? '';
    pageCover.value = detail?.cover ?? '';
    const def = defaultPageConfig();
    let conf: any = null;
    try {
      conf = detail?.page ? JSON.parse(detail.page) : null;
    } catch {
      conf = null;
    }
    pageConf.value = {
      params: { ...def.params, ...(conf?.params ?? {}) },
      style: { ...def.style, ...(conf?.style ?? {}) },
    };
    let arr: any[] = [];
    try {
      arr = detail?.item ? JSON.parse(detail.item) : [];
    } catch {
      arr = [];
    }
    items.value = Array.isArray(arr) ? arr : [];
  } finally {
    loading.value = false;
  }
}

function addComponent(def: DiyComponentDef) {
  items.value.push(cloneComponentDef(def));
  selected.value = items.value.length - 1;
  rightTab.value = 'data';
}

function delModule(index: number) {
  items.value.splice(index, 1);
  selected.value = 'page';
}

function moveUp(index: number) {
  if (index <= 0) return;
  const arr = items.value;
  [arr[index - 1], arr[index]] = [arr[index] as any, arr[index - 1] as any];
  selected.value = index - 1;
}

function moveDown(index: number) {
  const arr = items.value;
  if (index >= arr.length - 1) return;
  [arr[index + 1], arr[index]] = [arr[index] as any, arr[index + 1] as any];
  selected.value = index + 1;
}

function addData() {
  if (!comp.value || comp.value.data.length === 0) return;
  comp.value.data.push(structuredClone(comp.value.data[0]));
}

function delData(index: number) {
  if (!comp.value || comp.value.data.length <= 1) return;
  comp.value.data.splice(index, 1);
}

function addStyleKey() {
  if (!comp.value || !newStyleKey.value) return;
  comp.value.style = comp.value.style ?? {};
  comp.value.style[newStyleKey.value] = '';
  newStyleKey.value = undefined;
}

function delStyleKey(key: string) {
  if (!comp.value) return;
  delete comp.value.style[key];
}

async function save() {
  saving.value = true;
  try {
    const result = await updatePage({
      id: props.record.id,
      name: pageName.value,
      cover: pageCover.value,
      page: JSON.stringify(pageConf.value),
      item: JSON.stringify(items.value),
    });
    if (result.code === 0) {
      message.success($t('common.successful'));
      emit('saved');
    }
  } finally {
    saving.value = false;
  }
}

onMounted(() => {
  load();
});
</script>

<template>
  <div class="diy-editor">
    <!-- 顶部工具栏 -->
    <div class="diy-topbar">
      <div class="topbar-left">
        <Select v-model:value="device" size="small" class="device-select">
          <Select.Option value="huaweiMate30">华为Mate30</Select.Option>
          <Select.Option value="iPhoneX">iPhoneX</Select.Option>
          <Select.Option value="iPhoneXmax">iPhoneXmax</Select.Option>
          <Select.Option value="iPhone7">iPhone7</Select.Option>
          <Select.Option value="iPhone7plus">iPhone7plus</Select.Option>
          <Select.Option value="OPPORenoAce">OPPORenoAce</Select.Option>
          <Select.Option value="vivoNEX3">vivoNEX3</Select.Option>
          <Select.Option value="xiaomi9Pro">xiaomi9Pro</Select.Option>
        </Select>
        <Select v-model:value="signal" size="small" class="signal-select">
          <Select.Option value="WIFI">WIFI</Select.Option>
          <Select.Option value="3G">3G</Select.Option>
          <Select.Option value="4G">4G</Select.Option>
          <Select.Option value="5G">5G</Select.Option>
        </Select>
      </div>
      <div class="topbar-right">
        <Button :loading="saving" size="small" type="primary" @click="save">
          保存页面
        </Button>
        <Button size="small" @click="emit('close')">关闭</Button>
      </div>
    </div>

    <div class="diy-body">
      <!-- 手机预览 -->
      <div class="diy-canvas">
        <Spin :spinning="loading">
          <div class="phone-frame" :style="{ width: phoneWidth }">
            <div
              class="phone-page"
              :style="{
                backgroundColor: pageConf.style.pageBackgroundColor,
                backgroundImage: pageConf.style.pageBackgroundImage
                  ? `url(${pageConf.style.pageBackgroundImage})`
                  : undefined,
                backgroundRepeat: pageConf.style.pageBackgroundRepeat,
              }"
            >
              <!-- 状态栏 + 导航 -->
              <div
                class="phone-nav"
                :class="{ active: selected === 'page' }"
                :style="{
                  backgroundColor: pageConf.style.navigationBarBackgroundColor,
                  color: pageConf.style.navigationBarTextStyle,
                }"
                @click="selected = 'page'"
              >
                <div class="status-bar">
                  <span class="time">{{ nowTime }}</span>
                  <span v-if="hasBangs" class="bangs"></span>
                  <span v-else></span>
                  <span class="device-info">
                    <IconifyIcon
                      v-if="signal === 'WIFI'"
                      icon="ant-design:wifi-outlined"
                    />
                    <span v-else class="signal-text">{{ signal }}</span>
                    <IconifyIcon icon="ant-design:thunderbolt-filled" />
                  </span>
                </div>
                <div class="nav-bar">
                  <span class="nav-icon">‹</span>
                  <span class="nav-title">
                    {{ pageConf.params.navigationBarTitleText }}
                  </span>
                  <span class="nav-icon">⤴</span>
                </div>
              </div>

              <!-- 组件堆栈 -->
              <div
                v-for="(item, index) in items"
                :key="index"
                class="phone-mod"
                :class="{ active: selected === index }"
                :style="item.style"
                @click="selected = index"
              >
                <!-- 轮播组件 -->
                <div v-if="item.type === 'banner'" class="mod-banner">
                  <img
                    v-if="item.data[0]?.image"
                    :src="item.data[0].image"
                    :style="{ height: item.params?.height }"
                  />
                  <div v-else class="mod-placeholder" :style="{ height: item.params?.height }">
                    轮播图 {{ item.data.length }} 张
                  </div>
                  <div class="indicator">
                    <span
                      v-for="(_, i) in item.data"
                      :key="i"
                      :class="{ on: i === 0 }"
                    ></span>
                  </div>
                </div>
                <!-- 广告轮播 -->
                <div v-else-if="item.type === 'advertBanner'" class="mod-placeholder" :style="{ height: item.params?.height }">
                  广告轮播（自动获取）
                </div>
                <!-- 图片橱窗 -->
                <div v-else-if="item.type === 'image'" class="mod-image">
                  <div v-for="(img, i) in item.data" :key="i" class="image-item">
                    <img v-if="img.image" :src="img.image" />
                    <div v-else class="mod-placeholder">图片 {{ i + 1 }}</div>
                  </div>
                </div>
                <!-- 广告单图 -->
                <div v-else-if="item.type === 'advertImage'" class="mod-placeholder" :style="{ height: item.style?.height }">
                  广告图（自动获取）
                </div>
                <!-- 视频 -->
                <div v-else-if="item.type === 'video'" class="mod-video">
                  <img v-if="item.data[0]?.image" :src="item.data[0].image" />
                  <div v-else class="mod-placeholder">视频封面</div>
                  <div class="play">▶</div>
                </div>
                <!-- 菜单 -->
                <div v-else-if="item.type === 'menu'" class="mod-menu">
                  <div v-for="(me, i) in item.data" :key="i" class="menu-item">
                    <div class="menu-icon">
                      <img v-if="item.params?.menuType === 'image' && me.iconImage" :src="me.iconImage" />
                      <IconifyIcon v-else icon="ant-design:appstore-outlined" />
                    </div>
                    <div class="menu-text" :style="{ fontSize: item.params?.menuTextSize }">
                      {{ me.text }}
                    </div>
                  </div>
                </div>
                <!-- 公告栏 -->
                <div v-else-if="item.type === 'notice'" class="mod-notice">
                  <IconifyIcon v-if="item.params?.show" icon="ant-design:sound-outlined" />
                  <span>{{ item.data[0]?.content }}</span>
                </div>
                <!-- 文章 -->
                <div v-else-if="item.type === 'article'" class="mod-article">
                  <div v-for="(ar, i) in item.data" :key="i" class="article-item">
                    <div class="article-image">
                      <img v-if="ar.image" :src="ar.image" />
                      <div v-else class="mod-placeholder">图</div>
                    </div>
                    <div class="article-content">
                      <div class="article-title">
                        {{ ar.articleTitle || '请选择文章' }}
                      </div>
                      <div class="article-operate">
                        <span v-if="item.params?.showTime">2020年5月30日</span>
                        <span v-if="item.params?.showView">浏览：100</span>
                      </div>
                    </div>
                  </div>
                </div>
                <!-- 头条 -->
                <div v-else-if="item.type === 'headlines'" class="mod-headlines">
                  <IconifyIcon icon="ant-design:read-outlined" />
                  <div class="headlines-list">
                    <div class="headlines-text">热门 · 客户端自动获取头条数据</div>
                    <div class="headlines-pic">
                      <img v-if="item.data[0]?.image" :src="item.data[0].image" />
                    </div>
                  </div>
                </div>
                <!-- 搜索栏 -->
                <div v-else-if="item.type === 'search'" class="mod-search">
                  <div
                    :style="{
                      borderRadius: item.params?.searchRadius,
                      background: item.params?.searchBackground,
                      padding: item.params?.searchPadding,
                    }"
                  >
                    <IconifyIcon icon="ant-design:search-outlined" />
                    <span>{{ item.data[0]?.content }}</span>
                  </div>
                </div>
                <!-- 活动/分类橱窗 -->
                <div
                  v-else-if="item.type === 'activity' || item.type === 'classify'"
                  class="mod-category"
                >
                  <div v-for="(cat, i) in item.data" :key="i" class="category-item">
                    <div class="category-name">
                      {{ item.type === 'activity' ? cat.activity : `分类#${cat.categoryId}` }}
                      <em v-if="cat.tags">{{ cat.tags }}</em>
                    </div>
                    <div v-if="cat.describe" class="category-describe">
                      {{ cat.describe }}
                    </div>
                    <div class="category-goods">
                      <span></span><span></span>
                    </div>
                  </div>
                </div>
                <!-- 类目标题 -->
                <div v-else-if="item.type === 'categoryTitle'" class="mod-category-title">
                  <span>{{ item.data[0]?.categoryName }} ···</span>
                  <span class="more">更多 ›</span>
                </div>
                <!-- 猜你喜欢 / 商品 -->
                <div
                  v-else-if="item.type === 'likes' || item.type === 'goods'"
                  class="mod-product"
                >
                  <div v-for="n in 4" :key="n" class="product-item">
                    <div class="product-pic"></div>
                    <div class="product-info">
                      <div class="product-title">
                        {{ item.type === 'likes' ? '猜你喜欢自动获取' : `商品#${item.data[0]?.goodsLink ?? n}` }}
                      </div>
                      <div class="product-price">¥ 99.00</div>
                    </div>
                  </div>
                </div>
                <!-- 拼团 -->
                <div v-else-if="item.type === 'groups'" class="mod-groups">
                  <div class="groups-head">
                    <span :style="{ color: item.params?.titleColor, fontSize: item.params?.titleFontSize }">
                      {{ item.params?.titleText }}
                    </span>
                    <span :style="{ color: item.params?.infoColor, fontSize: item.params?.infoFontSize }">
                      {{ item.params?.infoText }}
                    </span>
                  </div>
                  <div class="groups-body">
                    <div v-for="n in 3" :key="n" class="groups-item">
                      <div class="groups-pic"></div>
                      <div class="groups-price">¥ 19.00</div>
                    </div>
                  </div>
                </div>
                <!-- 空白行 -->
                <div v-else-if="item.type === 'empty'" class="mod-empty"></div>
                <!-- 分隔符 -->
                <div v-else-if="item.type === 'division'" class="mod-division">
                  <div
                    class="line"
                    :style="{
                      width: item.params?.lineWidth,
                      height: item.params?.lineHeight,
                      background: item.params?.lineBackground,
                    }"
                  ></div>
                  <div
                    class="linetext"
                    :style="{
                      color: item.params?.lineTextColor,
                      fontSize: item.params?.lineTextSize,
                      background: item.params?.lineTextBackground,
                      padding: item.params?.lineTextPadding,
                    }"
                  >
                    {{ item.params?.lineText }}
                  </div>
                </div>
                <div v-else class="mod-placeholder">{{ item.name }}</div>

                <div class="mod-del" @click.stop="delModule(index)">×</div>
              </div>
              <div v-if="items.length === 0" class="phone-empty">
                点击右侧组件库添加模块
              </div>
            </div>
          </div>
        </Spin>
      </div>

      <!-- 组件库 -->
      <div class="diy-palette">
        <div class="palette-title"><i></i>自定义组件</div>
        <div v-for="group in diyGroups" :key="group.key" class="palette-group">
          <div class="group-name">{{ group.label }}</div>
          <div class="group-row">
            <div
              v-for="el in group.items"
              :key="el.type"
              class="palette-item"
              @click="addComponent(el)"
            >
              <IconifyIcon :icon="el.icon" />
              <span>{{ el.name }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧配置 -->
      <div class="diy-config">
        <!-- 页面配置 -->
        <template v-if="selected === 'page'">
          <div class="config-title">页面配置</div>
          <div class="config-form">
            <div class="form-item">
              <label>页面名称</label>
              <Input v-model:value="pageName" />
            </div>
            <div class="form-item">
              <label>页面封面</label>
              <Input v-model:value="pageCover" placeholder="封面图URL" />
            </div>
            <div class="form-item">
              <label>导航栏标题</label>
              <Input v-model:value="pageConf.params.navigationBarTitleText" />
            </div>
            <div class="form-item">
              <label>导航栏背景图</label>
              <Input v-model:value="pageConf.style.navigationBackgroundImage" placeholder="背景图URL" />
            </div>
            <div class="form-item">
              <label>导航栏背景</label>
              <div class="color-row">
                <input
                  v-model="pageConf.style.navigationBarBackgroundColor"
                  type="color"
                />
                <Input v-model:value="pageConf.style.navigationBarBackgroundColor" />
              </div>
            </div>
            <div class="form-item">
              <label>导航前景色</label>
              <Select v-model:value="pageConf.style.navigationBarTextStyle" class="w-full">
                <Select.Option value="#ffffff">浅色（白色）</Select.Option>
                <Select.Option value="#000000">深色（黑色）</Select.Option>
              </Select>
            </div>
            <div class="form-item">
              <label>页面背景图</label>
              <Input v-model:value="pageConf.style.pageBackgroundImage" placeholder="背景图URL" />
            </div>
            <div class="form-item">
              <label>页面背景</label>
              <div class="color-row">
                <input v-model="pageConf.style.pageBackgroundColor" type="color" />
                <Input v-model:value="pageConf.style.pageBackgroundColor" />
              </div>
            </div>
            <div class="form-item">
              <label>背景重复</label>
              <Select v-model:value="pageConf.style.pageBackgroundRepeat" class="w-full">
                <Select.Option value="repeat-x">水平方向重复</Select.Option>
                <Select.Option value="repeat-y">垂直方向重复</Select.Option>
                <Select.Option value="no-repeat">不重复</Select.Option>
              </Select>
            </div>
          </div>
        </template>

        <!-- 组件配置 -->
        <template v-else-if="comp">
          <div class="config-toolbar">
            <span class="config-name">{{ comp.name }} #{{ (selected as number) + 1 }}</span>
            <span class="config-ops">
              <Button size="small" type="link" @click="moveUp(selected as number)">上移</Button>
              <Button size="small" type="link" @click="moveDown(selected as number)">下移</Button>
              <Button danger size="small" type="link" @click="delModule(selected as number)">删除</Button>
            </span>
          </div>
          <Tabs v-model:active-key="rightTab" class="config-tabs">
            <TabPane key="data" :tab="`${comp.name}数据`">
              <div class="config-form">
                <Button size="small" type="primary" @click="addData">+ 追加数据</Button>
                <p class="config-tip">
                  注意：请自行判断是否要添加数据，单数据如单图追加无效！
                </p>
                <div v-for="(entry, ei) in comp.data" :key="ei" class="data-panel">
                  <div class="data-panel-head">
                    <span>{{ comp.name }} <strong>#{{ ei + 1 }}</strong></span>
                    <span class="data-del" @click="delData(ei)">×</span>
                  </div>
                  <div class="data-panel-body">
                    <div v-for="(val, key) in entry" :key="key" class="form-item">
                      <template v-if="isHintKey(String(key))">
                        <p class="config-tip">{{ val }}</p>
                      </template>
                      <template v-else-if="isImageKey(String(key))">
                        <label>{{ dataLabel(String(key)) }}</label>
                        <Input v-model:value="entry[key]" placeholder="图片URL" />
                        <img v-if="entry[key]" :src="entry[key]" class="data-preview" />
                      </template>
                      <template v-else>
                        <label>{{ dataLabel(String(key)) }}</label>
                        <Input v-model:value="entry[key]" />
                      </template>
                    </div>
                    <p v-if="Object.keys(entry).length === 0" class="config-tip">
                      该组件无需配置数据
                    </p>
                  </div>
                </div>
              </div>
            </TabPane>
            <TabPane v-if="comp.params" key="params" tab="配置参数">
              <div class="config-form">
                <div
                  v-for="(val, key) in comp.params"
                  :key="key"
                  class="form-item"
                >
                  <label>{{ paramsLabel(String(key)) }}</label>
                  <Switch
                    v-if="typeof val === 'boolean'"
                    :checked="val"
                    @change="(v: any) => (comp.params[key] = v)"
                  />
                  <div v-else-if="isColorValue(val)" class="color-row">
                    <input v-model="comp.params[key]" type="color" />
                    <Input v-model:value="comp.params[key]" />
                  </div>
                  <Input v-else v-model:value="comp.params[key]" />
                </div>
              </div>
            </TabPane>
            <TabPane key="style" tab="CSS样式">
              <div class="config-form">
                <div
                  v-for="(val, key) in comp.style"
                  :key="key"
                  class="form-item"
                >
                  <label>{{ moduleStyleCatalog[String(key)] ?? key }}</label>
                  <div class="color-row">
                    <Input v-model:value="comp.style[key]" />
                    <span class="style-del" @click="delStyleKey(String(key))">×</span>
                  </div>
                </div>
                <div class="form-item">
                  <label>追加属性</label>
                  <div class="color-row">
                    <Select
                      v-model:value="newStyleKey"
                      :options="styleAddOptions"
                      class="w-full"
                      placeholder="选择CSS属性"
                    />
                    <Button size="small" @click="addStyleKey">添加</Button>
                  </div>
                </div>
              </div>
            </TabPane>
          </Tabs>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped>
.diy-editor {
  position: fixed;
  inset: 0;
  z-index: 200;
  display: flex;
  flex-direction: column;
  background: hsl(var(--background));
}

.diy-topbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 16px;
  background: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
}

.topbar-left {
  display: flex;
  gap: 8px;
}

.device-select {
  width: 140px;
}

.signal-select {
  width: 90px;
}

.topbar-right {
  display: flex;
  gap: 8px;
}

.diy-body {
  display: flex;
  flex: 1;
  overflow: hidden;
}

/* ===== 手机预览 ===== */
.diy-canvas {
  flex: 1;
  overflow: auto;
  padding: 24px;
  background: hsl(var(--muted));
}

.phone-frame {
  width: 375px;
  margin: 0 auto;
  background: hsl(var(--background));
  border: 1px solid hsl(var(--border));
  border-radius: 12px;
  box-shadow: 0 4px 16px rgb(0 0 0 / 10%);
}

.phone-page {
  min-height: 640px;
  overflow: hidden;
  border-radius: 12px;
}

.phone-nav {
  cursor: pointer;
  background: #fff;
}

.phone-nav.active {
  outline: 2px solid hsl(var(--primary));
  outline-offset: -2px;
}

.status-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 30px;
  padding: 0 12px;
  font-size: 12px;
}

.bangs {
  width: 120px;
  height: 18px;
  background: #000;
  border-radius: 0 0 12px 12px;
}

.device-info {
  display: flex;
  gap: 4px;
  align-items: center;
}

.signal-text {
  font-size: 10px;
}

.nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 40px;
  padding: 0 12px;
}

.nav-title {
  font-size: 15px;
  font-weight: 500;
}

.phone-mod {
  position: relative;
  cursor: pointer;
}

.phone-mod.active {
  outline: 2px dashed hsl(var(--primary));
  outline-offset: -2px;
}

.mod-del {
  position: absolute;
  top: 2px;
  right: 2px;
  z-index: 2;
  display: none;
  width: 18px;
  height: 18px;
  font-size: 14px;
  line-height: 18px;
  color: #fff;
  text-align: center;
  cursor: pointer;
  background: rgb(0 0 0 / 45%);
  border-radius: 50%;
}

.phone-mod:hover .mod-del {
  display: block;
}

.mod-placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 60px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
  background: hsl(var(--muted));
}

.mod-banner {
  position: relative;
}

.mod-banner img {
  width: 100%;
  object-fit: cover;
}

.indicator {
  position: absolute;
  bottom: 6px;
  left: 50%;
  display: flex;
  gap: 4px;
  transform: translateX(-50%);
}

.indicator span {
  width: 6px;
  height: 6px;
  background: rgb(255 255 255 / 60%);
  border-radius: 50%;
}

.indicator span.on {
  background: #ff4632;
}

.mod-image {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 2px;
}

.mod-image img {
  width: 100%;
  object-fit: cover;
}

.mod-video {
  position: relative;
}

.mod-video img {
  width: 100%;
  object-fit: cover;
}

.mod-video .play {
  position: absolute;
  top: 50%;
  left: 50%;
  color: rgb(255 255 255 / 85%);
  font-size: 32px;
  transform: translate(-50%, -50%);
}

.mod-menu {
  display: flex;
  flex-wrap: wrap;
  padding: 8px 4px;
  background: #fff;
}

.menu-item {
  width: 20%;
  text-align: center;
}

.menu-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 45px;
  height: 45px;
  margin: 0 auto 4px;
  overflow: hidden;
  color: #fff;
  font-size: 24px;
  background: linear-gradient(135deg, #ff8c69, #ff4632);
  border-radius: 50%;
}

.menu-icon img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-text {
  color: #333;
}

.mod-notice {
  display: flex;
  gap: 6px;
  align-items: center;
  padding: 4px 12px;
  color: #de8f1c;
  font-size: 12px;
  background: #fffbe8;
}

.mod-article {
  background: #fff;
}

.article-item {
  display: flex;
  gap: 8px;
  padding: 10px 12px;
}

.article-image {
  width: 110px;
  height: 70px;
  overflow: hidden;
  flex-shrink: 0;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.article-title {
  color: #333;
  font-size: 13px;
}

.article-operate {
  display: flex;
  gap: 12px;
  margin-top: 24px;
  color: #999;
  font-size: 11px;
}

.mod-headlines {
  display: flex;
  gap: 8px;
  align-items: center;
  margin: 12px;
  padding: 10px;
  background: #fff;
  border-radius: 8px;
}

.headlines-list {
  display: flex;
  flex: 1;
  gap: 8px;
  align-items: center;
  justify-content: space-between;
}

.headlines-text {
  color: #666;
  font-size: 12px;
}

.headlines-pic {
  width: 56px;
  height: 56px;
  overflow: hidden;
  background: hsl(var(--muted));
  flex-shrink: 0;
}

.headlines-pic img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.mod-search {
  padding: 12px;
}

.mod-search > div {
  display: flex;
  gap: 6px;
  align-items: center;
  color: #999;
  font-size: 12px;
}

.mod-category {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 12px;
  background: #fff;
  border-radius: 10px;
}

.category-name {
  color: #333;
  font-size: 15px;
}

.category-name em {
  margin-left: 6px;
  padding: 1px 6px;
  color: #fff;
  font-size: 10px;
  font-style: normal;
  background: #ff8c69;
  border-radius: 8px;
}

.category-describe {
  color: #999;
  font-size: 11px;
}

.category-goods {
  display: flex;
  gap: 4px;
  margin-top: 6px;
}

.category-goods span {
  height: 48px;
  background: hsl(var(--muted));
  border-radius: 4px;
  flex: 1;
}

.mod-category-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin: 12px;
  color: #333;
  font-size: 15px;
}

.mod-category-title .more {
  color: #999;
  font-size: 12px;
}

.mod-product {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  padding: 8px;
  background: #f5f5f5;
}

.product-item {
  overflow: hidden;
  background: #fff;
  border-radius: 8px;
}

.product-pic {
  height: 90px;
  background: hsl(var(--muted));
}

.product-info {
  padding: 6px;
}

.product-title {
  color: #333;
  font-size: 12px;
}

.product-price {
  color: #ff4632;
  font-size: 14px;
}

.mod-groups {
  margin: 12px;
  overflow: hidden;
  background: #fff;
  border-radius: 10px;
}

.groups-head {
  display: flex;
  gap: 8px;
  align-items: baseline;
  padding: 10px 12px 4px;
}

.groups-body {
  display: flex;
  gap: 8px;
  padding: 8px 12px 12px;
}

.groups-item {
  flex: 1;
}

.groups-pic {
  height: 60px;
  background: hsl(var(--muted));
  border-radius: 6px;
}

.groups-price {
  margin-top: 4px;
  color: #ff4632;
  font-size: 12px;
}

.mod-empty {
  height: 25px;
}

.mod-division {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 12px;
}

.mod-division .line {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
}

.mod-division .linetext {
  position: relative;
  font-size: 14px;
}

.phone-empty {
  padding: 48px 0;
  color: hsl(var(--muted-foreground));
  font-size: 13px;
  text-align: center;
}

/* ===== 组件库 ===== */
.diy-palette {
  width: 280px;
  overflow: auto;
  padding: 12px;
  border-left: 1px solid hsl(var(--border));
}

.palette-title {
  display: flex;
  gap: 6px;
  align-items: center;
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.palette-title i {
  width: 3px;
  height: 14px;
  background: hsl(var(--primary));
}

.group-name {
  margin: 10px 0 6px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.group-row {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.palette-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
  align-items: center;
  padding: 8px 2px;
  font-size: 11px;
  cursor: pointer;
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.palette-item:hover {
  border-color: hsl(var(--primary));
  color: hsl(var(--primary));
}

/* ===== 右侧配置 ===== */
.diy-config {
  width: 320px;
  overflow: auto;
  padding: 12px;
  border-left: 1px solid hsl(var(--border));
}

.config-title {
  margin-bottom: 12px;
  font-size: 14px;
  font-weight: 600;
}

.config-toolbar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 4px;
}

.config-name {
  font-size: 14px;
  font-weight: 600;
}

.config-form {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.form-item label {
  display: block;
  margin-bottom: 4px;
  color: hsl(var(--muted-foreground));
  font-size: 12px;
}

.color-row {
  display: flex;
  gap: 6px;
  align-items: center;
}

.color-row input[type='color'] {
  width: 32px;
  height: 32px;
  padding: 2px;
  cursor: pointer;
  background: hsl(var(--muted));
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
  flex-shrink: 0;
}

.w-full {
  width: 100%;
}

.config-tip {
  padding: 6px 8px;
  color: #1890ff;
  font-size: 12px;
  background: hsl(var(--muted));
  border-radius: 4px;
}

.data-panel {
  border: 1px solid hsl(var(--border));
  border-radius: 6px;
}

.data-panel-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 10px;
  font-size: 13px;
  background: hsl(var(--muted));
  border-bottom: 1px solid hsl(var(--border));
  border-radius: 6px 6px 0 0;
}

.data-del {
  cursor: pointer;
  color: hsl(var(--muted-foreground));
}

.data-panel-body {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 10px;
}

.data-preview {
  width: 64px;
  height: 64px;
  margin-top: 6px;
  object-fit: cover;
  border: 1px solid hsl(var(--border));
  border-radius: 4px;
}

.style-del {
  cursor: pointer;
  color: hsl(var(--muted-foreground));
}
</style>
