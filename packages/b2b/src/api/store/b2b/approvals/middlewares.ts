import { ContainerRegistrationKeys } from "@medusajs/framework/utils"
import {
  authenticate,
  AuthenticatedMedusaRequest,
  MedusaNextFunction,
  MedusaResponse,
  validateAndTransformBody,
  validateAndTransformQuery,
} from "@medusajs/framework";
import { MiddlewareRoute } from "@medusajs/medusa";
import { ensureRole } from "@b2b/api/middlewares/ensure-role";
import { ApprovalType } from "@b2b/types/approval";
import { approvalTransformQueryConfig } from "./query-config";
import { StoreGetApprovals, StoreUpdateApproval } from "./validators";

const ensureApprovalType = async (
  req: AuthenticatedMedusaRequest,
  res: MedusaResponse,
  next: MedusaNextFunction
) => {
  const { id } = req.params;
  const customerId =
    req.auth_context?.actor_id ||
    (req.auth_context?.app_metadata as Record<string, unknown> | undefined)
      ?.customer_id;

  if (typeof customerId !== "string" || customerId.length === 0) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  const query = req.scope.resolve(ContainerRegistrationKeys.QUERY);

  const {
    data: [approval],
  } = await query.graph({
    entity: "approval",
    fields: [
      "id",
      "type",
      "cart.company.id",
      "cart.company.employees.is_admin",
      "cart.company.employees.customer.id",
    ],
    filters: { id },
  });

  if (!approval) {
    res.status(404).json({ message: "Approval not found" });
    return;
  }

  const approvalType = approval.type as unknown as ApprovalType;

  if (approvalType !== ApprovalType.ADMIN) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  const employees = ((approval as any)?.cart?.company?.employees ?? []) as Array<{
    is_admin?: boolean;
    customer?: { id?: string } | null;
  }>;
  const isCompanyAdmin = employees.some(
    (emp) => emp.customer?.id === customerId && emp.is_admin === true
  );
  if (!isCompanyAdmin) {
    res.status(403).json({ message: "Forbidden" });
    return;
  }

  next();
};

export const storeApprovalsMiddlewares: MiddlewareRoute[] = [
  {
    method: "ALL",
    matcher: "/store/b2b/approvals*",
    middlewares: [
      authenticate("customer", ["session", "bearer"]),
      ensureRole("company_admin"),
    ],
  },
  {
    method: ["GET"],
    matcher: "/store/b2b/approvals",
    middlewares: [
      validateAndTransformQuery(
        StoreGetApprovals,
        approvalTransformQueryConfig
      ),
    ],
  },
  {
    method: ["POST"],
    matcher: "/store/b2b/approvals/:id",
    middlewares: [
      ensureApprovalType,
      validateAndTransformBody(StoreUpdateApproval),
    ],
  },
];
