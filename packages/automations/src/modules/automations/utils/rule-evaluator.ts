import type { AutomationCondition } from "../../../types"

const BLOCKED_SEGMENTS = new Set(["__proto__", "constructor", "prototype"])

export function resolveContextPath(
  source: Record<string, any> | null | undefined,
  path: string
): unknown {
  if (!source || typeof source !== "object" || !path) {
    return undefined
  }
  const segments = path.trim().split(".").filter(Boolean)
  let current: any = source
  for (const seg of segments) {
    if (BLOCKED_SEGMENTS.has(seg)) {
      return undefined
    }
    if (current == null || typeof current !== "object") {
      return undefined
    }
    if (Array.isArray(current) && /^\d+$/.test(seg)) {
      current = current[Number(seg)]
    } else if (Object.prototype.hasOwnProperty.call(current, seg)) {
      current = current[seg]
    } else {
      return undefined
    }
  }
  return current
}

export function evaluateCondition(
  condition: AutomationCondition,
  context: Record<string, any>
): boolean {
  const actual = resolveContextPath(context, condition.field)
  const expected = condition.value

  switch (condition.operator) {
    case "exists":
      return actual !== undefined && actual !== null && actual !== ""
    case "not_exists":
      return actual === undefined || actual === null || actual === ""
    case "eq":
      return actual === expected
    case "neq":
      return actual !== expected
    case "gt":
      return typeof actual === "number" && typeof expected === "number"
        ? actual > expected
        : Number(actual) > Number(expected)
    case "gte":
      return typeof actual === "number" && typeof expected === "number"
        ? actual >= expected
        : Number(actual) >= Number(expected)
    case "lt":
      return typeof actual === "number" && typeof expected === "number"
        ? actual < expected
        : Number(actual) < Number(expected)
    case "lte":
      return typeof actual === "number" && typeof expected === "number"
        ? actual <= expected
        : Number(actual) <= Number(expected)
    case "in":
      return Array.isArray(expected) && expected.includes(actual)
    case "not_in":
      return Array.isArray(expected) && !expected.includes(actual)
    case "contains": {
      if (Array.isArray(actual)) return actual.includes(expected)
      if (typeof actual === "string" && typeof expected === "string") {
        return actual.toLowerCase().includes(expected.toLowerCase())
      }
      return false
    }
    case "not_contains": {
      if (Array.isArray(actual)) return !actual.includes(expected)
      if (typeof actual === "string" && typeof expected === "string") {
        return !actual.toLowerCase().includes(expected.toLowerCase())
      }
      return true
    }
    default:
      return false
  }
}

export function evaluateConditions(
  conditions: AutomationCondition[] | null | undefined,
  context: Record<string, any>
): boolean {
  if (!Array.isArray(conditions) || conditions.length === 0) {
    return true
  }
  return conditions.every((cond) => evaluateCondition(cond, context))
}
