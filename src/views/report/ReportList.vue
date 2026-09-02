<template>
  <PageContainer title="评估报告" subtitle="AI 自动生成的简历与岗位匹配度分析报告">
    <template #action>
      <el-button type="primary" @click="showDialog = true">
        <el-icon><Plus /></el-icon>
        生成报告
      </el-button>
    </template>

    <el-table :data="reports" v-loading="loading" @row-click="handleRowClick">
      <el-table-column prop="id" label="编号" width="80" align="center" />
      <el-table-column prop="resume_name" label="简历" min-width="160" show-overflow-tooltip />
      <el-table-column prop="position_title" label="目标职位" min-width="180" show-overflow-tooltip />
      <el-table-column label="匹配度" width="120" align="center">
        <template #default="{ row }">
          <el-tag
            v-if="row.content?.match_score"
            :type="scoreType(row.content.match_score)"
            size="small"
          >
            {{ row.content.match_score }}%
          </el-tag>
          <span v-else class="text-muted">-</span>
        </template>
      </el-table-column>
      <el-table-column label="状态" width="120" align="center">
        <template #default="{ row }">
          <el-tag :type="row.status === 0 ? 'warning' : row.status === 2 ? 'danger' : 'success'" size="small">
            {{ row.status === 0 ? '生成中' : row.status === 2 ? '失败' : '已完成' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="created_at" label="生成时间" width="180" />
      <el-table-column label="操作" min-width="160" fixed="right">
        <template #default="{ row }">
          <div class="action-btns">
            <el-button size="small" @click.stop="handleView(row.id)">查看</el-button>
            <el-popconfirm title="确定删除？" @confirm="handleDelete(row.id)">
              <template #reference>
                <el-button size="small" text type="danger" @click.stop>删除</el-button>
              </template>
            </el-popconfirm>
          </div>
        </template>
      </el-table-column>
    </el-table>

    <!-- 生成报告对话框 -->
    <el-dialog v-model="showDialog" title="生成评估报告" width="500px" :close-on-click-modal="false">
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
        <el-button type="primary" :loading="submitting" @click="handleCreate">生成</el-button>
      </template>
    </el-dialog>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { getReportList, createReport, deleteReport } from '../../api/report'
import { getResumeList } from '../../api/resume'
import { getPositionList } from '../../api/position'
import type { ReportVO, ResumeVO, PositionVO } from '../../types/api'
import PageContainer from '../../components/PageContainer.vue'

const router = useRouter()
const reports = ref<ReportVO[]>([])
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
    // 非关键数据，对话框会显示空选项
  })
})

async function fetchList() {
  loading.value = true
  try {
    const res = await getReportList()
    reports.value = res.data.data
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
    await createReport(form.value)
    ElMessage.success('报告生成中...')
    showDialog.value = false
    fetchList()
  } finally {
    submitting.value = false
  }
}

async function handleDelete(id: number) {
  try {
    await deleteReport(id)
    ElMessage.success('删除成功')
    fetchList()
  } catch {
    ElMessage.error('删除失败')
  }
}

function handleView(id: number) {
  router.push(`/reports/${id}`)
}

function handleRowClick(row: ReportVO) {
  handleView(row.id)
}

function scoreType(score: number) {
  if (score >= 80) return 'success'
  if (score >= 60) return 'warning'
  return 'danger'
}
</script>

<style scoped>
.text-muted {
  color: var(--color-text-muted);
}
</style>