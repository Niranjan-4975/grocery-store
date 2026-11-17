<template>
  <v-card elevation="1" rounded="lg">
    <v-data-table-server
      v-model:page="localPage"
      v-model="selected"
      v-model:items-per-page="localItemsPerPage"
      :headers="headers"
      :items="items"
      :items-length="totalItems"
      :show-select="showSelect"
      :items-per-page-options="[10, 25, 50, 100]"
      :loading="loading"
      @update:options="$emit('update:options', $event)"
      hover
      density="comfortable"
      class="custom-admin-table"
    >
      <template #item.imageUrl="{ item }">
        <v-img :src="getImageUrl(item.imageUrl)" 
          max-width="50" max-height="50"
          cover
          class="my-1 rounded border bg-grey-lighten-4">
        </v-img>
      </template>
      <template #item.featured="{ item }">
        <v-icon :color="item.featured ? 'amber' : 'grey-lighten-2'">
          {{ item.featured ? 'mdi-star' : 'mdi-star-outline' }}
        </v-icon>
      </template>
      <template #item.roles="{ item }">
        <v-chip color="blue-lighten-1" text-color="blue-darken-4" size="x-small" class="mr-1 font-weight-bold"
          v-for="role in item.roles" :key="role"
        >
          {{ role.name || role }}
        </v-chip>
      </template>
      <template #[`item.${statusKey}`]="{ item }">
        <v-chip 
          :color="getStatusColor(item[statusKey])" 
          size="small" variant="flat" class="font-weight-bold"
        >
          {{ item[statusKey] }}
        </v-chip>
      </template>
      <template #item.actions="{ item }">
        <div class="d-flex justify-end align-center">
          <slot name="actions" :item="item"></slot>
        </div>
      </template>
      <template v-for="slotName in Object.keys($slots)" #[slotName]="slotProps">
        <slot :name="slotName" v-bind="slotProps"></slot>
      </template>
    </v-data-table-server>
  </v-card>
</template>

<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps({
  headers: Array as any,
  items: Array as any,
  totalItems: Number,
  loading: Boolean,
  page: Number,
  itemsPerPage: Number,
  statusKey: {
    type: String,
    default: 'status'
  },
  modelValue: { type: Array, default: () => [] },
  showSelect: { type: Boolean, default: false }
});

const emit = defineEmits(['update:modelValue','update:page', 'update:itemsPerPage', 'update:options']);

// Two-way binding for pagination
const localPage = computed({
  get: () => props.page,
  set: (val) => emit('update:page', val)
});

const localItemsPerPage = computed({
  get: () => props.itemsPerPage,
  set: (val) => emit('update:itemsPerPage', val)
});

// Two was binding for selected items
const selected = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val)
});

// Centralized Color Logic
function getStatusColor(status: string) {
  const s = status?.toUpperCase();
  if (['ACTIVE', 'COMPLETED', 'DELIVERED'].includes(s)) return 'green';
  if (['INACTIVE','PENDING', 'WARNING'].includes(s)) return 'orange';
  if (['SUSPENDED','CANCELLED','ERROR'].includes(s)) return 'red';
  return 'grey';
};
function getImageUrl(url: string) {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${import.meta.env.VITE_IMAGE_API_URL}${url}`;
}
</script>
<style scoped>
.custom-admin-table :deep(thead th) {
  font-weight: bold !important;
  color: #666 !important;
  text-transform: uppercase;
  font-size: 0.8rem;
}
</style>