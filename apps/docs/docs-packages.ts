// Canonical package list for the @vicacha-devs/docs site — single source of truth
// shared by astro.config.ts, scripts/generate-openapi.ts, and scripts/sync-readmes.ts.

export type SupportedLocale = "en" | "es" | "ar" | "tr";
export type NonDefaultLocale = "es" | "ar" | "tr";

export interface PluginPackageMeta {
  slug: string;
  npmName: string;
  pluginId: string;
  category: string;
  label: string;
  translations: Record<NonDefaultLocale, string>;
  summary: Record<SupportedLocale, string>;
  /** Empty when the plugin exposes no HTTP routes (no OpenAPI reference). */
  schemaFile: string;
  dir: string;
}

export interface GuideMeta {
  slug: string;
  label: string;
  translations: Record<NonDefaultLocale, string>;
}

export const SUPPORTED_LOCALES: SupportedLocale[] = ["en", "es", "ar", "tr"];

export const plugins: PluginPackageMeta[] = [
  {
    slug: "medusa-plugin-b2b",
    npmName: "@vicacha-devs/medusa-plugin-b2b",
    pluginId: "b2b",
    category: "B2B & Enterprise Commerce",
    label: "B2B Companies & Quotes",
    translations: {
      es: "B2B Empresas y Cotizaciones",
      ar: "تجارة B2B والشركات وعروض الأسعار",
      tr: "B2B Şirketler ve Teklifler",
    },
    summary: {
      en: "B2B companies, employee hierarchies, approval rules, spending limits, and quote negotiation workflows for Medusa v2.",
      es: "Empresas B2B, jerarquías de empleados, reglas de aprobación, límites de gasto y flujos de negociación de cotizaciones para Medusa v2.",
      ar: "إدارة شركات B2B وتسلسل الموظفين وقواعد الموافقة وحدود الإنفاق ومسارات التفاوض على عروض الأسعار لنظام Medusa v2.",
      tr: "Medusa v2 için B2B şirketler, çalışan hiyerarşileri, onay kuralları, harcama limitleri ve teklif müzakere iş akışları.",
    },
    schemaFile: "b2b",
    dir: "b2b",
  },
  {
    slug: "medusa-plugin-barcode",
    npmName: "@vicacha-devs/medusa-plugin-barcode",
    pluginId: "barcode",
    category: "Operations & Fulfillment",
    label: "Barcode, GS1 & Stock-Take",
    translations: {
      es: "Códigos de Barras, GS1 e Inventario",
      ar: "الباركود وGS1 وجرد المستودعات",
      tr: "Barkod, GS1 ve Stok Sayımı",
    },
    summary: {
      en: "4-in-1 Barcode, GS1/QR generation, multi-provider GTIN lookup, thermal ZPL II & sheet label printing, anti-counterfeit verification, and warehouse stock-take.",
      es: "Suite 4-en-1 de códigos de barras, generación GS1/QR, búsqueda GTIN multiproveedor, impresión térmica ZPL II, verificación antifalsificación y conteo de inventario.",
      ar: "حزمة 4 في 1 للباركود وتوليد GS1/QR والبحث عن GTIN وطباعة الملصقات الحرارية ZPL II والتحقق من الأصالة وجرد المستودعات.",
      tr: "Medusa v2 için barkod/GS1/QR üretimi, çoklu sağlayıcı GTIN sorgulama, termal ZPL II etiket yazdırma ve depo stok sayımı.",
    },
    schemaFile: "barcode",
    dir: "barcode",
  },
  {
    slug: "medusa-plugin-dian",
    npmName: "@vicacha-devs/medusa-plugin-dian",
    pluginId: "dian",
    category: "Compliance & Invoicing",
    label: "DIAN Electronic Invoicing",
    translations: {
      es: "Facturación Electrónica DIAN",
      ar: "الفوترة الإلكترونية DIAN",
      tr: "DIAN Elektronik Faturalama",
    },
    summary: {
      en: "Colombian DIAN UBL 2.1 electronic invoicing (Resolución 000165), CUFE/CUDE SHA-384, XAdES-EPES signatures, SOAP Web Services, and pluggable providers.",
      es: "Facturación electrónica DIAN Colombia UBL 2.1 (Resolución 000165), CUFE/CUDE SHA-384, firma XAdES-EPES, servicios SOAP y proveedores conectables.",
      ar: "الفوترة الإلكترونية الكولومبية DIAN UBL 2.1 مع توقيع XAdES-EPES وحساب CUFE/CUDE وخدمات SOAP ومزودين قابلين للتوصيل.",
      tr: "Kolombiya DIAN UBL 2.1 elektronik faturalama, CUFE/CUDE SHA-384, XAdES-EPES dijital imza ve takılabilir sağlayıcılar.",
    },
    schemaFile: "dian",
    dir: "dian",
  },
  {
    slug: "medusa-plugin-documents",
    npmName: "@vicacha-devs/medusa-plugin-documents",
    pluginId: "documents",
    category: "Compliance & Invoicing",
    label: "Commercial PDF Documents",
    translations: {
      es: "Documentos PDF Comerciales",
      ar: "المستندات التجارية PDF",
      tr: "Ticari PDF Belgeleri",
    },
    summary: {
      en: "Invoices, packing slips, credit notes, and POS receipts with dual PDF engine (@react-pdf/renderer + Handlebars/pdfmake), 10-locale i18n, and Docuseal e-signatures.",
      es: "Facturas, listas de empaque, notas crédito y recibos POS con motor PDF dual, i18n en 10 idiomas y firmas electrónicas Docuseal.",
      ar: "فواتير وقوائم تعبئة وإشعارات دائنة وإيصالات نقاط البيع بمحرك PDF مزدوج و10 لغات وتوقيع إلكتروني عبر Docuseal.",
      tr: "Çift PDF motoru, 10 dilde yerelleştirme ve Docuseal e-imza desteği ile fatura, irsaliye, kredi notu ve POS fişleri.",
    },
    schemaFile: "documents",
    dir: "documents",
  },
  {
    slug: "medusa-fulfillment-eu",
    npmName: "@vicacha-devs/medusa-fulfillment-eu",
    pluginId: "fulfillment-eu",
    category: "Operations & Fulfillment",
    label: "EU & Benelux Fulfillment",
    translations: {
      es: "Logística UE y Benelux",
      ar: "الشحن الأوروبي وبينيلوكس",
      tr: "AB ve Benelüks Lojistik",
    },
    summary: {
      en: "EU & Benelux fulfillment provider plugin for Medusa v2 supporting PostNL letterbox, Sendcloud EU parcel, and Rotterdam LCL pallet freight.",
      es: "Proveedor de logística UE y Benelux para Medusa v2 compatible con PostNL letterbox, Sendcloud EU y carga paletizada Rotterdam LCL.",
      ar: "مزود شحن لأوروبا وبينيلوكس لـ Medusa v2 يدعم PostNL وSendcloud EU وشحن المنصات LCL في روتردام.",
      tr: "PostNL, Sendcloud EU ve Rotterdam LCL palet taşımacılığı destekli Medusa v2 AB ve Benelüks lojistik sağlayıcısı.",
    },
    schemaFile: "",
    dir: "fulfillment-eu",
  },
  {
    slug: "medusa-plugin-notifications",
    npmName: "@vicacha-devs/medusa-plugin-notifications",
    pluginId: "notifications",
    category: "Engagement & Growth",
    label: "Omnichannel Notifications",
    translations: {
      es: "Notificaciones Omnicanal",
      ar: "الإشعارات متعددة القنوات",
      tr: "Çok Kanallı Bildirimler",
    },
    summary: {
      en: "Multi-channel notification studio for Medusa v2: visual template builder, event mappings, consent ledger, abandoned cart recovery, broadcasts, and 6+ providers.",
      es: "Estudio de notificaciones multicanal: constructor visual de plantillas, mapeo de eventos, registro de consentimiento, carritos abandonados y difusiones.",
      ar: "استوديو إشعارات متعدد القنوات لـ Medusa v2 مع منشئ قوالب وسجل موافقات واسترداد السلال المتروكة والبث الجماعي.",
      tr: "Görsel şablon oluşturucu, olay eşleme, onay defteri, terk edilmiş sepet kurtarma ve çoklu kanal sağlayıcıları.",
    },
    schemaFile: "notifications",
    dir: "notifications",
  },
  {
    slug: "medusa-plugin-odoo",
    npmName: "@vicacha-devs/medusa-plugin-odoo",
    pluginId: "odoo",
    category: "ERP & Integrations",
    label: "Odoo ERP Bidirectional Sync",
    translations: {
      es: "Sincronización Odoo ERP",
      ar: "مزامنة Odoo ERP ثنائية الاتجاه",
      tr: "Odoo ERP Çift Yönlü Senkronizasyon",
    },
    summary: {
      en: "Bidirectional Odoo 14–19+ (JSON-RPC 2.0 & JSON-2) sync for products, multi-warehouse inventory drift reconciliation, orders, invoices, and offline POS replay.",
      es: "Sincronización bidireccional con Odoo 14–19+ para productos, conciliación de inventario multialmacén, pedidos, facturas y POS offline.",
      ar: "مزامنة ثنائية الاتجاه مع Odoo 14–19+ للمنتجات والمخزون متعدد المستودعات والطلبات والفواتير ونقاط البيع.",
      tr: "Ürünler, çoklu depo stok mutabakatı, siparişler, faturalar ve çevrimdışı POS tekrarı için çift yönlü Odoo ERP entegrasyonu.",
    },
    schemaFile: "odoo",
    dir: "odoo",
  },
  {
    slug: "medusa-payment-bold",
    npmName: "@vicacha-devs/medusa-payment-bold",
    pluginId: "payment-bold",
    category: "Payments",
    label: "Bold Colombia Payments",
    translations: {
      es: "Pagos Bold Colombia",
      ar: "مدفوعات Bold كولومبيا",
      tr: "Bold Kolombiya Ödemeleri",
    },
    summary: {
      en: "Bold Colombia 4-channel payment suite (Payment Button, Payment Links, Online API for Cards/PSE/Nequi/QR, and Smart POS Terminals) with loopback QA emulator.",
      es: "Suite de pagos Bold Colombia de 4 canales (Botón, Links, API Online Tarjetas/PSE/Nequi/QR y Datáfonos Smart POS) con emulador QA.",
      ar: "بوابة مدفوعات Bold كولومبيا عبر 4 قنوات (زر الدفع والروابط والواجهة المباشرة وأجهزة Smart POS) مع محاكي اختبار محلي.",
      tr: "Ödeme düğmesi, link, çevrimiçi API (Kart/PSE/Nequi/QR) ve Smart POS terminalleri için 4 kanallı Bold Kolombiya ödeme paketi.",
    },
    schemaFile: "payment-bold",
    dir: "payment-bold",
  },
  {
    slug: "medusa-payment-mollie",
    npmName: "@vicacha-devs/medusa-payment-mollie",
    pluginId: "payment-mollie",
    category: "Payments",
    label: "Mollie & B2B Net-14",
    translations: {
      es: "Pagos Mollie y B2B Net-14",
      ar: "مدفوعات Mollie وNet-14",
      tr: "Mollie ve B2B Net-14 Ödemeleri",
    },
    summary: {
      en: "Mollie (iDEAL, Bancontact, SEPA, Cards) and B2B Net-14 Invoice payment provider plugin for Medusa v2.",
      es: "Proveedor de pagos Mollie (iDEAL, Bancontact, SEPA, Tarjetas) y facturación B2B Net-14 para Medusa v2.",
      ar: "مزود دفع Mollie (iDEAL وBancontact وSEPA والبطاقات) وفواتير B2B Net-14 لنظام Medusa v2.",
      tr: "Medusa v2 için Mollie (iDEAL, Bancontact, SEPA, Kartlar) ve B2B Net-14 fatura ödeme sağlayıcısı.",
    },
    schemaFile: "",
    dir: "payment-mollie",
  },
  {
    slug: "medusa-plugin-product-extensions",
    npmName: "@vicacha-devs/medusa-plugin-product-extensions",
    pluginId: "product-extensions",
    category: "Catalog & Merchandising",
    label: "Product Extensions Suite",
    translations: {
      es: "Extensiones de Producto",
      ar: "إضافات المنتجات المتقدمة",
      tr: "Ürün Uzantıları Paketi",
    },
    summary: {
      en: "Rich video & 3D media, variant galleries, typed custom attributes with SI/Imperial normalization, hierarchical content sections, badges, swatches, and storefront overrides.",
      es: "Video y medios 3D, galerías por variante, atributos tipados con normalización SI/Imperial, secciones jerárquicas, insignias y muestras.",
      ar: "وسائط فيديو وثلاثية الأبعاد ومعارض متغيرات وسمات مخصصة وأقسام محتوى هرمية وشارات وعينات ألوان لـ Medusa v2.",
      tr: "Zengin video/3D medya, varyant galerileri, özel öznitelikler, hiyerarşik içerik bölümleri, rozetler ve renk örnekleri.",
    },
    schemaFile: "product-extensions",
    dir: "product-extensions",
  },
  {
    slug: "medusa-plugin-social-commerce",
    npmName: "@vicacha-devs/medusa-plugin-social-commerce",
    pluginId: "social-commerce",
    category: "Engagement & Growth",
    label: "Social Commerce & Live Selling",
    translations: {
      es: "Comercio Social y Live Selling",
      ar: "التجارة الاجتماعية والبث المباشر",
      tr: "Sosyal Ticaret ve Canlı Satış",
    },
    summary: {
      en: "Multi-platform Social Commerce, live selling sessions, product tagging, and catalog sync for TikTok, Instagram, and Facebook / Meta Graph API.",
      es: "Comercio social multiplataforma, sesiones de venta en vivo, etiquetado de productos y sincronización de catálogo para TikTok, Instagram y Meta.",
      ar: "تجارة اجتماعية متعددة المنصات وجلسات بيع مباشر ووسم المنتجات ومزامنة الكتالوج مع TikTok وInstagram وMeta.",
      tr: "TikTok, Instagram ve Meta Graph API için çok platformlu sosyal ticaret, canlı satış oturumları ve katalog senkronizasyonu.",
    },
    schemaFile: "social-commerce",
    dir: "social-commerce",
  },
  {
    slug: "medusa-plugin-stories",
    npmName: "@vicacha-devs/medusa-plugin-stories",
    pluginId: "stories",
    category: "Engagement & Growth",
    label: "Shoppable Stories & Reels",
    translations: {
      es: "Historias Comprables",
      ar: "القصص التفاعلية القابلة للتسوق",
      tr: "Alışveriş Yapılabilir Hikayeler",
    },
    summary: {
      en: "Shoppable 9:16 stories, highlight rings, X/Y product hotspots, interactive stickers (polls, countdowns, coupons), funnel analytics, and Storefront React UI Kit.",
      es: "Historias comprables 9:16, anillos destacados, hotspots de productos X/Y, stickers interactivos, analítica de embudo y UI Kit React.",
      ar: "قصص تفاعلية 9:16 مع نقاط منتجات X/Y وملصقات استطلاع وعد تنازلي وقسائم وتحليلات قمع التحويل ومجموعة واجهات React.",
      tr: "9:16 alışveriş yapılabilir hikayeler, ürün etiketleri, etkileşimli çıkartmalar, dönüşüm analitiği ve React UI kiti.",
    },
    schemaFile: "stories",
    dir: "stories",
  },
  {
    slug: "medusa-plugin-typesense",
    npmName: "@vicacha-devs/medusa-plugin-typesense",
    pluginId: "typesense",
    category: "Catalog & Merchandising",
    label: "Typesense Search & AI Hybrid",
    translations: {
      es: "Búsqueda Typesense e IA Híbrida",
      ar: "بحث Typesense والبحث الهجين بالذكاء الاصطناعي",
      tr: "Typesense Arama ve Yapay Zeka Hibrit",
    },
    summary: {
      en: "Typesense search indexing, vector/hybrid AI search, merchandising (synonyms, curations, stopwords), custom entity indexing, and InstantSearch storefront SDK.",
      es: "Indexación Typesense, búsqueda híbrida/vectorial con IA, merchandising (sinónimos, curaciones), entidades personalizadas y SDK InstantSearch.",
      ar: "فهرسة Typesense والبحث الهجين/المتجهي بالذكاء الاصطناعي وإدارة المرادفات والترتيب المخصص وحزمة InstantSearch للواجهة.",
      tr: "Typesense indeksleme, vektör/hibrit yapay zeka araması, eşanlamlılar, kürasyonlar ve InstantSearch mağaza SDK'sı.",
    },
    schemaFile: "typesense",
    dir: "typesense",
  },
];

export const guides: GuideMeta[] = [
  {
    slug: "guides/getting-started",
    label: "Getting Started",
    translations: {
      es: "Primeros Pasos",
      ar: "البدء السريع",
      tr: "Başlangıç",
    },
  },
  {
    slug: "guides/architecture",
    label: "Monorepo Architecture",
    translations: {
      es: "Arquitectura del Monorepo",
      ar: "هندسة المستودع الموحد",
      tr: "Monorepo Mimarisi",
    },
  },
  {
    slug: "guides/inter-plugin-bridges",
    label: "Inter-Plugin Bridges",
    translations: {
      es: "Puentes entre Plugins",
      ar: "التكامل بين الإضافات",
      tr: "Eklentiler Arası Köprüler",
    },
  },
  {
    slug: "guides/qa-emulators-and-testing",
    label: "QA Emulators & Testing",
    translations: {
      es: "Emuladores QA y Pruebas",
      ar: "محاكيات الجودة والاختبارات",
      tr: "QA Emülatörleri ve Test",
    },
  },
  {
    slug: "guides/i18n-and-rtl",
    label: "Admin i18n & RTL",
    translations: {
      es: "Internacionalización y RTL",
      ar: "التعريب ودعم RTL",
      tr: "Çoklu Dil ve RTL",
    },
  },
  {
    slug: "guides/security",
    label: "Security & RBAC",
    translations: {
      es: "Seguridad y RBAC",
      ar: "الأمان وصلاحيات RBAC",
      tr: "Güvenlik ve RBAC",
    },
  },
  {
    slug: "guides/contributing",
    label: "Contributing & Scaffolding",
    translations: {
      es: "Contribución y Scaffolding",
      ar: "المساهمة وإنشاء الإضافات",
      tr: "Katkı ve Eklenti Oluşturma",
    },
  },
];
