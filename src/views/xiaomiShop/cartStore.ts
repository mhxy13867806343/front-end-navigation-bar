import { ref, computed } from 'vue'
import { ElMessage } from 'element-plus'

export interface CartItem {
  id: string
  productId: string
  name: string
  subtitle: string
  coverImage: string
  specName: string
  colorName: string
  price: number
  quantity: number
  selected: boolean
}

const STORAGE_KEY = 'xiaomi_shop_cart_items_v1'

const loadCart = (): CartItem[] => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      return JSON.parse(raw)
    }
  } catch (err) {
    console.error('Failed to load cart from localStorage', err)
  }
  // Initial default mock items if empty
  return [
    {
      id: 'cart-init-1',
      productId: 'mi-prod-1',
      name: '小米 15 Pro (2026 尊享生态版 #1)',
      subtitle: '小米手机 专属高端选购系列',
      coverImage: 'https://img.service.mi.com/static/cms/mi15pro.png',
      specName: '至尊满配版 (16GB + 512GB)',
      colorName: '岩石灰',
      price: 5299,
      quantity: 1,
      selected: true
    },
    {
      id: 'cart-init-2',
      productId: 'mi-prod-2',
      name: 'Redmi K80 Pro (2026 尊享生态版 #2)',
      subtitle: 'Redmi 手机 专属高端选购系列',
      coverImage: 'https://img.service.mi.com/static/cms/redmik80pro.png',
      specName: '高配进阶版 (12GB + 256GB)',
      colorName: '墨羽',
      price: 3699,
      quantity: 1,
      selected: true
    }
  ]
}

export const cartItems = ref<CartItem[]>(loadCart())

const saveCart = () => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(cartItems.value))
  } catch (err) {
    console.error('Failed to save cart to localStorage', err)
  }
}

export const addToCartStore = (itemData: {
  productId: string
  name: string
  subtitle: string
  coverImage: string
  specName?: string
  colorName?: string
  price: number
  quantity?: number
}) => {
  const spec = itemData.specName || '标准配置'
  const color = itemData.colorName || '经典色'
  const qty = itemData.quantity || 1

  const existing = cartItems.value.find(
    i => i.productId === itemData.productId && i.specName === spec && i.colorName === color
  )

  if (existing) {
    existing.quantity += qty
  } else {
    cartItems.value.push({
      id: `cart-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      productId: itemData.productId,
      name: itemData.name,
      subtitle: itemData.subtitle,
      coverImage: itemData.coverImage,
      specName: spec,
      colorName: color,
      price: itemData.price,
      quantity: qty,
      selected: true
    })
  }
  saveCart()
  ElMessage.success(`🛒 成功将 [${itemData.name}] 加入购物车！`)
}

export const removeFromCartStore = (id: string) => {
  cartItems.value = cartItems.value.filter(item => item.id !== id)
  saveCart()
  ElMessage.info('已从购物车中移除该商品')
}

export const updateCartQuantity = (id: string, delta: number) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    item.quantity += delta
    if (item.quantity <= 0) {
      removeFromCartStore(id)
    } else {
      saveCart()
    }
  }
}

export const clearCartStore = () => {
  cartItems.value = []
  saveCart()
  ElMessage.warning('购物车已清空')
}

export const toggleCartSelect = (id: string) => {
  const item = cartItems.value.find(i => i.id === id)
  if (item) {
    item.selected = !item.selected
    saveCart()
  }
}

export const toggleSelectAll = (selected: boolean) => {
  cartItems.value.forEach(item => {
    item.selected = selected
  })
  saveCart()
}

export const cartTotalCount = computed(() => {
  return cartItems.value.reduce((acc, item) => acc + item.quantity, 0)
})

export const selectedTotalCount = computed(() => {
  return cartItems.value.filter(i => i.selected).reduce((acc, item) => acc + item.quantity, 0)
})

export const selectedTotalAmount = computed(() => {
  return cartItems.value
    .filter(i => i.selected)
    .reduce((acc, item) => acc + item.price * item.quantity, 0)
})
