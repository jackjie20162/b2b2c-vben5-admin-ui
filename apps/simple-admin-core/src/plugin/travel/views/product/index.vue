<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { getTravelProductList, type TravelProduct } from '../../api/product';

const loading = ref(false);
const products = ref<TravelProduct[]>([]);

async function loadProducts() {
  loading.value = true;
  try {
    const response = await getTravelProductList({ page: 1, pageSize: 20 });
    products.value = response.data?.items ?? [];
  } finally {
    loading.value = false;
  }
}

onMounted(loadProducts);
</script>

<template>
  <div class="p-5">
    <h2 class="mb-4 text-xl font-semibold">旅游产品</h2>
    <div v-if="loading">加载中...</div>
    <div v-else class="rounded border p-4">
      <div v-if="products.length === 0" class="text-gray-500">
        暂无旅游产品
      </div>
      <div v-for="item in products" :key="item.id" class="border-b py-3 last:border-b-0">
        <div class="font-medium">{{ item.title }}</div>
        <div class="text-sm text-gray-500">
          {{ item.destination }} · {{ item.currency }} {{ item.minPrice }} · {{ item.status }}
        </div>
      </div>
    </div>
  </div>
</template>
