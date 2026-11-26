import { MedusaError } from "@medusajs/framework/utils"

import type { BarcodeOpsContext } from "./context"
import type {
  BarcodeSymbology,
  CustomLabelTemplateConfig,
  LabelPresetId,
  LabelPrintItem,
  LabelPrintOutput,
  LabelTemplateSpec,
} from "../types"
import {
  BUILTIN_LABEL_TEMPLATES,
  renderPrintableLabels,
} from "../utils/label-printer"

function normalizeConfigLabelTemplate(
  cfg: CustomLabelTemplateConfig
): LabelTemplateSpec {
  const base = BUILTIN_LABEL_TEMPLATES.thermal_50x25
  return {
    id: cfg.id,
    name: cfg.name,
    preset_id: cfg.preset_id || "custom",
    layout_type: cfg.layout_type || base.layout_type,
    width_mm: cfg.width_mm ?? base.width_mm,
    height_mm: cfg.height_mm ?? base.height_mm,
    columns: cfg.columns ?? base.columns,
    rows: cfg.rows ?? base.rows,
    margin_top_mm: cfg.margin_top_mm ?? base.margin_top_mm,
    margin_left_mm: cfg.margin_left_mm ?? base.margin_left_mm,
    gap_x_mm: cfg.gap_x_mm ?? base.gap_x_mm,
    gap_y_mm: cfg.gap_y_mm ?? base.gap_y_mm,
    symbology: cfg.symbology || base.symbology,
    show_title: cfg.show_title ?? base.show_title,
    show_variant_title: cfg.show_variant_title ?? base.show_variant_title,
    show_sku: cfg.show_sku ?? base.show_sku,
    show_price: cfg.show_price ?? base.show_price,
    show_compare_at_price:
      cfg.show_compare_at_price ?? base.show_compare_at_price,
    show_brand: cfg.show_brand ?? base.show_brand,
    show_qr: cfg.show_qr ?? base.show_qr,
    custom_header: cfg.custom_header !== undefined ? cfg.custom_header : null,
    custom_footer: cfg.custom_footer !== undefined ? cfg.custom_footer : null,
    dpi: cfg.dpi || base.dpi,
    is_default: Boolean(cfg.is_default),
  }
}

/**
 * Lists all built-in + config + DB custom label templates.
 */
export async function listAllLabelTemplates(
  ctx: BarcodeOpsContext
): Promise<LabelTemplateSpec[]> {
  const builtinList = Object.values(BUILTIN_LABEL_TEMPLATES)
  const configList = (ctx.options.customLabelTemplates || []).map(
    normalizeConfigLabelTemplate
  )
  let dbList: LabelTemplateSpec[] = []
  try {
    const customRows = await ctx.svc.listBarcodeLabelTemplates(
      {},
      { take: 100 }
    )
    dbList = customRows.map((row) => ({
      id: row.id,
      name: row.name,
      preset_id: (row.preset_id as LabelPresetId) || "custom",
      layout_type: row.layout_type as "thermal_roll" | "a4_sheet",
      width_mm: Number(row.width_mm),
      height_mm: Number(row.height_mm),
      columns: Number(row.columns),
      rows: Number(row.rows),
      margin_top_mm: Number(row.margin_top_mm),
      margin_left_mm: Number(row.margin_left_mm),
      gap_x_mm: Number(row.gap_x_mm),
      gap_y_mm: Number(row.gap_y_mm),
      symbology: (row.symbology as BarcodeSymbology) || "ean13",
      show_title: Boolean(row.show_title),
      show_variant_title: Boolean(row.show_variant_title),
      show_sku: Boolean(row.show_sku),
      show_price: Boolean(row.show_price),
      show_compare_at_price: Boolean(row.show_compare_at_price),
      show_brand: Boolean(row.show_brand),
      show_qr: Boolean(row.show_qr),
      custom_header: row.custom_header ?? null,
      custom_footer: row.custom_footer ?? null,
      dpi: (Number(row.dpi) === 300 ? 300 : 203) as 203 | 300,
      is_default: Boolean(row.is_default),
    }))
  } catch {
    dbList = []
  }

  const byId = new Map<string, LabelTemplateSpec>()
  for (const tpl of builtinList) byId.set(tpl.id, tpl)
  for (const tpl of configList) byId.set(tpl.id, tpl)
  for (const tpl of dbList) byId.set(tpl.id, tpl)
  return Array.from(byId.values())
}

/**
 * Renders printable HTML+SVG and Zebra ZPL II output for a list of label items.
 */
export async function renderLabels(
  ctx: BarcodeOpsContext,
  input: {
    items: LabelPrintItem[]
    template_id?: string
    template_override?: Partial<LabelTemplateSpec>
  }
): Promise<LabelPrintOutput> {
  if (!Array.isArray(input.items) || input.items.length === 0) {
    throw new MedusaError(
      MedusaError.Types.INVALID_DATA,
      "At least one label item is required for printing"
    )
  }

  const templates = await listAllLabelTemplates(ctx)
  const baseTemplate =
    templates.find(
      (t) => t.id === input.template_id || t.preset_id === input.template_id
    ) || BUILTIN_LABEL_TEMPLATES.thermal_50x25

  const mergedTemplate: LabelTemplateSpec = {
    ...baseTemplate,
    ...input.template_override,
  }

  const output = renderPrintableLabels(input.items, mergedTemplate)
  const configMatch = (ctx.options.customLabelTemplates || []).find(
    (c) => c.id === baseTemplate.id
  )
  if (configMatch?.renderHtml) {
    output.html = configMatch.renderHtml(input.items, mergedTemplate)
  }
  if (configMatch?.renderZpl) {
    output.zpl = configMatch.renderZpl(input.items, mergedTemplate)
  }
  return output
}
