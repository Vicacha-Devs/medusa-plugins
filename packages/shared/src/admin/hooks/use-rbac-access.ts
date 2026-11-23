import { useEffect, useState } from "react"

export interface RbacMePayload {
  isSuperAdmin?: boolean
  permissions?: string[]
}

export interface RbacAccessState {
  isLoading: boolean
  rbacActive: boolean
  isSuperAdmin: boolean
  permissions: string[]
  hasPermission: (permission?: string) => boolean
}

interface CachedRbacResult {
  rbacActive: boolean
  isSuperAdmin: boolean
  permissions: string[]
  fetchedAt: number
}

const CACHE_TTL_MS = 30_000
let cachedResult: CachedRbacResult | null = null
let inflightPromise: Promise<CachedRbacResult> | null = null

export function clearRbacAccessCache(): void {
  cachedResult = null
  inflightPromise = null
}

export function matchRbacPermission(
  granted: readonly string[],
  required: string,
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin) return true
  if (!required) return true
  if (
    granted.includes("*") ||
    granted.includes("*:*") ||
    granted.includes(required)
  ) {
    return true
  }
  const sep = required.includes(".") ? "." : required.includes(":") ? ":" : null
  if (sep) {
    const ns = required.split(sep)[0]
    if (granted.includes(`${ns}.*`) || granted.includes(`${ns}:*`)) {
      return true
    }
  }
  return false
}

async function fetchRbacMe(): Promise<CachedRbacResult> {
  if (cachedResult && Date.now() - cachedResult.fetchedAt < CACHE_TTL_MS) {
    return cachedResult
  }
  if (inflightPromise) {
    return inflightPromise
  }

  inflightPromise = (async () => {
    try {
      const res = await fetch("/admin/rbac/me", {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      if (res.status === 404) {
        const fallback: CachedRbacResult = {
          rbacActive: false,
          isSuperAdmin: false,
          permissions: [],
          fetchedAt: Date.now(),
        }
        cachedResult = fallback
        return fallback
      }
      if (!res.ok) {
        const denied: CachedRbacResult = {
          rbacActive: true,
          isSuperAdmin: false,
          permissions: [],
          fetchedAt: Date.now(),
        }
        cachedResult = denied
        return denied
      }
      const data = (await res.json()) as RbacMePayload
      const resolved: CachedRbacResult = {
        rbacActive: true,
        isSuperAdmin: Boolean(data?.isSuperAdmin),
        permissions: Array.isArray(data?.permissions) ? data.permissions : [],
        fetchedAt: Date.now(),
      }
      cachedResult = resolved
      return resolved
    } catch {
      const fallback: CachedRbacResult = {
        rbacActive: false,
        isSuperAdmin: false,
        permissions: [],
        fetchedAt: Date.now(),
      }
      cachedResult = fallback
      return fallback
    } finally {
      inflightPromise = null
    }
  })()

  return inflightPromise
}

/**
 * Fetches `/admin/rbac/me` with graceful 404 fallback when no RBAC plugin is mounted.
 */
export function useRbacAccess(): RbacAccessState {
  const [state, setState] = useState<CachedRbacResult | null>(() =>
    cachedResult && Date.now() - cachedResult.fetchedAt < CACHE_TTL_MS
      ? cachedResult
      : null
  )

  useEffect(() => {
    let active = true
    fetchRbacMe().then((res) => {
      if (active) setState(res)
    })
    return () => {
      active = false
    }
  }, [])

  if (!state) {
    return {
      isLoading: true,
      rbacActive: false,
      isSuperAdmin: false,
      permissions: [],
      hasPermission: () => false,
    }
  }

  return {
    isLoading: false,
    rbacActive: state.rbacActive,
    isSuperAdmin: state.isSuperAdmin,
    permissions: state.permissions,
    hasPermission: (permission?: string) => {
      if (!state.rbacActive || !permission) return true
      return matchRbacPermission(
        state.permissions,
        permission,
        state.isSuperAdmin
      )
    },
  }
}
