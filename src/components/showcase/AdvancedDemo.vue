<script setup>
import { ref, reactive, computed } from 'vue'
import { ElMessage, ElMessageBox, ElNotification, ElLoading } from 'element-plus'
import { Document, Menu as MenuIcon, Setting, Location } from '@element-plus/icons-vue'

// ------ Form 表单校验 ------
const formRef = ref(null)
const form = reactive({
  name: '',
  region: '',
  date: '',
  type: [],
  resource: '',
  desc: ''
})
const rules = {
  name: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 2, max: 10, message: '长度在 2 到 10 个字符', trigger: 'blur' }
  ],
  region: [{ required: true, message: '请选择活动区域', trigger: 'change' }],
  date: [{ required: true, message: '请选择日期', trigger: 'change' }],
  type: [{ type: 'array', required: true, message: '请至少选择一个活动性质', trigger: 'change' }],
  resource: [{ required: true, message: '请选择活动资源', trigger: 'change' }]
}
const submitForm = () => {
  formRef.value.validate((valid) => {
    if (valid) {
      ElMessage.success('校验通过，提交成功！')
    } else {
      ElMessage.error('校验未通过，请检查表单')
    }
  })
}
const resetForm = () => {
  formRef.value.resetFields()
}

// ------ Autocomplete / Mention ------
const autocompleteValue = ref('')
const frameworks = [
  { value: 'Vue 3' }, { value: 'Vue Router' }, { value: 'Vuex' }, { value: 'Vite' },
  { value: 'React' }, { value: 'Redux' }, { value: 'Next.js' },
  { value: 'Angular' }, { value: 'Astro' }, { value: 'Svelte' }
]
const queryFrameworks = (queryString, cb) => {
  const results = queryString
    ? frameworks.filter(f => f.value.toLowerCase().includes(queryString.toLowerCase()))
    : frameworks
  cb(results)
}
const mentionValue = ref('')
const mentionOptions = [
  { value: 'HooksVue' },
  { value: 'ElementPlus' },
  { value: 'Vue3' },
  { value: 'Vite' }
]

// ------ 虚拟化 Select ------
const selectV2Value = ref('')
const selectV2Options = Array.from({ length: 1000 }).map((_, idx) => ({
  value: `option-${idx + 1}`,
  label: `选项 ${idx + 1}`
}))

// ------ TreeSelect / Tree ------
const treeSelectValue = ref('')
const treeSelectData = [
  {
    value: 'frontend',
    label: '前端',
    children: [
      { value: 'vue', label: 'Vue', children: [{ value: 'vue3', label: 'Vue 3' }, { value: 'nuxt', label: 'Nuxt' }] },
      { value: 'react', label: 'React', children: [{ value: 'next', label: 'Next.js' }] }
    ]
  },
  {
    value: 'backend',
    label: '后端',
    children: [{ value: 'node', label: 'Node.js' }, { value: 'go', label: 'Go' }]
  }
]
const treeData = [
  {
    label: '前端技术',
    children: [
      { label: 'Vue 生态', children: [{ label: 'Vue 3' }, { label: 'Vite' }, { label: 'Pinia' }] },
      { label: 'React 生态', children: [{ label: 'Next.js' }, { label: 'Redux' }] }
    ]
  },
  {
    label: 'AI 工具',
    children: [{ label: 'AI 聊天助手' }, { label: 'AI 绘画' }, { label: 'AI 编程' }]
  }
]

// ------ Transfer / Upload ------
const transferValue = ref([1, 4])
const transferData = Array.from({ length: 10 }).map((_, idx) => ({
  key: idx + 1,
  label: `技术选项 ${idx + 1}`,
  disabled: idx % 5 === 0
}))
const fileList = ref([])
const handleUploadChange = () => {
  ElMessage.info('演示模式：文件不会真正上传')
}

// ------ 高级表格（展开行） ------
const expandTableData = [
  { name: 'DeepSeek', type: 'AI聊天助手', price: '免费', region: '国内', desc: '强力开源大模型，深度求索' },
  { name: 'Cursor', type: 'AI编程', price: '20$/月', region: '国外', desc: 'AI 代码编辑器' },
  { name: 'Midjourney', type: 'AI绘画', price: '10$/月', region: '国外', desc: 'AI 图像生成工具' }
]

// ------ 综合表格：搜索 + 分页 + 自定义计算 + 合计行 ------
const orderSearch = ref('')
const orderPage = ref(1)
const orderPageSize = ref(5)
const orderData = ref(
  Array.from({ length: 28 }).map((_, idx) => {
    const products = ['AI 会员套餐', 'GPU 算力包', 'API 调用额度', '存储扩容包', '模型微调服务', '数据标注包', '私有化部署']
    return {
      id: idx + 1,
      product: `${products[idx % products.length]} #${idx + 1}`,
      price: Number(((idx % 9) * 15.5 + 9.9).toFixed(2)),
      count: (idx % 5) + 1,
      status: idx % 3 === 0 ? '已支付' : idx % 3 === 1 ? '待支付' : '已取消'
    }
  })
)

// 搜索过滤（名称/状态）
const filteredOrders = computed(() => {
  const kw = orderSearch.value.trim().toLowerCase()
  if (!kw) return orderData.value
  return orderData.value.filter(
    row => row.product.toLowerCase().includes(kw) || row.status.includes(kw)
  )
})

// 分页后的当页数据
const pagedOrders = computed(() => {
  const start = (orderPage.value - 1) * orderPageSize.value
  return filteredOrders.value.slice(start, start + orderPageSize.value)
})

const handleOrderSearch = () => {
  orderPage.value = 1
}

// 自定义计算：金额 = 单价 × 数量
const calcAmount = (row) => Number((row.price * row.count).toFixed(2))

// 自定义合计行：对当页 数量/金额 求和
const orderSummary = ({ columns }) => {
  const sums = []
  columns.forEach((column, index) => {
    if (index === 0) {
      sums[index] = '当页合计'
      return
    }
    if (column.property === 'count') {
      sums[index] = pagedOrders.value.reduce((acc, row) => acc + row.count, 0)
    } else if (column.property === 'amount') {
      const total = pagedOrders.value.reduce((acc, row) => acc + calcAmount(row), 0)
      sums[index] = `¥ ${total.toFixed(2)}`
    } else {
      sums[index] = ''
    }
  })
  return sums
}

// ------ Statistic / Segmented / Descriptions / Carousel ------
const segmentedValue = ref('日')
const segmentedOptions = ['日', '周', '月', '季', '年']

// ------ Steps / Menu ------
const activeStep = ref(1)
const activeMenu = ref('1-1')

// ------ Dialog / Drawer / Loading / MessageBox / Notification / Popover / Tour ------
const dialogVisible = ref(false)
const drawerVisible = ref(false)
const popoverVisible = ref(false)
const tourOpen = ref(false)

const showNotification = (position) => {
  ElNotification({
    title: '通知',
    message: `来自 ${position} 的通知消息`,
    type: 'success',
    position
  })
}
const showConfirm = () => {
  ElMessageBox.confirm('确定要执行此操作吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  })
    .then(() => ElMessage.success('已确认'))
    .catch(() => ElMessage.info('已取消'))
}
const showPrompt = () => {
  ElMessageBox.prompt('请输入你的昵称', '输入框弹窗', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    inputPattern: /\S+/,
    inputErrorMessage: '昵称不能为空'
  })
    .then(({ value }) => ElMessage.success(`你好，${value}！`))
    .catch(() => ElMessage.info('已取消'))
}
const showLoading = () => {
  const loading = ElLoading.service({
    lock: true,
    text: '加载中，2 秒后自动关闭...',
    background: 'rgba(0, 0, 0, 0.7)'
  })
  setTimeout(() => loading.close(), 2000)
}

// ------ Watermark / InfiniteScroll / Image ------
const watermarkContent = ref('HooksVue')
const imageUrl = 'https://picsum.photos/id/1015/300/180'
const previewList = [
  'https://picsum.photos/id/1015/800/500',
  'https://picsum.photos/id/1016/800/500',
  'https://picsum.photos/id/1018/800/500'
]
const scrollCount = ref(10)
const loadMore = () => {
  if (scrollCount.value < 30) {
    scrollCount.value += 5
  }
}
</script>

<template>
  <div>
    <div class="demo-section">
      <h4 class="demo-title">Form 表单（完整校验规则）</h4>
      <el-form ref="formRef" :model="form" :rules="rules" label-width="100px" style="max-width: 560px;">
        <el-form-item label="活动名称" prop="name">
          <el-input v-model="form.name" placeholder="请输入活动名称（2-10 个字符）" clearable />
        </el-form-item>
        <el-form-item label="活动区域" prop="region">
          <el-select v-model="form.region" placeholder="请选择活动区域" style="width: 100%;">
            <el-option label="杭州" value="hangzhou" />
            <el-option label="上海" value="shanghai" />
            <el-option label="北京" value="beijing" />
          </el-select>
        </el-form-item>
        <el-form-item label="活动日期" prop="date">
          <el-date-picker v-model="form.date" type="date" placeholder="选择日期" style="width: 100%;" />
        </el-form-item>
        <el-form-item label="活动性质" prop="type">
          <el-checkbox-group v-model="form.type">
            <el-checkbox value="online">线上活动</el-checkbox>
            <el-checkbox value="promotion">地推活动</el-checkbox>
            <el-checkbox value="offline">线下主题</el-checkbox>
          </el-checkbox-group>
        </el-form-item>
        <el-form-item label="活动资源" prop="resource">
          <el-radio-group v-model="form.resource">
            <el-radio value="sponsor">线上品牌赞助</el-radio>
            <el-radio value="venue">线下场地免费</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="活动形式">
          <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="请输入活动形式" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即创建</el-button>
          <el-button @click="resetForm">重置</el-button>
        </el-form-item>
      </el-form>
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Autocomplete 自动补全</h4>
          <el-autocomplete
            v-model="autocompleteValue"
            :fetch-suggestions="queryFrameworks"
            placeholder="输入 v 或 r 试试"
            clearable
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Mention 提及</h4>
          <el-mention
            v-model="mentionValue"
            :options="mentionOptions"
            placeholder="输入 @ 触发提及"
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Virtualized Select 虚拟化选择器（1000 条）</h4>
          <el-select-v2
            v-model="selectV2Value"
            :options="selectV2Options"
            placeholder="请选择（虚拟滚动）"
            filterable
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">TreeSelect 树形选择</h4>
          <el-tree-select
            v-model="treeSelectValue"
            :data="treeSelectData"
            check-strictly
            placeholder="请选择节点"
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Tree 树形控件（可勾选）</h4>
          <el-tree :data="treeData" show-checkbox default-expand-all node-key="label" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Transfer 穿梭框</h4>
          <el-transfer
            v-model="transferValue"
            :data="transferData"
            :titles="['待选列表', '已选列表']"
            filterable
          />
        </div>
      </el-col>

      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Upload 上传（拖拽，演示模式）</h4>
          <el-upload
            v-model:file-list="fileList"
            drag
            :auto-upload="false"
            :on-change="handleUploadChange"
            style="max-width: 360px;"
          >
            <div class="el-upload__text" style="padding: 20px 0;">
              📁 拖拽文件到此处，或 <em>点击选择文件</em>
            </div>
            <template #tip>
              <div class="el-upload__tip">演示模式，文件不会真正上传</div>
            </template>
          </el-upload>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Statistic 统计数值 / Segmented 分段控制器</h4>
          <el-row :gutter="16" style="margin-bottom: 12px;">
            <el-col :span="8"><el-statistic title="日访问量" :value="26890" /></el-col>
            <el-col :span="8"><el-statistic title="收藏工具数" :value="512" /></el-col>
            <el-col :span="8"><el-statistic title="好评率" :value="99.8" suffix="%" :precision="1" /></el-col>
          </el-row>
          <el-segmented v-model="segmentedValue" :options="segmentedOptions" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Descriptions 描述列表</h4>
          <el-descriptions title="项目信息" :column="2" border>
            <el-descriptions-item label="项目名称">HooksVue 导航</el-descriptions-item>
            <el-descriptions-item label="框架">Vue 3</el-descriptions-item>
            <el-descriptions-item label="UI 库">Element Plus</el-descriptions-item>
            <el-descriptions-item label="构建工具">Vite</el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Carousel 走马灯</h4>
          <el-carousel height="140px" style="max-width: 420px; border-radius: 8px;">
            <el-carousel-item v-for="i in 4" :key="i">
              <div class="carousel-item" :class="`carousel-${i}`">轮播页 {{ i }}</div>
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Progress 环形 / 仪表盘</h4>
          <div class="demo-row">
            <el-progress type="circle" :percentage="70" :width="90" />
            <el-progress type="dashboard" :percentage="80" :width="90" />
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="demo-section">
      <h4 class="demo-title">Table 综合示例（搜索 + 分页 + 自定义计算列 + 合计行）</h4>
      <div class="demo-row" style="margin-bottom: 12px;">
        <el-input
          v-model="orderSearch"
          placeholder="搜索商品名称或状态（如：已支付）"
          clearable
          style="width: 300px;"
          @input="handleOrderSearch"
        />
        <el-text type="info" style="align-self: center;">共 {{ filteredOrders.length }} 条结果</el-text>
      </div>
      <el-table :data="pagedOrders" border stripe show-summary :summary-method="orderSummary" style="width: 100%;">
        <el-table-column prop="id" label="ID" width="70" />
        <el-table-column prop="product" label="商品名称" min-width="160" />
        <el-table-column prop="price" label="单价（¥）" width="110" sortable />
        <el-table-column prop="count" label="数量" width="120">
          <template #default="{ row }">
            <el-input-number v-model="row.count" :min="1" :max="99" size="small" style="width: 100px;" />
          </template>
        </el-table-column>
        <el-table-column prop="amount" label="金额（单价×数量）" width="150">
          <template #default="{ row }">
            <el-text type="primary" tag="b">¥ {{ calcAmount(row).toFixed(2) }}</el-text>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="状态" width="100">
          <template #default="{ row }">
            <el-tag :type="row.status === '已支付' ? 'success' : row.status === '待支付' ? 'warning' : 'info'" size="small">
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="orderPage"
        v-model:page-size="orderPageSize"
        :total="filteredOrders.length"
        :page-sizes="[5, 10, 20]"
        layout="total, sizes, prev, pager, next, jumper"
        style="margin-top: 12px; justify-content: flex-end;"
      />
      <el-text type="info" size="small" style="display: block; margin-top: 8px;">
        💡 修改表格内“数量”可实时重算金额与合计行；搜索与分页联动。
      </el-text>
    </div>

    <div class="demo-section">
      <h4 class="demo-title">Table 表格（排序 + 展开行）</h4>
      <el-table :data="expandTableData" border stripe style="width: 100%;">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding: 8px 16px;">📄 详情：{{ row.desc }}</div>
          </template>
        </el-table-column>
        <el-table-column prop="name" label="名称" sortable />
        <el-table-column prop="type" label="分类" />
        <el-table-column prop="price" label="价格" sortable />
        <el-table-column prop="region" label="地区">
          <template #default="{ row }">
            <el-tag :type="row.region === '国内' ? 'success' : 'warning'" size="small">{{ row.region }}</el-tag>
          </template>
        </el-table-column>
      </el-table>
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :sm="10">
        <div class="demo-section">
          <h4 class="demo-title">Menu 菜单（含子菜单）</h4>
          <el-menu :default-active="activeMenu" style="max-width: 260px; border-radius: 8px;">
            <el-sub-menu index="1">
              <template #title>
                <el-icon><Location /></el-icon>
                <span>导航一</span>
              </template>
              <el-menu-item index="1-1">选项 1</el-menu-item>
              <el-menu-item index="1-2">选项 2</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="2">
              <el-icon><MenuIcon /></el-icon>
              <span>导航二</span>
            </el-menu-item>
            <el-menu-item index="3">
              <el-icon><Document /></el-icon>
              <span>导航三</span>
            </el-menu-item>
            <el-menu-item index="4" disabled>
              <el-icon><Setting /></el-icon>
              <span>禁用项</span>
            </el-menu-item>
          </el-menu>
        </div>
      </el-col>

      <el-col :xs="24" :sm="14">
        <div class="demo-section">
          <h4 class="demo-title">Steps 步骤条</h4>
          <el-steps :active="activeStep" finish-status="success" style="max-width: 600px;">
            <el-step title="步骤一" description="填写基本信息" />
            <el-step title="步骤二" description="确认订单内容" />
            <el-step title="步骤三" description="完成提交" />
          </el-steps>
          <div class="demo-row" style="margin-top: 12px;">
            <el-button size="small" @click="activeStep = Math.max(0, activeStep - 1)">上一步</el-button>
            <el-button size="small" type="primary" @click="activeStep = Math.min(3, activeStep + 1)">下一步</el-button>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Dialog / Drawer / Loading / MessageBox / Notification</h4>
          <div class="demo-row">
            <el-button type="primary" @click="dialogVisible = true">对话框</el-button>
            <el-button type="primary" plain @click="drawerVisible = true">抽屉</el-button>
            <el-button type="info" @click="showLoading">全屏 Loading</el-button>
            <el-button type="warning" @click="showConfirm">确认弹框</el-button>
            <el-button type="warning" plain @click="showPrompt">输入弹框</el-button>
            <el-button type="success" @click="showNotification('top-right')">通知</el-button>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Popover 气泡卡片 / Tour 漫游式引导</h4>
          <div class="demo-row">
            <el-popover :visible="popoverVisible" placement="top" :width="200">
              <p>这是 Popover 气泡卡片的内容。</p>
              <div style="text-align: right;">
                <el-button size="small" text @click="popoverVisible = false">关闭</el-button>
              </div>
              <template #reference>
                <el-button @click="popoverVisible = !popoverVisible">Popover 点击弹出</el-button>
              </template>
            </el-popover>
            <el-button type="primary" @click="tourOpen = true">开始引导</el-button>
            <el-button id="tour-step-1">第一步目标</el-button>
            <el-button id="tour-step-2" type="success">第二步目标</el-button>
          </div>
          <el-tour v-model="tourOpen">
            <el-tour-step target="#tour-step-1" title="第一步" description="这是漫游引导的第一步，介绍该按钮的功能。" />
            <el-tour-step target="#tour-step-2" title="第二步" description="这是第二步，引导结束。" />
          </el-tour>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Skeleton 骨架屏 / Result 结果</h4>
          <el-skeleton :rows="2" animated style="max-width: 420px; margin-bottom: 12px;" />
          <el-result icon="success" title="操作成功" sub-title="内容已保存" style="padding: 10px;" />
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24">
      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Image 图片（懒加载 + 大图预览）</h4>
          <div class="demo-row">
            <el-image
              :src="imageUrl"
              :preview-src-list="previewList"
              fit="cover"
              lazy
              style="width: 240px; height: 140px; border-radius: 8px;"
            >
              <template #error>
                <div class="image-error">图片加载失败</div>
              </template>
            </el-image>
            <el-text type="info" style="align-self: center;">点击图片可放大预览</el-text>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Watermark 水印（动态修改）</h4>
          <el-input v-model="watermarkContent" placeholder="修改水印文案" style="max-width: 240px; margin-bottom: 12px;" />
          <el-watermark :content="watermarkContent" :font="{ color: 'rgba(64, 158, 255, 0.3)' }">
            <div class="watermark-area">
              <el-text>这块区域带有动态水印，修改上方输入框即可实时更新水印内容。</el-text>
            </div>
          </el-watermark>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">InfiniteScroll 无限滚动</h4>
          <ul
            v-infinite-scroll="loadMore"
            class="infinite-list"
            :infinite-scroll-disabled="scrollCount >= 30"
          >
            <li v-for="i in scrollCount" :key="i" class="infinite-list-item">列表项 {{ i }}</li>
            <li v-if="scrollCount >= 30" class="infinite-list-end">已加载全部 30 条</li>
          </ul>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Backtop 回到顶部</h4>
          <el-text type="info">页面滚动超过一定高度后，右下角会出现"回到顶部"按钮（全局生效）。</el-text>
          <el-backtop :right="40" :bottom="40" />
        </div>
      </el-col>
    </el-row>

    <!-- 对话框演示 -->
    <el-dialog v-model="dialogVisible" title="Dialog 对话框" width="420px">
      <span>这是一个 Element Plus 对话框示例。</span>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="dialogVisible = false">确定</el-button>
      </template>
    </el-dialog>

    <!-- 抽屉演示 -->
    <el-drawer v-model="drawerVisible" title="Drawer 抽屉" size="30%">
      <span>这是一个 Element Plus 抽屉示例。</span>
    </el-drawer>
  </div>
</template>

<style scoped>
.carousel-item {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-size: 18px;
  font-weight: 600;
}
.carousel-1 { background: #409eff; }
.carousel-2 { background: #67c23a; }
.carousel-3 { background: #e6a23c; }
.carousel-4 { background: #f56c6c; }

.image-error {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--el-fill-color-light, #f5f7fa);
  color: var(--el-text-color-secondary, #909399);
  font-size: 13px;
}

.watermark-area {
  height: 160px;
  border: 1px dashed var(--el-border-color, #dcdfe6);
  border-radius: 8px;
  padding: 16px;
}

.infinite-list {
  height: 200px;
  overflow: auto;
  padding: 0;
  margin: 0;
  list-style: none;
  max-width: 400px;
  border: 1px solid var(--el-border-color, #dcdfe6);
  border-radius: 8px;
}
.infinite-list-item {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 42px;
  margin: 8px;
  background: var(--el-color-primary-light-9, #ecf5ff);
  color: var(--el-color-primary, #409eff);
  border-radius: 6px;
  font-size: 13px;
}
.infinite-list-end {
  text-align: center;
  color: var(--el-text-color-secondary, #909399);
  font-size: 12px;
  padding: 8px 0;
}
</style>
