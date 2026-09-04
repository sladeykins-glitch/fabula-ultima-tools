import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

const pageSizeTransform = {
  name: 'fabula-native-page-size',
  enforce: 'pre' as const,
  transform(code: string, id: string) {
    if (!id.replace(/\\/g, '/').endsWith('/src/App.tsx')) return null
    const marker = 'const DATABASE_PAGE_SIZE = 24'
    if (!code.includes(marker)) return null
    const replacement = `const DATABASE_PAGE_SIZE = (() => {\n  try {\n    const value = Number(localStorage.getItem('fu-db-page-size') || '24')\n    return [12, 24, 48].includes(value) ? value : 24\n  } catch {\n    return 24\n  }\n})()`
    return { code: code.replace(marker, replacement), map: null }
  },
}

export default defineConfig({
  plugins: [pageSizeTransform, react()],
  base: '/fabula-ultima-tools/',
})
