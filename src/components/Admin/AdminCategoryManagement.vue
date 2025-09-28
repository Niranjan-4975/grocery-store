<script setup lang="ts">
import { ref } from 'vue';

// --- Mock Data ---
interface Category {
  id: number;
  name: string;
  description: string;
  status: boolean;
}

const categories = ref<Category[]>([
  { id: 1, name: 'Vegetables', description: 'Fresh vegetables', status: true },
  { id: 2, name: 'Dairy', description: 'Milk and cheese', status: true },
  { id: 3, name: 'Bakery', description: 'Bread and cakes', status: false },
]);

// --- Dialog State ---
const dialog = ref(false);
const isEdit = ref(false);
const editedCategory = ref<Category | null>(null);

// --- Form Fields ---
const form = ref<Category>({
  id: 0,
  name: '',
  description: '',
  status: true,
});

// --- Functions ---
function openAddDialog() {
  isEdit.value = false;
  form.value = { id: 0, name: '', description: '', status: true };
  dialog.value = true;
}

function openEditDialog(category: Category) {
  isEdit.value = true;
  form.value = { ...category };
  dialog.value = true;
}

function saveCategory() {
  if (isEdit.value && form.value.id) {
    // Edit category
    const index = categories.value.findIndex(c => c.id === form.value.id);
    if (index !== -1) categories.value[index] = { ...form.value };
  } else {
    // Add new category
    form.value.id = categories.value.length + 1;
    categories.value.push({ ...form.value });
  }
  dialog.value = false;
}

function deleteCategory(category: Category) {
  categories.value = categories.value.filter(c => c.id !== category.id);
}
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn color="primary" @click="openAddDialog">Add Category</v-btn>
      </v-col>
    </v-row>

    <!-- Categories Table -->
    <v-row>
      <v-col cols="12">
        <v-data-table :items="categories" :headers="[
          { text: 'Name', value: 'name' },
          { text: 'Description', value: 'description' },
          { text: 'Status', value: 'status' },
          { text: 'Actions', value: 'actions', sortable: false }
        ]">
          <template #item.status="{ item }">
            <v-chip :color="item.status ? 'green' : 'red'" small>{{ item.status ? 'Active' : 'Inactive' }}</v-chip>
          </template>
          <template #item.actions="{ item }">
            <v-btn icon @click="openEditDialog(item)">
              <v-icon>mdi-pencil</v-icon>
            </v-btn>
            <v-btn icon color="red" @click="deleteCategory(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEdit ? 'Edit Category' : 'Add Category' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="form.name" label="Category Name" required />
            <v-textarea v-model="form.description" label="Description" rows="2" />
            <v-switch v-model="form.status" label="Active Status" />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" @click="saveCategory">Save</v-btn>
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
