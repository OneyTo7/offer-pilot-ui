<template>
  <PageContainer title="模拟面试" subtitle="三面制 AI 模拟面试，帮你查漏补缺">
    <template #action>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        开始面试
      </el-button>
    </template>

    <el-table :data="sessions" v-loading="loading" @row-click="handleRowClick">
      <el-table-column prop="id" label="编号" width="80" align="center" />
      <el-table-column label="轮次" width="100" align="center">
        <template #default="{ row }">
          <span>第 {{ row.current_round }} 轮</span>
        </template>
      </el-table-column>
      <el-table-column label="进度" width="160">
        <template #default="{ row }">
          <div class="progress-cell">
            <span>第 {{ row.current_question }} / 10 题</span>
            <el-progress
              :percentage="Math.round((row.current_question / 10) * 100)"
              :stroke-width="4"
              :show-text="false"
              color="var(--color-primary)"
            />
          </div>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="statusType(row.status)" size="small">
            {{ statusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="开始时间" width="180" />
      <el-table-column label="操作" width="150" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <el-button
              size="small"
              :type="row.status === 0 ? 'primary' : 'default'"
              @click.stop="handleView(row.id)"
            >
              {{ row.status === 0 ? '继续' : '查看' }}
            </el-button>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 开始面试对话框 -->
    <el-dialog v-model="showDialog" title="开始模拟面试" width="500px" :close-on-click-modal="false">
      <el-form label-width="80px">
        <el-form-item label="简历">
          <el-select v-model="form.resume_id" placeholder="选择简历" style="width: 100%">
            <el-option v-for="r in resumeList" :key="r.id" :label="r.name" :value="r.id" />
          </el-select>
        </el-form-item>
        <el-form-item label="目标职位">
          <el-select v-model="form.position_id" placeholder="选择目标职位" style="width: 100%">
            <el-option v-for="p in positionList" :key="p.id" :label="`${p.title} - ${p.company}`" :value="p.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showDialog = false">取消</el-button>
        <el-button type="primary" :loading="submitting" @click="handleCreate">开始</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getInterviewList, createInterview } from '../../api/interview'
import { getResumeList } from '../../api/resume'
import { getPositionList } from '../../api/position'
import type { SessionVO, ResumeVO, PositionVO } from '../../types/api'
import PageContainer from '../../components/PageContainer.vue'

const router = useRouter()
const sessions = ref<SessionVO[]>([])
const loading = ref(false)
const showDialog = ref(false)
const submitting = ref(false)
const resumeList = ref<ResumeVO[]>([])
const positionList = ref<PositionVO[]>([])
const form = ref({ resume_id: 0, position_id: 0 })

onMounted(() => {
  fetchList()
  Promise.all([getResumeList(), getPositionList()]).then(([r, p]) => {
    resumeList.value = r.data.data
    positionList.value = p.data.data
  }).catch(() => {
    // 非关键数据
  })
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getInterviewList()
    sessions.value = res.data.data
  } finally {
    loading.value = false
  }
}

async function handleCreate() {
  if (!form.value.resume_id || !form.value.position_id) {
    ElMessage.warning('请选择简历和职位')
    return
  }
  submitting.value = true
  try {
    const res = await createInterview(form.value)
    ElMessage.success('面试已创建')
    showDialog.value = false
    router.push(`/interviews/${res.data.data.id}`)
  } finally {
    submitting.value = false
  }
}

function handleView(id: number) {
  router.push(`/interviews/${id}`)
}

function handleRowClick(row: SessionVO) {
  handleView(row.id)
}

function statusType(status: number) {
  return status === 0 ? 'success' : status === 1 ? 'info' : 'danger'
}

function statusLabel(status: number) {
  return status === 0 ? '进行中' : status === 1 ? '已完成' : '已结束'
}
</script>

<style scoped>
.progress-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}
</style>