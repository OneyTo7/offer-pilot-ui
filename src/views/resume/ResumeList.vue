<template>
  <PageContainer title="简历管理" subtitle="管理你的简历，上传 PDF 自动解析">
    <template #action>
      <el-upload
        :show-file-list="false"
        :before-upload="handleUpload"
        accept=".pdf,application/pdf"
      >
        <el-button type="primary" :loading="uploading">
          <el-icon><Upload /></el-icon>
          上传简历
        </el-button>
      </el-upload>
    </template>

    <el-table :data="resumes" v-loading="loading" @row-click="handleRowClick">
      <el-table-column prop="name" label="文件名" min-width="200" />
      <el-table-column prop="file_size" label="大小" width="100">
        <template #default="{ row }">
          {{ formatSize(row.file_size) }}
        </template>
      </el-table-column>
      <el-table-column prop="page_count" label="页数" width="80" align="center" />
      <el-table-column prop="status" label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column label="默认" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.is_default" type="success" size="small" effect="plain">默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="上传时间" width="180" />
      <el-table-column label="操作" min-width="180" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <el-button size="small" @click.stop="handleView(row.id)">查看</el-button>
            <el-button
              v-if="!row.is_default"
              size="small"
              text
              type="primary"
              @click.stop="handleSetDefault(row.id)"
            >设为默认</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" text type="danger" @click.stop>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getResumeList, uploadResume, deleteResume, setDefaultResume } from '../../api/resume'
import type { ResumeVO } from '../../types/api'
import PageContainer from '../../components/PageContainer.vue'

const router = useRouter()
const resumes = ref<ResumeVO[]>([])
const loading = ref(false)
const uploading = ref(false)

onMounted(() => fetchList())

async function fetchList() {
  loading.value = true
  try {
    const res = await getResumeList()
    resumes.value = res.data.data
  } finally {
    loading.value = false
  }
}

async function handleUpload(file: File) {
  uploading.value = true
  try {
    await uploadResume(file)
    ElMessage.success('上传成功，简历正在解析中...')
    fetchList()
  } catch (e: unknown) {
    ElMessage.error((e as { response?: { data?: { message?: string } } })?.response?.data?.message || '上传失败')
  } finally {
    uploading.value = false
  }
  return false
}

async function handleDelete(id: number) {
  try {
    await deleteResume(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleSetDefault(id: number) {
  try {
    await setDefaultResume(id)
    ElMessage.success('已设为默认简历')
    fetchList()
  } catch {
    ElMessage.error('设置失败')
  }
}

function handleView(id: number) {
  router.push(`/resumes/${id}`)
}

function handleRowClick(row: ResumeVO) {
  handleView(row.id)
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + 'B'
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'KB'
  return (bytes / 1024 / 1024).toFixed(1) + 'MB'
}

function statusType(status: number) {
  return status === 0 ? 'warning' : status === 1 ? 'success' : 'danger'
}

function statusLabel(status: number) {
  return status === 0 ? '解析中' : status === 1 ? '已完成' : '失败'
}
</script>