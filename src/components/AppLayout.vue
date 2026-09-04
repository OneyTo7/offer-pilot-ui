<template>
  <el-container class="app-container">
    <!-- 侧边栏 -->
    <el-aside :width="isCollapsed ? '64px' : '240px'" class="app-aside">
      <!-- 品牌 Logo -->
      <div class="brand">
        <div class="brand-icon">
          <span class="brand-mark">面</span>
        </div>
        <transition name="fade">
          <div v-if="!isCollapsed" class="brand-text">
            <span class="brand-title">面壁</span>
            <span class="brand-subtitle">OfferPilot</span>
          </div>
        </transition>
      </div>

      <!-- 导航菜单 -->
      <el-menu
        :default-active="activeMenu"
        :collapse="isCollapsed"
        :router="true"
        class="sidebar-menu"
      >
        <el-menu-item index="/dashboard">
          <el-icon><Odometer /></el-icon>
          <template #title>仪表盘</template>
        </el-menu-item>
        <el-menu-item index="/resumes">
          <el-icon><Document /></el-icon>
          <template #title>简历管理</template>
        </el-menu-item>
        <el-menu-item index="/positions">
          <el-icon><Briefcase /></el-icon>
          <template #title>目标职位</template>
        </el-menu-item>
        <el-menu-item index="/reports">
          <el-icon><DataAnalysis /></el-icon>
          <template #title>评估报告</template>
        </el-menu-item>
        <el-menu-item index="/interviews">
          <el-icon><ChatDotSquare /></el-icon>
          <template #title>模拟面试</template>
        </el-menu-item>
        <el-menu-item index="/assistant">
          <el-icon><ChatLineSquare /></el-icon>
          <template #title>AI 小助手</template>
        </el-menu-item>
        <el-menu-item index="/ai">
          <el-icon><Cpu /></el-icon>
          <template #title>大模型</template>
        </el-menu-item>
        <el-menu-item index="/knowledge">
          <el-icon><Collection /></el-icon>
          <template #title>知识库</template>
        </el-menu-item>
      </el-menu>
    </el-aside>

    <!-- 右侧主区域 -->
    <el-container>
      <!-- 顶部栏 -->
      <el-header class="app-header">
        <div class="header-left">
          <el-icon class="collapse-btn" @click="isCollapsed = !isCollapsed">
            <Fold v-if="!isCollapsed" />
            <Expand v-else />
          </el-icon>
          <span class="header-breadcrumb">{{ breadcrumbTitle }}</span>
        </div>
        <div class="header-right">
          <el-dropdown trigger="click">
            <span class="user-info">
              <span class="user-avatar">
                {{ (authStore.user?.nickname || '用').charAt(0) }}
              </span>
              <span class="user-name">{{ authStore.user?.nickname || '用户' }}</span>
              <el-icon class="user-arrow"><ArrowDown /></el-icon>
            </span>
            <template #dropdown>
              <el-dropdown-menu>
                <el-dropdown-item @click="router.push('/settings')">
                  <el-icon style="margin-right: 4px"><Setting /></el-icon>
                  设置
                </el-dropdown-item>
                <el-dropdown-item divided @click="handleLogout">
                  <el-icon style="margin-right: 4px"><SwitchButton /></el-icon>
                  退出登录
                </el-dropdown-item>
              </el-dropdown-menu>
            </template>
          </el-dropdown>
        </div>
      </el-header>

      <!-- 主内容 -->
      <el-main class="app-main">
        <router-view />
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const route = useRoute()
const router = useRouter()
const authStore = useAuthStore()
const isCollapsed = ref(false)

const activeMenu = computed(() => {
  const path = route.path
  const segments = path.split('/')
  if (segments.length >= 2) {
    return '/' + segments[1]
  }
  return path
})

const breadcrumbTitle = computed(() => {
  const routeMap: Record<string, string> = {
    '/dashboard': '仪表盘',
    '/resumes': '简历管理',
    '/positions': '目标职位',
    '/reports': '评估报告',
    '/interviews': '模拟面试',
    '/assistant': 'AI 小助手',
    '/ai': '大模型配置',
    '/knowledge': '知识库',
    '/settings': '设置',
  }
  return routeMap[activeMenu.value] || ''
})

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
/* ============================================
   布局容器
   ============================================ */
.app-container {
  height: 100vh;
}

/* ============================================
   侧边栏
   ============================================ */
.app-aside {
  background: var(--color-sidebar-bg);
  transition: width 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  z-index: 100;
  box-shadow: var(--shadow-sidebar);
}

/* ---- 品牌 Logo ---- */
.brand {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
}

.brand-icon {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, var(--color-primary), #818cf8);
  border-radius: 8px;
}

.brand-mark {
  font-family: var(--font-display);
  font-size: 18px;
  font-weight: 700;
  color: #fff;
  line-height: 1;
}

.brand-text {
  display: flex;
  flex-direction: column;
  white-space: nowrap;
  overflow: hidden;
}

.brand-title {
  font-family: var(--font-display);
  font-size: 16px;
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
}

.brand-subtitle {
  font-size: 11px;
  font-weight: 500;
  color: var(--color-primary);
  line-height: 1.2;
  letter-spacing: 0.5px;
}

/* ---- 折叠状态品牌 ---- */
.brand .fade-enter-active,
.brand .fade-leave-active {
  transition: opacity 0.2s ease;
}
.brand .fade-enter-from,
.brand .fade-leave-to {
  opacity: 0;
}

/* ---- 导航菜单 ---- */
.sidebar-menu {
  flex: 1;
  background: transparent;
  border-right: none;
  padding: 8px 0;
}

/* 菜单项 */
.sidebar-menu .el-menu-item {
  display: flex;
  align-items: center;
  height: 44px;
  line-height: 44px;
  margin: 2px 8px;
  padding: 0 12px;
  border-radius: 8px;
  color: var(--color-sidebar-text);
  font-size: 14px;
  transition: all 0.15s ease;
}

.sidebar-menu .el-menu-item:hover {
  background: var(--color-sidebar-hover);
  color: #e2e8f0;
}

.sidebar-menu .el-menu-item.is-active {
  background: rgba(79, 70, 229, 0.12);
  color: var(--color-sidebar-text-active);
  font-weight: 500;
  position: relative;
}

.sidebar-menu .el-menu-item.is-active::before {
  content: '';
  position: absolute;
  left: 0;
  top: 50%;
  transform: translateY(-50%);
  width: 3px;
  height: 20px;
  background: var(--color-primary);
  border-radius: 0 3px 3px 0;
}

.sidebar-menu .el-menu-item .el-icon {
  font-size: 18px;
  margin-right: 8px;
  color: inherit;
}

/* 折叠态 */
.sidebar-menu .el-menu-item.is-active .el-icon {
  color: var(--color-primary);
}

/* ============================================
   顶部栏
   ============================================ */
.app-header {
  background: var(--color-bg-card);
  border-bottom: 1px solid var(--color-border);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 24px;
  height: 56px !important;
  flex-shrink: 0;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.collapse-btn {
  font-size: 18px;
  cursor: pointer;
  color: var(--color-text-muted);
  transition: color 0.2s ease;
}

.collapse-btn:hover {
  color: var(--color-text-primary);
}

.header-breadcrumb {
  font-size: 14px;
  font-weight: 500;
  color: var(--color-text-primary);
}

.header-right {
  display: flex;
  align-items: center;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 8px;
  transition: background 0.15s ease;
}

.user-info:hover {
  background: var(--color-bg-subtle);
}

.user-avatar {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-primary);
  color: #fff;
  font-size: 13px;
  font-weight: 600;
  border-radius: 50%;
  flex-shrink: 0;
}

.user-name {
  font-size: 13px;
  color: var(--color-text-secondary);
  font-weight: 500;
}

.user-arrow {
  font-size: 12px;
  color: var(--color-text-muted);
}

/* ============================================
   主内容区
   ============================================ */
.app-main {
  background: var(--color-bg-page);
  padding: 24px;
  overflow-y: auto;
}
</style>