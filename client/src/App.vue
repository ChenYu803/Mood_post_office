<template>
  <div id="app">
    <DustParticles />
    <NavBar />
    <main class="main-content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import NavBar from '@/components/NavBar.vue'
import DustParticles from '@/components/DustParticles.vue'
</script>

<style lang="scss">
:root {
  --color-parchment: #F5F0E8;
  --color-cream: #FAF6F0;
  --color-mist-gray: #C5C1B9;
  --color-deep-blue-gray: #4A5568;
  --color-warm-brown: #8B7355;
  --color-moonlight: #D1CDC7;
  --color-night-blue: #2D3748;
  --color-amber-glow: #D4A574;
  --color-candle: #E8C9A0;
  --color-ash: #A09890;
  
  --bg-primary: var(--color-parchment);
  --text-primary: var(--color-deep-blue-gray);
  --text-secondary: var(--color-moonlight);
  --border-color: var(--color-mist-gray);
  --accent-color: var(--color-warm-brown);
  --highlight-color: var(--color-amber-glow);
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: system-ui, -apple-system, "PingFang SC", "Microsoft YaHei", "Hiragino Sans GB", sans-serif;
  background: var(--color-parchment);
  color: var(--color-deep-blue-gray);
  line-height: 1.8;
  letter-spacing: 0.01em;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

#app {
  min-height: 100vh;
  background: var(--color-parchment);
  position: relative;
}

.main-content {
  padding-top: 70px;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

h1, h2, h3, h4, h5, h6 {
  font-weight: 400;
  letter-spacing: 0.02em;
  line-height: 1.6;
  color: var(--color-night-blue);
}

.letter-card {
  background: var(--color-cream);
  background-image: 
    repeating-linear-gradient(
      0deg,
      transparent,
      transparent 27px,
      rgba(197, 193, 185, 0.15) 27px,
      rgba(197, 193, 185, 0.15) 28px
    );
  box-shadow: 
    0 2px 12px rgba(139, 115, 85, 0.08),
    0 1px 4px rgba(139, 115, 85, 0.04);
  border-radius: 14px;
  padding: 24px;
  border: 1px solid rgba(197, 193, 185, 0.3);
  transition: all 0.4s ease;
}

.letter-card:hover {
  box-shadow: 
    0 4px 20px rgba(139, 115, 85, 0.12),
    0 2px 8px rgba(139, 115, 85, 0.06);
  transform: translateY(-2px);
}

.el-button {
  border-radius: 10px !important;
  font-weight: 400 !important;
  letter-spacing: 0.01em;
  transition: all 0.3s ease !important;
}

.el-button--primary {
  background: var(--color-warm-brown) !important;
  border-color: var(--color-warm-brown) !important;
  color: var(--color-cream) !important;
}

.el-button--primary:hover {
  background: var(--color-amber-glow) !important;
  border-color: var(--color-amber-glow) !important;
}

.el-button--default {
  background: var(--color-cream) !important;
  border-color: var(--color-mist-gray) !important;
  color: var(--color-deep-blue-gray) !important;
}

.el-button--default:hover {
  border-color: var(--color-amber-glow) !important;
  color: var(--color-warm-brown) !important;
}

.el-input__wrapper {
  border-radius: 10px !important;
  background: var(--color-cream) !important;
  box-shadow: 0 0 0 1px var(--color-mist-gray) inset !important;
  transition: all 0.3s ease !important;
}

.el-input__wrapper:hover {
  box-shadow: 0 0 0 1px var(--color-amber-glow) inset !important;
}

.el-input__wrapper.is-focus {
  box-shadow: 0 0 0 1px var(--color-amber-glow), 0 0 8px rgba(212, 165, 116, 0.2) !important;
}

.el-textarea__inner {
  border-radius: 10px !important;
  background: var(--color-cream) !important;
  border: 1px solid var(--color-mist-gray) !important;
  color: var(--color-deep-blue-gray) !important;
  line-height: 1.8 !important;
}

.el-textarea__inner:focus {
  border-color: var(--color-amber-glow) !important;
  box-shadow: 0 0 8px rgba(212, 165, 116, 0.2) !important;
}

.el-card {
  border-radius: 14px !important;
  border: 1px solid rgba(197, 193, 185, 0.3) !important;
  background: var(--color-cream) !important;
  box-shadow: 0 2px 12px rgba(139, 115, 85, 0.08) !important;
}

.el-dialog {
  border-radius: 16px !important;
  background: var(--color-cream) !important;
}

.el-message-box {
  border-radius: 14px !important;
  background: var(--color-cream) !important;
}

.el-tag {
  border-radius: 8px !important;
}

.el-pagination button {
  border-radius: 8px !important;
  background: var(--color-cream) !important;
}

.el-pagination .el-pager li {
  border-radius: 8px !important;
  background: var(--color-cream) !important;
}

.el-pagination .el-pager li.is-active {
  background: var(--color-warm-brown) !important;
  color: var(--color-cream) !important;
}

::selection {
  background: var(--color-amber-glow);
  color: var(--color-night-blue);
}

::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

::-webkit-scrollbar-track {
  background: var(--color-parchment);
}

::-webkit-scrollbar-thumb {
  background: var(--color-mist-gray);
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: var(--color-warm-brown);
}
</style>
