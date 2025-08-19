import {themes as prismThemes} from 'prism-react-renderer';
import type {Config} from '@docusaurus/types';
import type * as Preset from '@docusaurus/preset-classic';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

const config: Config = {
  title: 'Petk - Transform Markdown Templates into Dynamic Content',
  tagline: 'A powerful toolkit for processing templates with advanced file inclusion capabilities',
  favicon: 'img/favicon.ico',

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: 'https://mihazs.github.io',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/petk/',

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: 'mihazs', // Usually your GitHub org/user name.
  projectName: 'petk', // Usually your repo name.

  onBrokenLinks: 'throw',
  onBrokenMarkdownLinks: 'warn',

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: 'en',
    locales: ['en'],
  },

  // Custom head tags for SEO
  headTags: [
    // Open Graph tags
    {
      tagName: 'meta',
      attributes: {
        property: 'og:title',
        content: 'Petk - Transform Markdown Templates into Dynamic Content',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:description',
        content: 'A powerful toolkit for processing templates with advanced file inclusion capabilities. Perfect for prompt engineering, documentation automation, and content generation workflows.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:type',
        content: 'website',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:url',
        content: 'https://mihazs.github.io/petk/',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        property: 'og:image',
        content: 'https://mihazs.github.io/petk/img/petk-social-card.jpg',
      },
    },
    // Twitter Card tags
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:card',
        content: 'summary_large_image',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:title',
        content: 'Petk - Transform Markdown Templates into Dynamic Content',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:description',
        content: 'A powerful toolkit for processing templates with advanced file inclusion capabilities. Perfect for prompt engineering, documentation automation, and content generation workflows.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'twitter:image',
        content: 'https://mihazs.github.io/petk/img/petk-social-card.jpg',
      },
    },
    // Additional meta tags
    {
      tagName: 'meta',
      attributes: {
        name: 'description',
        content: 'A powerful toolkit for processing templates with advanced file inclusion capabilities. Perfect for prompt engineering, documentation automation, and content generation workflows.',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'keywords',
        content: 'template processing, markdown, yaml conversion, file inclusion, prompt engineering, documentation automation, content generation, CLI tool, TypeScript',
      },
    },
    {
      tagName: 'meta',
      attributes: {
        name: 'author',
        content: 'Petk Contributors',
      },
    },
    // JSON-LD structured data
    {
      tagName: 'script',
      attributes: {
        type: 'application/ld+json',
      },
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'SoftwareApplication',
        name: 'Petk',
        description: 'A powerful toolkit for processing templates with advanced file inclusion capabilities. Perfect for prompt engineering, documentation automation, and content generation workflows.',
        applicationCategory: 'DeveloperApplication',
        operatingSystem: 'Cross-platform',
        offers: {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'USD',
        },
        author: {
          '@type': 'Organization',
          name: 'Petk Contributors',
          url: 'https://github.com/mihazs/petk',
        },
        maintainer: {
          '@type': 'Person',
          name: 'mihazs',
          url: 'https://github.com/mihazs',
        },
        downloadUrl: 'https://www.npmjs.com/package/petk',
        codeRepository: 'https://github.com/mihazs/petk',
        programmingLanguage: 'TypeScript',
        runtimePlatform: 'Node.js',
        keywords: ['template processing', 'markdown', 'yaml conversion', 'file inclusion', 'prompt engineering', 'documentation automation', 'content generation', 'CLI tool', 'TypeScript'],
      }),
    },
  ],

  plugins: [
    [
      '@easyops-cn/docusaurus-search-local',
      {
        hashed: true,
        language: ['en'],
        highlightSearchTermsOnTargetPage: true,
        explicitSearchResultPath: true,
        indexDocs: true,
        indexBlog: false,
        indexPages: true,
        docsRouteBasePath: '/',
        searchBarShortcut: true,
        searchBarShortcutHint: true,
      },
    ],
  ],

  presets: [
    [
      'classic',
      {
        docs: {
          sidebarPath: './sidebars.ts',
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/mihazs/petk/tree/main/apps/docs/',
          showLastUpdateTime: true,
          showLastUpdateAuthor: true,
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ['rss', 'atom'],
            xslt: true,
            title: 'Petk Blog',
            description: 'Latest updates and insights about Petk template processing toolkit',
            copyright: `Copyright © ${new Date().getFullYear()} Petk Project.`,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          editUrl: 'https://github.com/mihazs/petk/tree/main/apps/docs/',
          // Useful options to enforce blogging best practices
          onInlineTags: 'warn',
          onInlineAuthors: 'warn',
          onUntruncatedBlogPosts: 'warn',
        },
        theme: {
          customCss: './src/css/custom.css',
        },
        sitemap: {
          changefreq: 'weekly',
          priority: 0.5,
          ignorePatterns: ['/tags/**'],
          filename: 'sitemap.xml',
        },
      } satisfies Preset.Options,
    ],
  ],

  themeConfig: {
    // Replace with your project's social card
    image: 'img/petk-social-card.jpg',
    
    // SEO metadata
    metadata: [
      {
        name: 'description',
        content: 'A powerful toolkit for processing templates with advanced file inclusion capabilities. Perfect for prompt engineering, documentation automation, and content generation workflows.',
      },
      {
        name: 'keywords',
        content: 'template processing, markdown, yaml conversion, file inclusion, prompt engineering, documentation automation, content generation, CLI tool, TypeScript',
      },
    ],
    
    navbar: {
      title: 'Petk',
      logo: {
        alt: 'Petk Logo',
        src: 'img/logo.svg',
      },
      items: [
        {
          type: 'docSidebar',
          sidebarId: 'mainSidebar',
          position: 'left',
          label: 'Documentation',
        },
        {to: '/blog', label: 'Blog', position: 'left'},
        {
          href: 'https://github.com/mihazs/petk',
          label: 'GitHub',
          position: 'right',
        },
        {
          href: 'https://www.npmjs.com/package/petk',
          label: 'npm',
          position: 'right',
        },
      ],
    },
    footer: {
      style: 'dark',
      links: [
        {
          title: 'Documentation',
          items: [
            {
              label: 'Getting Started',
              to: '/docs/learning/intro',
            },
            {
              label: 'CLI Reference',
              to: '/docs/reference/cli',
            },
            {
              label: 'Template Syntax',
              to: '/docs/reference/template-syntax',
            },
            {
              label: 'Troubleshooting',
              to: '/docs/problems/common-issues',
            },
          ],
        },
        {
          title: 'Community',
          items: [
            {
              label: 'GitHub Issues',
              href: 'https://github.com/mihazs/petk/issues',
            },
            {
              label: 'GitHub Discussions',
              href: 'https://github.com/mihazs/petk/discussions',
            },
            {
              label: 'npm Package',
              href: 'https://www.npmjs.com/package/petk',
            },
          ],
        },
        {
          title: 'More',
          items: [
            {
              label: 'Blog',
              to: '/blog',
            },
            {
              label: 'GitHub',
              href: 'https://github.com/mihazs/petk',
            },
            {
              label: 'Changelog',
              href: 'https://github.com/mihazs/petk/blob/main/CHANGELOG.md',
            },
          ],
        },
      ],
      copyright: `Copyright © ${new Date().getFullYear()} Petk Project. Built with Docusaurus.`,
    },
    prism: {
      theme: prismThemes.github,
      darkTheme: prismThemes.dracula,
      additionalLanguages: ['bash', 'yaml', 'json', 'typescript', 'javascript', 'markdown'],
    },
    colorMode: {
      defaultMode: 'light',
      disableSwitch: false,
      respectPrefersColorScheme: true,
    },
    
    // Enhanced search configuration
    algolia: undefined, // We're using local search instead
    
    // Announcement bar for important updates
    announcementBar: undefined,
    
  } satisfies Preset.ThemeConfig,
};

export default config;
