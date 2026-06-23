<template>
  <div class="home">
    <main class="home-main">
      <section class="hero">
        <div class="container">
          <div class="hero__content">
            <h1 class="hero__title">
              门厅
            </h1>
            <p class="hero__subtitle">
              欢迎来到心事邮局<br>
              在这里，每一封信都被温柔以待
            </p>
            <div class="hero__actions">
              <router-link to="/deposit" class="btn btn--primary btn--lg">
                写一封信
              </router-link>
              <router-link to="/plaza" class="btn btn--outline btn--lg">
                去回声广场
              </router-link>
            </div>
          </div>
          <div class="hero__visual">
            <div class="hero__card hero__card--1">
              <span class="emotion-tag emotion-tag--开心">开心</span>
              <p>今天的日落真美~</p>
            </div>
            <div class="hero__card hero__card--2">
              <span class="emotion-tag emotion-tag--平静">平静</span>
              <p>雨声很治愈</p>
            </div>
            <div class="hero__card hero__card--3">
              <span class="emotion-tag emotion-tag--感动">感动</span>
              <p>收到了好久不见的信</p>
            </div>
          </div>
        </div>
      </section>

      <section class="quick-section" v-if="userStore.isLoggedIn">
        <div class="container">
          <h2 class="section-title">今日关怀</h2>
          <div class="quick-grid">
            <div class="quick-card mood-chart-card">
              <div class="quick-card__header">
                <h3 class="quick-card__title">心情分布</h3>
                <div class="time-tabs">
                  <button :class="['time-tab', { active: chartPeriod === '7days' }]" @click="chartPeriod = '7days'">7天</button>
                  <button :class="['time-tab', { active: chartPeriod === '30days' }]" @click="chartPeriod = '30days'">30天</button>
                </div>
              </div>
              <div class="mood-chart">
                <div class="chart-container">
                  <svg viewBox="0 0 200 200" class="pie-chart">
                    <path
                      v-for="(segment, index) in pieSegments"
                      :key="index"
                      :d="segment.path"
                      :fill="segment.color"
                      class="pie-slice"
                    />
                  </svg>
                </div>
                <div class="chart-legend">
                  <div v-for="item in legendItems" :key="item.emotion" class="legend-item">
                    <span class="legend-color" :style="{ background: item.color }"></span>
                    <span class="legend-text">{{ item.emotion }}</span>
                    <span class="legend-count">{{ item.count }}</span>
                  </div>
                </div>
              </div>
            </div>

            <div class="quick-card breathing-card">
              <div class="quick-card__header">
                <h3 class="quick-card__title">呼吸引导</h3>
                <span class="quick-card__icon">🌬️</span>
              </div>
              <div class="breathing-guide">
                <div class="breathing-circle" :class="{ active: breathingActive, inhale: breathingPhase === 'inhale', hold: breathingPhase === 'hold', exhale: breathingPhase === 'exhale' }">
                  <span class="breathing-text">{{ breathingText }}</span>
                </div>
                <button :class="['breathing-btn', { active: breathingActive }]" @click="toggleBreathing">
                  {{ breathingActive ? '停止' : '开始' }}
                </button>
              </div>
            </div>

            <div class="quick-card meditation-card">
              <div class="quick-card__header">
                <h3 class="quick-card__title">冥想引导</h3>
                <span class="quick-card__icon">🧘</span>
              </div>
              <div class="meditation-guide">
                <div class="meditation-steps">
                  <div v-for="(step, index) in meditationSteps" :key="index" :class="['meditation-step', { active: meditationStep === index }]">
                    <span class="step-number">{{ index + 1 }}</span>
                    <p>{{ step }}</p>
                  </div>
                </div>
                <div class="meditation-controls">
                  <button class="meditation-btn" @click="prevMeditationStep" :disabled="meditationStep === 0">上一步</button>
                  <button class="meditation-btn" @click="nextMeditationStep" :disabled="meditationStep === meditationSteps.length - 1">下一步</button>
                </div>
              </div>
            </div>

            <div class="quick-card recommend-card">
              <div class="quick-card__header">
                <h3 class="quick-card__title">TA需要你的帮助</h3>
                <span class="quick-card__icon">💝</span>
              </div>
              <div class="recommend-list">
                <div v-for="item in recommendedTreeholes" :key="item._id" class="recommend-item" @click="goToTreehole(item._id)">
                  <span class="emotion-tag" :class="`emotion-tag--${item.emotion}`">{{ getEmotionText(item.emotion) }}</span>
                  <p class="recommend-content">{{ truncate(item.content, 40) }}</p>
                  <span class="recommend-hint">点击倾听 →</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section class="features">
        <div class="container">
          <h2 class="features__title">心事邮局</h2>
          <div class="features__grid">
            <router-link to="/deposit" class="feature-card">
              <div class="feature-card__icon">📬</div>
              <h3 class="feature-card__title">心事寄存处</h3>
              <p class="feature-card__desc">写下心事，选择处理方式：粉碎、暂存、纪念、记录</p>
            </router-link>
            <router-link to="/plaza" class="feature-card">
              <div class="feature-card__icon">🌙</div>
              <h3 class="feature-card__title">回声广场</h3>
              <p class="feature-card__desc">匿名倾诉，善意回应，在共鸣中找到温暖</p>
            </router-link>
            <router-link to="/study" class="feature-card">
              <div class="feature-card__icon">🕯️</div>
              <h3 class="feature-card__title">夜灯书房</h3>
              <p class="feature-card__desc">专业心理文章，帮你更好地理解和管理情绪</p>
            </router-link>
          </div>
        </div>
      </section>

      <section class="cta">
        <div class="container">
          <div class="cta__content">
            <h2 class="cta__title">开始你的心事之旅</h2>
            <p class="cta__text">免费注册，开启专属你的心事档案</p>
            <router-link to="/auth" class="btn btn--primary btn--lg" v-if="!userStore.isLoggedIn">
              立即开始
            </router-link>
            <router-link to="/deposit" class="btn btn--primary btn--lg" v-else>
              写一封信
            </router-link>
          </div>
        </div>
      </section>
    </main>

    <footer class="home-footer">
      <div class="container">
        <p>心事邮局 © 2024 | 温暖每一个需要被倾听的心</p>
      </div>
    </footer>
  </div>
</template>

<script setup>import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import { useUserStore, api } from '@/stores';
const router = useRouter();
const userStore = useUserStore();
const chartPeriod = ref('7days');
const moodStats = ref({});
const recommendedTreeholes = ref([]);
const breathingActive = ref(false);
const breathingPhase = ref('inhale');
const breathingText = ref('吸气');
let breathingInterval = null;
const meditationStep = ref(0);
const meditationSteps = [
 '找一个安静舒适的地方坐下',
 '闭上眼睛，放松身体',
 '专注于你的呼吸',
 '感受气息进出身体',
 '保持内心的平静'
];
const emotionColors = {
 '开心': '#FFD93D',
 '平静': '#6BCB77',
 '焦虑': '#FF6B6B',
 '悲伤': '#4D96FF',
 '愤怒': '#FF8C42',
 '迷茫': '#9B59B6',
 '感动': '#FFB3BA',
 '疲惫': '#95A5A6'
};
const emotionList = ['开心', '平静', '焦虑', '悲伤', '愤怒', '迷茫', '感动', '疲惫'];
const pieSegments = computed(() => {
 const stats = moodStats.value;
 const total = Object.values(stats).reduce((sum, val) => sum + val, 0);
 if (total === 0) {
  return [{ path: describeArc(100, 100, 80, 0, 360), color: '#3D4A5C' }];
 }
 let startAngle = 0;
 const segments = [];
 emotionList.forEach(emotion => {
  const count = stats[emotion] || 0;
  if (count > 0) {
   const angle = (count / total) * 360;
   segments.push({
    path: describeArc(100, 100, 80, startAngle, startAngle + angle),
    color: emotionColors[emotion] || '#ccc'
   });
   startAngle += angle;
  }
 });
 return segments;
});
const legendItems = computed(() => {
 const stats = moodStats.value;
 return emotionList
  .map(emotion => ({
   emotion,
   count: stats[emotion] || 0,
   color: emotionColors[emotion] || '#ccc'
  }))
  .filter(item => item.count > 0);
});
const totalCount = computed(() => {
 return Object.values(moodStats.value).reduce((sum, val) => sum + val, 0);
});
function polarToCartesian(cx, cy, r, angle) {
 const rad = (angle - 90) * Math.PI / 180;
 return {
  x: cx + r * Math.cos(rad),
  y: cy + r * Math.sin(rad)
 };
}
function describeArc(cx, cy, r, startAngle, endAngle) {
 const start = polarToCartesian(cx, cy, r, endAngle);
 const end = polarToCartesian(cx, cy, r, startAngle);
 const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1';
 return [
  'M', cx, cy,
  'L', start.x, start.y,
  'A', r, r, 0, largeArcFlag, 0, end.x, end.y,
  'Z'
 ].join(' ');
}
async function fetchMoodStats() {
 if (!userStore.isLoggedIn)
  return;
 try {
  const days = chartPeriod.value === '7days' ? 7 : 30;
  const res = await api.get('/notes/stats/summary', { params: { days } });
  if (res.data.code === 200) {
   moodStats.value = res.data.data || {};
  }
 }
 catch (e) {
  console.error('Failed to fetch mood stats:', e);
 }
}
async function fetchRecommendedTreeholes() {
 try {
  const res = await api.get('/treehole/recommend');
  if (res.data.code === 200) {
   recommendedTreeholes.value = res.data.data.treeholes || [];
  }
 }
 catch (e) {
  console.error('Failed to fetch recommended treeholes:', e);
 }
}
function toggleBreathing() {
 if (breathingActive.value) {
  stopBreathing();
 }
 else {
  startBreathing();
 }
}
function startBreathing() {
 breathingActive.value = true;
 breathingPhase.value = 'inhale';
 breathingText.value = '吸气';
 let phase = 0;
 breathingInterval = setInterval(() => {
  phase = (phase + 1) % 8;
  if (phase >= 0 && phase < 2) {
   breathingPhase.value = 'inhale';
   breathingText.value = '吸气';
  }
  else if (phase >= 2 && phase < 3) {
   breathingPhase.value = 'hold';
   breathingText.value = '屏息';
  }
  else if (phase >= 3 && phase < 7) {
   breathingPhase.value = 'exhale';
   breathingText.value = '呼气';
  }
  else {
   breathingPhase.value = 'hold';
   breathingText.value = '屏息';
  }
 }, 500);
}
function stopBreathing() {
 breathingActive.value = false;
 breathingText.value = '开始';
 if (breathingInterval) {
  clearInterval(breathingInterval);
  breathingInterval = null;
 }
}
function nextMeditationStep() {
 if (meditationStep.value < meditationSteps.length - 1) {
  meditationStep.value++;
 }
}
function prevMeditationStep() {
 if (meditationStep.value > 0) {
  meditationStep.value--;
 }
}
function getEmotionText(emotion) {
 const emotionMap = {
  '开心': '开心',
  '平静': '平静',
  '焦虑': '焦虑',
  '悲伤': '悲伤',
  '愤怒': '愤怒',
  '迷茫': '迷茫',
  '感动': '感动',
  '疲惫': '疲惫'
 };
 return emotionMap[emotion] || emotion;
}
function truncate(text, length) {
 if (!text)
  return '';
 return text.length > length ? text.slice(0, length) + '...' : text;
}
function goToTreehole(id) {
 router.push(`/plaza/${id}`);
}
onMounted(() => {
 fetchMoodStats();
 fetchRecommendedTreeholes();
});
onUnmounted(() => {
 stopBreathing();
});
</script>

<style lang="scss" scoped>
.home {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(180deg, #1A202C 0%, #2D3748 50%, #1A202C 100%);
}

.home-header {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  z-index: 100;
}

.home-main {
  flex: 1;
  padding-top: 64px;
}

.hero {
  min-height: calc(100vh - 64px);
  display: flex;
  align-items: center;
  padding: 60px 0;
  background: 
    radial-gradient(ellipse at 20% 30%, rgba(212, 165, 116, 0.08) 0%, transparent 50%),
    radial-gradient(ellipse at 80% 70%, rgba(139, 115, 85, 0.06) 0%, transparent 50%),
    linear-gradient(180deg, #1A202C 0%, #2D3748 100%);
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-image: 
      radial-gradient(circle at 10% 20%, rgba(232, 201, 160, 0.03) 0%, transparent 3px),
      radial-gradient(circle at 90% 80%, rgba(232, 201, 160, 0.03) 0%, transparent 3px);
    pointer-events: none;
  }
  
  .container {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 80px;
    align-items: center;
  }
  
  &__content {
    max-width: 540px;
  }
  
  &__title {
    font-size: 3.5rem;
    font-weight: 300;
    line-height: 1.2;
    margin-bottom: 24px;
    color: var(--color-moonlight);
    letter-spacing: 0.1em;
    text-shadow: 0 0 40px rgba(212, 165, 116, 0.3);
  }
  
  &__subtitle {
    font-size: 1.2rem;
    color: var(--color-ash);
    line-height: 1.8;
    margin-bottom: 40px;
    letter-spacing: 0.02em;
  }
  
  &__actions {
    display: flex;
    gap: 16px;
  }
  
  &__visual {
    position: relative;
    height: 400px;
  }
  
  &__card {
    position: absolute;
    background: linear-gradient(145deg, #3D4A5C 0%, #2D3748 100%);
    border-radius: 4px;
    padding: 20px 24px;
    box-shadow: 
      0 4px 20px rgba(0, 0, 0, 0.3),
      0 0 30px rgba(212, 165, 116, 0.1),
      inset 0 1px 0 rgba(255, 255, 255, 0.05);
    max-width: 200px;
    animation: float 4s ease-in-out infinite;
    border: 1px solid rgba(212, 165, 116, 0.15);
    
    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      height: 3px;
      background: linear-gradient(90deg, transparent, var(--color-amber-glow), transparent);
      opacity: 0.5;
    }
    
    p {
      font-family: var(--font-chinese);
      font-size: 14px;
      color: var(--color-moonlight);
      margin-top: 8px;
      line-height: 1.6;
    }
    
    &--1 {
      top: 20px;
      left: 40px;
      animation-delay: 0s;
    }
    
    &--2 {
      top: 140px;
      right: 60px;
      animation-delay: 1s;
    }
    
    &--3 {
      bottom: 40px;
      left: 100px;
      animation-delay: 2s;
    }
  }
}

@keyframes float {
  0%, 100% {
    transform: translateY(0) rotate(-1deg);
  }
  50% {
    transform: translateY(-10px) rotate(1deg);
  }
}

.quick-section {
  padding: 60px 0;
  background: linear-gradient(180deg, #2D3748 0%, #1A202C 100%);
  
  .section-title {
    font-size: 1.6rem;
    margin-bottom: 32px;
    text-align: center;
    color: var(--color-moonlight);
    font-weight: 300;
    letter-spacing: 0.05em;
  }
  
  .quick-grid {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 24px;
  }
}

.quick-card {
  background: linear-gradient(145deg, #3D4A5C 0%, #2D3748 100%);
  border-radius: 8px;
  padding: 24px;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &__header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
  }
  
  &__title {
    font-size: 1.1rem;
    font-weight: 400;
    color: var(--color-moonlight);
    letter-spacing: 0.02em;
  }
  
  &__icon {
    font-size: 24px;
  }
}

.time-tabs {
  display: flex;
  gap: 8px;
  
  .time-tab {
    padding: 6px 12px;
    border-radius: 4px;
    font-size: 13px;
    background: rgba(45, 55, 72, 0.8);
    border: 1px solid rgba(212, 165, 116, 0.1);
    color: var(--color-ash);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &.active {
      background: rgba(212, 165, 116, 0.2);
      color: var(--color-amber-glow);
      border-color: rgba(212, 165, 116, 0.3);
    }
  }
}

.mood-chart {
  display: flex;
  gap: 24px;
  align-items: center;
}

.chart-container {
  position: relative;
  width: 150px;
  height: 150px;
  flex-shrink: 0;
}

.pie-chart {
  width: 100%;
  height: 100%;
}

.pie-slice {
  transition: opacity 0.3s;
  
  &:hover {
    opacity: 0.8;
  }
}

.chart-center {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  
  .chart-total {
    display: block;
    font-size: 1.5rem;
    font-weight: 300;
    color: var(--color-moonlight);
  }
  
  .chart-label {
    font-size: 12px;
    color: var(--color-ash);
  }
}

.chart-legend {
  flex: 1;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.legend-color {
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.legend-text {
  color: var(--color-ash);
}

.legend-count {
  color: var(--color-moonlight);
  font-weight: 400;
}

.breathing-guide {
  text-align: center;
}

.breathing-circle {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  background: radial-gradient(circle at 30% 30%, #4A5568 0%, #2D3748 100%);
  margin: 0 auto 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.5s ease;
  box-shadow: 
    0 0 30px rgba(212, 165, 116, 0.15),
    inset 0 0 20px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(212, 165, 116, 0.2);
  
  &.active {
    &.inhale {
      transform: scale(1.1);
      box-shadow: 
        0 0 40px rgba(212, 165, 116, 0.25),
        inset 0 0 20px rgba(0, 0, 0, 0.3);
    }
    &.exhale {
      transform: scale(0.9);
    }
  }
  
  .breathing-text {
    color: var(--color-amber-glow);
    font-size: 1.2rem;
    font-weight: 300;
    letter-spacing: 0.05em;
  }
}

.breathing-btn {
  padding: 10px 32px;
  border-radius: 4px;
  border: 1px solid rgba(212, 165, 116, 0.3);
  background: transparent;
  color: var(--color-amber-glow);
  cursor: pointer;
  transition: all 0.3s ease;
  letter-spacing: 0.05em;
  
  &:hover {
    background: rgba(212, 165, 116, 0.1);
    border-color: var(--color-amber-glow);
  }
  
  &.active {
    background: rgba(212, 165, 116, 0.2);
    color: var(--color-candle);
  }
}

.meditation-guide {
  .meditation-steps {
    margin-bottom: 16px;
  }
  
  .meditation-step {
    padding: 12px;
    border-radius: 4px;
    background: rgba(45, 55, 72, 0.5);
    margin-bottom: 8px;
    opacity: 0.5;
    transition: all 0.3s ease;
    border: 1px solid transparent;
    
    &.active {
      opacity: 1;
      background: rgba(212, 165, 116, 0.1);
      border-left: 3px solid var(--color-amber-glow);
    }
    
    .step-number {
      display: inline-block;
      width: 24px;
      height: 24px;
      border-radius: 50%;
      background: rgba(212, 165, 116, 0.2);
      color: var(--color-amber-glow);
      font-size: 12px;
      font-weight: 400;
      text-align: center;
      line-height: 24px;
      margin-right: 12px;
    }
    
    p {
      display: inline;
      font-size: 14px;
      color: var(--color-moonlight);
    }
  }
  
  .meditation-controls {
    display: flex;
    gap: 12px;
    justify-content: center;
  }
  
  .meditation-btn {
    padding: 8px 20px;
    border-radius: 4px;
    border: 1px solid rgba(212, 165, 116, 0.2);
    background: transparent;
    color: var(--color-ash);
    cursor: pointer;
    transition: all 0.3s ease;
    
    &:hover:not(:disabled) {
      background: rgba(212, 165, 116, 0.1);
      color: var(--color-amber-glow);
    }
    
    &:disabled {
      opacity: 0.3;
      cursor: not-allowed;
    }
  }
}

.recommend-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.recommend-item {
  padding: 16px;
  background: rgba(45, 55, 72, 0.5);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid transparent;
  
  &:hover {
    background: rgba(212, 165, 116, 0.1);
    border-color: rgba(212, 165, 116, 0.2);
    transform: translateX(4px);
  }
  
  .recommend-content {
    margin: 8px 0;
    font-size: 14px;
    color: var(--color-moonlight);
    line-height: 1.5;
  }
  
  .recommend-hint {
    font-size: 12px;
    color: var(--color-amber-glow);
  }
}

.features {
  padding: 100px 0;
  background: linear-gradient(180deg, #1A202C 0%, #2D3748 100%);
  
  &__title {
    font-size: 2rem;
    text-align: center;
    margin-bottom: 60px;
    color: var(--color-moonlight);
    font-weight: 300;
    letter-spacing: 0.1em;
  }
  
  &__grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 32px;
  }
}

.feature-card {
  background: linear-gradient(145deg, #3D4A5C 0%, #2D3748 100%);
  border-radius: 8px;
  padding: 40px 32px;
  text-align: center;
  box-shadow: 
    0 4px 20px rgba(0, 0, 0, 0.3),
    inset 0 1px 0 rgba(255, 255, 255, 0.03);
  transition: all 0.4s ease;
  border: 1px solid rgba(212, 165, 116, 0.1);
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 
      0 8px 30px rgba(0, 0, 0, 0.4),
      0 0 40px rgba(212, 165, 116, 0.15);
    border-color: rgba(212, 165, 116, 0.3);
  }
  
  &__icon {
    font-size: 48px;
    margin-bottom: 20px;
  }
  
  &__title {
    font-size: 1.4rem;
    margin-bottom: 12px;
    color: var(--color-moonlight);
    font-weight: 400;
    letter-spacing: 0.05em;
  }
  
  &__desc {
    color: var(--color-ash);
    font-size: 15px;
    line-height: 1.6;
  }
}

.cta {
  padding: 100px 0;
  background: 
    radial-gradient(ellipse at center, rgba(212, 165, 116, 0.15) 0%, transparent 70%),
    linear-gradient(180deg, #2D3748 0%, #1A202C 100%);
  
  &__content {
    text-align: center;
    color: var(--color-moonlight);
  }
  
  &__title {
    font-size: 2rem;
    margin-bottom: 16px;
    color: var(--color-moonlight);
    font-weight: 300;
    letter-spacing: 0.05em;
  }
  
  &__text {
    font-size: 1.1rem;
    opacity: 0.8;
    margin-bottom: 32px;
    color: var(--color-ash);
  }
  
  .btn--primary {
    background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
    color: var(--color-night-blue);
    border: none;
    box-shadow: 0 4px 20px rgba(212, 165, 116, 0.3);
    
    &:hover {
      background: linear-gradient(135deg, var(--color-candle) 0%, var(--color-amber-glow) 100%);
      box-shadow: 0 6px 25px rgba(212, 165, 116, 0.4);
    }
  }
}

.home-footer {
  padding: 40px 0;
  text-align: center;
  color: var(--color-ash);
  font-size: 14px;
  background: #1A202C;
  letter-spacing: 0.02em;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 28px;
  border-radius: 4px;
  font-size: 15px;
  font-weight: 400;
  text-decoration: none;
  transition: all 0.3s ease;
  letter-spacing: 0.03em;
  
  &--primary {
    background: linear-gradient(135deg, var(--color-amber-glow) 0%, var(--color-warm-brown) 100%);
    color: var(--color-night-blue);
    border: none;
    box-shadow: 0 4px 15px rgba(212, 165, 116, 0.25);
    
    &:hover {
      background: linear-gradient(135deg, var(--color-candle) 0%, var(--color-amber-glow) 100%);
      box-shadow: 0 6px 20px rgba(212, 165, 116, 0.35);
      transform: translateY(-2px);
    }
  }
  
  &--outline {
    background: transparent;
    color: var(--color-amber-glow);
    border: 1px solid rgba(212, 165, 116, 0.4);
    
    &:hover {
      background: rgba(212, 165, 116, 0.1);
      border-color: var(--color-amber-glow);
    }
  }
  
  &--lg {
    padding: 14px 32px;
    font-size: 16px;
  }
}

.emotion-tag {
  font-size: 12px;
  padding: 4px 10px;
  border-radius: 3px;
  font-weight: 400;
  letter-spacing: 0.02em;
  
  &--开心 {
    background: rgba(255, 217, 61, 0.15);
    color: #FFD93D;
  }
  
  &--平静 {
    background: rgba(107, 203, 119, 0.15);
    color: #6BCB77;
  }
  
  &--焦虑 {
    background: rgba(255, 107, 107, 0.15);
    color: #FF6B6B;
  }
  
  &--悲伤 {
    background: rgba(77, 150, 255, 0.15);
    color: #4D96FF;
  }
  
  &--愤怒 {
    background: rgba(255, 140, 66, 0.15);
    color: #FF8C42;
  }
  
  &--迷茫 {
    background: rgba(155, 89, 182, 0.15);
    color: #9B59B6;
  }
  
  &--感动 {
    background: rgba(255, 179, 186, 0.15);
    color: #FFB3BA;
  }
  
  &--疲惫 {
    background: rgba(149, 165, 166, 0.15);
    color: #95A5A6;
  }
}

@media (max-width: 1024px) {
  .quick-grid {
    grid-template-columns: 1fr;
  }
  
  .mood-chart {
    flex-direction: column;
    text-align: center;
  }
  
  .chart-legend {
    justify-content: center;
  }
}

@media (max-width: 768px) {
  .hero {
    .container {
      grid-template-columns: 1fr;
      gap: 40px;
    }
    
    &__visual {
      display: none;
    }
    
    &__title {
      font-size: 2.5rem;
    }
  }
  
  .features__grid {
    grid-template-columns: 1fr;
  }
}
</style>
