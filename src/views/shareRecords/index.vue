<script setup lang="ts">
import { computed } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Refresh } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'
import { type ShareRecord, useShareRecords } from '@/composables/useShareRecords'

const router = useRouter()
const { shareRecordsList, loadShareRecords, clearShareRecords, copyShareLink } = useShareRecords()

const stats = computed(() => {
  const pageCount = shareRecordsList.value.filter((item: ShareRecord): boolean => item.type === 'page').length
  const itemCount = shareRecordsList.value.length - pageCount
  const clickCount = shareRecordsList.value.reduce((sum: number, item: ShareRecord): number => sum + item.count, 0)
  return {
    pages: pageCount,
    items: itemCount,
    clicks: clickCount,
    total: shareRecordsList.value.length
  }
})

const cloudTags = computed<Array<ShareRecord & { tone: number }>>(() => {
  return shareRecordsList.value.slice(0, 80).map((item: ShareRecord, index: number) => ({
    ...item,
    tone: index % 5 + 1
  }))
})

function formatTime(timestamp: number): string {
  return new Intl.DateTimeFormat('zh-CN', {
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(timestamp))
}

function openRecord(item: ShareRecord): void {
  window.open(item.url, '_blank', 'noopener,noreferrer')
}

async function copyRecord(item: ShareRecord): Promise<void> {
  try {
    await copyShareLink(item)
  } catch {
    ElMessage({ message: '复制失败，请手动复制链接', type: 'error', duration: 1200 })
  }
}

async function clearAll(): Promise<void> {
  try {
    await ElMessageBox.confirm('确定要清空全部分享点击记录吗？', '清空分享记录', {
      confirmButtonText: '确认清空',
      cancelButtonText: '再想想',
      type: 'warning',
      lockScroll: false
    })
    clearShareRecords()
    ElMessage({ message: '分享记录已清空', type: 'success', duration: 1200 })
  } catch {
    // keep records
  }
}
</script>

<template>
  <main class="share-records-page">
    <section class="share-hero">
      <div>
        <p class="eyebrow">SHARE RECORDS</p>
        <h1>分享记录展示</h1>
        <p class="subtitle">展示已经点击过分享的页面和列表内容，方便回看、复制链接和再次中转。</p>
      </div>
      <div class="hero-actions">
        <button type="button" @click="loadShareRecords">
          <el-icon><Refresh /></el-icon>
          刷新记录
        </button>
        <button type="button" @click="router.push('/records-cache')">收藏记录</button>
        <button type="button" class="danger" :disabled="!shareRecordsList.length" @click="clearAll">清空</button>
      </div>
    </section>

    <section class="stats-strip" aria-label="分享统计">
      <div><strong>{{ stats.pages }}</strong><span>页面分享</span></div>
      <div><strong>{{ stats.items }}</strong><span>列表分享</span></div>
      <div><strong>{{ stats.clicks }}</strong><span>点击次数</span></div>
      <div><strong>{{ stats.total }}</strong><span>记录合计</span></div>
    </section>

    <section class="cloud-panel" aria-label="分享云标签">
      <div v-if="!cloudTags.length" class="empty-state">暂无分享记录，点击页面或列表卡片上的分享按钮后会显示在这里。</div>
      <template v-else>
        <button
          v-for="tag in cloudTags"
          :key="`share-tag-${tag.id}`"
          type="button"
          class="cloud-tag"
          :class="`tone-${tag.tone}`"
          :title="`${tag.title} (${tag.count} 次)`"
          @click="openRecord(tag)"
        >
          <span :title="tag.title">{{ tag.title }}</span>
          <small>{{ tag.count }}</small>
        </button>
      </template>
    </section>

    <section v-if="!shareRecordsList.length" class="empty-state large">
      暂无分享内容。页面顶部的分享按钮、列表卡片里的分享按钮都会写入这里。
    </section>

    <section v-else class="records-grid" aria-label="分享记录卡片">
      <article v-for="item in shareRecordsList" :key="item.id" class="share-card">
        <div class="share-kind">{{ item.type === 'page' ? 'PAGE' : 'ITEM' }} · {{ item.count }} 次</div>
        <h2>{{ item.title }}</h2>
        <p>{{ item.description }}</p>
        <div class="share-meta">
          <span>{{ item.source }}</span>
          <span>{{ formatTime(item.timestamp) }}</span>
        </div>
        <div class="share-tags">
          <span v-for="tag in item.tags.slice(0, 6)" :key="`${item.id}-${tag}`">{{ tag }}</span>
        </div>
        <div class="share-actions">
          <button type="button" @click="openRecord(item)">中转打开</button>
          <button type="button" class="ghost" @click="copyRecord(item)">复制链接</button>
        </div>
      </article>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/index.scss"></style>
