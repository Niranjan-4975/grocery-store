<script setup lang="ts">
import { defineProps, defineEmits } from "vue";

const { icon, size, tooltip, badge, color } = defineProps<{
  icon: string;
  size?: string;
  tooltip?: string;
  badge?: number;
  color?: string;
}>();

const emit = defineEmits(["click"]);

function handleClick(event: MouseEvent) {
  event.stopPropagation();
  emit("click", event);
}
</script>

<template>
  <v-tooltip v-if="tooltip" bottom>
    <template #activator="{ props: tooltipProps }">
      <v-btn
        v-bind="tooltipProps"
        icon
        :color="color || 'primary'"
        :size="size || 'default'"
        @click="handleClick"
      >
        <v-icon :icon="icon" :size="size ==='small' ? '16' :size || undefined" /> <!-- Correct way to bind Vuetify icon -->
        <v-badge
          v-if="badge && badge > 0"
          :content="badge"
          color="red"
          overlap
          class="ma-0 pa-0"
        />
      </v-btn>
    </template>
    {{ tooltip }}
  </v-tooltip>

  <v-btn v-else icon :color="color || 'primary'" @click="handleClick">
    <v-icon :icon="icon" :size="size || undefined"/>
    <v-badge
      v-if="badge && badge > 0"
      :content="badge"
      color="red"
      overlap
      class="ma-0 pa-0"
    />
  </v-btn>
</template>
