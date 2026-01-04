<script setup lang="ts">
import { ref, onMounted, watch } from 'vue';
import api from '../../axios';

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
  featured: boolean; // ✅ Added to Interface
}

const products = ref<Product[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const dialog = ref(false);
const isEdit = ref(false);
const search = ref('');

// Form Fields
const productForm = ref<any>({
  id: 0,
  name: '',
  categoryId: null,
  price: 0,
  stock: 0,
  status: 'ACTIVE',
  description: '',
  featured: false
});

// Pagination states
const page = ref(1)
const itemsPerPage = ref(10);
const totalItems = ref(0);
// ... fetchCategories, fetchProducts, handleFileChange ...
async function fetchProducts(){
  if(loading.value) return;
  loading.value = true;
  try{
      const response: any = await api.get(`/admin/products`, {
          params: {
              page: page.value - 1,
              size: itemsPerPage.value,
              search: search.value
          }
      });
      products.value = response.content;
      totalItems.value = response.totalElements;
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      loading.value = false;
    }
}
let debounceTimer: any = null;
watch(search, (val) => {
  clearTimeout(debounceTimer);
  page.value = 1;
  if (!val){
    fetchProducts();
    return;
  }
  debounceTimer = setTimeout(() => {
    fetchProducts();
  }, 500);
});

async function fetchCategories(){
  try {
        const response: any = await api.get(`/admin/categories`);
        categories.value = response.content.map((c: any) => ({
                title: c.name,
                value: c.id,
            }));
    } catch (error) {
        console.error("Error fetching categories:", error);
    }
}

function openAddDialog() {
  isEdit.value = false;
  productForm.value = { id: 0, name: '', categoryId: null, price: 0, stock: 0, status: 'ACTIVE', imageUrl: '', description: '', featured: false };
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
  previewUrl.value = product.imageUrl ? `${import.meta.env.VITE_IMAGE_API_URL}${product.imageUrl}` : ''; 
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
    featured: productForm.value.featured, // ✅ Send to backend
  };
  try {
    if (isUpdating) {
      const response = await api.put(`/admin/products/${productForm.value.id}`, jsonPayload);
      savedProduct = response.data;
    } else {
      const response = await api.post(`/admin/products`, jsonPayload);
      savedProduct = response.data;
    }
    if (fileToUpload.value && savedProduct) {
      const formData = new FormData();
      formData.append('file', fileToUpload.value);
      await api.post(`/admin/products/images/product/${savedProduct.id}`, formData);
    }
    dialog.value = false;
    await fetchProducts();     
  } catch (error: any) {
    alert(`Failed to save product: ${error.response?.data?.message || 'Check console.'}`);
  }
}

// ... existing preview and delete functions ...
const fileToUpload = ref<File | null>(null); 
const previewUrl = ref('');
const showPreviewDialog = ref(false); 
const currentImagePreview = ref(''); 

function openPreview() {
    if (fileToUpload.value) {
        currentImagePreview.value = previewUrl.value; 
    } else if (productForm.value.imageUrl) {
        currentImagePreview.value = `${import.meta.env.VITE_IMAGE_API_URL}${productForm.value.imageUrl}`;
    } else {
        alert("No image selected to preview.");
        return;
    }
    showPreviewDialog.value = true;
}

function handleFileChange(event: Event){
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  fileToUpload.value = file || null;
  if (file) {
      previewUrl.value = URL.createObjectURL(file);
  } else {
      previewUrl.value = productForm.value.imageUrl ? `${import.meta.env.VITE_IMAGE_API_URL}${productForm.value.imageUrl}` : '';
  }
}

async function deleteProduct(product: any) {
    if (!confirm(`Are you sure you want to delete product: ${product.name}?`)) return;
    try {
        await api.delete(`/admin/products/${product.id}`);
        await fetchProducts();
    } catch (error) {
        alert("Failed to delete product.");
    }
}

onMounted(() => {
    fetchProducts();
    fetchCategories();
});

function getImageUrl(url: string) {
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}
</script>

<template>
  <v-container fluid>
    <v-row class="mb-4 align-center">
      <v-col cols="12" class="d-flex justify-space-between align-center">
        <h2 class="text-h5 font-weight-bold text-high-emphasis mb-4">Product Management</h2>
        <v-btn color="primary" prepend-icon="mdi-plus" @click="openAddDialog">Add Product</v-btn>
      </v-col>
    </v-row>

    <v-row class="mb-4">
      <v-col cols="12" md="4">
        <v-text-field
          v-model="search"
          v-click-outside="() => {}"
          prepend-inner-icon="mdi-magnify"
          label="Search products..."
          variant="outlined"
          density="compact"
          hide-details
        ></v-text-field>
      </v-col>
    </v-row>

    <v-card elevation="1">
      <v-data-table-server
        v-model:page="page"
        v-model:items-per-page="itemsPerPage"
        :items="products"
        :items-length="totalItems"
        :loading="loading"
        :items-per-page-options="[10,25,50,100]"
        @update:options="fetchProducts"
        hover
        :headers="[
          { title: 'Image', key: 'imageUrl', sortable: false },
          { title: 'Name', key: 'name' },
          { title: 'Featured', key: 'featured', align: 'center' },
          { title: 'Category', key: 'category.name' },
          { title: 'Price', key: 'price' },
          { title: 'Stock', key: 'stock' },
          { title: 'Status', key: 'status' },
          { title: 'Actions', key: 'actions', sortable: false, align: 'end' }
        ]"
      >
        <template #item.featured="{ item }">
          <v-icon :color="item.featured ? 'amber' : 'grey-lighten-1'">
            {{ item.featured ? 'mdi-star' : 'mdi-star-outline' }}
          </v-icon>
        </template>

        <template #item.imageUrl="{item}">
          <v-img 
            :src="getImageUrl(item.imageUrl)"
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
            <v-btn icon="mdi-pencil" variant="text" size="small" color="primary" @click="openEditDialog(item)"></v-btn>
            <v-btn icon="mdi-delete" variant="text" size="small" color="red" @click="deleteProduct(item)"></v-btn>
          </div>
        </template>
      </v-data-table-server>
    </v-card>

    <v-dialog v-model="dialog" max-width="600px">
      <v-card rounded="lg">
        <v-card-title class="bg-primary text-white">
          {{ isEdit ? 'Edit Product' : 'Add Product' }}
        </v-card-title>
        <v-card-text class="pt-4">
          <v-form>
            <v-switch
              v-model="productForm.featured"
              color="amber"
              label="Mark as Featured Product"
              hide-details
              inset
              class="mb-4"
            ></v-switch>

            <v-text-field v-model="productForm.name" label="Product Name" variant="outlined" density="compact" required/>         
            <v-autocomplete v-model="productForm.categoryId" :items="categories" label="Category" item-title="title" item-value="value" variant="outlined" density="compact" required />
            <v-row dense>
              <v-col cols="6"><v-text-field v-model.number="productForm.price" label="Price" prefix="₹" variant="outlined" density="compact"/></v-col>
              <v-col cols="6"><v-text-field v-model.number="productForm.stock" label="Stock" variant="outlined" density="compact"/></v-col>
            </v-row>
            <v-textarea v-model="productForm.description" label="Description" variant="outlined" density="compact" rows="2" />
            <v-select v-model="productForm.status" :items="['ACTIVE', 'INACTIVE']" label="Status" variant="outlined" density="compact" /> 
            <v-file-input label="Product Image" accept="image/*" @change="handleFileChange" prepend-icon="mdi-camera" variant="outlined" density="compact" />
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