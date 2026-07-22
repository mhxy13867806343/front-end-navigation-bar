<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ExampleCard from './components/ExampleCard.vue'
import SceneCanvas from './components/SceneCanvas.vue'
import { getGameById, labGames } from './data/catalog'
import type { SceneTelemetry } from './scenes/runtime'

const route = useRoute()
const router = useRouter()
const activeGameId = ref<string>(String(route.query.game || labGames[0].id))
const telemetry = ref<SceneTelemetry>({ label: '实验区就绪', status: '选择一个小游戏开始体验', score: 0 })
const parameterState = ref<Record<string, string | number | boolean>>({})

const activeGame = computed(() => getGameById(activeGameId.value) || labGames[0])

watch(activeGame, (value) => {
  parameterState.value = Object.fromEntries(value.parameters.map(item => [item.key, item.value]))
}, { immediate: true })

watch(() => route.query.game, (value) => {
  if (typeof value === 'string' && getGameById(value)) activeGameId.value = value
}, { immediate: true })

const selectGame = (id: string): void => {
  activeGameId.value = id
  void router.replace({ path: '/three-showcase/lab', query: { game: id } })
}
</script>

<template>
  <main class="three-lab-page">
    <section class="lab-hero">
      <div>
        <p class="lab-hero__eyebrow">Three.js 互动实验区</p>
        <h1>把 3D 示例推进到可玩的状态。</h1>
        <p>{{ activeGame.summary }}</p>
      </div>
      <div class="lab-hero__actions">
        <button type="button" class="primary-btn" @click="router.push(`/three-showcase/example/${labGames[0].id}`)">查看代码讲解</button>
        <button type="button" class="ghost-btn" @click="router.push('/three-showcase')">返回示例中心</button>
      </div>
    </section>

    <section class="lab-layout">
      <div class="lab-layout__list">
        <ExampleCard v-for="game in labGames" :key="game.id" :item="game" @open="selectGame(game.id)" />
      </div>
      <div class="lab-layout__stage">
        <SceneCanvas compact :scene-id="activeGame.id" :params="parameterState" @telemetry="telemetry = $event" />
        <section class="lab-stage-info">
          <div>
            <strong>{{ activeGame.title }}</strong>
            <p>{{ activeGame.controlHint }}</p>
          </div>
          <div>
            <strong>得分规则</strong>
            <p>{{ activeGame.scoreRule }}</p>
          </div>
          <div>
            <strong>当前状态</strong>
            <p>{{ telemetry.label }} · {{ telemetry.status }}</p>
          </div>
        </section>
      </div>
    </section>
  </main>
</template>

<style scoped lang="scss" src="./css/lab.scss"></style>
