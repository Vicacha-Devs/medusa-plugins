export class AbstractPaymentProvider {
  constructor(container, options) {
    this.container_ = container
    this.options_ = options
  }
}

export const PaymentSessionStatus = {
  AUTHORIZED: "authorized",
  CAPTURED: "captured",
  CANCELED: "canceled",
  ERROR: "error",
  PENDING: "pending",
  REQUIRES_MORE: "requires_more",
}
