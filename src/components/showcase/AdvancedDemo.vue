<script setup lang="ts">

import { ElMessage, ElMessageBox, ElNotification } from 'element-plus'
import type { FormInstance, FormRules, UploadFile } from 'element-plus'
import { 
  Document, Menu as MenuIcon, Setting, Location, CopyDocument, 
  Delete, View, Download, Plus, Star, CaretTop, CaretBottom 
} from '@element-plus/icons-vue'

// Import locales for Config Provider
import zhCn from 'element-plus/es/locale/lang/zh-cn'
import en from 'element-plus/es/locale/lang/en'

interface AdvancedForm {
  username: string
  email: string
  password: string
  nickname: string
  gender: string
  interests: string[]
  desc: string
  agree: boolean
}

interface FrameworkOption {
  value: string
}

interface TreeNodeData {
  id?: number | string
  value?: string
  label: string
  children?: TreeNodeData[]
}

interface TreeRefLike {
  filter: (value: string) => void
}

interface TreeNodeLike {
  parent: {
    data: TreeNodeData | TreeNodeData[]
  }
}

interface MenuItem {
  path: string
  name: string
  icon: string
  role: 'admin' | 'editor' | null
  isTemp?: boolean
}

interface OrderRow {
  id: number
  product: string
  price: number
  count: number
  status: string
}

interface SummaryColumn {
  property?: string
}

// ------ Config Provider 全局配置 ------
const currentLocale = ref<typeof zhCn | typeof en>(zhCn)
const toggleLocale = (): void => {
  currentLocale.value = currentLocale.value.name === 'zh-cn' ? en : zhCn
  ElMessage.success(`语言已切换至: ${currentLocale.value.name === 'zh-cn' ? '中文 (zh-cn)' : 'English (en)'}`)
}

// ------ Form 多步骤校验表单 (保留历史数据) ------
const formRef = ref<FormInstance | null>(null)
const formStep = ref<number>(0)
const isSubmitting = ref<boolean>(false)

const form = reactive<AdvancedForm>({
  username: '',
  email: '',
  password: '',
  nickname: '',
  gender: 'male',
  interests: [],
  desc: '',
  agree: false
})

const rules: FormRules<AdvancedForm> = {
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 3, max: 15, message: '长度在 3 到 15 个字符', trigger: 'blur' }
  ],
  email: [
    { required: true, message: '请输入电子邮箱', trigger: 'blur' },
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, message: '密码长度不能少于 6 个字符', trigger: 'blur' }
  ],
  nickname: [
    { required: true, message: '请输入昵称', trigger: 'blur' }
  ]
}

const nextStep = (): void => {
  if (formStep.value === 0) {
    formRef.value?.validateField(['username', 'email', 'password']).then(() => {
      formStep.value = 1
      ElMessage.success('第一步校验通过，数据已暂存')
    }).catch(() => {
      ElMessage.error('第一步校验未通过，请检查输入')
    })
  } else if (formStep.value === 1) {
    formRef.value?.validateField(['nickname']).then(() => {
      formStep.value = 2
      ElMessage.success('第二步校验通过')
    }).catch(() => {
      ElMessage.error('第二步校验未通过，请检查输入')
    })
  }
}

const prevStep = (): void => {
  if (formStep.value > 0) {
    formStep.value--
    ElMessage.info('返回上一步，历史输入数据已保留')
  }
}

const submitForm = (): void => {
  if (!form.agree) {
    ElMessage.warning('请先勾选确认信息无误协议')
    return
  }
  isSubmitting.value = true
  setTimeout(() => {
    isSubmitting.value = false
    ElMessageBox.alert(
      `提交的全部表单数据为：\n${JSON.stringify(form, null, 2)}`, 
      '表单提交成功', 
      { confirmButtonText: '确定' }
    )
    // 重置步骤和表单
    formStep.value = 0
    formRef.value?.resetFields()
    form.interests = []
    form.desc = ''
    form.agree = false
  }, 1000)
}

// ------ Autocomplete / Mention ------
const autocompleteValue = ref<string>('')
const frameworks: FrameworkOption[] = [
  { value: 'Vue 3' }, { value: 'Vue Router' }, { value: 'Vuex' }, { value: 'Vite' },
  { value: 'React' }, { value: 'Redux' }, { value: 'Next.js' },
  { value: 'Angular' }, { value: 'Astro' }, { value: 'Svelte' }
]
const queryFrameworks = (queryString: string, cb: (results: FrameworkOption[]) => void): void => {
  const results: FrameworkOption[] = queryString
    ? frameworks.filter((f: FrameworkOption): boolean => f.value.toLowerCase().includes(queryString.toLowerCase()))
    : frameworks
  cb(results)
}
const mentionValue = ref<string>('')
const mentionOptions = [
  { value: 'HooksVue' },
  { value: 'ElementPlus' },
  { value: 'Vue3' },
  { value: 'Vite' }
]

// ------ 虚拟化 Select ------
const selectV2Value = ref<string>('')
const selectV2Options = Array.from({ length: 1000 }).map((_: unknown, idx: number) => ({
  value: `option-${idx + 1}`,
  label: `选项 ${idx + 1}`
}))

// ------ TreeSelect / Tree ------
const treeSelectValue = ref<string>('')
const treeSelectData: TreeNodeData[] = [
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

// ------ Tree 过滤与动态增删 ------
const filterText = ref<string>('')
const treeRef = ref<TreeRefLike | null>(null)
const defaultProps = {
  children: 'children',
  label: 'label'
}
const editableTreeData = ref<TreeNodeData[]>([
  {
    id: 1,
    label: '研发中心',
    children: [
      {
        id: 2,
        label: '前端开发部',
        children: [
          { id: 3, label: 'Vue 架构组' },
          { id: 4, label: 'React 架构组' }
        ]
      },
      {
        id: 5,
        label: '后端开发部',
        children: [
          { id: 6, label: 'Node 业务组' },
          { id: 7, label: 'Go 底层组' }
        ]
      }
    ]
  },
  {
    id: 8,
    label: '设计中心',
    children: [
      { id: 9, label: 'UI 视觉设计' },
      { id: 10, label: 'UX 交互体验' }
    ]
  }
])

const filterNode = (value: string, data: TreeNodeData): boolean => {
  if (!value) return true
  return data.label.includes(value)
}

watch(filterText, (val: string): void => {
  treeRef.value?.filter(val)
})

let nodeId: number = 100
const appendNode = (data: TreeNodeData): void => {
  const newChild: TreeNodeData = { id: nodeId++, label: '新部门/岗位', children: [] }
  if (!data.children) {
    data.children = []
  }
  data.children.push(newChild)
  editableTreeData.value = [...editableTreeData.value]
  ElMessage.success('成功添加子节点')
}

const removeNode = (node: TreeNodeLike, data: TreeNodeData): void => {
  const parent = node.parent
  const children: TreeNodeData[] = Array.isArray(parent.data) ? parent.data : parent.data.children || []
  const index: number = children.findIndex((d: TreeNodeData): boolean => d.id === data.id)
  children.splice(index, 1)
  editableTreeData.value = [...editableTreeData.value]
  ElMessage.warning('节点已移除')
}

// ------ Virtualized Tree 虚拟化树形控件 ------
const createVirtualTreeData = (maxDeep: number, maxChildren: number, minNodesNumber: number, deep: number = 1, key: string = 'node'): TreeNodeData[] => {
  const getRandom = (min: number, max: number): number => Math.floor(Math.random() * (max - min + 1) + min)
  const nodes: TreeNodeData[] = []
  const count: number = getRandom(minNodesNumber, maxChildren)
  for (let i: number = 0; i < count; i++) {
    const nodeKey: string = `${key}-${deep}-${i}`
    const node: TreeNodeData = {
      id: nodeKey,
      label: `虚拟节点 L${deep} - ${i}`
    }
    if (deep < maxDeep) {
      node.children = createVirtualTreeData(maxDeep, maxChildren, minNodesNumber, deep + 1, nodeKey)
    }
    nodes.push(node)
  }
  return nodes
}
const virtualTreeData = ref<TreeNodeData[]>(createVirtualTreeData(3, 8, 3))

// ------ 动态路由 & 权限菜单 ------
const currentRole = ref<'admin' | 'editor' | 'guest'>('admin')
const hasMountedRoute = ref<boolean>(false)
const defaultMenus: MenuItem[] = [
  { path: '/dashboard', name: '系统数据大屏', icon: '📊', role: null },
  { path: '/showcase', name: 'Element Plus 组件库', icon: '🧩', role: null },
  { path: '/settings', name: '系统全局配置 (Admin)', icon: '⚙️', role: 'admin' },
  { path: '/articles', name: '文章管理中心 (Editor/Admin)', icon: '📝', role: 'editor' }
]

const filteredMenus = computed<MenuItem[]>(() => {
  const menus: MenuItem[] = [...defaultMenus]
  if (hasMountedRoute.value) {
    menus.push({ path: '/temp-page', name: '动态载入临时页面', icon: '🔌', role: null, isTemp: true })
  }
  if (currentRole.value === 'admin') return menus
  if (currentRole.value === 'editor') {
    return menus.filter((m: MenuItem): boolean => m.role !== 'admin')
  }
  return menus.filter((m: MenuItem): boolean => !m.role)
})

const handleMountRoute = (): void => {
  hasMountedRoute.value = true
  ElNotification({
    title: '🔌 动态路由注入成功',
    message: '新路由 /temp-page 及其对应的单页面组件已被成功追加到 Vue Router 中！',
    type: 'success',
    position: 'top-right'
  })
}

const handleUnmountRoute = (): void => {
  hasMountedRoute.value = false
  ElNotification({
    title: '🔌 动态路由已卸载',
    message: '已经成功从 Vue Router 路由表 and 菜单树中安全移除该组件。',
    type: 'warning',
    position: 'top-right'
  })
}

// ------ Transfer / Upload ------
const transferValue = ref<number[]>([1, 4])
const transferData = Array.from({ length: 10 }).map((_: unknown, idx: number) => ({
  key: idx + 1,
  label: `技术选项 ${idx + 1}`,
  disabled: idx % 5 === 0
}))
const fileList = ref<UploadFile[]>([])
const handleUploadChange = (): void => {
  ElMessage.info('演示模式：文件不会真正上传')
}

// Simulated Avatar Upload
const avatarUrl = ref<string>('')
const handleAvatarSuccess = (uploadFile: UploadFile): void => {
  if (!uploadFile.raw) return
  avatarUrl.value = URL.createObjectURL(uploadFile.raw)
  ElMessage.success('头像模拟上传并预览成功！')
}

// ------ 高级表格（展开行） ------
const expandTableData = [
  { name: 'DeepSeek', type: 'AI聊天助手', price: '免费', region: '国内', desc: '强力开源大模型，深度求索' },
  { name: 'Cursor', type: 'AI编程', price: '20$/月', region: '国外', desc: 'AI 代码编辑器' },
  { name: 'Midjourney', type: 'AI绘画', price: '10$/月', region: '国外', desc: 'AI 图像生成工具' }
]

// ------ 综合表格：搜索 + 分页 + 自定义计算 + 合计行 ------
const orderSearch = ref<string>('')
const orderPage = ref<number>(1)
const orderPageSize = ref<number>(5)
const orderData = ref<OrderRow[]>(
  Array.from({ length: 28 }).map((_: unknown, idx: number): OrderRow => {
    const products: string[] = ['AI 会员套餐', 'GPU 算力包', 'API 调用额度', '存储扩容包', '模型微调服务', '数据标注包', '私有化部署']
    return {
      id: idx + 1,
      product: `${products[idx % products.length]} #${idx + 1}`,
      price: Number(((idx % 9) * 15.5 + 9.9).toFixed(2)),
      count: (idx % 5) + 1,
      status: idx % 3 === 0 ? '已支付' : idx % 3 === 1 ? '待支付' : '已取消'
    }
  })
)

const filteredOrders = computed<OrderRow[]>(() => {
  const kw: string = orderSearch.value.trim().toLowerCase()
  if (!kw) return orderData.value
  return orderData.value.filter(
    (row: OrderRow): boolean => row.product.toLowerCase().includes(kw) || row.status.includes(kw)
  )
})

const pagedOrders = computed<OrderRow[]>(() => {
  const start: number = (orderPage.value - 1) * orderPageSize.value
  return filteredOrders.value.slice(start, start + orderPageSize.value)
})

const handleOrderSearch = (): void => {
  orderPage.value = 1
}

const calcAmount = (row: OrderRow): number => Number((row.price * row.count).toFixed(2))

const orderSummary = ({ columns }: { columns: SummaryColumn[] }): Array<string | number> => {
  const sums: Array<string | number> = []
  columns.forEach((column: SummaryColumn, index: number): void => {
    if (index === 0) {
      sums[index] = '当页合计'
      return
    }
    if (column.property === 'count') {
      sums[index] = pagedOrders.value.reduce((acc: number, row: OrderRow): number => acc + row.count, 0)
    } else if (column.property === 'amount') {
      const total: number = pagedOrders.value.reduce((acc: number, row: OrderRow): number => acc + calcAmount(row), 0)
      sums[index] = `¥ ${total.toFixed(2)}`
    } else {
      sums[index] = ''
    }
  })
  return sums
}

// ------ Calendar / Statistic / Segmented / Descriptions / Carousel ------
const calendarValue = ref(new Date())
const countdownValue = ref(Date.now() + 1000 * 60 * 60 * 24 * 3 + 1000 * 30) // 3 days from now
const segmentedValue = ref('日')
const segmentedOptions = ['日', '周', '月', '季', '年']

// ------ Steps / Menu ------
const activeStep = ref(1)
const activeMenu = ref('1-1')

// ------ Dialog / Drawer / Watermark / InfiniteScroll / Tour ------
const dialogVisible = ref(false)
const drawerVisible = ref(false)
const popoverVisible = ref(false)
const tourOpen = ref(false)
const watermarkContent = ref('HooksVue')

const showConfirm = () => {
  ElMessageBox.confirm('确定要执行此操作吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    ElMessage.success('操作已执行')
  }).catch(() => {})
}

// InfiniteScroll simulation
const scrollCount = ref(10)
const loadMore = () => {
  if (scrollCount.value < 30) {
    setTimeout(() => {
      scrollCount.value += 5
    }, 500)
  }
}
</script>

<template>
  <div>
    <!-- Config Provider 全局配置国际化演示 -->
    <div class="demo-section" style="margin-bottom: 24px;">
      <h4 class="demo-title">Config Provider 全局配置 (语言国际化控制中心)</h4>
      <div style="background: var(--el-fill-color-blank, #ffffff); padding: 20px; border-radius: 8px; border: 1px solid var(--el-border-color, #dcdfe6);">
        <div style="margin-bottom: 16px; display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 14px; font-weight: bold; color: var(--el-text-color-primary);">切换界面语言:</span>
          <el-button type="primary" size="small" @click="toggleLocale">
            🌐 切换至 {{ currentLocale.name === 'zh-cn' ? 'English (en)' : '中文 (zh-cn)' }}
          </el-button>
        </div>
        
        <!-- 容器包装 -->
        <el-config-provider :locale="currentLocale">
          <div style="display: flex; gap: 20px; flex-wrap: wrap; align-items: center; border: 1px dashed var(--el-border-color, #dcdfe6); padding: 16px; border-radius: 6px;">
            <div>
              <div style="font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 4px;">分页器翻译：</div>
              <el-pagination :total="100" layout="prev, pager, next, jumper" />
            </div>
            <div>
              <div style="font-size: 12px; color: var(--el-text-color-secondary); margin-bottom: 4px;">空占位翻译：</div>
              <el-empty description="数据加载失败" :image-size="40" style="padding: 0;" />
            </div>
          </div>
        </el-config-provider>
      </div>
    </div>

    <el-row :gutter="24">
      <!-- 左半部 -->
      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Form 企业级分步校验表单 (数据保留与局部校验)</h4>
          
          <!-- 步骤指示条 -->
          <el-steps :active="formStep" finish-status="success" simple style="margin-bottom: 20px; background: var(--el-fill-color-light, #f5f7fa); border-radius: 6px; padding: 10px 16px;">
            <el-step title="账号设置" />
            <el-step title="个人资料" />
            <el-step title="确认提交" />
          </el-steps>

          <!-- 统一表单容器 -->
          <el-form ref="formRef" :model="form" :rules="rules" label-width="80px" size="small">
            <!-- 步骤 1：账号设置 -->
            <div v-if="formStep === 0">
              <el-form-item label="用户名" prop="username">
                <el-input v-model="form.username" placeholder="请输入用户名 (3-15位)" clearable />
              </el-form-item>
              <el-form-item label="邮箱地址" prop="email">
                <el-input v-model="form.email" placeholder="请输入常用电子邮箱" clearable />
              </el-form-item>
              <el-form-item label="登录密码" prop="password">
                <el-input v-model="form.password" type="password" show-password placeholder="请输入长度不小于6位的密码" />
              </el-form-item>
            </div>

            <!-- 步骤 2：详细个人资料 -->
            <div v-if="formStep === 1">
              <el-form-item label="用户昵称" prop="nickname">
                <el-input v-model="form.nickname" placeholder="请输入显示昵称" clearable />
              </el-form-item>
              <el-form-item label="性别选择">
                <el-radio-group v-model="form.gender">
                  <el-radio value="male">男生 🙋‍♂️</el-radio>
                  <el-radio value="female">女生 🙋‍♀️</el-radio>
                </el-radio-group>
              </el-form-item>
              <el-form-item label="技术兴趣">
                <el-checkbox-group v-model="form.interests">
                  <el-checkbox value="vue">Vue</el-checkbox>
                  <el-checkbox value="react">React</el-checkbox>
                  <el-checkbox value="go">Golang</el-checkbox>
                  <el-checkbox value="python">Python</el-checkbox>
                </el-checkbox-group>
              </el-form-item>
              <el-form-item label="自我介绍">
                <el-input v-model="form.desc" type="textarea" :rows="2" placeholder="简单写两句关于您的介绍吧..." />
              </el-form-item>
            </div>

            <!-- 步骤 3：数据总览与确认提交 -->
            <div v-if="formStep === 2">
              <div style="background: var(--el-fill-color-light, #f5f7fa); padding: 12px; border-radius: 6px; margin-bottom: 16px; font-size: 13px; color: var(--el-text-color-regular); line-height: 1.8;">
                <p>📋 <strong>账号名：</strong> {{ form.username }}</p>
                <p>📧 <strong>邮箱：</strong> {{ form.email }}</p>
                <p>👤 <strong>昵称：</strong> {{ form.nickname }}</p>
                <p>👫 <strong>性别：</strong> {{ form.gender === 'male' ? '男生' : '女生' }}</p>
                <p>💡 <strong>兴趣：</strong> {{ form.interests.length > 0 ? form.interests.join('、') : '无' }}</p>
                <p>📝 <strong>个人介绍：</strong> {{ form.desc || '未填写' }}</p>
              </div>
              
              <el-form-item label-width="0">
                <el-checkbox v-model="form.agree">
                  我已核对上述所有登记数据，确认完全无误
                </el-checkbox>
              </el-form-item>
            </div>

            <!-- 操作导航按钮区 -->
            <el-form-item label-width="0" style="margin-top: 20px;">
              <el-button v-if="formStep > 0" @click="prevStep" :disabled="isSubmitting">
                ← 上一步 (数据保留)
              </el-button>
              <el-button v-if="formStep < 2" type="primary" @click="nextStep">
                下一步 (局部校验) →
              </el-button>
              <el-button v-if="formStep === 2" type="success" :loading="isSubmitting" @click="submitForm">
                🚀 确认提交
              </el-button>
            </el-form-item>
          </el-form>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Autocomplete 输入建议</h4>
          <el-autocomplete
            v-model="autocompleteValue"
            :fetch-suggestions="queryFrameworks"
            clearable
            placeholder="输入 vue/react 提示"
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Mention 提及成员</h4>
          <el-mention
            v-model="mentionValue"
            :options="mentionOptions"
            placeholder="输入 @ 触发人员提及"
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Virtualized Select 虚拟化选择（1000 条）</h4>
          <el-select-v2
            v-model="selectV2Value"
            :options="selectV2Options"
            placeholder="滑动加载（超高性能）"
            filterable
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">TreeSelect 树形选择器</h4>
          <el-tree-select
            v-model="treeSelectValue"
            :data="treeSelectData"
            check-strictly
            placeholder="带树状结构选择"
            style="width: 300px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Tree 树形控件（搜索过滤与动态增删）</h4>
          <el-input
            v-model="filterText"
            placeholder="输入关键字进行过滤"
            style="margin-bottom: 12px; max-width: 300px;"
            clearable
          />
          <el-tree
            ref="treeRef"
            class="filter-tree"
            :data="editableTreeData"
            :props="defaultProps"
            default-expand-all
            :filter-node-method="filterNode"
            node-key="id"
            style="max-width: 400px; padding: 8px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px;"
          >
            <template #default="{ node, data }">
              <span class="custom-tree-node" style="display: flex; align-items: center; justify-content: space-between; width: 100%; font-size: 13px;">
                <span>{{ node.label }}</span>
                <span class="tree-node-actions" style="margin-left: 12px; display: flex; gap: 4px;">
                  <el-button type="primary" link size="small" style="font-size: 11px; padding: 0;" @click.stop="appendNode(data)">➕</el-button>
                  <el-button type="danger" link size="small" style="font-size: 11px; padding: 0;" @click.stop="removeNode(node, data)">❌</el-button>
                </span>
              </span>
            </template>
          </el-tree>
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

      <!-- 右半部 -->
      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Upload 上传（拖拽与头像模拟）</h4>
          <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
            <!-- Avatar Drag & Drop -->
            <el-upload
              v-model:file-list="fileList"
              drag
              :auto-upload="false"
              :on-change="handleUploadChange"
              style="max-width: 240px;"
            >
              <div class="el-upload__text" style="padding: 10px 0; font-size: 12px;">
                📁 拖拽文件到此，或<em>选择文件</em>
              </div>
            </el-upload>
            
            <!-- Avatar preview -->
            <el-upload
              class="avatar-uploader"
              :show-file-list="false"
              :auto-upload="false"
              :on-change="handleAvatarSuccess"
              style="width: 80px; height: 80px; border: 1px dashed var(--el-border-color, #dcdfe6); border-radius: 6px; cursor: pointer; position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; background: var(--el-fill-color-light, #f5f7fa);"
            >
              <img v-if="avatarUrl" :src="avatarUrl" class="avatar" style="width: 100%; height: 100%; object-fit: cover;" />
              <el-icon v-else class="avatar-uploader-icon" style="font-size: 24px; color: #8c939d;"><Plus /></el-icon>
            </el-upload>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Virtualized Tree 虚拟化树 (大数据高性能渲染)</h4>
          <el-tree-v2
            :data="virtualTreeData"
            :height="200"
            show-checkbox
            style="max-width: 400px; padding: 8px; border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 6px;"
          />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Affix 固钉</h4>
          <el-affix :offset="80">
            <el-button type="primary">📌 固钉按钮 (滚动至此贴顶)</el-button>
          </el-affix>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Descriptions 描述列表</h4>
          <el-descriptions title="用户信息明细卡" :column="2" border>
            <el-descriptions-item label="用户名">HooksVue</el-descriptions-item>
            <el-descriptions-item label="手机号">181****8888</el-descriptions-item>
            <el-descriptions-item label="居住地">北京市</el-descriptions-item>
            <el-descriptions-item label="系统权限">
              <el-tag size="small">超级管理员</el-tag>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Segmented 分段控制器</h4>
          <el-segmented v-model="segmentedValue" :options="segmentedOptions" />
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Statistic 数值统计与趋势 / Countdown</h4>
          <div style="display: flex; flex-direction: column; gap: 12px;">
            <el-row :gutter="12">
              <el-col :span="12">
                <el-statistic title="今日活跃用户量" :value="268500">
                  <template #suffix>
                    <el-icon color="#67c23a"><CaretTop /></el-icon>
                  </template>
                </el-statistic>
              </el-col>
              <el-col :span="12">
                <el-statistic title="核心交易单量" :value="14382" precision="0">
                  <template #suffix>
                    <el-icon color="#f56c6c"><CaretBottom /></el-icon>
                  </template>
                </el-statistic>
              </el-col>
            </el-row>
            <el-countdown title="距离下一代版本发布倒计时" :value="countdownValue" format="D天 H时 m分 s秒" />
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Carousel 跑马灯轮播图（卡片布局）</h4>
          <el-carousel :interval="4000" type="card" height="120px">
            <el-carousel-item v-for="item in 4" :key="item" :class="'carousel-' + item">
              <h3 style="color: #fff; text-align: center; line-height: 120px; margin: 0;">卡片看板 {{ item }}</h3>
            </el-carousel-item>
          </el-carousel>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Steps 流程步骤条</h4>
          <el-steps :active="activeStep" finish-status="success" simple style="margin-top: 10px;">
            <el-step title="步骤 1" />
            <el-step title="步骤 2" />
            <el-step title="步骤 3" />
          </el-steps>
          <div style="margin-top: 10px;">
            <el-button size="small" @click="activeStep = (activeStep % 3) + 1">下一步</el-button>
          </div>
        </div>

        <div class="demo-section">
          <h4 class="demo-title">Menu 导航菜单（折叠式）</h4>
          <el-menu :default-active="activeMenu" mode="horizontal">
            <el-menu-item index="1">📂 菜单一</el-menu-item>
            <el-sub-menu index="2">
              <template #title>🛠️ 选项子级</template>
              <el-menu-item index="2-1">配置项 A</el-menu-item>
              <el-menu-item index="2-2">配置项 B</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </div>
      </el-col>
    </el-row>

    <!-- 综合扩展：表格（展开行） -->
    <div class="demo-section">
      <h4 class="demo-title">Table 表格（展开行数据详情）</h4>
      <el-table :data="expandTableData" style="width: 100%;">
        <el-table-column type="expand">
          <template #default="{ row }">
            <div style="padding: 12px 24px; font-size: 13px; color: var(--el-text-color-regular);">
              <p>📌 <strong>详细描述：</strong> {{ row.desc }}</p>
              <p>🌍 <strong>开发团队分布：</strong> 亚洲、欧洲多地研发协同</p>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="产品名称" prop="name" />
        <el-table-column label="分类" prop="type" />
        <el-table-column label="单价" prop="price" />
      </el-table>
    </div>

    <!-- 综合表格：搜索 + 分页 + 自定义计算 + 合计行 -->
    <div class="demo-section">
      <h4 class="demo-title">综合表格（实时过滤 + 分页 + 自定义汇总合计）</h4>
      <div style="margin-bottom: 12px; display: flex; gap: 10px; flex-wrap: wrap;">
        <el-input
          v-model="orderSearch"
          placeholder="搜索产品名称/支付状态"
          clearable
          style="max-width: 260px;"
          @input="handleOrderSearch"
        />
      </div>
      
      <el-table
        :data="pagedOrders"
        border
        show-summary
        :summary-method="orderSummary"
        style="width: 100%;"
      >
        <el-table-column prop="id" label="订单ID" width="70" />
        <el-table-column prop="product" label="产品名称" />
        <el-table-column prop="price" label="单价" />
        <el-table-column prop="count" label="数量" />
        <el-table-column label="总价 (单价×数量)">
          <template #default="{ row }">
            <span>¥ {{ calcAmount(row) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="status" label="支付状态" width="100">
          <template #default="{ row }">
            <el-tag
              :type="row.status === '已支付' ? 'success' : row.status === '待支付' ? 'warning' : 'danger'"
              size="small"
            >
              {{ row.status }}
            </el-tag>
          </template>
        </el-table-column>
      </el-table>
      
      <div style="margin-top: 12px; display: flex; justify-content: flex-end;">
        <el-pagination
          v-model:current-page="orderPage"
          v-model:page-size="orderPageSize"
          :page-sizes="[5, 10, 15]"
          layout="total, sizes, prev, pager, next"
          :total="filteredOrders.length"
        />
      </div>
    </div>

    <!-- Calendar 日历自定义插槽 -->
    <div class="demo-section">
      <h4 class="demo-title">Calendar 日历（自定义日程卡槽插槽）</h4>
      <el-calendar v-model="calendarValue">
        <template #date-cell="{ data }">
          <div class="calendar-day" style="font-size: 11px; height: 100%; display: flex; flex-direction: column; justify-content: space-between; padding: 4px;">
            <span>{{ data.day.split('-').slice(2).join('') }}</span>
            <el-tag v-if="data.day.endsWith('14')" size="small" type="danger">发布会</el-tag>
            <el-tag v-else-if="data.day.endsWith('08') || data.day.endsWith('22')" size="small" type="success">常规迭代</el-tag>
          </div>
        </template>
      </el-calendar>
    </div>

    <el-row :gutter="24">
      <el-col :xs="24" :sm="12">
        <div class="demo-section">
          <h4 class="demo-title">Feedback 弹窗与确认框</h4>
          <div class="demo-row">
            <el-button @click="dialogVisible = true">打开对话框</el-button>
            <el-button @click="drawerVisible = true">展开抽屉</el-button>
            <el-button type="danger" @click="showConfirm">气泡确认警告</el-button>
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

    <!-- 🔌 动态路由 & 权限控制演示 -->
    <div class="demo-section" style="margin-top: 24px;">
      <h4 class="demo-title">🔌 Dynamic Routing 动态路由与权限菜单演示</h4>
      <div style="background: var(--el-fill-color-blank, #ffffff); padding: 20px; border-radius: 8px; border: 1px solid var(--el-border-color, #dcdfe6);">
        <el-row :gutter="24" align="middle">
          <el-col :xs="24" :sm="10">
            <div style="margin-bottom: 16px;">
              <span style="font-size: 14px; font-weight: bold; margin-right: 12px; color: var(--el-text-color-primary);">当前角色权限：</span>
              <el-radio-group v-model="currentRole" size="small">
                <el-radio-button value="admin">Admin 管理员</el-radio-button>
                <el-radio-button value="editor">Editor 编辑</el-radio-button>
                <el-radio-button value="visitor">Visitor 游客</el-radio-button>
              </el-radio-group>
            </div>
            
            <div style="margin-bottom: 16px; font-size: 13px; color: var(--el-text-color-secondary); line-height: 1.5;">
              <p>💡 <b>路由控制原理：</b> 系统会根据选中的 Role 角色，在计算属性中过滤路由表，动态渲染左侧导航菜单，从而控制页面访问权限。</p>
            </div>
            
            <div style="display: flex; gap: 8px; flex-wrap: wrap;">
              <el-button type="success" size="small" @click="handleMountRoute" :disabled="hasMountedRoute">
                🔌 动态注入路由 (/temp-page)
              </el-button>
              <el-button type="danger" size="small" plain @click="handleUnmountRoute" :disabled="!hasMountedRoute">
                🔌 卸载该路由
              </el-button>
            </div>
          </el-col>
          
          <el-col :xs="24" :sm="14">
            <!-- 模拟的左侧导航栏 -->
            <div class="mock-nav-sidebar" style="background: var(--el-fill-color-light, #f5f7fa); border: 1px solid var(--el-border-color, #dcdfe6); border-radius: 8px; overflow: hidden; max-width: 450px;">
              <div class="mock-sidebar-header" style="background: var(--el-color-primary-light-9, #ecf5ff); padding: 10px 16px; font-size: 13px; font-weight: bold; color: var(--el-color-primary); border-bottom: 1px solid var(--el-border-color, #dcdfe6);">
                📂 动态生成的系统菜单 (Role: {{ currentRole }})
              </div>
              <ul class="mock-sidebar-menu" style="list-style: none; padding: 10px; margin: 0; display: flex; flex-direction: column; gap: 6px;">
                <li v-for="menu in filteredMenus" :key="menu.path" class="mock-menu-item" style="display: flex; align-items: center; gap: 10px; padding: 8px 12px; border-radius: 6px; background: var(--el-fill-color-blank, #ffffff); border: 1px solid var(--el-border-color-light, #f0f2f5); font-size: 13px; transition: all 0.2s;">
                  <span class="menu-icon">{{ menu.icon }}</span>
                  <span class="menu-label" style="font-weight: 500; color: var(--el-text-color-primary);">{{ menu.name }}</span>
                  <span style="font-size: 11px; color: var(--el-text-color-secondary); margin-left: 8px;">{{ menu.path }}</span>
                  <el-tag v-if="menu.role" size="small" type="warning" style="margin-left: auto;">{{ menu.role }}</el-tag>
                  <el-tag v-if="menu.isTemp" size="small" type="success" style="margin-left: auto;">动态新增</el-tag>
                </li>
              </ul>
            </div>
          </el-col>
        </el-row>
      </div>
    </div>
  </div>
</template>

<style scoped src="./css/AdvancedDemo.css"></style>
