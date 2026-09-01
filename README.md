# 面壁 OfferPilot - 前端

基于 Vue 3 + TypeScript + Vite + Element Plus 构建的 AI 简历智能平台前端。

## 技术栈

- **框架**: Vue 3 (Composition API + `<script setup>`)
- **语言**: TypeScript
- **构建**: Vite
- **UI 组件**: Element Plus
- **状态管理**: Pinia
- **路由**: Vue Router 4
- **HTTP 客户端**: Axios

## 快速开始

```bash
# 安装依赖
npm install

# 启动开发服务器（默认 3000 端口）
npm run dev

# 生产构建
npm run build
```

## 环境变量

复制 `.env.example` 为 `.env` 并配置：

```env
VITE_API_BASE_URL=http://localhost:8080
VITE_DEV_PORT=3000
```

## 项目结构

```
src/
├── api/            # API 请求封装
├── components/     # 公共组件
├── router/         # 路由配置
├── stores/         # Pinia 状态管理
├── types/          # TypeScript 类型定义
├── utils/          # 工具函数
└── views/          # 页面组件
    ├── auth/       # 登录/注册
    ├── dashboard/  # 仪表盘
    ├── resume/     # 简历管理
    ├── position/   # 目标职位
    ├── report/     # 评估报告
    ├── interview/  # 模拟面试
    ├── knowledge/  # 知识库
    └── settings/   # 个人设置
```

## 后端 API

默认代理到 `http://localhost:8080`，可在 `.env` 中通过 `VITE_API_BASE_URL` 配置。