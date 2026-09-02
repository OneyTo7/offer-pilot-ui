<template>
  <PageContainer title="知识分片" :subtitle="chunksTitle || `文档 #${docId}`">
    <template #action>
      <el-button @click="goBack">
        <el-icon><Back /></el-icon>
        返回
      </el-button>
    </template>

    <el-table :data="chunks" v-loading="loading" empty-text="暂无分片" style="width: 100%">
      <el-table-column type="expand">
        <template #default="{ row }">
          <div class="expand-wrap">
            <div class="expand-label">完整内容</div>
            <pre class="expand-content">{{ row.content }}</pre>
            <template v-if="hasMeta(row)">
              <div class="expand-label">元数据</div>
              <pre class="expand-content">{{ JSON.stringify(row.metadata, null, 2) }}</pre>
            </template>
          </div>
        </template>
      </el-table-column>
      <el-table-column label="序号" width="70" align="center">
        <template #default="{ row, $index }">{{ row.index ?? $index + 1 }}</template>
      </el-table-column>
      <el-table-column label="分片 ID" width="120">
        <template #default="{ row }">
          <span :title="row.id">{{ row.id?.slice(0, 8) }}</span>
        </template>
      </el-table-column>
      <el-table-column label="内容" min-width="320" show-overflow-tooltip>
        <template #default="{ row }">{{ row.content }}</template>
      </el-table-column>
      <el-table-column label="元数据" min-width="220" show-overflow-tooltip>
        <template #default="{ row }">{{ row.metadata ? JSON.stringify(row.metadata) : '-' }}</template>
      </el-table-column>
    </el-table>
  </PageContainer>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import { Back } from '@element-plus/icons-vue'
import { getKnowledgeChunks } from '../../api/knowledge'
import type { KnowledgeChunkVO } from '../../types/api'
import PageContainer from '../../components/PageContainer.vue'

const route = useRoute()
const router = useRouter()

const docId = computed(() => Number(route.params.id))
const chunksTitle = computed(() => String(route.query.title ?? ''))

const loading = ref(false)
const chunks = ref<KnowledgeChunkVO[]>([])

onMounted(fetchChunks)

async function fetchChunks() {
  loading.value = true
  try {
    const res = await getKnowledgeChunks(docId.value)
    chunks.value = res.data.data
  } catch {
    ElMessage.error('获取分片失败')
  } finally {
    loading.value = false
  }
}

function hasMeta(chunk: KnowledgeChunkVO) {
  return chunk.metadata != null && Object.keys(chunk.metadata).length > 0
}

function goBack() {
  router.back()
}
</script>

<style scoped>
.expand-wrap {
  padding: 8px 16px;
}

.expand-label {
  font-size: 12px;
  color: var(--el-text-color-secondary);
  margin-bottom: 6px;
}

.expand-content {
  margin: 0 0 12px;
  padding: 12px;
  background: var(--el-fill-color-lighter);
  border-radius: 6px;
  font-size: 13px;
  line-height: 1.7;
  white-space: pre-wrap;
  word-break: break-word;
}
</style>
