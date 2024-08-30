import { NextResponse } from "next/server";
import axios from "axios";

const CASHFREE_API_URL = "https://sandbox.cashfree.com/pg";
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_API_VERSION = "2022-09-01";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("order_id");

  if (!orderId) {
    return NextResponse.json(
      { success: false, error: "No order ID provided" },
      { status: 400 }
    );
  }

  try {
    const response = await axios.get(
      `${CASHFREE_API_URL}/orders/${orderId}/payments`,
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": CASHFREE_API_VERSION,
          Accept: "application/json",
        },
      }
    );

    const paymentDetails = response.data;
    let status = "PENDING";

    if (paymentDetails.length > 0) {
      const latestPayment = paymentDetails[0];
      status = latestPayment.payment_status;
    }

    console.log("Cashfree payment status:   ", status);

    return NextResponse.json({ success: true, status });
  } catch (error) {
    console.error("Error fetching payment status:", error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { success: false, error: error.response.data },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to fetch payment status" },
      { status: 500 }
    );
  }
}
