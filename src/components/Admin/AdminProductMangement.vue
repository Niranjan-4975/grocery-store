<script setup lang="ts">
import { ref } from 'vue';

// --- Mock Data ---
interface Product {
  id: number;
  name: string;
  category: string;
  price: number;
  stock: number;
  status: boolean;
  image: string;
}

const products = ref<Product[]>([
  { id: 1, name: 'Tomatoes', category: 'Vegetables', price: 50, stock: 20, status: true, image: '' },
  { id: 2, name: 'Milk', category: 'Dairy', price: 60, stock: 10, status: true, image: '' },
  { id: 3, name: 'Bread', category: 'Bakery', price: 30, stock: 5, status: false, image: '' },
]);

// --- Dialog State ---
const dialog = ref(false);
const isEdit = ref(false);
const editedProduct = ref<Product | null>(null);

// --- Form Fields ---
const form = ref<Product>({
  id: 0,
  name: '',
  category: '',
  price: 0,
  stock: 0,
  status: true,
  image: '',
});

// --- Categories (mock) ---
const categories = ['Vegetables', 'Dairy', 'Bakery', 'Fruits'];

// --- Functions ---
function openAddDialog() {
  isEdit.value = false;
  form.value = { id: 0, name: '', category: '', price: 0, stock: 0, status: true, image: '' };
  dialog.value = true;
}

function openEditDialog(product: Product) {
  isEdit.value = true;
  form.value = { ...product };
  dialog.value = true;
}

function saveProduct() {
  if (isEdit.value && form.value.id) {
    // Edit product
    const index = products.value.findIndex(p => p.id === form.value.id);
    if (index !== -1) products.value[index] = { ...form.value };
  } else {
    // Add new product
    form.value.id = products.value.length + 1;
    products.value.push({ ...form.value });
  }
  dialog.value = false;
}

function deleteProduct(product: Product) {
  products.value = products.value.filter(p => p.id !== product.id);
}

</script>

<template>
  <v-container fluid>
    <v-row class="mb-4">
      <v-col cols="12">
        <v-btn color="primary" @click="openAddDialog">Add Product</v-btn>
      </v-col>
    </v-row>

    <!-- Products Table -->
    <v-row>
      <v-col cols="12">
        <v-data-table :items="products" :headers="[
          { text: 'Name', value: 'name' },
          { text: 'Category', value: 'category' },
          { text: 'Price', value: 'price' },
          { text: 'Stock', value: 'stock' },
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
            <v-btn icon color="red" @click="deleteProduct(item)">
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>
        </v-data-table>
      </v-col>
    </v-row>

    <!-- Add/Edit Dialog -->
    <v-dialog v-model="dialog" max-width="500px">
      <v-card>
        <v-card-title>{{ isEdit ? 'Edit Product' : 'Add Product' }}</v-card-title>
        <v-card-text>
          <v-form>
            <v-text-field v-model="form.name" label="Product Name" required />
            <v-select v-model="form.category" :items="categories" label="Category" required />
            <v-text-field v-model="form.price" type="number" label="Price" required />
            <v-text-field v-model="form.stock" type="number" label="Stock" required />
            <v-switch v-model="form.status" label="Active Status" />
            <v-file-input
              v-model="form.image"
              label="Product Image"
              accept="image/*"
              prepend-icon="mdi-image"
              show-size
            />
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn text @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" @click="saveProduct">Save</v-btn>
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
