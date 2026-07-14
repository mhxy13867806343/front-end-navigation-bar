// Global constants and config parameters for the navigation site

export const GLOBAL_CONFIG = {
  // Background images
  bingWallpaperUrl: 'https://bing.img.run/rand_uhd.php',
  defaultWallpaperUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1920&q=80',
  
  // API endpoints
  weatherApiUrl: 'https://api.jirengu.com/weather.php',
  quoteDujitangUrl: 'https://v2.xxapi.cn/api/dujitang',
  
  // Hot lists (Douyin / Weibo backup URLs)
  hotWeiboUrl: 'https://v2.xxapi.cn/api/weibohot',
  hotDouyinUrl: 'https://v2.xxapi.cn/api/douyinhot',
  
  // Video channels
  videoGirlNormalUrl: 'https://api.kuleu.com/api/sjxjj?type=json',
  videoGirlHDUrl: 'https://api.kuleu.com/api/sjxjj?type=mp4', // fallback: MP4 hd channel
  
  // Photo galleries
  photoMeinvUrl: 'https://v2.xxapi.cn/api/meinvpic',
  photoBaisiUrl: 'https://v2.xxapi.cn/api/baisi',
  
  // Default search engine index
  defaultSearchEngine: 'baidu'
}

export const BING_DOMAINS = {
  rand_4k: 'https://bing.img.run/rand_uhd.php',
  rand_1080: 'https://bing.img.run/rand.php',
  today_4k: 'https://bing.img.run/uhd.php',
  today_1080: 'https://bing.img.run/1920x1080.php'
}
