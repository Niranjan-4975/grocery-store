<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// API Configuration
const API_URL = 'http://localhost:8080/api/admin/categories';
const token = localStorage.getItem('token');

type CategoryStatus = 'ACTIVE' | 'INACTIVE';

interface Category {
  id: number;
  name: string;
  description: string;
  status: CategoryStatus;
}

// --- State ---
const categories = ref<Category[]>([]);
const loading = ref(false);
const search = ref(""); // ✅ Added for search logic
const dialog = ref(false);
const isEdit = ref(false);

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
    const response = await axios.get(API_URL, {
      headers: { "user-payload": token }
    });
    categories.value = response.data;
  } catch (error) {
    console.error("Error fetching categories", error);
    alert("Failed to load categories");
  } finally {
    loading.value = false;
  }
}

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
    alert("Category name is required.");
    return;
  }
  
  const payload = {
    name: form.value.name,
    description: form.value.description,
    status: form.value.status
  };

  try {
    if (isEdit.value && form.value.id) {
      await axios.put(`${API_URL}/${form.value.id}`, payload, {
        headers: { "user-payload": token }
      });
    } else {
      await axios.post(API_URL, payload, {
        headers: { "user-payload": token }
      });
    }
    dialog.value = false;
    await fetchCategories();
  } catch (error: any) {
    alert(`Error saving category: ${error.response?.data?.message || "Operation failed."}`);
  }
}

async function deleteCategory(category: Category) {
  if (!confirm(`Are you sure you want to delete category: ${category.name}?`)) return;
  try {
    await axios.delete(`${API_URL}/${category.id}`, {
      headers: { "user-payload": token }
    });
    await fetchCategories();
  } catch (error: any) {
    alert(`Failed to delete: ${error.response?.data?.message || "Operation failed."}`);
  }
}

onMounted(fetchCategories);
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-bold">Category Management</h2>
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
      <v-data-table 
        :items="categories" 
        :search="search"
        hover 
        :loading="loading"
        :headers="[
          { title: 'Name', key: 'name' },
          { title: 'Description', key: 'description' },
          { title: 'Status', key: 'status' },
          { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
        ]"
      >
        <template #item.status="{ item }">
          <v-chip 
            :color="item.status === 'ACTIVE' ? 'green' : 'red'" 
            size="small" 
            variant="flat"
          >
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
      </v-data-table>
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