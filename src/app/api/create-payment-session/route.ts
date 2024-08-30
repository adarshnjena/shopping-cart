import { NextResponse } from "next/server";
import axios from "axios";

const CASHFREE_API_URL = "https://sandbox.cashfree.com/pg";
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_API_VERSION = "2022-09-01";

export async function POST(req: Request) {
  try {
    const { paymentSessionId, paymentMethod, paymentDetails } =
      await req.json();

    const sessionData = {
      payment_session_id: paymentSessionId,
      payment_method: {
        [paymentMethod]: paymentDetails[paymentMethod],
      },
    };

    const response = await axios.post(
      `${CASHFREE_API_URL}/orders/sessions`,
      sessionData,
      {
        headers: {
          "x-client-id": CASHFREE_APP_ID,
          "x-client-secret": CASHFREE_SECRET_KEY,
          "x-api-version": CASHFREE_API_VERSION,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
      }
    );

    const responseData = response.data;

    console.log("Cashfree payment session created:", responseData);

    return NextResponse.json({ success: true, session: responseData });
  } catch (error) {
    console.error("Error creating payment session:", error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { success: false, error: error.response.data },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create payment session" },
      { status: 500 }
    );
  }
}
