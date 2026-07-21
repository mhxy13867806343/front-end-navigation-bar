<template>
  <div class="image-editor">
    <div class="upload-container" v-if="!imageUrl">
      <el-upload
        class="upload-area"
        drag
        :auto-upload="false"
        :show-file-list="false"
        accept="image/*"
        @change="handleFileChange"
      >
        <el-icon class="el-icon--upload"><upload-filled /></el-icon>
        <div class="el-upload__text">
          拖拽图片到此处或 <em>点击上传</em>
        </div>
      </el-upload>
    </div>

    <div v-else class="editor-container">
      <div class="image-container">
        <Cropper
          ref="cropperRef"
          class="cropper"
          :src="imageUrl"
          :stencil-props="{
            aspectRatio: currentAspectRatio
          }"
          :default-size="defaultSize"
          image-restriction="stencil"
          @change="onChange"
          :transitions="true"
          :scaling="true"
          :rotation="true"
        />
      </div>

      <div class="controls">
        <div class="control-group">
          <el-button @click="rotate(-90)">向左旋转</el-button>
          <el-button @click="rotate(90)">向右旋转</el-button>
          <el-button @click="flipX">水平翻转</el-button>
          <el-button @click="flipY">垂直翻转</el-button>
        </div>

        <div class="control-group">
          <el-button @click="zoom(-0.1)" :disabled="!canZoomOut">缩小</el-button>
          <el-button @click="zoom(0.1)" :disabled="!canZoomIn">放大</el-button>
          <el-button v-if="showReset" @click="reset">重置</el-button>
        </div>

        <div class="control-group">
          <span class="aspect-label">宽高比：</span>
          <el-radio-group v-model="aspectRatio" @change="updateCropper">
            <el-radio-button :label="0">自由</el-radio-button>
            <el-radio-button :label="1">1:1</el-radio-button>
            <el-radio-button :label="4/3">4:3</el-radio-button>
            <el-radio-button :label="16/9">16:9</el-radio-button>
          </el-radio-group>
        </div>

        <div class="control-group">
          <el-button type="primary" @click="crop">裁剪</el-button>
          <el-button v-if="isCropped" type="success" @click="saveToLocal">保存到本地</el-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">

import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { UploadFilled } from '@element-plus/icons-vue'
import type { UploadFile } from 'element-plus'

interface CropperCoordinates {
  width: number
  height: number
  left: number
  top: number
}

interface CropperChangeEvent {
  coordinates: CropperCoordinates
}

interface CropperInstance {
  getCanvas: () => HTMLCanvasElement
  getResult: () => { canvas: HTMLCanvasElement }
}

interface ImageState {
  imageUrl: string
  currentWidth: number
  rotationAngle: number
  flipX: boolean
  flipY: boolean
  coordinates: CropperCoordinates | null
}

const imageUrl = ref<string>('')
const cropperRef = ref<CropperInstance | null>(null)
const aspectRatio = ref<number>(0)
const coordinates = ref<CropperCoordinates | null>(null)
const flipXFlag = ref<boolean>(false)
const flipYFlag = ref<boolean>(false)
const currentWidth = ref<number>(0)
const originalWidth = ref<number>(0)
const MAX_SCALE: number = 5
const rotationAngle = ref<number>(0)
const imageState = ref<ImageState | null>(null)
const hasEdits = ref<boolean>(false)
const isCropped = ref<boolean>(false)

const currentAspectRatio = computed<number | null>(() => aspectRatio.value || null)
const canZoomOut = computed<boolean>(() => currentWidth.value > originalWidth.value * 0.5)
const canZoomIn = computed<boolean>(() => currentWidth.value < originalWidth.value * MAX_SCALE)
const showReset = computed<boolean>(() => Boolean(hasEdits.value && imageState.value && isCropped.value))

const defaultSize: { width: number, height: number } = {
  width: 400,
  height: 300
}

const handleFileChange = (file: UploadFile): void => {
  if (!file.raw) return
  const reader: FileReader = new FileReader()
  reader.onload = (): void => {
    if (typeof reader.result !== 'string') return
    const result: string = reader.result
    const img: HTMLImageElement = new Image()
    img.onload = (): void => {
      originalWidth.value = img.width
      currentWidth.value = img.width
      rotationAngle.value = 0
      flipXFlag.value = false
      flipYFlag.value = false
      imageState.value = null
      hasEdits.value = false
      isCropped.value = false
    }
    img.src = result
    imageUrl.value = result
  }
  reader.readAsDataURL(file.raw)
}

const onChange = ({ coordinates: coords }: CropperChangeEvent): void => {
  coordinates.value = coords
}

const saveState = (): void => {
  imageState.value = {
    imageUrl: imageUrl.value,
    currentWidth: currentWidth.value,
    rotationAngle: rotationAngle.value,
    flipX: flipXFlag.value,
    flipY: flipYFlag.value,
    coordinates: coordinates.value
  }
  hasEdits.value = true
}

const updateCropper = (): void => {
  hasEdits.value = true
}

function getCropperCanvas(): HTMLCanvasElement | null {
  return cropperRef.value?.getCanvas() || null
}

function createCanvasFromImage(imageData: HTMLCanvasElement): { canvas: HTMLCanvasElement, ctx: CanvasRenderingContext2D } | null {
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) return null
  canvas.width = imageData.width
  canvas.height = imageData.height
  return { canvas, ctx }
}

const flipX = (): void => {
  flipXFlag.value = !flipXFlag.value
  const imageData: HTMLCanvasElement | null = getCropperCanvas()
  if (!imageData) return
  const created = createCanvasFromImage(imageData)
  if (!created) return
  const { canvas, ctx } = created
  
  ctx.scale(flipXFlag.value ? -1 : 1, 1)
  ctx.drawImage(imageData, flipXFlag.value ? -canvas.width : 0, 0)
  
  const dataUrl: string = canvas.toDataURL()
  imageUrl.value = dataUrl
  saveState()
}

const flipY = (): void => {
  flipYFlag.value = !flipYFlag.value
  const imageData: HTMLCanvasElement | null = getCropperCanvas()
  if (!imageData) return
  const created = createCanvasFromImage(imageData)
  if (!created) return
  const { canvas, ctx } = created
  
  ctx.scale(1, flipYFlag.value ? -1 : 1)
  ctx.drawImage(imageData, 0, flipYFlag.value ? -canvas.height : 0)
  
  const dataUrl: string = canvas.toDataURL()
  imageUrl.value = dataUrl
  saveState()
}

const zoom = (factor: number): void => {
  const newWidth: number = Math.round(currentWidth.value * (1 + factor))
  
  if (newWidth < originalWidth.value * 0.5 || newWidth > originalWidth.value * MAX_SCALE) {
    return
  }

  const imageData: HTMLCanvasElement | null = getCropperCanvas()
  if (!imageData) return
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) return
  
  canvas.width = newWidth
  canvas.height = Math.round(imageData.height * (newWidth / imageData.width))
  
  ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height)
  
  const dataUrl: string = canvas.toDataURL()
  imageUrl.value = dataUrl
  currentWidth.value = newWidth
  saveState()
}

const rotate = (deg: number): void => {
  rotationAngle.value = (rotationAngle.value + deg) % 360
  const imageData: HTMLCanvasElement | null = getCropperCanvas()
  if (!imageData) return
  const canvas: HTMLCanvasElement = document.createElement('canvas')
  const ctx: CanvasRenderingContext2D | null = canvas.getContext('2d')
  if (!ctx) return
  
  const angle: number = rotationAngle.value * Math.PI / 180
  const sin: number = Math.sin(angle)
  const cos: number = Math.cos(angle)
  
  if (Math.abs(sin) > Math.abs(cos)) {
    canvas.width = imageData.height
    canvas.height = imageData.width
  } else {
    canvas.width = imageData.width
    canvas.height = imageData.height
  }
  
  ctx.translate(canvas.width / 2, canvas.height / 2)
  ctx.rotate(angle)
  ctx.drawImage(imageData, -imageData.width / 2, -imageData.height / 2)
  
  const dataUrl: string = canvas.toDataURL()
  imageUrl.value = dataUrl
  saveState()
}

const crop = (): void => {
  if (!cropperRef.value) return
  
  const canvas: HTMLCanvasElement = cropperRef.value.getResult().canvas
  const dataUrl: string = canvas.toDataURL()
  
  imageUrl.value = dataUrl
  currentWidth.value = canvas.width
  originalWidth.value = canvas.width
  rotationAngle.value = 0
  flipXFlag.value = false
  flipYFlag.value = false
  isCropped.value = true
  saveState()
}

const reset = (): void => {
  if (imageState.value) {
    imageUrl.value = imageState.value.imageUrl
    currentWidth.value = imageState.value.currentWidth
    rotationAngle.value = imageState.value.rotationAngle
    flipXFlag.value = imageState.value.flipX
    flipYFlag.value = imageState.value.flipY
    coordinates.value = imageState.value.coordinates
    hasEdits.value = false
  }
}

const saveToLocal = (): void => {
  if (!imageUrl.value) return
  
  // 创建一个链接元素
  const link: HTMLAnchorElement = document.createElement('a')
  link.download = `edited_image_${Date.now()}.png` // 生成文件名
  link.href = imageUrl.value
  
  // 触发点击事件来下载
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
}

const handleClose = () => {
  imageUrl.value = ''
  currentWidth.value = 0
  originalWidth.value = 0
  rotationAngle.value = 0
  flipXFlag.value = false
  flipYFlag.value = false
  coordinates.value = null
  imageState.value = null
  hasEdits.value = false
  aspectRatio.value = 0
  isCropped.value = false
}

defineExpose({
  handleClose
})
</script>

<style scoped lang="scss" src="./css/ImageEditor.scss"></style>
