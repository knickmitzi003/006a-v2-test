/**
 * 从粘贴的标题串中智能提取文章元数据。
 * 标准格式示例：[XIAOYUKIKO] [82P - 22MB] 药师少女的独语 - 猫猫
 */
import {
  BUILTIN_STANDARD_TEMPLATE,
  BUILTIN_STANDARD_TEMPLATE_ID,
  type SmartParseTemplate,
} from './smartParseTemplates'

export type SmartParseRules = {
  /** 标签分隔正则字符组，如 [,、/|] */
  tagDelimiterPattern: string
  /** 标题与标签分隔正则，如 [-–—] */
  titleSeparatorPattern: string
}

export type SmartPostParseResult = {
  title?: string
  category?: string
  tags?: string[]
  /** 媒体数量，如 82P、50P+2v */
  downloadCount?: string
  /** 资源包大小，如 22MB */
  downloadSize?: string
  confidence: 'high' | 'medium' | 'low'
}

export type SmartPostParseOutcome = {
  result: SmartPostParseResult
  templateId: string
  templateName: string
}

const COUNT_RE =
  /\d+\s*[pP](?:\s*\+\s*\d+\s*[vV])?|\d+\s*[vV](?:\s*\+\s*\d+\s*[pP])?/i
const SIZE_RE = /\d+(?:\.\d+)?\s*(?:MB|GB|GiB|KB|TB|mb|gb|giB|kb|tb)/i

const DEFAULT_RULES: SmartParseRules = {
  tagDelimiterPattern: '[,、/|]',
  titleSeparatorPattern: '[-–—]',
}

function normalizeCount(raw: string): string {
  const t = raw.trim()
  const m = t.match(
    /(\d+)\s*([pP])(?:\s*\+\s*(\d+)\s*([vV]))?|(\d+)\s*([vV])(?:\s*\+\s*(\d+)\s*([pP]))?/i
  )
  if (!m) return t
  if (m[1] && m[2]) {
    const p = `${m[1]}P`
    return m[3] && m[4] ? `${p}+${m[3]}v` : p
  }
  if (m[5] && m[6]) {
    const v = `${m[5]}v`
    return m[7] && m[8] ? `${m[7]}P+${v}` : v
  }
  return t
}

function normalizeSize(raw: string): string {
  const m = raw.trim().match(/^(\d+(?:\.\d+)?)\s*([A-Za-z]+)$/i)
  if (!m) return raw.trim()
  const unit = m[2].toUpperCase().replace('GIB', 'GB').replace('MIB', 'MB')
  return `${m[1]} ${unit}`
}

function looksLikeCountOrSize(s: string): boolean {
  return COUNT_RE.test(s) || SIZE_RE.test(s)
}

function extractCountAndSize(segment: string): {
  count?: string
  size?: string
} {
  const parts = segment.split(/[-–—]/).map((p) => p.trim()).filter(Boolean)
  let count: string | undefined
  let size: string | undefined

  for (const p of parts) {
    const countMatch = p.match(COUNT_RE)
    const sizeMatch = p.match(SIZE_RE)
    if (countMatch && !count) count = normalizeCount(countMatch[0])
    if (sizeMatch && !size) size = normalizeSize(sizeMatch[0])
  }

  if (!count && !size) {
    const countMatch = segment.match(COUNT_RE)
    const sizeMatch = segment.match(SIZE_RE)
    if (countMatch) count = normalizeCount(countMatch[0])
    if (sizeMatch) size = normalizeSize(sizeMatch[0])
  }

  return { count, size }
}

function splitTagList(tagPart: string, rules: SmartParseRules): string[] {
  const text = tagPart.trim()
  if (!text) return []
  try {
    return text
      .split(new RegExp(rules.tagDelimiterPattern))
      .map((t) => t.trim())
      .filter(Boolean)
  } catch {
    return [text]
  }
}

function splitTitleAndTags(
  rest: string,
  rules: SmartParseRules
): { title?: string; tags?: string[] } {
  const text = rest.trim()
  if (!text) return {}

  let titleSepRe: RegExp
  try {
    titleSepRe = new RegExp(
      `^(.+?)\\s*${rules.titleSeparatorPattern}\\s*(.+)$`
    )
  } catch {
    titleSepRe = /^(.+?)\s*[-–—]\s*(.+)$/
  }

  const dashMatch = text.match(titleSepRe)
  if (dashMatch) {
    const tagPart = dashMatch[1].trim()
    const titlePart = dashMatch[2].trim()
    const tags = tagPart ? splitTagList(tagPart, rules) : undefined
    return {
      title: titlePart || undefined,
      tags: tags?.length ? tags : undefined,
    }
  }

  if (text.length <= 40) {
    return { title: text }
  }
  const tags = splitTagList(text, rules)
  return tags.length > 1 ? { tags } : { tags: [text] }
}

function countLeadingBrackets(input: string): number {
  let text = input.trim()
  let n = 0
  while (text.startsWith('[')) {
    const end = text.indexOf(']')
    if (end === -1) break
    n += 1
    text = text.slice(end + 1).trim()
  }
  return n
}

function confidenceScore(result: SmartPostParseResult): number {
  if (result.confidence === 'high') return 3
  if (result.confidence === 'medium') return 2
  return 1
}

function structureScore(input: string, example: string): number {
  const inputBrackets = countLeadingBrackets(input)
  const exampleBrackets = countLeadingBrackets(example)
  const diff = Math.abs(inputBrackets - exampleBrackets)
  return Math.max(0, 3 - diff)
}

/** 从示例串推导分隔规则，用于「存为模板」 */
export function inferRulesFromExample(example: string): SmartParseRules {
  const rules: SmartParseRules = { ...DEFAULT_RULES }
  let text = example.trim()

  while (text.startsWith('[')) {
    const end = text.indexOf(']')
    if (end === -1) break
    text = text.slice(end + 1).trim()
  }

  const titleCandidates: Array<{ sep: string; tagPart: string; titlePart: string }> =
    []
  for (const sep of [' - ', ' – ', ' — ', ' | ']) {
    const idx = text.lastIndexOf(sep)
    if (idx > 0) {
      titleCandidates.push({
        sep,
        tagPart: text.slice(0, idx).trim(),
        titlePart: text.slice(idx + sep.length).trim(),
      })
    }
  }

  const best = titleCandidates.sort(
    (a, b) => a.titlePart.length - b.titlePart.length
  )[0]

  if (best && best.titlePart && best.tagPart) {
    const ch = best.sep.trim().charAt(0)
    if (ch && ch !== '|') {
      const escaped = ch.replace(/[-[\]\\^$.*+?()|{}]/g, '\\$&')
      rules.titleSeparatorPattern = `[${escaped}]`
    }
    if (best.tagPart.includes('、')) rules.tagDelimiterPattern = '[,、]'
    else if (best.tagPart.includes(',')) rules.tagDelimiterPattern = '[,、/|]'
    else if (best.tagPart.includes('/')) rules.tagDelimiterPattern = '[,/|、]'
    else if (best.tagPart.includes('|')) rules.tagDelimiterPattern = '[|/、,]'
  }

  return rules
}

export function parseSmartPostText(
  input: string,
  rules: SmartParseRules = DEFAULT_RULES
): SmartPostParseResult {
  const raw = (input || '').trim()
  if (!raw) return { confidence: 'low' }

  let text = raw
  const brackets: string[] = []

  while (text.startsWith('[')) {
    const end = text.indexOf(']')
    if (end === -1) break
    brackets.push(text.slice(1, end).trim())
    text = text.slice(end + 1).trim()
  }

  const result: SmartPostParseResult = { confidence: 'low' }

  for (const bracket of brackets) {
    if (looksLikeCountOrSize(bracket)) {
      const { count, size } = extractCountAndSize(bracket)
      if (count) result.downloadCount = count
      if (size) result.downloadSize = size
    } else if (!result.category) {
      result.category = bracket
    }
  }

  const { title, tags } = splitTitleAndTags(text, rules)
  if (title) result.title = title
  if (tags?.length) result.tags = tags

  if (brackets.length >= 2 && result.title && result.category) {
    result.confidence = 'high'
  } else if (brackets.length > 0 || result.title) {
    result.confidence = 'medium'
  }

  if (brackets.length === 0) {
    const { count, size } = extractCountAndSize(raw)
    if (count) result.downloadCount = count
    if (size) result.downloadSize = size
    if (!result.title && !result.tags) {
      let stripped = raw
      if (count) stripped = stripped.replace(COUNT_RE, '').trim()
      if (size) stripped = stripped.replace(SIZE_RE, '').trim()
      stripped = stripped.replace(/^[-–—\s]+|[-–—\s]+$/g, '').trim()
      if (stripped) {
        const flex = splitTitleAndTags(stripped, rules)
        if (flex.title) result.title = flex.title
        if (flex.tags) result.tags = flex.tags
      }
    }
  }

  return result
}

export function parseSmartPostWithTemplate(
  input: string,
  template: SmartParseTemplate
): SmartPostParseOutcome {
  const result = parseSmartPostText(input, template.rules)
  return {
    result,
    templateId: template.id,
    templateName: template.name,
  }
}

export function parseSmartPostAuto(
  input: string,
  templates: SmartParseTemplate[]
): SmartPostParseOutcome {
  const list =
    templates.length > 0 ? templates : [BUILTIN_STANDARD_TEMPLATE]
  let best: SmartPostParseOutcome | null = null
  let bestScore = -1

  for (const template of list) {
    const outcome = parseSmartPostWithTemplate(input, template)
    const score =
      confidenceScore(outcome.result) * 10 +
      structureScore(input, template.example)
    if (score > bestScore) {
      bestScore = score
      best = outcome
    }
  }

  return best || parseSmartPostWithTemplate(input, BUILTIN_STANDARD_TEMPLATE)
}

export function parseSmartPostBySelection(
  input: string,
  templates: SmartParseTemplate[],
  selectedTemplateId: string
): SmartPostParseOutcome {
  if (selectedTemplateId === 'auto') {
    return parseSmartPostAuto(input, templates)
  }
  const template =
    templates.find((t) => t.id === selectedTemplateId) ||
    BUILTIN_STANDARD_TEMPLATE
  return parseSmartPostWithTemplate(input, template)
}

/** 在已有列表中查找忽略大小写的精确匹配项 */
export function findExistingOption(
  name: string,
  options: string[]
): string | undefined {
  const n = (name || '').trim()
  if (!n) return undefined
  return options.find((o) => o.toLowerCase() === n.toLowerCase())
}
