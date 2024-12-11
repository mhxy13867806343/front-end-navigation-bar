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

<script setup>
import { ref, computed } from 'vue'
import { Cropper } from 'vue-advanced-cropper'
import 'vue-advanced-cropper/dist/style.css'
import { UploadFilled } from '@element-plus/icons-vue'

const imageUrl = ref('')
const cropperRef = ref(null)
const aspectRatio = ref(0)
const coordinates = ref(null)
const flipXFlag = ref(false)
const flipYFlag = ref(false)
const currentWidth = ref(0)
const originalWidth = ref(0)
const MAX_SCALE = 5
const rotationAngle = ref(0)
const imageState = ref(null)
const hasEdits = ref(false)
const isCropped = ref(false)

const currentAspectRatio = computed(() => aspectRatio.value || null)
const canZoomOut = computed(() => currentWidth.value > originalWidth.value * 0.5)
const canZoomIn = computed(() => currentWidth.value < originalWidth.value * MAX_SCALE)
const showReset = computed(() => hasEdits.value && imageState.value && isCropped.value)

const defaultSize = {
  width: 400,
  height: 300
}

const handleFileChange = (file) => {
  const reader = new FileReader()
  reader.onload = (e) => {
    const img = new Image()
    img.onload = () => {
      originalWidth.value = img.width
      currentWidth.value = img.width
      rotationAngle.value = 0
      flipXFlag.value = false
      flipYFlag.value = false
      imageState.value = null
      hasEdits.value = false
      isCropped.value = false
    }
    img.src = e.target.result
    imageUrl.value = e.target.result
  }
  reader.readAsDataURL(file.raw)
}

const onChange = ({ coordinates: coords }) => {
  coordinates.value = coords
}

const saveState = () => {
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

const flipX = () => {
  flipXFlag.value = !flipXFlag.value
  const imageData = cropperRef.value.getCanvas()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = imageData.width
  canvas.height = imageData.height
  
  ctx.scale(flipXFlag.value ? -1 : 1, 1)
  ctx.drawImage(imageData, flipXFlag.value ? -canvas.width : 0, 0)
  
  const dataUrl = canvas.toDataURL()
  imageUrl.value = dataUrl
  saveState()
}

const flipY = () => {
  flipYFlag.value = !flipYFlag.value
  const imageData = cropperRef.value.getCanvas()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = imageData.width
  canvas.height = imageData.height
  
  ctx.scale(1, flipYFlag.value ? -1 : 1)
  ctx.drawImage(imageData, 0, flipYFlag.value ? -canvas.height : 0)
  
  const dataUrl = canvas.toDataURL()
  imageUrl.value = dataUrl
  saveState()
}

const zoom = (factor) => {
  const newWidth = Math.round(currentWidth.value * (1 + factor))
  
  if (newWidth < originalWidth.value * 0.5 || newWidth > originalWidth.value * MAX_SCALE) {
    return
  }

  const imageData = cropperRef.value.getCanvas()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  canvas.width = newWidth
  canvas.height = Math.round(imageData.height * (newWidth / imageData.width))
  
  ctx.drawImage(imageData, 0, 0, canvas.width, canvas.height)
  
  const dataUrl = canvas.toDataURL()
  imageUrl.value = dataUrl
  currentWidth.value = newWidth
  saveState()
}

const rotate = (deg) => {
  rotationAngle.value = (rotationAngle.value + deg) % 360
  const imageData = cropperRef.value.getCanvas()
  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')
  
  const angle = rotationAngle.value * Math.PI / 180
  const sin = Math.sin(angle)
  const cos = Math.cos(angle)
  
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
  
  const dataUrl = canvas.toDataURL()
  imageUrl.value = dataUrl
  saveState()
}

const crop = () => {
  if (!cropperRef.value) return
  
  const canvas = cropperRef.value.getResult().canvas
  const dataUrl = canvas.toDataURL()
  
  imageUrl.value = dataUrl
  currentWidth.value = canvas.width
  originalWidth.value = canvas.width
  rotationAngle.value = 0
  flipXFlag.value = false
  flipYFlag.value = false
  isCropped.value = true
  saveState()
}

const reset = () => {
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

const saveToLocal = () => {
  if (!imageUrl.value) return
  
  // 创建一个链接元素
  const link = document.createElement('a')
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

<style scoped>
.image-editor {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.upload-container {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 20px;
}

.editor-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  padding: 20px;
}

.image-container {
  flex: 1;
  min-height: 400px;
  position: relative;
}

.cropper {
  height: 100%;
  width: 100%;
}

.controls {
  display: flex;
  flex-direction: column;
  gap: 15px;
  padding: 10px;
  background-color: #f5f7fa;
  border-radius: 4px;
}

.control-group {
  display: flex;
  gap: 10px;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
}

.aspect-label {
  color: #606266;
}

.upload-area {
  width: 100%;
  max-width: 360px;
}
</style>
