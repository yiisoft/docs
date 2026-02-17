<script setup>
import {computed} from 'vue'
import { useData } from 'vitepress'

const {lang, page, site} = useData()

const issueUrl = computed(() => {
    const title = page.value.title
    const origin = typeof window !== 'undefined' ? window.location.origin : ''
    const pageUrl = origin + site.value.base + page.value.relativePath.replace(/\.md$/, '.html')
    const params = new URLSearchParams({
        template: '01-bug-report.yml',
        title: 'Problem on "' + title + '"',
        description: 'Link to page: [' + title + '](' + pageUrl + ')',
    })
    return `https://github.com/yiisoft/docs/issues/new?${params}`
})

const labels = {
  'en': 'Report an issue',
  'es': 'Reportar un problema',
  'id': 'Laporkan masalah',
  'it': 'Segnala un problema',
  'ru': 'Сообщить об ошибке',
  'zh-CN': '报告问题',
}
</script>

<template>
  <div class="report-issue">
    <a
        :href="issueUrl"
      target="_blank"
      rel="noopener noreferrer"
      class="report-issue-link"
    >
      <span class="vpi-report-issue-icon" />
      {{ labels[lang] || labels['en'] }}
    </a>
  </div>
</template>
