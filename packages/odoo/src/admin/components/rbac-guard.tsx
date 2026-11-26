import { Container, Heading, Text } from "@medusajs/ui"
import { useEffect, useState, type JSX, type ReactNode } from "react"
import { useTranslation } from "react-i18next"

interface CachedRbacResult {
  rbacActive: boolean
  isSuperAdmin: boolean
  permissions: string[]
  fetchedAt: number
}

const CACHE_TTL_MS = 30_000
let cachedResult: CachedRbacResult | null = null
let inflightPromise: Promise<CachedRbacResult> | null = null

function matchRbacPermission(
  granted: readonly string[],
  required: string,
  isSuperAdmin = false
): boolean {
  if (isSuperAdmin || !required) return true
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
  if (inflightPromise) return inflightPromise

  inflightPromise = (async () => {
    try {
      const res = await fetch("/admin/rbac/me", {
        credentials: "include",
        headers: { Accept: "application/json" },
      })
      if (res.status === 404) {
        cachedResult = {
          rbacActive: false,
          isSuperAdmin: false,
          permissions: [],
          fetchedAt: Date.now(),
        }
        return cachedResult
      }
      if (!res.ok) {
        cachedResult = {
          rbacActive: true,
          isSuperAdmin: false,
          permissions: [],
          fetchedAt: Date.now(),
        }
        return cachedResult
      }
      const data = (await res.json()) as {
        isSuperAdmin?: boolean
        permissions?: string[]
      }
      cachedResult = {
        rbacActive: true,
        isSuperAdmin: Boolean(data?.isSuperAdmin),
        permissions: Array.isArray(data?.permissions) ? data.permissions : [],
        fetchedAt: Date.now(),
      }
      return cachedResult
    } catch {
      cachedResult = {
        rbacActive: false,
        isSuperAdmin: false,
        permissions: [],
        fetchedAt: Date.now(),
      }
      return cachedResult
    } finally {
      inflightPromise = null
    }
  })()

  return inflightPromise
}

export function useRbacAccess() {
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
    return { isLoading: true, rbacActive: false, hasPermission: () => false }
  }

  return {
    isLoading: false,
    rbacActive: state.rbacActive,
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

export const RbacGuard = ({
  permission,
  children,
  hideOnDenied = false,
}: {
  permission: string
  children: ReactNode
  hideOnDenied?: boolean
}): JSX.Element | null => {
  const { t } = useTranslation()
  const { isLoading, hasPermission } = useRbacAccess()
  if (isLoading) return null
  if (!hasPermission(permission)) {
    if (hideOnDenied) return null
    return (
      <Container className="flex flex-col gap-y-2 p-6">
        <Heading level="h2">{t("rbac.accessDeniedTitle")}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {t("rbac.accessDeniedDescription", { permission })}
        </Text>
      </Container>
    )
  }
  return <>{children}</>
}
