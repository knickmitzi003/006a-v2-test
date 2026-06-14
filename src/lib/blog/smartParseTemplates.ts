import type { SmartParseRules } from './smartPostParse'

export type SmartParseTemplate = {
  id: string
  name: string
  example: string
  rules: SmartParseRules
  builtIn?: boolean
  createdAt?: number
}

export const SMART_PARSE_STORAGE_KEY = 'gallery-smart-parse-templates'
export const SMART_PARSE_TEMPLATE_AUTO = 'auto'
export const BUILTIN_STANDARD_TEMPLATE_ID = 'builtin-standard'

export const DEFAULT_SMART_PARSE_RULES: SmartParseRules = {
  tagDelimiterPattern: '[,、/|]',
  titleSeparatorPattern: '[-–—]',
}

export const BUILTIN_STANDARD_TEMPLATE: SmartParseTemplate = {
  id: BUILTIN_STANDARD_TEMPLATE_ID,
  name: '标准：[分类] [数量-大小] 标签 - 标题',
  example: '[XIAOYUKIKO] [82P - 22MB] 药师少女的独语 - 猫猫',
  rules: DEFAULT_SMART_PARSE_RULES,
  builtIn: true,
}

function safeParseTemplates(raw: string | null): SmartParseTemplate[] {
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as SmartParseTemplate[]
    if (!Array.isArray(parsed)) return []
    return parsed.filter(
      (t) =>
        t &&
        typeof t.id === 'string' &&
        typeof t.name === 'string' &&
        typeof t.example === 'string' &&
        t.rules &&
        typeof t.rules.tagDelimiterPattern === 'string' &&
        typeof t.rules.titleSeparatorPattern === 'string'
    )
  } catch {
    return []
  }
}

export function loadCustomSmartParseTemplates(): SmartParseTemplate[] {
  if (typeof window === 'undefined') return []
  return safeParseTemplates(localStorage.getItem(SMART_PARSE_STORAGE_KEY))
}

export function saveCustomSmartParseTemplates(templates: SmartParseTemplate[]) {
  if (typeof window === 'undefined') return
  localStorage.setItem(SMART_PARSE_STORAGE_KEY, JSON.stringify(templates))
}

export function getAllSmartParseTemplates(): SmartParseTemplate[] {
  return [BUILTIN_STANDARD_TEMPLATE, ...loadCustomSmartParseTemplates()]
}

export function addSmartParseTemplate(
  name: string,
  example: string,
  rules: SmartParseRules
): SmartParseTemplate {
  const custom = loadCustomSmartParseTemplates()
  const template: SmartParseTemplate = {
    id: `tpl-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim() || '自定义模板',
    example: example.trim(),
    rules,
    createdAt: Date.now(),
  }
  saveCustomSmartParseTemplates([...custom, template])
  return template
}

export function deleteSmartParseTemplate(id: string): boolean {
  if (id === BUILTIN_STANDARD_TEMPLATE_ID) return false
  const custom = loadCustomSmartParseTemplates()
  const next = custom.filter((t) => t.id !== id)
  if (next.length === custom.length) return false
  saveCustomSmartParseTemplates(next)
  return true
}
