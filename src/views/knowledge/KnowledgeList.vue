<template>
  <PageContainer title="知识库" subtitle="管理面试知识库文档，用于 AI 检索增强">
    <template #action>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        添加文档
      </el-button>
    </template>

    <el-table :data="documents" v-loading="loading" @row-click="handleRowClick">
      <el-table-column prop="title" label="标题" min-width="200" />
      <el-table-column prop="content_type" label="类型" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="contentTypeTag(row.content_type)" size="small">
            {{ row.content_type === 'text' ? '文本' : '文件' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag
            :type="row.status === 0 ? 'warning' : row.status === 1 ? 'success' : 'danger'"
            size="small"
          >
            {{ row.status === 0 ? '索引中' : row.status === 1 ? '已完成' : '失败' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" min-width="140" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <el-button size="small" @click.stop="goChunks(row)">分片</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" text type="danger" @click.stop>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加文档对话框 -->
    <el-dialog v-model="showDialog" title="添加文档" width="500px" :close-on-click-modal="false">
      <el-form :model="form" label-width="80px">
        <el-form-item label="标题" prop="title">
          <el-input v-model="form.title" />
        </el-form-item>
        <el-form-item label="类型" prop="content_type">
          <el-radio-group v-model="form.content_type">
            <el-radio value="text">文本</el-radio>
            <el-radio value="file">文件</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item v-if="form.content_type === 'text'" label="内容" prop="content">
          <el-input v-model="form.content" type="textarea" :rows="6" />
        </el-form-item>
        <el-form-item v-else-if="form.content_type === 'file'" label="文件">
          <el-upload
            :auto-upload="false"
            :limit="1"
            accept=".md,.markdown,.txt"
            :on-change="handleFileChange"
            :on-remove="handleFileRemove"
            :on-exceed="handleFileExceed"
            :before-upload="() => false"
          >
            <el-button>选择文件</el-button>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">保存</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getKnowledgeList, createKnowledge, deleteKnowledge, uploadKnowledge } from '../../api/knowledge'
import type { KnowledgeDocumentVO } from '../../types/api'
import type { UploadFile, UploadFiles } from 'element-plus'
import PageContainer from '../../components/PageContainer.vue'

const router = useRouter()

const documents = ref<KnowledgeDocumentVO[]>([])
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)

const form = ref({
  title: '',
  content_type: 'text',
  content: '',
  file: null as File | null,
})

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
  // 按类型校验（文件上传标题可省略，后端会用文件名兜底）
  if (form.value.content_type === 'text') {
    if (!form.value.title.trim()) {
      ElMessage.warning('请输入标题')
      return
    }
    if (!form.value.content.trim()) {
      ElMessage.warning('请输入内容')
      return
    }
  } else if (form.value.content_type === 'file' && !form.value.file) {
    ElMessage.warning('请选择文件')
    return
  }

  submitting.value = true
  try {
    if (form.value.content_type === 'file') {
      const fd = new FormData()
      fd.append('file', form.value.file!)
      if (form.value.title.trim()) {
        fd.append('title', form.value.title.trim())
      }
      await uploadKnowledge(fd)
    } else {
      await createKnowledge({
        title: form.value.title,
        content_type: form.value.content_type,
        content: form.value.content,
      })
    }
    ElMessage.success('添加成功')
    showDialog.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

function handleFileChange(file: UploadFile) {
  if (file.raw) {
    form.value.file = file.raw
  }
}

function handleFileRemove() {
  form.value.file = null
}

function handleFileExceed(files: UploadFiles) {
  // 仅允许一个文件，超出时提示替换
  ElMessage.warning(`最多上传 1 个文件，已忽略 ${files.length} 个`)
}

function goChunks(row: KnowledgeDocumentVO) {
  router.push({ path: `/knowledge/${row.id}/chunks`, query: { title: row.title } })
}

function handleDelete(id: number) {
  deleteKnowledge(id).then(() => {
    ElMessage.success('删除成功')
    fetchList()
  }).catch(() => {
    ElMessage.error('删除失败')
  })
}

function handleRowClick(_row: KnowledgeDocumentVO) {
  // 暂无详情页
}

function contentTypeTag(type: string) {
  return type === 'text' ? 'default' : type === 'file' ? 'primary' : 'warning'
}
</script>