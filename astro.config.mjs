import { defineConfig } from "astro/config";
import tailwind from "@astrojs/tailwind";
import react from "@astrojs/react";
import remarkToc from "remark-toc";
import remarkCollapse from "remark-collapse";
import sitemap from "@astrojs/sitemap";
import mdx from "@astrojs/mdx";
import {
  transformerMetaHighlight,
  transformerMetaWordHighlight,
  transformerNotationDiff,
  transformerNotationErrorLevel,
  transformerNotationFocus,
  transformerNotationHighlight,
  transformerNotationWordHighlight,
  transformerRenderWhitespace,
} from "@shikijs/transformers";

import { addCopyButton } from "shiki-transformer-copy-button";

// https://astro.build/config
export default defineConfig({
  site: "https://wahlstrand.dev/",
  vite: { optimizeDeps: { include: ["asciinema-player"] } },
  integrations: [
    tailwind({
      config: {
        applyBaseStyles: false,
      },
    }),
    react(),
    sitemap(),
    mdx(),
  ],
  markdown: {
    remarkPlugins: [remarkToc],
    shikiConfig: {
      theme: "github-dark",
      wrap: false,
      transformers: [
        addCopyButton({
          toggle: 500,
        }),
        transformerNotationDiff(),
        transformerNotationHighlight(),
        transformerNotationWordHighlight(),
        transformerNotationFocus(),
        transformerNotationErrorLevel(),
        transformerMetaHighlight(),
        transformerMetaWordHighlight(),
        transformerRenderWhitespace(),
      ],
    },
    extendDefaultPlugins: true,
  },
});
