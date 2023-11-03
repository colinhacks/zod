<script setup lang="ts">
import { ref } from 'vue'
import { useSponsorsGrid } from 'vitepress/dist/client/theme-default/composables/sponsor-grid'
export interface Sponsor {
  name: string
  img: string
  url: string
  desc: string
}
interface Props {
  size?: any
  data: Sponsor[]
}
const props = withDefaults(defineProps<Props>(), {
  size: 'medium'
})

const el = ref(null)

useSponsorsGrid({ el, size: props.size })
</script>

<template>
  <div class="VPSponsorsGrid vp-sponsor-grid" :class="[size]" ref="el">
    <div v-for="sponsor in data" :key="sponsor.name" class="vp-sponsor-grid-item">
      <a class="vp-sponsor-grid-link" :href="sponsor.url" target="_blank" rel="sponsored noopener">
        <article class="vp-sponsor-grid-box">
          <img v-if="sponsor.img" class="vp-sponsor-grid-image" :src="sponsor.img" :alt="sponsor.name" />
          <h4 class="title" v-if="sponsor.name">{{ sponsor.name }}</h4>
          <p class="details" v-html="sponsor.desc" v-if="sponsor.desc"></p>
        </article>
      </a>
    </div>
  </div>
</template>

<style>
.dark .vp-sponsor-grid-item:hover {
  background-color: var(--vp-c-gray-3);
}
.vp-sponsor-grid-image {
  margin-bottom: 8px;
  filter: none !important;
}

.vp-sponsor-grid-box {
  display: flex;
  flex-direction: column;
}

.vp-sponsor-grid-box .title {
  line-height: 24px;
  font-size: 16px;
  font-weight: 600;
}

.vp-sponsor-grid-box .details {
  line-height: 24px;
  font-size: 14px;
  font-weight: 500;
  text-align: center;
  color: var(--vp-c-text-2);
}
</style>
