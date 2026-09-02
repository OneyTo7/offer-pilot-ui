<template>
  <PageContainer title="目标职位" subtitle="设定你的目标岗位，AI 将据此进行匹配分析">
    <template #action>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        添加职位
      </el-button>
    </template>

    <el-table :data="positions" v-loading="loading" @row-click="handleRowClick">
      <el-table-column prop="title" label="职位名称" min-width="160" />
      <el-table-column prop="company" label="公司" width="150" />
      <el-table-column prop="location" label="城市" width="100" />
      <el-table-column label="薪资范围" width="150">
        <template #default="{ row }">
          {{ row.salary_range || '-' }}
        </template>
      </el-table-column>
      <el-table-column label="默认" width="80" align="center">
        <template #default="{ row }">
          <el-tag v-if="row.is_default" type="success" size="small" effect="plain">默认</el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="创建时间" width="180" />
      <el-table-column label="操作" min-width="160" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
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

    <!-- 添加职位对话框 -->
    <el-dialog v-model="showDialog" title="添加目标职位" width="560px" :close-on-click-modal="false">
      <el-form ref="formRef" :model="form" :rules="rules" label-width="80px">
        <el-form-item label="职位名称" prop="title">
          <el-input v-model="form.title" placeholder="如：高级 Java 工程师" />
        </el-form-item>
        <el-form-item label="公司">
          <el-input v-model="form.company" placeholder="可选" />
        </el-form-item>
        <el-form-item label="城市">
          <el-input v-model="form.city" placeholder="可选" />
        </el-form-item>
        <el-form-item label="最低薪资">
          <el-input-number v-model="form.salary_min" :min="0" :step="1" :precision="0" />
        </el-form-item>
        <el-form-item label="最高薪资">
          <el-input-number v-model="form.salary_max" :min="0" :step="1" :precision="0" />
        </el-form-item>
        <el-form-item label="JD 描述" prop="jd_text">
          <el-input v-model="form.jd_text" type="textarea" :rows="6" placeholder="职位描述、任职要求..." />
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
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPositionList, createPosition, deletePosition, setDefaultPosition } from '../../api/position'
import type { PositionVO } from '../../types/api'
import PageContainer from '../../components/PageContainer.vue'

const positions = ref<PositionVO[]>([])
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const formRef = ref()

const form = reactive({
  title: '',
  company: '',
  city: '',
  salary_min: 0,
  salary_max: 0,
  jd_text: '',
})

const rules = {
  title: [{ required: true, message: '请输入职位名称', trigger: 'blur' }],
  jd_text: [{ required: true, message: '请输入职位描述', trigger: 'blur' }],
}

onMounted(() => {
  fetchList()
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getPositionList()
    positions.value = res.data.data
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  const valid = await formRef.value.validate().catch(() => false)
  if (!valid) return
  submitting.value = true
  try {
    await createPosition({
      title: form.title,
      company: form.company,
      jd_text: form.jd_text,
      city: form.city,
      salary_min: form.salary_min,
      salary_max: form.salary_max,
    })
    ElMessage.success('添加成功')
    showDialog.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await deletePosition(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}

async function handleSetDefault(id: number) {
  try {
    await setDefaultPosition(id)
    ElMessage.success('已设为默认')
    fetchList()
  } catch {
    ElMessage.error('设置失败')
  }
}

function handleRowClick(_row: PositionVO) {
  // 无详情页，仅做占位
}
</script>