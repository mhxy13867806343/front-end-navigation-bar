<script setup lang="ts">
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import shopDataRaw from '../../shop-json/xiaomi-shop.json'

interface Product {
  id: string
  name: string
  title: string
  subtitle: string
  category: string
  price: number
  originalPrice: number
  tag: string
  rating: number
  sales: number
  stock: number
  coverImage: string
  colors: { name: string; hex: string }[]
  specs: { name: string; price: number }[]
  highlights: string[]
  description: string
}

interface Banner {
  id: string
  title: string
  subtitle: string
  price: number
  tag: string
  bgGradient: string
  productId: string
}

const router = useRouter()

const shopInfo = shopDataRaw.shopInfo
const banners: Banner[] = shopDataRaw.banners
const categories = shopDataRaw.categories
const products: Product[] = shopDataRaw.products

const selectedCategory = ref('all')
const searchQuery = ref('')
const currentBannerIndex = ref(0)
const cartCount = ref(2)

const filteredProducts = computed(() => {
  return products.filter(p => {
    if (selectedCategory.value !== 'all' && p.category !== selectedCategory.value) {
      return false
    }
    if (searchQuery.value.trim()) {
      const q = searchQuery.value.toLowerCase()
      return (
        p.name.toLowerCase().includes(q) ||
        p.title.toLowerCase().includes(q) ||
        p.subtitle.toLowerCase().includes(q)
      )
    }
    return true
  })
})

const goToDetail = (productId: string) => {
  router.push(`/xiaomi-shop/detail/${productId}`)
}

const addToCart = (e: MouseEvent, product: Product) => {
  e.stopPropagation()
  cartCount.value++
  ElMessage.success(`🛒 成功将 [${product.name}] 加入购物车！`)
}

const handleBannerClick = (productId: string) => {
  goToDetail(productId)
}

const goHome = () => {
  router.push('/')
}
</script>

<template>
  <div class="xiaomi-shop-page">
    <!-- Top Announcement Bar -->
    <div class="top-bar">
      <div class="container bar-content">
        <span>{{ shopInfo.notice }}</span>
        <div class="top-links">
          <span @click="goHome">↩ 返回全站主页</span>
          <span class="divider">|</span>
          <span>小米官网</span>
          <span class="divider">|</span>
          <span>小米云服务</span>
          <span class="divider">|</span>
          <span>资质证照</span>
        </div>
      </div>
    </div>

    <!-- Main Header -->
    <header class="main-header">
      <div class="container header-content">
        <div class="brand-logo" @click="goHome">
          <div class="mi-logo-square">
            <span class="mi-text">mi</span>
          </div>
          <div class="brand-titles">
            <h1 class="shop-title">小米商城</h1>
            <span class="shop-sub">Xiaomi Shop Official</span>
          </div>
        </div>

        <div class="search-box">
          <el-input
            v-model="searchQuery"
            placeholder="搜一搜 小米15 / Redmi K80 / 电视 / 扫拖机器人..."
            size="large"
            clearable
          >
            <template #append>
              <el-button type="primary" class="mi-search-btn">🔍 搜索</el-button>
            </template>
          </el-input>
        </div>

        <div class="header-cart" @click="ElMessage.info('当前购物车已有 ' + cartCount + ' 件商品')">
          <span class="cart-icon">🛒</span>
          <span>购物车</span>
          <span class="cart-badge">{{ cartCount }}</span>
        </div>
      </div>
    </header>

    <!-- Category Nav Bar -->
    <nav class="category-nav">
      <div class="container nav-items">
        <button
          v-for="cat in categories"
          :key="cat.key"
          class="nav-btn"
          :class="{ active: selectedCategory === cat.key }"
          @click="selectedCategory = cat.key"
        >
          <span class="cat-icon">{{ cat.icon }}</span>
          <span class="cat-name">{{ cat.name }}</span>
        </button>
      </div>
    </nav>

    <!-- Hero Banner Slider -->
    <section class="banner-section container">
      <el-carousel trigger="click" height="380px" indicator-position="inside" :interval="5000">
        <el-carousel-item v-for="b in banners" :key="b.id">
          <div
            class="banner-slide"
            :style="{ background: b.bgGradient }"
            @click="handleBannerClick(b.productId)"
          >
            <div class="slide-info">
              <span class="slide-tag">{{ b.tag }}</span>
              <h2 class="slide-title">{{ b.title }}</h2>
              <p class="slide-sub">{{ b.subtitle }}</p>
              <div class="slide-price">
                <span class="currency">￥</span>
                <strong class="num">{{ b.price }}</strong>
                <span class="unit">起</span>
              </div>
              <el-button type="primary" size="large" class="mi-btn-orange">
                立即前往查看详情 →
              </el-button>
            </div>
            <div class="slide-visual">
              <div class="visual-sphere">
                <span class="visual-text">XIAOMI</span>
              </div>
            </div>
          </div>
        </el-carousel-item>
      </el-carousel>
    </section>

    <!-- Product Showcase Grid -->
    <main class="product-section container">
      <div class="section-header">
        <h2 class="section-title">
          {{ categories.find(c => c.key === selectedCategory)?.name }}
          <span class="count-hint">({{ filteredProducts.length }} 款热销选购)</span>
        </h2>
      </div>

      <div v-if="filteredProducts.length === 0" class="empty-box">
        <span>🔍 没有找到匹配的商品，请更换搜索词试试。</span>
      </div>

      <div class="products-grid">
        <div
          v-for="item in filteredProducts"
          :key="item.id"
          class="product-card"
          @click="goToDetail(item.id)"
        >
          <div class="card-tag" v-if="item.tag">{{ item.tag }}</div>
          <div class="card-img-wrap">
            <div class="fake-product-img">
              <span class="img-logo">mi</span>
              <span class="img-name">{{ item.name }}</span>
            </div>
          </div>

          <div class="card-body">
            <h3 class="p-name">{{ item.name }}</h3>
            <p class="p-sub">{{ item.subtitle }}</p>
            <div class="price-row">
              <span class="price-current">￥{{ item.price }}<span class="qi">起</span></span>
              <span class="price-original" v-if="item.originalPrice > item.price">￥{{ item.originalPrice }}</span>
            </div>

            <div class="card-footer-actions">
              <el-button size="small" class="detail-btn" @click.stop="goToDetail(item.id)">
                查看详情
              </el-button>
              <el-button size="small" type="warning" class="cart-btn" @click="(e: MouseEvent) => addToCart(e, item)">
                🛒 加入购物车
              </el-button>
            </div>
          </div>
        </div>
      </div>
    </main>

    <!-- Service Guarantees Footer -->
    <footer class="shop-footer">
      <div class="container">
        <div class="service-bar">
          <div class="s-item"><span>🔧</span> 预约维修服务</div>
          <div class="s-item"><span>7</span> 7天无理由退货</div>
          <div class="s-item"><span>15</span> 15天免费换货</div>
          <div class="s-item"><span>🚚</span> 满69元包邮</div>
          <div class="s-item"><span>📍</span> 520余家售后网点</div>
        </div>
        <div class="copyright">
          <p>小米商城模仿演示界面 | 纯数据驱动 JSON：<code>src/shop-json/xiaomi-shop.json</code></p>
        </div>
      </div>
    </footer>
  </div>
</template>

<style scoped lang="scss">
.xiaomi-shop-page {
  min-height: 100vh;
  background: #f5f5f5;
  color: #333;
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

.container {
  max-width: 1226px;
  margin: 0 auto;
  padding: 0 16px;
  box-sizing: border-box;
}

.top-bar {
  background: #333;
  color: #b0b0b0;
  font-size: 12px;
  height: 40px;
  line-height: 40px;

  .bar-content {
    display: flex;
    justify-content: space-between;
    align-items: center;

    .top-links {
      display: flex;
      gap: 8px;
      align-items: center;

      span {
        cursor: pointer;
        &:hover { color: #fff; }
      }
      .divider { color: #424242; }
    }
  }
}

.main-header {
  background: #fff;
  padding: 20px 0;
  box-shadow: 0 2px 10px rgba(0,0,0,0.05);

  .header-content {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 20px;

    .brand-logo {
      display: flex;
      align-items: center;
      gap: 12px;
      cursor: pointer;

      .mi-logo-square {
        width: 48px;
        height: 48px;
        background: #ff6700;
        border-radius: 14px;
        display: flex;
        align-items: center;
        justify-content: center;

        .mi-text {
          color: #fff;
          font-weight: 900;
          font-size: 24px;
          letter-spacing: -1px;
        }
      }

      .brand-titles {
        .shop-title {
          font-size: 22px;
          font-weight: 800;
          color: #333;
          margin: 0;
        }
        .shop-sub {
          font-size: 11px;
          color: #999;
        }
      }
    }

    .search-box {
      flex: 1;
      max-width: 520px;

      .mi-search-btn {
        background: #ff6700;
        border-color: #ff6700;
        color: #fff;
        font-weight: bold;
      }
    }

    .header-cart {
      background: #ff6700;
      color: #fff;
      padding: 10px 20px;
      border-radius: 8px;
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
      font-weight: bold;
      transition: background 0.2s;

      &:hover { background: #f25807; }

      .cart-badge {
        background: #fff;
        color: #ff6700;
        font-size: 12px;
        padding: 1px 6px;
        border-radius: 10px;
      }
    }
  }
}

.category-nav {
  background: #fff;
  border-top: 1px solid #eee;

  .nav-items {
    display: flex;
    gap: 8px;
    overflow-x: auto;
    padding: 8px 0;

    .nav-btn {
      background: transparent;
      border: none;
      padding: 10px 18px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
      color: #666;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 6px;
      transition: all 0.2s;

      &:hover {
        color: #ff6700;
        background: #fff5ee;
      }

      &.active {
        color: #fff;
        background: #ff6700;
        font-weight: bold;
      }
    }
  }
}

.banner-section {
  margin-top: 16px;
  margin-bottom: 24px;
  border-radius: 16px;
  overflow: hidden;

  .banner-slide {
    height: 100%;
    padding: 40px 60px;
    box-sizing: border-box;
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: #fff;
    cursor: pointer;

    .slide-info {
      max-width: 520px;

      .slide-tag {
        background: #ff6700;
        color: #fff;
        font-size: 12px;
        padding: 3px 10px;
        border-radius: 12px;
        font-weight: bold;
      }

      .slide-title {
        font-size: 36px;
        font-weight: 800;
        margin: 12px 0 8px;
      }

      .slide-sub {
        font-size: 15px;
        color: #cbd5e1;
        margin-bottom: 20px;
        line-height: 1.5;
      }

      .slide-price {
        margin-bottom: 24px;
        .currency { font-size: 20px; color: #ff6700; font-weight: bold; }
        .num { font-size: 38px; color: #ff6700; font-weight: 900; }
        .unit { font-size: 14px; color: #94a3b8; margin-left: 4px; }
      }

      .mi-btn-orange {
        background: #ff6700;
        border-color: #ff6700;
        font-weight: bold;
      }
    }

    .slide-visual {
      .visual-sphere {
        width: 220px;
        height: 220px;
        border-radius: 50%;
        background: radial-gradient(circle, rgba(255,103,0,0.3) 0%, transparent 70%);
        border: 2px dashed rgba(255,103,0,0.5);
        display: flex;
        align-items: center;
        justify-content: center;

        .visual-text {
          font-size: 32px;
          font-weight: 900;
          color: rgba(255,255,255,0.4);
          letter-spacing: 4px;
        }
      }
    }
  }
}

.product-section {
  margin-bottom: 40px;

  .section-header {
    margin-bottom: 20px;
    .section-title {
      font-size: 22px;
      font-weight: 700;
      color: #333;

      .count-hint {
        font-size: 14px;
        color: #888;
        font-weight: normal;
      }
    }
  }

  .empty-box {
    background: #fff;
    padding: 40px;
    text-align: center;
    border-radius: 12px;
    color: #666;
  }

  .products-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;

    .product-card {
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      padding: 20px;
      cursor: pointer;
      position: relative;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;

      &:hover {
        transform: translateY(-5px);
        box-shadow: 0 12px 30px rgba(0,0,0,0.1);
      }

      .card-tag {
        position: absolute;
        top: 12px;
        left: 12px;
        background: #e53935;
        color: #fff;
        font-size: 11px;
        padding: 2px 8px;
        border-radius: 4px;
        font-weight: bold;
      }

      .card-img-wrap {
        height: 180px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-bottom: 16px;

        .fake-product-img {
          width: 140px;
          height: 140px;
          background: linear-gradient(135deg, #fff5ee, #ffe4d6);
          border-radius: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          border: 1px solid #ffd0b3;

          .img-logo {
            font-size: 28px;
            font-weight: 900;
            color: #ff6700;
          }
          .img-name {
            font-size: 12px;
            color: #ff6700;
            font-weight: bold;
            margin-top: 4px;
          }
        }
      }

      .card-body {
        flex: 1;
        display: flex;
        flex-direction: column;

        .p-name {
          font-size: 16px;
          font-weight: 700;
          color: #333;
          margin: 0 0 6px;
        }

        .p-sub {
          font-size: 12px;
          color: #b0b0b0;
          margin: 0 0 14px;
          line-height: 1.4;
          height: 34px;
          overflow: hidden;
        }

        .price-row {
          margin-bottom: 16px;
          margin-top: auto;
          display: flex;
          align-items: baseline;
          gap: 8px;

          .price-current {
            color: #ff6700;
            font-size: 20px;
            font-weight: 800;

            .qi { font-size: 12px; font-weight: normal; margin-left: 2px; }
          }

          .price-original {
            color: #b0b0b0;
            font-size: 13px;
            text-decoration: line-through;
          }
        }

        .card-footer-actions {
          display: flex;
          gap: 8px;

          .detail-btn {
            flex: 1;
          }

          .cart-btn {
            flex: 1;
            background: #ff6700;
            border-color: #ff6700;
            color: #fff;
          }
        }
      }
    }
  }
}

.shop-footer {
  background: #fff;
  border-top: 1px solid #e0e0e0;
  padding: 30px 0;
  color: #666;

  .service-bar {
    display: flex;
    justify-content: space-around;
    padding-bottom: 24px;
    border-bottom: 1px solid #f0f0f0;
    font-size: 15px;

    .s-item {
      display: flex;
      align-items: center;
      gap: 6px;
      span { font-weight: bold; color: #ff6700; }
    }
  }

  .copyright {
    text-align: center;
    margin-top: 20px;
    font-size: 13px;
    color: #999;

    code { color: #ff6700; }
  }
}
</style>
