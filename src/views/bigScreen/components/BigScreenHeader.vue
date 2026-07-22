<script setup lang="ts">
defineProps<{
  title: string
  subtitle: string
  dateText: string
  timeText: string
}>()
</script>

<template>
  <header class="screen-header panel-card">
    <div>
      <p class="screen-header__eyebrow">智能指挥中枢</p>
      <h1>{{ title }}</h1>
      <p class="screen-header__subtitle">{{ subtitle }}</p>
    </div>

    <div class="screen-header__meta">
      <div class="meta-chip">
        <span>系统状态</span>
        <strong>在线运行</strong>
      </div>
      <div class="meta-chip">
        <span>今日日期</span>
        <strong>{{ dateText }}</strong>
      </div>
      <div class="meta-chip meta-chip--time">
        <span>当前时间</span>
        <strong>{{ timeText }}</strong>
      </div>
    </div>
  </header>
</template>
