<template>
  <div class="knowledge-list">
    <div class="page-header">
      <h2>知识库</h2>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon> 添加文档
      </el-button>
    </div>

    <el-table :data="documents" v-loading="loading" stripe>
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="content_type" label="类型" width="120">
        <template #default="{ row }">
          <el-tag>{{ row.content_type }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'warning' : row.status === 1 ? 'success' : 'danger'">
            {{ row.status === 0 ? '索引中' : row.status === 1 ? '已完成' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleView(row)">查看</el-button>
          <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
            <template #reference>
              <el-button size="small" type="danger">删除</el-button>
            </template>
          </el-popconfirm>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加文档对话框 -->
    <el-dialog v-model="showDialog" title="添加文档" width="500px">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="类型" prop="content_type">
          <el-radio-group v-model="form.content_type">
            <el-radio value="text">文本</el-radio>
            <el-radio value="file">文件</el-radio>
            <el-radio value="url">URL</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.content_type === 'text'" label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item v-else-if="form.content_type === 'file'" label="文件">
          <el-upload :show-file-list="true" :before-upload="handleFileUpload">
            <el-button>选择文件</el-button>
          </el-upload>
        </el-form-item>
        <el-form-item v-else-if="form.content_type === 'url'" label="URL">
          <el-input v-model="form.url" placeholder="https://..." />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getKnowledgeList, createKnowledge, deleteKnowledge } from '../../api/knowledge'
import type { KnowledgeDocumentVO } from '../../types/api'

const documents = ref<KnowledgeDocumentVO[]>([])
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = ref({
  title: '',
  content_type: 'text',
  content: '',
  url: '',
  file: null as File | null,
})

const rules = {
  title: [{ required: true, message: '请输入标题', trigger: 'blur' }],
}

// 需要先创建 api/knowledge.ts
onMounted(() => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const res = await getKnowledgeList()
    documents.value = res.data.data
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await createKnowledge({
      title: form.value.title,
      content_type: form.value.content_type,
      content: form.value.content,
      url: form.value.url,
    })
    ElMessage.success('添加成功')
    showDialog.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

function handleFileUpload(file: File) {
  form.value.file = file
  return false
}

function handleView(_row: unknown) {
  ElMessage.info('查看详情功能开发中')
}

async function handleDelete(id: number) {
  try {
    await deleteKnowledge(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}
</script>

<style scoped>
.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}
</style>