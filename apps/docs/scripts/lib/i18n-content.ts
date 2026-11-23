import { join } from "node:path"

import {
  type NonDefaultLocale,
  type PluginPackageMeta,
  plugins,
} from "../../docs-packages.ts"
import { writeMarkdownFile, yamlQuote } from "./plugin-inspector.ts"

interface LandingTranslations {
  title: string
  description: string
  tagline: string
  gettingStarted: string
  architecture: string
  pillarsHeading: string
  matrixHeading: string
  pkgCol: string
  catCol: string
  summaryCol: string
}

const LANDING_COPY: Record<NonDefaultLocale, LandingTranslations> = {
  es: {
    title: "Plugins Medusa v2 — Vicacha",
    description:
      "Suite empresarial de 14 plugins Medusa v2: comercio B2B, facturación DIAN, documentos PDF, Odoo ERP, pagos Bold y Mollie, logística UE, códigos de barras, RBAC, comercio social, historias, notificaciones, extensiones de producto y Typesense AI.",
    tagline:
      "13 plugins modulares para Medusa v2 con emuladores QA sin conexión, bridges entre módulos, i18n en 10+ idiomas y referencia OpenAPI interactiva.",
    gettingStarted: "Primeros Pasos",
    architecture: "Explorar Arquitectura",
    pillarsHeading: "Pilares Principales",
    matrixHeading: "Matriz Completa de Plugins (13 Paquetes)",
    pkgCol: "Paquete",
    catCol: "Categoría",
    summaryCol: "Resumen",
  },
  ar: {
    title: "إضافات Medusa v2 — فيكاتشا",
    description:
      "مجموعة احترافية من 14 إضافة لنظام Medusa v2 تشمل تجارة B2B والفوترة الإلكترونية ومزامنة Odoo ERP والمدفوعات والشحن الأوروبي والبحث بالذكاء الاصطناعي.",
    tagline:
      "13 إضافة معيارية لنظام Medusa v2 مع محاكيات اختبار محلية وتكامل تلقائي بين الإضافات ودعم كامل للغات RTL ومواصفات OpenAPI تفاعلية.",
    gettingStarted: "البدء السريع",
    architecture: "استكشاف الهندسة",
    pillarsHeading: "الركائز الأساسية",
    matrixHeading: "مصفوفة الإضافات الكاملة (13 حزمة)",
    pkgCol: "الحزمة",
    catCol: "الفئة",
    summaryCol: "الملخص",
  },
  tr: {
    title: "Vicacha Medusa v2 Eklentileri",
    description:
      "B2B ticaret, DIAN e-fatura, PDF belgeler, Odoo ERP, Bold & Mollie ödemeleri, AB lojistik, barkod, RBAC, sosyal ticaret, hikayeler, bildirimler ve Typesense AI için 14 Medusa v2 eklentisi.",
    tagline:
      "Çevrimdışı QA emülatörleri, eklentiler arası köprüler, çoklu dil desteği ve etkileşimli OpenAPI referansı ile 13 modüler Medusa v2 eklentisi.",
    gettingStarted: "Başlangıç",
    architecture: "Mimariyi İncele",
    pillarsHeading: "Temel İlkeler",
    matrixHeading: "Tam Eklenti Matrisi (13 Paket)",
    pkgCol: "Paket",
    catCol: "Kategori",
    summaryCol: "Özet",
  },
}

export function generateLocalizedLandings(contentDocsRoot: string): void {
  for (const locale of ["es", "ar", "tr"] as const) {
    const copy = LANDING_COPY[locale]
    const rows = plugins
      .map(
        (p) =>
          `| [${p.translations[locale]}](/${locale}/${p.slug}/) | ${p.category} | ${p.summary[locale]} |`
      )
      .join("\n")

    const mdx = `---
title: ${yamlQuote(copy.title)}
description: ${yamlQuote(copy.description)}
template: splash
hero:
  tagline: ${yamlQuote(copy.tagline)}
  actions:
    - text: ${yamlQuote(copy.gettingStarted)}
      link: /guides/getting-started/
      icon: right-arrow
    - text: ${yamlQuote(copy.architecture)}
      link: /guides/architecture/
      variant: minimal
      icon: external
---

## ${copy.matrixHeading}

| ${copy.pkgCol} | ${copy.catCol} | ${copy.summaryCol} |
| :--- | :--- | :--- |
${rows}
`
    writeMarkdownFile(join(contentDocsRoot, locale, "index.mdx"), mdx)
  }
}

export function buildLocalizedOverview(
  plugin: PluginPackageMeta,
  locale: NonDefaultLocale,
  routeCount: number
): string {
  const title = plugin.translations[locale]
  const summary = plugin.summary[locale]
  const apiLink = plugin.schemaFile
    ? `- [Interactive OpenAPI Reference](/${plugin.slug}/api/) (${routeCount} endpoints)`
    : ""

  const labels: Record<NonDefaultLocale, { install: string; docs: string }> = {
    es: { install: "Instalación Rápida", docs: "Documentación Completa" },
    ar: { install: "التثبيت السريع", docs: "الوثائق الكاملة" },
    tr: { install: "Hızlı Kurulum", docs: "Tam Dokümantasyon" },
  }

  return `---
title: ${yamlQuote(title)}
description: ${yamlQuote(summary)}
---

${summary}

## ${labels[locale].install}

\`\`\`bash
pnpm add ${plugin.npmName}
\`\`\`

\`\`\`ts
// medusa-config.ts
export default defineConfig({
  plugins: [
    {
      resolve: "${plugin.npmName}",
      options: {},
    },
  ],
});
\`\`\`

## ${labels[locale].docs}

- [Overview (EN)](/${plugin.slug}/)
- [Data Models & Use Cases](/${plugin.slug}/use-cases/)
- [Developer Guide & Admin UI](/${plugin.slug}/guide/)
${apiLink}
`
}
