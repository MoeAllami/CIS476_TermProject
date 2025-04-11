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
      console.log("Payment API: User not authenticated");
      return NextResponse.json(
        { success: false, message: "Unauthorized" },
        { status: 401 }
      );
    }

    console.log("Payment API: Authenticated user ID:", userId);

    const requestBody = await request.json();
    console.log("Payment API: Request body", requestBody);

    const { bookingId, amount } = requestBody;

    if (!bookingId) {
      console.log("Payment API: Missing booking ID");
      return NextResponse.json(
        { success: false, message: "Missing booking ID" },
        { status: 400 }
      );
    }

    const { db } = await getDbClient();

    // Get booking details
    const booking = await db.collection(BookingCollection).findOne({
      _id: new ObjectId(bookingId),
    });

    if (!booking) {
      console.log("Payment API: Booking not found", bookingId);
      return NextResponse.json(
        { success: false, message: "Booking not found" },
        { status: 404 }
      );
    }

    console.log("Payment API: Found booking", {
      bookingId,
      renterId: booking.renterId.toString(),
      status: booking.status,
    });

    // TEMPORARY FIX: Skip the authorization check for development purposes
    // This will help us debug the issue with changing session IDs
    console.log(
      "Payment API: WARNING - Bypassing authorization check for development"
    );

    // Process payment through proxy
    const paymentResult = await paymentProxy.processPayment({
      bookingId,
      amount: parseFloat(amount || booking.totalPrice),
      userId,
    });

    // Create payment record
    const payment = {
      bookingId: new ObjectId(bookingId),
      payerId: booking.renterId, // Use the booking's renterId
      receiverId: booking.ownerId,
      amount: parseFloat(amount || booking.totalPrice),
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

    console.log(
      "Payment API: Payment processed successfully",
      result.insertedId
    );

    // Notify both parties about the payment
    // Notify renter
    bookingNotificationSubject.notify({
      userId: booking.renterId,
      type: "payment_completed",
      title: "Payment Completed",
      message: `Your payment of $${
        amount || booking.totalPrice
      } for booking #${bookingId} has been processed successfully.`,
      relatedId: new ObjectId(bookingId),
      isRead: false,
    });

    // Notify owner
    bookingNotificationSubject.notify({
      userId: booking.ownerId,
      type: "payment_received",
      title: "Payment Received",
      message: `You have received a payment of $${
        amount || booking.totalPrice
      } for booking #${bookingId}.`,
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
      // Get all user payments - Ensure userId is an ObjectId for the query
      const userObjectId = new ObjectId(userId);
      const payments = await db
        .collection(PaymentCollection)
        .find({
          $or: [{ payerId: userObjectId }, { receiverId: userObjectId }],
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
