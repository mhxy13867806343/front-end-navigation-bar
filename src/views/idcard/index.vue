<template>
  <div class="idcard-page">
    <!-- Header -->
    <div class="header-card">
      <button class="back-btn" @click="goBack">
        ← 返回工具箱
      </button>
      <div class="title">🪪 身份证信息查询与 15 位升级</div>
      <div style="width: 100px;"></div>
    </div>

    <!-- Query Input Box -->
    <div class="query-box-card">
      <div class="mode-switch">
        <button
          class="mode-btn"
          :class="{ active: mode === 'query' }"
          @click="mode = 'query'"
        >
          🪪 归属地发证机关查询
        </button>
        <button
          class="mode-btn"
          :class="{ active: mode === 'upgrade' }"
          @click="mode = 'upgrade'"
        >
          🚀 15 位旧卡号升级 18 位
        </button>
      </div>

      <div class="input-row">
        <input
          v-model="inputNo"
          type="text"
          class="id-input"
          :placeholder="mode === 'upgrade' ? '请输入15位旧身份证号' : '请输入15位或18位身份证号码'"
          @keyup.enter="handleQuery"
        />
        <button class="submit-btn" :disabled="loading" @click="handleQuery">
          {{ loading ? '查询中...' : (mode === 'upgrade' ? '升级生成' : '立即查询') }}
        </button>
      </div>
    </div>

    <!-- Error message -->
    <div v-if="errorMessage" style="margin-bottom: 20px; padding: 12px 18px; background: rgba(239, 68, 68, 0.15); border: 1px solid rgba(239, 68, 68, 0.3); border-radius: 12px; color: #fca5a5; font-size: 14px;">
      ⚠️ {{ errorMessage }}
    </div>

    <!-- Result Display -->
    <div v-if="infoData && (mode === 'query' || !upgradeResult)" class="result-card">
      <div v-if="mode === 'upgrade' && !upgradeResult" style="color: #fbbf24; font-size: 13px; margin-bottom: 12px;">
        💡 该身份证号已为 18 位标准格式，无须升级。为您展示归属地与详细信息：
      </div>
      <div class="res-title">
        📍 归属地发证机关：{{ infoData.address || infoData.province + (infoData.city || '') + (infoData.county || '') }}
      </div>

      <div class="info-grid">
        <div class="info-item">
          <div class="item-label">🏛️ 行政区划代码</div>
          <div class="item-val highlight">{{ infoData.address_code || '已校验' }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">🎂 出生日期</div>
          <div class="item-val green">{{ infoData.birthday }} ({{ infoData.age }} 周岁)</div>
        </div>

        <div class="info-item">
          <div class="item-label">👤 性别</div>
          <div class="item-val" :class="infoData.sex === 1 ? 'highlight' : 'pink'">
            {{ infoData.sex === 1 ? '♂ 男' : '♀ 女' }}
          </div>
        </div>

        <div class="info-item">
          <div class="item-label">✨ 所属星座</div>
          <div class="item-val purple">{{ infoData.constellation }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">🐴 生肖属相</div>
          <div class="item-val amber">{{ infoData.zodiac }}</div>
        </div>

        <div class="info-item">
          <div class="item-label">🗺️ 省/市/县</div>
          <div class="item-val">{{ infoData.province }} {{ infoData.city }} {{ infoData.county }}</div>
        </div>
      </div>
    </div>

    <!-- Upgrade Result Display -->
    <div v-else-if="upgradeResult && mode === 'upgrade'" class="result-card">
      <div class="res-title">
        🎉 15 位身份证成功升级为 18 位新标准号！
      </div>
      <div style="font-size: 15px; line-height: 1.8; color: #cbd5e1;">
        <div>原始 15 位卡号：<code style="background: rgba(255,255,255,0.1); padding: 4px 10px; border-radius: 6px; color: #93c5fd;">{{ upgradeResult.id }}</code></div>
        <div style="margin-top: 8px;">升级 18 位卡号：<strong style="font-size: 20px; color: #4ade80; font-family: monospace; margin-left: 8px;">{{ upgradeResult.new_id }}</strong></div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { resolveApiUrl } from '../../utils/resolveApiUrl'

const router = useRouter()
const mode = ref<'query' | 'upgrade'>('query')
const inputNo = ref<string>('')
const loading = ref<boolean>(false)
const errorMessage = ref<string>('')
const infoData = ref<any>(null)
const upgradeResult = ref<any>(null)

function goBack(): void {
  router.push('/toolbox')
}

async function handleQuery(): Promise<void> {
  const query = inputNo.value.trim()
  if (!query) {
    errorMessage.value = '请输入身份证号码'
    return
  }

  loading.value = true
  errorMessage.value = ''
  infoData.value = null
  upgradeResult.value = null

  try {
    const endpoint = mode.value === 'upgrade' ? '/api/idcard/upgrade' : '/api/idcard'
    const url = resolveApiUrl(`/api-alapi${endpoint}?token=qgqofofvmxtoskffd37omkscobipmn&id=${encodeURIComponent(query)}`)
    const res = await fetch(url)
    if (!res.ok) throw new Error(`HTTP ${res.status}`)
    const json = await res.json()
    if ((json.code === 200 || json.success) && json.data) {
      if (mode.value === 'upgrade') {
        upgradeResult.value = json.data
      } else {
        infoData.value = json.data
      }
    } else {
      throw new Error(json.message || '身份证号不合法')
    }
  } catch (err: any) {
    console.warn('ALAPI 接口调用异常，尝试本地校验解析:', err)
    errorMessage.value = err.message || '查询失败'
  } finally {
    loading.value = false
  }
}
</script>

<style scoped lang="scss" src="./css/index.scss"></style>
