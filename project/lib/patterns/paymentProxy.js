// lib/patterns/paymentProxy.js
class RealPaymentService {
  async processPayment(paymentData) {
    // In a real system, this would connect to a payment gateway
    // For this demo, we'll just simulate a successful payment
    console.log("Processing real payment:", paymentData);

    // Simulate processing time
    await new Promise((resolve) => setTimeout(resolve, 500));

    return {
      success: true,
      transactionId: `tx_${Date.now()}`,
      amount: paymentData.amount,
      timestamp: new Date().toISOString(),
    };
  }
}

class PaymentProxy {
  constructor() {
    this.realPaymentService = new RealPaymentService();
  }

  async processPayment(paymentData) {
    // Validate payment data before processing
    this.validatePaymentData(paymentData);

    // Log payment attempt
    console.log(
      `Payment attempt: ${paymentData.amount} for booking ${paymentData.bookingId}`
    );

    try {
      // Forward to real payment service
      const result = await this.realPaymentService.processPayment(paymentData);

      // Log successful payment
      console.log(`Payment successful: ${result.transactionId}`);

      return result;
    } catch (error) {
      // Log payment failure
      console.error(`Payment failed: ${error.message}`);
      throw new Error(`Payment processing failed: ${error.message}`);
    }
  }

  validatePaymentData(paymentData) {
    if (!paymentData.bookingId) {
      throw new Error("Booking ID is required");
    }

    if (!paymentData.amount || paymentData.amount <= 0) {
      throw new Error("Valid payment amount is required");
    }

    if (!paymentData.payerId) {
      throw new Error("Payer ID is required");
    }

    if (!paymentData.receiverId) {
      throw new Error("Receiver ID is required");
    }
  }
}

// Export singleton instance
const paymentProxyInstance = new PaymentProxy();
export default paymentProxyInstance;
