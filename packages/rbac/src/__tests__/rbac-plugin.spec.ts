import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  clearRbacRegistry,
  getRegisteredPermissions,
  getRegisteredRoutes,
  hasMatchingPermission,
  matchRegisteredRoute,
  parsePermissionKey,
  registerRbacAccess,
} from "../lib/rbac-registry";

describe("@vicacha-devs/medusa-plugin-rbac — registry & matching", () => {
  beforeEach(() => {
    clearRbacRegistry();
  });

  it("parses dot and colon permission keys into resource and operation", () => {
    assert.deepEqual(parsePermissionKey("b2b.read"), {
      key: "b2b.read",
      resource: "b2b",
      operation: "read",
    });
    assert.deepEqual(parsePermissionKey("order:write"), {
      key: "order:write",
      resource: "order",
      operation: "write",
    });
    assert.deepEqual(parsePermissionKey("admin"), {
      key: "admin",
      resource: "admin",
      operation: "*",
    });
  });

  it("registers plugin permissions/routes and matches parameterized admin routes", () => {
    registerRbacAccess([
      {
        permissions: [
          ["b2b.read", "Read B2B", "B2B"],
          ["b2b.write", "Write B2B", "B2B"],
        ],
        routes: [
          { method: "GET", path: "/admin/b2b/companies", permissions: ["b2b.read"] },
          { method: "POST", path: "/admin/b2b/companies/:id", permissions: ["b2b.write"] },
        ],
      },
    ]);

    assert.equal(getRegisteredPermissions().length, 2);
    assert.equal(getRegisteredRoutes().length, 2);

    const exact = matchRegisteredRoute("GET", "/admin/b2b/companies?limit=20");
    assert.deepEqual(exact?.permissions, ["b2b.read"]);

    const param = matchRegisteredRoute("POST", "/admin/b2b/companies/comp_123");
    assert.deepEqual(param?.permissions, ["b2b.write"]);

    assert.equal(matchRegisteredRoute("DELETE", "/admin/b2b/companies/comp_123"), null);
  });

  it("evaluates exact, wildcard, cross-separator, and super-admin permissions", () => {
    assert.equal(hasMatchingPermission([], ["b2b.read"], true), true);
    assert.equal(hasMatchingPermission(["b2b.read"], ["b2b.read"], false), true);
    assert.equal(hasMatchingPermission(["b2b:read"], ["b2b.read"], false), true);
    assert.equal(hasMatchingPermission(["b2b.*"], ["b2b.write"], false), true);
    assert.equal(hasMatchingPermission(["*"], ["b2b.write"], false), true);
    assert.equal(hasMatchingPermission(["b2b.read"], ["b2b.write"], false), false);
  });
});
