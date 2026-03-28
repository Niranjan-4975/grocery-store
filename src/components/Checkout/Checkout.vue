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
  return url ? `${import.meta.env.VITE_IMAGE_API_URL}${url}` : '/placeholder.png';
}
</script>

<template>
  <v-container class="checkout-container">
    <h2 class="mb-6">Checkout</h2>

    <v-row v-if="cart && cart.length > 0">
      <v-col cols="12" md="8">
        <v-card v-for="item in cart" :key="item.id" class="cart-item mb-4" variant="outlined" rounded="lg">
          <div class="d-flex align-center pa-4">
            <v-img :src="getImageUrl(item.imageUrl)" width="120" height="120" cover class="rounded-lg mr-4 bg-grey-lighten-4"></v-img>
            <div class="flex-grow-1">
              <div class="d-flex justify-space-between align-start">
                <h3 class="text-h6 font-weight-bold">{{ item.name }}</h3>
                <v-btn icon="mdi-delete-outline" variant="text" color="error" size="small" @click="removeAll(item)"></v-btn>
              </div>
              <p class="text-subtitle-1 text-primary font-weight-bold">₹{{ item.price }}</p>
              <div class="d-flex align-center justify-space-between mt-4">
                <div class="cart-controls border rounded-pill px-2 py-1">
                  <v-btn size="small" variant="text" icon="mdi-minus" color="error" @click="removeFromCart(item)"></v-btn>
                  <span class="mx-4 font-weight-bold text-h6">{{ item.quantity }}</span>
                  <v-btn size="small" variant="text" icon="mdi-plus" color="success" @click="addToCart(item)"></v-btn>
                </div>
                <div class="text-right">
                  <div class="text-caption text-grey">Subtotal</div>
                  <div class="text-h6 font-weight-bold">₹{{ (item.price * (item.quantity || 0)).toFixed(2) }}</div>
                </div>
              </div>
            </div>
          </div>
        </v-card>
      </v-col>

      <v-col cols="12" md="4">
        <v-card class="pa-4 sticky-card" elevation="3" rounded="lg">
          <h3 class="mb-4 d-flex align-center">
            <v-icon start color="primary">mdi-map-marker</v-icon> Delivery Address
          </h3>
          
          <div v-if="!isAddingNew">
            <v-radio-group v-model="selectedAddressId" v-if="savedAddresses.length > 0" hide-details>
              <v-card v-for="addr in savedAddresses" :key="addr.id" variant="outlined" 
                :class="['mb-3 pa-2', selectedAddressId === addr.id ? 'border-primary bg-blue-lighten-5' : '']"
              >
                <v-radio :value="addr.id" color="primary">
                  <template v-slot:label>
                    <div class="w-100 pl-2">
                      <div class="d-flex align-center justify-space-between">
                        <span class="font-weight-bold">
                          <v-icon size="small" class="mr-1">
                            {{ addr.addressType === 'Home' ? 'mdi-home' : addr.addressType === 'Office' ? 'mdi-briefcase' : 'mdi-map-marker' }}
                          </v-icon>
                          {{ addr.addressType }}
                        </span>
                        <v-chip v-if="addr.isDefault" size="x-small" color="success" variant="flat">Default</v-chip>
                      </div>
                      <div class="text-caption text-grey-darken-1">{{ addr.flatHouseNo }}, {{ addr.area }}, {{ addr.city }}</div>
                    </div>
                  </template>
                </v-radio>
              </v-card>
            </v-radio-group>
            <v-btn block variant="tonal" color="primary" @click="handleAddNewClick" class="mt-2">
              <v-icon start>mdi-plus</v-icon> Add New Address
            </v-btn>
          </div>

          <div v-else>
            <div class="d-flex align-center mb-4">
              <v-btn icon="mdi-arrow-left" size="small" variant="text" @click="cancelAddNew"></v-btn>
              <span class="font-weight-bold">Enter New Address</span>
            </div>
            <v-text-field v-model="newAddress.flatHouseNo" label="House/Flat No." variant="outlined" density="compact"></v-text-field>
            <v-text-field v-model="newAddress.area" label="Area/Landmark" variant="outlined" density="compact"></v-text-field>
            <v-row dense>
              <v-col cols="7"><v-text-field v-model="newAddress.city" label="City" variant="outlined" density="compact"></v-text-field></v-col>
              <v-col cols="5"><v-text-field v-model="newAddress.zipCode" label="Zip" variant="outlined" density="compact"></v-text-field></v-col>
            </v-row>
            <v-select v-model="newAddress.addressType" :items="['Home', 'Office', 'Other']" label="Type" variant="outlined" density="compact"></v-select>
            <v-btn block color="success" @click="saveAddress">Save & Use</v-btn>
          </div>

          <v-divider class="my-6"></v-divider>

          <h3 class="mb-4 d-flex align-center"><v-icon start color="primary">mdi-credit-card</v-icon> Payment</h3>
          <v-select v-model="selectedPayment" :items="paymentOptions" variant="outlined" density="compact" hide-details></v-select>

          <div class="pa-3 mt-6 bg-grey-lighten-4 rounded-lg">
            <div class="d-flex justify-space-between mb-2"><span>Subtotal</span><span>₹{{ total.toFixed(2) }}</span></div>
            <div class="d-flex justify-space-between mb-2"><span>Delivery</span><span class="text-success">FREE</span></div>
            <v-divider class="my-2"></v-divider>
            <div class="d-flex justify-space-between text-h6 font-weight-bold">
              <span>Total Amount</span><span class="text-primary">₹{{ total.toFixed(2) }}</span>
            </div>
          </div>

          <v-btn color="primary" block size="large" class="mt-6 font-weight-bold" @click="confirmOrder" :disabled="isAddingNew">
            Place Order
          </v-btn>
        </v-card>
      </v-col>
    </v-row>

    <v-sheet v-else class="d-flex flex-column align-center justify-center py-16 text-center bg-transparent">
      <v-avatar size="150" color="grey-lighten-4" class="mb-6">
        <v-icon size="80" color="grey-lighten-1">mdi-cart-off</v-icon>
      </v-avatar>
      <h2 class="text-h4 font-weight-bold mb-2">Your cart is empty!</h2>
      <v-btn color="primary" size="large" rounded="pill" @click="router.push('/home')" class="mt-6 px-8">Start Shopping</v-btn>
    </v-sheet>
  </v-container>
</template>

<style scoped>
.checkout-container { max-width: 1200px; margin: 0 auto; }
.sticky-card { position: sticky; top: 90px; }
.cart-controls { display: inline-flex; align-items: center; background: #fff; }
.border-primary { border: 2px solid #1867C0 !important; }
</style>