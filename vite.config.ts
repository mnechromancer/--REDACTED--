import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

// GitHub Pages serves project sites at /<repo>/, so the deploy workflow needs a
// matching base for every bundled asset URL (including the public/fonts @font-face).
// GITHUB_REPOSITORY ("owner/repo") is set by Actions; local dev/build stay at '/'.
const repo = process.env.GITHUB_REPOSITORY?.split('/')[1]

// https://vite.dev/config/
export default defineConfig({
  base: repo ? `/${repo}/` : '/',
  plugins: [svelte()],
})
