import assert from 'node:assert/strict'
import test from 'node:test'

import { parseRawHelloWorldHtml } from '../src/vue-pages-text-fn-abc/helloworld.ts'

const fixture = `
  <div class="blog-item">
    <div class="blog-header">
      <a href="/74966852" class="name">京东云开发者</a>
      <span class="time">3个月前</span>
    </div>
    <div class="blog-content">
      <a href="/p/1922620579" title="深入理解 Linux 文件系统" class="title">深入理解 Linux 文件系统</a>
      <div class="intro">inode 与路径解析</div>
    </div>
    <span class="num">979</span><span class="num">8</span><span class="num">2</span>
  </div>
  <div class="author-item">
    <img src="https://img.example.com/avatar.jpg" class="avatar">
    <a href="/6843671385" class="author-info">
      <span class="name">万界星空科技</span>
      <span class="count">市场运营</span>
    </a>
  </div>
  <a href="/lesson/detail/4054943041" class="re-course-list">
    <img src="https://img.example.com/course.png">
    <h2>Android 源码分析</h2>
    <div class="price">免费</div>
    <div class="des"><span>25人学习</span></div>
  </a>
`

test('parses HelloWorld lists directly from raw SSR HTML', () => {
  const parsed = parseRawHelloWorldHtml(fixture)

  assert.equal(parsed.articles.length, 1)
  assert.equal(parsed.articles[0]?.title, '深入理解 Linux 文件系统')
  assert.equal(parsed.articles[0]?.url, 'https://www.helloworld.net/p/1922620579')
  assert.equal(parsed.articles[0]?.readCount, '979')

  assert.equal(parsed.authors.length, 1)
  assert.equal(parsed.authors[0]?.name, '万界星空科技')
  assert.equal(parsed.authors[0]?.job, '市场运营')

  assert.equal(parsed.lessons.length, 1)
  assert.equal(parsed.lessons[0]?.title, 'Android 源码分析')
  assert.equal(parsed.lessons[0]?.learnCount, '25人学习')
})

const nuxtOnlyFixture = `
  <html>
    <body>
      <div id="__nuxt"></div>
      <script>window.__NUXT__=(function(a,b,c,d,e){return {state:{recommend:{recommendBlog:{data:[{uuid:"1922620579",title:"深入理解Linux文件系统",intro:"inode 映射",publishTime:"2026-04-22T22:30:26.282688+08:00",homeImg:c,readCount:981,zanCount:a,commentCount:a,profile:"0334105138",nicker:"方悦",avatar:"https:\\u002F\\u002Fimg.example.com\\u002Fa.jpg"}]},recommendAuthorList:[{profile:"6843671385",nicker:"万界星空科技",avatar:"https:\\u002F\\u002Fimg.example.com\\u002Fb.jpg",job:"市场运营"}],recommendLessonList:[{cover:"https:\\u002F\\u002Fimg.example.com\\u002Fc.png",name:"AI时代大模型开发全流程解析",payCount:25,price:a,uuid:"4716880025"}]}}}}(0,"",void 0,false,true));</script>
    </body>
  </html>
`

test('parses HelloWorld lists from Nuxt payload when SSR list nodes are absent', () => {
  const parsed = parseRawHelloWorldHtml(nuxtOnlyFixture)

  assert.equal(parsed.articles.length, 1)
  assert.equal(parsed.articles[0]?.title, '深入理解Linux文件系统')
  assert.equal(parsed.articles[0]?.url, 'https://www.helloworld.net/p/1922620579')
  assert.equal(parsed.articles[0]?.readCount, '981')

  assert.equal(parsed.authors.length, 1)
  assert.equal(parsed.authors[0]?.name, '万界星空科技')

  assert.equal(parsed.lessons.length, 1)
  assert.equal(parsed.lessons[0]?.title, 'AI时代大模型开发全流程解析')
  assert.equal(parsed.lessons[0]?.learnCount, '25人学习')
})
