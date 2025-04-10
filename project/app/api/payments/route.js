// app/api/payments/route.js
import { NextResponse } from "next/server";
import { getDbClient } from "@/lib/mongodb_server";
import { getUserId } from "@/lib/auth/sessionManager";
import { ObjectId } from "mongodb";
import bookingNotificationSubject from "@/lib/patterns/observer";
import { BookingStatus } from "@/lib/models/booking";

// Collections
const PaymentCollection = "payments";
const BookingCollection = "bookings";

// Payment Proxy Pattern implementation
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
  }
}

// Create singleton instance of payment proxy
const paymentProxy = new PaymentProxy();

export async function POST(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { bookingId, amount } = await request.json();

    if (!bookingId || !amount) {
      return NextResponse.json(
        { success: false, message: "Missing required fields" },
        { status: 400 }
      );
    }

    const { db } = await getDbClient();

    // Get booking details
    const booking = await db.collection(BookingCollection).findOne({
      _id: new ObjectId(bookingId),
    });

    if (!booking) {
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    // Verify user is the renter
    if (booking.renterId.toString() !== userId) {
      return NextResponse.json(
        {
          success: false,
          message: "Unauthorized to make payment for this booking",
        },
        { status: 403 }
      );
    }

    // Check if payment already exists
    const existingPayment = await db.collection(PaymentCollection).findOne({
      bookingId: new ObjectId(bookingId),
    });

    if (existingPayment) {
      return NextResponse.json(
        {
          success: false,
          message: "Payment already processed for this booking",
        },
        { status: 400 }
      );
    }

    // Process payment through proxy
    const paymentResult = await paymentProxy.processPayment({
      bookingId,
      amount: parseFloat(amount),
      userId,
    });

    // Create payment record
    const payment = {
      bookingId: new ObjectId(bookingId),
      payerId: new ObjectId(userId),
      receiverId: booking.ownerId,
      amount: parseFloat(amount),
      status: "completed",
      transactionId: paymentResult.transactionId,
      createdAt: new Date(),
    };

    const result = await db.collection(PaymentCollection).insertOne(payment);

    // Update booking status to PAID
    await db.collection(BookingCollection).updateOne(
      { _id: new ObjectId(bookingId) },
      {
        $set: {
          status: BookingStatus.PAID,
          updatedAt: new Date(),
        },
      }
    );

    // Notify both parties about the payment
    // Notify renter
    bookingNotificationSubject.notify({
      userId: booking.renterId,
      type: "payment_completed",
      title: "Payment Completed",
      message: `Your payment of $${amount} for booking #${bookingId} has been processed successfully.`,
      relatedId: new ObjectId(bookingId),
      isRead: false,
    });

    // Notify owner
    bookingNotificationSubject.notify({
      userId: booking.ownerId,
      type: "payment_received",
      title: "Payment Received",
      message: `You have received a payment of $${amount} for booking #${bookingId}.`,
      relatedId: new ObjectId(bookingId),
      isRead: false,
    });

    return NextResponse.json({
      success: true,
      data: {
        paymentId: result.insertedId,
        transactionId: paymentResult.transactionId,
        status: "completed",
      },
    });
  } catch (error) {
    console.error("Payment processing error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const userId = await getUserId(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const bookingId = searchParams.get("bookingId");

    const { db } = await getDbClient();

    if (bookingId) {
      // Get specific payment for a booking
      const payment = await db.collection(PaymentCollection).findOne({
        bookingId: new ObjectId(bookingId),
      });

      return NextResponse.json({
        success: true,
        data: payment,
      });
    } else {
      // Get all user payments
      const payments = await db
        .collection(PaymentCollection)
        .find({
          $or: [
            { payerId: new ObjectId(userId) },
            { receiverId: new ObjectId(userId) },
          ],
        })
        .sort({ createdAt: -1 })
        .toArray();

      return NextResponse.json({
        success: true,
        data: payments,
      });
    }
  } catch (error) {
    console.error("Payment retrieval error:", error);
    return NextResponse.json(
      { success: false, message: error.message },
      { status: 500 }
    );
  }
}
