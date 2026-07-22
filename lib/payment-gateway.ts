export type PaymentRequest = {
  registrationId: string;
  amountCents: number;
  currency: "USD";
  idempotencyKey: string;
};

export type PaymentResult =
  | { status: "authorized"; paymentId: string; orderReference: string | null }
  | { status: "failed"; safeMessage: string }
  | { status: "pending"; paymentId: string | null };

export interface OnlinePaymentGateway {
  createPayment(request: PaymentRequest): Promise<PaymentResult>;
  retrievePayment(paymentId: string): Promise<PaymentResult>;
  verifyNotification(rawBody: string, signature: string): Promise<boolean>;
}

export class PaymentGatewayUnavailableError extends Error {
  constructor() {
    super("Online payment is not configured.");
    this.name = "PaymentGatewayUnavailableError";
  }
}

export const unavailablePaymentGateway: OnlinePaymentGateway = {
  async createPayment() {
    throw new PaymentGatewayUnavailableError();
  },
  async retrievePayment() {
    throw new PaymentGatewayUnavailableError();
  },
  async verifyNotification() {
    return false;
  },
};
