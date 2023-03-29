<template>
  <div :class="{ subtitle }" class="ui-section-title">
    <component :is="subtitle ? 'h5' : 'h4'" class="title">
      <slot />
    </component>
  </div>
</template>

<script lang="ts" setup>
defineProps<{
  subtitle?: boolean;
}>();
</script>

<style lang="postcss" scoped>
.ui-section-title {
  display: flex;
  align-items: center;
  justify-content: space-between;

  --section-title-left-size: 2rem;
  --section-title-left-color: var(--color-blue-scale-100);
  --section-title-left-weight: 500;

  &.subtitle {
    --section-title-left-size: 1.5rem;
    --section-title-left-color: var(--color-blue-scale-300);
    --section-title-left-weight: 400;
  }
}

.title {
  font-size: var(--section-title-left-size);
  font-weight: var(--section-title-left-weight);
  color: var(--section-title-left-color);
}
</style>
