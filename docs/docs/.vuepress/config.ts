import { defineUserConfig, defaultTheme } from 'vuepress';

export default defineUserConfig({
  base: '/dainty-di/',
  lang: 'en-US',
  title: 'Dainty DI',
  description: 'A mini Node.js dependency injection library',
  theme: defaultTheme({
    repo: 'dreamerblue/dainty-di',
    docsBranch: 'master',
    docsDir: 'docs/docs',
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
