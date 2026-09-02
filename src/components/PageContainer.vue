<template>
  <div class="page-container">
    <!-- 页面头部 -->
    <div class="page-header">
      <div class="page-header-left">
        <h1 class="page-title">{{ title }}</h1>
        <p v-if="subtitle" class="page-subtitle">{{ subtitle }}</p>
      </div>
      <div class="page-header-right">
        <slot name="action" />
      </div>
    </div>

    <!-- 页面内容 -->
    <div class="page-body">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
}>()
</script>

<style scoped>
.page-container {
  max-width: 100%;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 20px;
  gap: 16px;
}

.page-header-left {
  flex: 1;
  min-width: 0;
}

.page-title {
  font-family: var(--font-display);
  font-size: 22px;
  font-weight: 700;
  color: var(--color-text-primary);
  margin: 0;
  line-height: 1.3;
}

.page-subtitle {
  font-size: 13px;
  color: var(--color-text-muted);
  margin: 4px 0 0;
  line-height: 1.5;
}

.page-header-right {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding-top: 2px;
}

.page-body {
  background: var(--color-bg-card);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-card);
  overflow: hidden;
}
</style>