<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useAuthStore } from './stores/auth'
import { getAccessToken } from './utils/token'

const authStore = useAuthStore()

onMounted(async () => {
  if (getAccessToken()) {
    await authStore.fetchUserInfo()
  }
})
</script>