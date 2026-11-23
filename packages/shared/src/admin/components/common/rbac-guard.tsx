import { Container, Heading, Text } from "@medusajs/ui"
import type { JSX, ReactNode } from "react"

import { useRbacAccess } from "../../hooks/use-rbac-access"

export interface RbacGuardProps {
  permission: string
  children: ReactNode
  fallback?: ReactNode
  hideOnDenied?: boolean
  title?: string
  description?: string
}

/**
 * Guards Admin UI routes, widgets, or actions using `/admin/rbac/me`.
 * Falls back to rendering `children` when `/admin/rbac/me` is not mounted (404).
 */
export const RbacGuard = ({
  permission,
  children,
  fallback,
  hideOnDenied = false,
  title = "Access denied",
  description = "You do not have permission to view this section.",
}: RbacGuardProps): JSX.Element | null => {
  const { isLoading, hasPermission } = useRbacAccess()

  if (isLoading) {
    return null
  }

  if (!hasPermission(permission)) {
    if (hideOnDenied) {
      return null
    }
    if (fallback !== undefined) {
      return <>{fallback}</>
    }
    return (
      <Container className="flex flex-col gap-y-2 p-6">
        <Heading level="h2">{title}</Heading>
        <Text size="small" className="text-ui-fg-subtle">
          {description} ({permission})
        </Text>
      </Container>
    )
  }

  return <>{children}</>
}
