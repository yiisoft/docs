<script setup>
import { useData } from 'vitepress'

const { lang } = useData()

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
      href="https://github.com/yiisoft/docs/issues"
      target="_blank"
      rel="noopener noreferrer"
      class="report-issue-link"
    >
      <span class="vpi-report-issue-icon" />
      {{ labels[lang] || labels['en'] }}
    </a>
  </div>
</template>
