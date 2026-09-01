import { createRouter, createWebHistory } from 'vue-router'
import { getAccessToken } from '../utils/token'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/login',
      name: 'Login',
      component: () => import('../views/auth/Login.vue'),
      meta: { guest: true },
    },
    {
      path: '/register',
      name: 'Register',
      component: () => import('../views/auth/Register.vue'),
      meta: { guest: true },
    },
    {
      path: '/',
      component: () => import('../components/AppLayout.vue'),
      meta: { requiresAuth: true },
      redirect: '/dashboard',
      children: [
        {
          path: 'dashboard',
          name: 'Dashboard',
          component: () => import('../views/dashboard/Dashboard.vue'),
        },
        {
          path: 'resumes',
          name: 'ResumeList',
          component: () => import('../views/resume/ResumeList.vue'),
        },
        {
          path: 'resumes/:id',
          name: 'ResumeDetail',
          component: () => import('../views/resume/ResumeDetail.vue'),
        },
        {
          path: 'positions',
          name: 'PositionList',
          component: () => import('../views/position/PositionList.vue'),
        },
        {
          path: 'reports',
          name: 'ReportList',
          component: () => import('../views/report/ReportList.vue'),
        },
        {
          path: 'reports/:id',
          name: 'ReportDetail',
          component: () => import('../views/report/ReportDetail.vue'),
        },
        {
          path: 'interviews',
          name: 'InterviewList',
          component: () => import('../views/interview/InterviewList.vue'),
        },
        {
          path: 'interviews/:id',
          name: 'InterviewSession',
          component: () => import('../views/interview/InterviewSession.vue'),
        },
        {
          path: 'knowledge',
          name: 'KnowledgeList',
          component: () => import('../views/knowledge/KnowledgeList.vue'),
        },
        {
          path: 'settings',
          name: 'Settings',
          component: () => import('../views/settings/Settings.vue'),
        },
      ],
    },
  ],
})

router.beforeEach((to, _from, next) => {
  const isAuthenticated = getAccessToken()
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } else if (to.meta.guest && isAuthenticated) {
    next('/dashboard')
  } else {
    next()
  }
})

export default router