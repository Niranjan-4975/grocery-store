<script setup lang="ts">

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
  <v-badge
    v-if="badge && badge > 0"
    :content="badge"
    color="red"
    overlap
    class="ma-0 pa-0"
  >
    <v-tooltip v-if="tooltip" bottom>
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon
          :color="color || 'primary'"
          :size="size || 'default'"
          @click="handleClick"
        >
          <v-icon :icon="icon" :size="size === 'small' ? '18' : undefined" /> <!-- Correct way to bind Vuetify icon -->
        </v-btn>
      </template>
      <span>{{ $t(tooltip) }}</span>
    </v-tooltip>

    <v-btn
      v-else
      icon
      :color="color || 'primary'"
      :size="size || 'default'"
      @click="handleClick"
    >
      <v-icon :icon="icon" />
    </v-btn>
  </v-badge>
  <template v-else>
    <v-tooltip v-if="tooltip" location="bottom">
      <template #activator="{ props: tooltipProps }">
        <v-btn
          v-bind="tooltipProps"
          icon
          :color="color || 'primary'"
          :size="size || 'default'"
          @click="handleClick"
        >
          <v-icon :icon="icon" />
        </v-btn>
      </template>
      <span>{{ $t(tooltip) }}</span>
    </v-tooltip>
    <v-btn
      v-else
      icon
      :color="color || 'primary'"
      :size="size || 'default'"
      @click="handleClick"
    >
      <v-icon :icon="icon" />
    </v-btn>
  </template>
</template>
