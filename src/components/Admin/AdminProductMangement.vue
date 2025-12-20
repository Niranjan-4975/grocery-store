<script setup lang="ts">
import { ref, onMounted } from 'vue';
import axios from 'axios';

// --- Constants ---
const API_URL = 'http://localhost:8080/api/admin/products'; 
const CATEGORY_API_URL = 'http://localhost:8080/api/admin/categories';
const token = localStorage.getItem('token');

// --- Data Structures ---
type ProductStatus = 'ACTIVE' | 'INACTIVE' | 'DELETED' | 'SUSPENDED';
interface Product {
  id: number;
  name: string;
  categoryId: number | null; 
  category: { id: number, name: string };
  price: number;
  stock: number;
  status: ProductStatus;
  imageUrl: string;
}

const products = ref<Product[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const dialog = ref(false);
const isEdit = ref(false);
const search = ref(''); // Added search ref

// Image Preview State
const showPreviewDialog = ref(false); 
const currentImagePreview = ref(''); 

// Form Fields
const productForm = ref<any>({
  id: 0,
  name: '',
  categoryId: null,
  price: 0,
  stock: 0,
  status: 'ACTIVE',
  description: ''
});

const fileToUpload = ref<File | null>(null); 
const previewUrl = ref('');

// --- Logic Functions ---

function openPreview() {
    if (fileToUpload.value) {
        currentImagePreview.value = previewUrl.value; 
    } else if (productForm.value.imageUrl) {
        currentImagePreview.value = `http://localhost:8080${productForm.value.imageUrl}`;
    } else {
        alert("No image selected to preview.");
        return;
    }
    showPreviewDialog.value = true;
}

async function fetchCategories(){
  try {
        const response = await axios.get(CATEGORY_API_URL, {
            headers: { "user-payload": token }
        });
        categories.value = response.data.map((c: any) => ({
                title: c.name,
                value: c.id,
            }));
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

async function fetchProducts(){
  loading.value = true;
  try{
      const response = await axios.get(`${API_URL}`, {
          headers: { "user-payload": token }
      });
      products.value = response.data.content;
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      loading.value = false;
    }
}

function handleFileChange(event: Event){
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  fileToUpload.value = file || null;
  if (file) {
      previewUrl.value = URL.createObjectURL(file);
  } else {
      previewUrl.value = productForm.value.imageUrl ? `http://localhost:8080${productForm.value.imageUrl}` : '';
  }
}

function openAddDialog() {
  isEdit.value = false;
  productForm.value = { id: 0, name: '', categoryId: null, price: 0, stock: 0, status: 'ACTIVE', imageUrl: '', description: '' };
  fileToUpload.value = null;
  previewUrl.value = '';
  dialog.value = true;
}

function openEditDialog(product: any) {
  isEdit.value = true;
  productForm.value = JSON.parse(JSON.stringify({
      ...product,
      categoryId: product.category ? product.category.id : product.categoryId
  }));
  fileToUpload.value = null;
  previewUrl.value = product.imageUrl ? `http://localhost:8080${product.imageUrl}` : ''; 
  dialog.value = true;
}

async function saveProduct() {
  if (!productForm.value.name || !productForm.value.categoryId) {
      alert("Name and Category are required.");
      return;
  }

  let savedProduct: Product | null = null;
  const isUpdating = isEdit.value && productForm.value.id;
  const jsonPayload = {
    name: productForm.value.name,
    description: productForm.value.description,
    price: productForm.value.price,
    stock: productForm.value.stock,
    categoryId: productForm.value.categoryId,
    status: productForm.value.status,
  };
 
  try {
    if (isUpdating) {
      const response = await axios.put(`${API_URL}/${productForm.value.id}`, jsonPayload, {
                      headers: { "user-payload": token }
      });
      savedProduct = response.data;
    } else {
      const response = await axios.post(`${API_URL}`, jsonPayload, {
        headers: { "user-payload": token }
      });
      savedProduct = response.data;
    }

    if (fileToUpload.value && savedProduct) {
      const formData = new FormData();
      formData.append('file', fileToUpload.value);
      await axios.post(`${API_URL}/images/product/${savedProduct.id}`, formData, {
        headers: { "user-payload": token }
      });
    }
    dialog.value = false;
    await fetchProducts();     
  } catch (error: any) {
    alert(`Failed to save product: ${error.response?.data?.message || 'Check console.'}`);
  }
}

async function deleteProduct(product: any) {
    if (!confirm(`Are you sure you want to delete product: ${product.name}?`)) return;
    try {
        await axios.delete(`${API_URL}/${product.id}`, {
            headers: { "user-payload": token }
        });
        await fetchProducts();
    } catch (error) {
        alert("Failed to delete product.");
    }
}

onMounted(() => {
    fetchProducts();
    fetchCategories();
});
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-bold">Product Management</h2>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">Add Product</v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          prepend-inner-icon="mdi-magnify"
          label="Search products..."
          variant="outlined"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-card elevation="1">
      <v-data-table 
        :items="products" 
        :search="search"
        :loading="loading"
        hover
        :headers="[
          { title: 'Image', key: 'imageUrl', sortable: false },
          { title: 'Name', key: 'name' },
          { title: 'Category', key: 'category.name' },
          { title: 'Price', key: 'price' },
          { title: 'Stock', key: 'stock' },
          { title: 'Status', key: 'status' },
          { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
        ]"
      >
        <template #item.imageUrl="{item}">
          <v-img 
            :src="item.imageUrl ? `http://localhost:8080${item.imageUrl}` : '/placeholder.png'"
            height="40" 
            width="40" 
            cover 
            class="my-1 rounded border"
          ></v-img>
        </template>
        
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
          <div class="d-flex justify-end">
            <v-tooltip text="Edit Product" location="top">
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

            <v-tooltip text="Delete Product" location="top">
              <template v-slot:activator="{ props }">
                <v-btn 
                  v-bind="props" 
                  icon="mdi-delete" 
                  variant="text" 
                  size="small" 
                  color="red" 
                  @click="deleteProduct(item)"
                ></v-btn>
              </template>
            </v-tooltip>
          </div>
        </template>
      </v-data-table>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white">
          {{ isEdit ? 'Edit Product' : 'Add Product' }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form>
            <v-row dense>
              <v-col cols="12">
                <v-text-field v-model="productForm.name" label="Product Name" variant="outlined" density="compact" required/>         
                <v-autocomplete
                  v-model="productForm.categoryId"
                  :items="categories" 
                  label="Category" 
                  item-title="title" 
                  item-value="value"
                  variant="outlined" 
                  density="compact"
                  required
                />
                <v-row dense>
                  <v-col cols="6">
                    <v-text-field v-model.number="productForm.price" label="Price" prefix="₹" required variant="outlined" density="compact"/>
                  </v-col>
                  <v-col cols="6">
                    <v-text-field v-model.number="productForm.stock" label="Stock" variant="outlined" density="compact" required />
                  </v-col>
                </v-row>
                <v-textarea v-model="productForm.description" label="Description" variant="outlined" density="compact" rows="2" />
                <v-select v-model="productForm.status" :items="['ACTIVE', 'INACTIVE']" label="Status" variant="outlined" density="compact" required /> 
                <v-file-input 
                  label="Product Image"
                  accept="image/*"
                  @change="handleFileChange"
                  prepend-icon="mdi-camera"
                  variant="outlined"
                  density="compact"
                ></v-file-input>
              </v-col>
            </v-row>
          </v-form>
        </v-card-text>
        <v-card-actions>
          <v-btn
            v-if="fileToUpload || productForm.imageUrl"
            variant="text"
            color="info"
            size="small"
            @click="openPreview"
            prepend-icon="mdi-eye"
          >Preview Image</v-btn>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="dialog = false">Cancel</v-btn>
          <v-btn color="success" variant="elevated" @click="saveProduct">Save</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-dialog v-model="showPreviewDialog" max-width="400">
      <v-card rounded="lg">
        <v-card-title>Image Preview</v-card-title>
        <v-card-text class="d-flex justify-center">
          <v-img :src="currentImagePreview" height="300" width="300" contain class="rounded-lg border"></v-img>
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn variant="text" @click="showPreviewDialog = false">Close</v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </v-container>
</template>

<style scoped>
.v-data-table {
  margin-top: 10px;
}
input[type=number]::-webkit-inner-spin-button, 
input[type=number]::-webkit-outer-spin-button {
  -webkit-appearance: none;
  margin: 0;
}
.v-field--focused {
    outline: none !important;
}
</style>