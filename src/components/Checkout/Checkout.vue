<script setup lang="ts">
import { ref, inject, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import api from "../../axios";
import { useNotify } from "../../composables/useNotify";

const { notify } = useNotify();
const router = useRouter();

// State
const savedAddresses = ref<any[]>([]);
const selectedAddressId = ref<number | null>(null);
const isAddingNew = ref(false);
const selectedPayment = ref("Cash On Delivery");
const paymentOptions = ["Cash On Delivery", "UPI", "Credit/Debit Card", "BHIM"];

const newAddress = ref({
  flatHouseNo: "",
  area: "",
  city: "",
  state: "",
  zipCode: "",
  addressType: "Home"
});

onMounted(() => {
  fetchSavedAddresses();
});

async function fetchSavedAddresses() {
  try {
    const response: any = await api.get("/address");
    const data = response.data || response;
    savedAddresses.value = Array.isArray(data) ? data : [];

    if (savedAddresses.value.length > 0) {
      // Auto-select default or first address
      const defaultAddr = savedAddresses.value.find((a: any) => a.isDefault);
      selectedAddressId.value = defaultAddr ? defaultAddr.id : savedAddresses.value[0].id;
    }
  } catch (error) {
    savedAddresses.value = [];
    console.error("Fetch address error:", error);
  }
}

function handleAddNewClick() {
  isAddingNew.value = true;
  selectedAddressId.value = null;
}

function cancelAddNew() {
  isAddingNew.value = false;
  if (savedAddresses.value.length > 0) {
    selectedAddressId.value = savedAddresses.value[0].id;
  }
}

async function saveAddress() {
  if (!newAddress.value.flatHouseNo || !newAddress.value.city) {
    notify.warning("Please fill in the required fields.");
    return;
  }
  try {
    const res: any = await api.post("/address", newAddress.value);
    const savedObj = res.data || res;
    savedAddresses.value.push(savedObj);
    selectedAddressId.value = savedObj.id;
    isAddingNew.value = false;
    notify.success("Address saved!");
    // Reset form
    newAddress.value = { flatHouseNo: "", area: "", city: "", state: "", zipCode: "", addressType: "Home" };
  } catch (e) {
    notify.error("Failed to save address");
  }
}

// Inject cart
const cart = inject("cart") as any;
const addToCart = inject("addToCart") as any;
const removeFromCart = inject("removeFromCart") as any;
const removeAll = inject("removeAll") as any;

const total = computed(() => cart.value.reduce((acc: number, item: any) => acc + item.price * (item.quantity || 0), 0));

async function confirmOrder() {
  if (!selectedAddressId.value) {
    notify.warning("📍 Please select a delivery address.");
    return;
  }
  const orderPayload = {
    addressId: selectedAddressId.value,
    paymentMethod: selectedPayment.value,
    items: cart.value.map((item: any) => ({ productId: item.id, quantity: item.quantity }))
  };
  try {
    await api.post(`/orders/place`, orderPayload);
    cart.value = [];
    router.push("/orders");
    notify.success("Order placed successfully! 🎉");
  } catch (error) {
    notify.error("Failed to place order");
  }
}

function getImageUrl(url: string) {
  if (!url) return '/placeholder.png';
  if (url.startsWith('http://') || url.startsWith('https://')) return url;
  return `${import.meta.env.VITE_IMAGE_API_URL}${url}`;
}
</script>

<template>
  <v-container class="checkout-container">
    <h2 class="mb-6 font-weight-bold">{{ $t('checkout.title') }}</h2>

    <v-row v-if="cart && cart.length > 0">
      <v-col cols="12" md="8">
        <v-card v-for="item in cart" :key="item.id" class="cart-item mb-4" variant="outlined" rounded="lg">
          <div class="d-flex align-center pa-4">
            <v-img :src="getImageUrl(item.imageUrl)" width="100" height="100" cover class="rounded-lg mr-4 bg-grey-lighten-4"></v-img>
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start">
                <h3 class="text-subtitle-1 font-weight-bold">{{ item.name }}</h3>
                <v-btn icon="mdi-close" variant="text" color="grey" size="small" @click="removeAll(item)"></v-btn>
              </div>
              <p class="text-subtitle-2 text-primary font-weight-bold">₹{{ item.price }}</p>
              
              <div class="d-flex align-center justify-space-between mt-2">
                <div class="cart-controls border rounded-pill px-1">
                  <v-btn size="x-small" variant="text" icon="mdi-minus" color="error" @click="removeFromCart(item)"></v-btn>
                  <span class="mx-3 font-weight-bold">{{ item.quantity }}</span>
                  <v-btn size="x-small" variant="text" icon="mdi-plus" color="success" @click="addToCart(item)"></v-btn>
                </div>
                <div class="text-right">
                  <div class="text-caption text-grey">{{ $t('checkout.total') }}</div>
                  <div class="font-weight-bold">₹{{ (item.price * (item.quantity || 0)).toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-5 sticky-card" elevation="4" rounded="xl">
          <h3 class="text-h6 mb-4 d-flex align-center">
            <v-icon start color="primary">mdi-map-marker-radius</v-icon> {{ $t('checkout.delivery_address') }}
          </h3>
          
          <div v-if="!isAddingNew">
            <v-radio-group v-model="selectedAddressId" v-if="savedAddresses.length > 0" hide-details>
              <v-hover v-for="addr in savedAddresses" :key="addr.id" v-slot="{ props }">
                <v-card v-bind="props" variant="outlined" 
                  :class="['mb-3 pa-3 transition-swing', selectedAddressId === addr.id ? 'border-primary bg-blue-lighten-5' : '']"
                  @click="selectedAddressId = addr.id"
                  style="cursor: pointer;"
                >
                  <div class="d-flex align-start">
                    <v-radio :value="addr.id" color="primary" class="mt-n1"></v-radio>
                    <div class="flex-grow-1 ml-2">
                      <div class="d-flex align-center justify-space-between mb-1">
                        <span class="text-subtitle-2 font-weight-bold">
                          {{ addr.addressType }}
                        </span>
                        <v-chip v-if="addr.isDefault" size="x-small" color="primary" variant="flat">Default</v-chip>
                      </div>
                      <div class="text-caption text-grey-darken-2">{{ addr.flatHouseNo }}, {{ addr.area }}</div>
                      <div class="text-caption text-grey-darken-2">{{ addr.city }}, {{ addr.zipCode }}</div>
                    </div>
                  </div>
                </v-card>
              </v-hover>
            </v-radio-group>
            
            <v-btn block variant="dashed" color="primary" @click="handleAddNewClick" class="mt-2 border-dashed">
              <v-icon start>mdi-plus-circle-outline</v-icon> {{ $t('checkout.add_new_address') }}
            </v-btn>
          </div>

          <v-expand-transition>
            <div v-if="isAddingNew" class="mt-2">
              <div class="d-flex align-center mb-4">
                <v-btn icon="mdi-chevron-left" size="small" variant="text" @click="cancelAddNew"></v-btn>
                <span class="font-weight-bold">{{ $t('checkout.enter_new_address') }}</span>
              </div>
              <v-text-field v-model="newAddress.flatHouseNo" :label="$t('checkout.address')" variant="outlined" density="compact"></v-text-field>
              <v-text-field v-model="newAddress.area" :label="$t('checkout.landmark')" variant="outlined" density="compact"></v-text-field>
              <v-row dense>
                <v-col cols="7"><v-text-field v-model="newAddress.city" :label="$t('profile.city')" variant="outlined" density="compact"></v-text-field></v-col>
                <v-col cols="5"><v-text-field v-model="newAddress.zipCode" :label="$t('profile.pincode')" variant="outlined" density="compact"></v-text-field></v-col>
              </v-row>
              <v-select v-model="newAddress.addressType" :items="['Home', 'Office', 'Other']" :label="$t('checkout.address_type')" variant="outlined" density="compact"></v-select>
              <v-btn block color="primary" rounded="lg" @click="saveAddress">{{ $t('checkout.save_and_use') }}</v-btn>
            </div>
          </v-expand-transition>

          <v-divider class="my-6"></v-divider>

          <h3 class="text-h6 mb-4 d-flex align-center"><v-icon start color="primary">mdi-shield-check-outline</v-icon>{{ $t('checkout.payment') }}</h3>
          <v-select v-model="selectedPayment" :items="paymentOptions" variant="solo-filled" flat density="compact" hide-details></v-select>

          <div class="pa-4 mt-6 bg-grey-lighten-4 rounded-xl">
            <div class="d-flex justify-space-between mb-2 text-body-2"><span>{{ $t('checkout.subtotal') }}</span><span>₹{{ total.toFixed(2) }}</span></div>
            <div class="d-flex justify-space-between mb-2 text-body-2"><span>{{ $t('checkout.delivery') }}</span><span class="text-success font-weight-bold">FREE</span></div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-h6 font-weight-bold">
              <span>{{ $t('checkout.total') }}</span><span class="text-primary">₹{{ total.toFixed(2) }}</span>
            </div>
          </div>

          <v-btn color="primary" block size="x-large" rounded="pill" class="mt-6 font-weight-bold elevation-4" @click="confirmOrder" :disabled="isAddingNew">
            {{ $t('checkout.place_order') }}
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-sheet v-else class="d-flex flex-column align-center justify-center py-16 text-center bg-transparent">
      <v-icon size="120" color="grey-lighten-3">mdi-cart-remove</v-icon>
      <h2 class="text-h4 font-weight-bold mt-4">{{ $t('checkout.cart_empty') }}</h2>
      <v-btn color="primary" size="large" rounded="pill" @click="router.push('/home')" class="mt-8 px-10 elevation-2">
        {{ $t('checkout.start_shopping') }}
      </v-btn>
    </v-sheet>
  </v-container>
</template>

<style scoped>
.checkout-container { max-width: 1200px; margin: 0 auto; }
.sticky-card { position: sticky; top: 85px; }
.border-primary { border: 2px solid #1867C0 !important; }
.border-dashed { border: 2px dashed #ccc !important; }
.transition-swing { transition: 0.3s cubic-bezier(0.25, 0.8, 0.5, 1); }
</style>