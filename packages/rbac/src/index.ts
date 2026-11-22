export {
  clearRbacRegistry,
  getRegisteredPermissions,
  getRegisteredRoutes,
  hasMatchingPermission,
  matchRegisteredRoute,
  parsePermissionKey,
  registerRbacAccess,
  type ParsedPermissionKey,
  type RbacAccessBundle,
  type RbacPermissionTuple,
  type RbacRoutePolicy,
} from "./lib/rbac-registry";
export {
  resolveRbacService,
  resolveUserAccessContext,
  syncRegisteredPolicies,
  type RbacServiceLike,
  type UserAccessContext,
} from "./lib/rbac-service";
