import { defineUserConfig, defaultTheme } from 'vuepress';

export default defineUserConfig({
  base: '/dainty-di/',
  lang: 'zh-CN',
  title: 'Dainty DI',
  description: 'A mini Node.js dependency injection library',
  theme: defaultTheme({
    repo: 'dreamerblue/dainty-di',
    docsDir: 'docs',
    navbar: [
      {
        text: 'Docs',
        link: '/',
      },
      {
        text: 'Reference',
        link: '/reference',
      },
    ],
    sidebar: {
      '/': [
        '/quick-start',
        '/advanced',
      ],
      '/reference': [
        '/reference',
      ],
    },
  }),
});
