<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../axios';
import { useNotify } from '../../composables/useNotify';


type CategoryStatus = 'ACTIVE' | 'INACTIVE';

interface Category {
  id: number;
  name: string;
  description: string;
  status: CategoryStatus;
}

// --- Composables ---
const {notify } = useNotify();
// --- State ---
const categories = ref<Category[]>([]);
const loading = ref(false);
const search = ref("");
const dialog = ref(false);
const isEdit = ref(false);

// Pagination State
const page = ref(1);
const itemsPerPage = ref(10);
const totalItems = ref(0);

const form = ref<Category>({
  id: 0,
  name: '',
  description: '',
  status: 'ACTIVE',
});

// --- API Functions ---
async function fetchCategories() {
  loading.value = true;
  try {
    const response: any = await api.get(`/admin/categories`, {
      params: {
        page: page.value - 1,
        size: itemsPerPage.value+1,
        search: search.value
      }
    });
    categories.value = response.content;
    totalItems.value = response.totalElements;
  } catch (error) {
  } finally {
    loading.value = false;
  }
}
// --- Watchers ---
let debounceTimer: any = null;
watch(search, (val) => {
  clearTimeout(debounceTimer);
  page.value = 1;
  if (!val){
    fetchCategories();
    return;
  }
  debounceTimer = setTimeout(() => {
    fetchCategories();
  }, 500);
});

// --- Logic Functions ---
function openAddDialog() {
  isEdit.value = false;
  form.value = { id: 0, name: '', description: '', status: 'ACTIVE' };
  dialog.value = true;
}

function openEditDialog(category: Category) {
  isEdit.value = true;
  form.value = JSON.parse(JSON.stringify(category));
  dialog.value = true;
}

async function saveCategory() {
  if (!form.value.name.trim()) {
    return notify.warning("Category name is required!");
  }
  const payload = {
    name: form.value.name,
    description: form.value.description,
    status: form.value.status
  };
  try {
    if (isEdit.value && form.value.id) {
      await api.put(`/admin/categories/${form.value.id}`, payload);
    } else {
      await api.post(`/admin/categories`, payload);
    };
    dialog.value = false;
    await fetchCategories();
  } catch (error: any) {
    console.error(error);
  }
}

async function deleteCategory(category: Category) {
  const ok = await notify.confirm(
    "Delete Category",
    `Are you sure you want to delete the category "${category.name}"? This action cannot be undone.`,
  );
  if (!ok) return;
  try {
    await api.delete(`/admin/categories/${category.id}`);
    await fetchCategories();
  } catch (error: any) {
    console.error(error);
  }
}

onMounted(fetchCategories);
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-bold text-high-emphasis mb-4">Category Management</h2>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">Add Category</v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          label="Search categories..."
          prepend-inner-icon="mdi-magnify"
          variant="outlined"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-card elevation="1">
      <v-data-table-server v-model:page="page" v-model:items-per-page="itemsPerPage"
        :items="categories" :items-length="totalItems"
        hover @update:options="fetchCategories"
        :loading="loading"
        :headers="[
          { title: 'Name', key: 'name' },
          { title: 'Description', key: 'description' },
          { title: 'Status', key: 'status' },
          { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
        ]"
      >
        <template #item.status="{ item }">
          <v-chip :color="item.status === 'ACTIVE' ? 'green' : 'red'" size="small" variant="flat">
            {{ item.status }}
          </v-chip>
        </template>

        <template #item.actions="{ item }">
          <v-tooltip text="Edit Category" location="top">
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props" 
                icon="mdi-pencil" 
                variant="text" 
                size="small" 
                color="primary" 
                @click="openEditDialog(item)"
              ></v-btn>
            </template>
          </v-tooltip>

          <v-tooltip text="Delete Category" location="top">
            <template v-slot:activator="{ props }">
              <v-btn 
                v-bind="props" 
                icon="mdi-delete" 
                variant="text" 
                size="small" 
                color="red" 
                @click="deleteCategory(item)"
              ></v-btn>
            </template>
          </v-tooltip>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="500px">
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white">
          {{ isEdit ? 'Edit Category' : 'Add Category' }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form>
            <v-text-field v-model="form.name" label="Category Name" variant="outlined" density="compact" class="mb-2" />
            <v-textarea v-model="form.description" label="Description" variant="outlined" density="compact" rows="2" class="mb-2" />
            <v-select
              v-model="form.status"
              :items="['ACTIVE', 'INACTIVE']" 
              label="Status"
              variant="outlined"
              density="compact"
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" variant="elevated" @click="saveCategory">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-data-table {
  margin-top: 10px;
}
</style>