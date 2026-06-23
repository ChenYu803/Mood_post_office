<template>
  <canvas ref="canvasRef" class="dust-particles"></canvas>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const canvasRef = ref(null)
let animationId = null
let particles = []

const config = {
  particleCount: 50,
  minSize: 1,
  maxSize: 3,
  minSpeed: 0.1,
  maxSpeed: 0.3,
  minOpacity: 0.1,
  maxOpacity: 0.3,
  color: 'rgba(139, 115, 85, '
}

class Particle {
  constructor(canvas) {
    this.canvas = canvas
    this.reset()
  }

  reset() {
    this.x = Math.random() * this.canvas.width
    this.y = Math.random() * this.canvas.height
    this.size = config.minSize + Math.random() * (config.maxSize - config.minSize)
    this.speedX = (Math.random() - 0.5) * config.maxSpeed
    this.speedY = -config.minSpeed - Math.random() * (config.maxSpeed - config.minSpeed)
    this.opacity = config.minOpacity + Math.random() * (config.maxOpacity - config.minOpacity)
    this.life = Math.random() * 200 + 100
    this.maxLife = this.life
  }

  update() {
    this.x += this.speedX
    this.y += this.speedY
    this.life--

    if (this.life <= 0 || this.y < -10 || this.x < -10 || this.x > this.canvas.width + 10) {
      this.reset()
      this.y = this.canvas.height + 10
    }
  }

  draw(ctx) {
    const fadeRatio = this.life / this.maxLife
    const currentOpacity = this.opacity * fadeRatio
    ctx.beginPath()
    ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
    ctx.fillStyle = config.color + currentOpacity + ')'
    ctx.fill()
  }
}

const initParticles = (canvas) => {
  particles = []
  for (let i = 0; i < config.particleCount; i++) {
    particles.push(new Particle(canvas))
  }
}

const animate = (ctx, canvas) => {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  
  particles.forEach(particle => {
    particle.update()
    particle.draw(ctx)
  })

  animationId = requestAnimationFrame(() => animate(ctx, canvas))
}

const handleResize = (canvas) => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
}

const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)')

onMounted(() => {
  if (prefersReducedMotion.matches) return

  const canvas = canvasRef.value
  const ctx = canvas.getContext('2d')

  handleResize(canvas)
  initParticles(canvas)
  animate(ctx, canvas)

  window.addEventListener('resize', () => handleResize(canvas))
})

onUnmounted(() => {
  if (animationId) {
    cancelAnimationFrame(animationId)
  }
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.dust-particles {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  opacity: 0.6;
}
</style>
