import { NextResponse } from "next/server";
import axios from "axios";

const CASHFREE_API_URL = "https://sandbox.cashfree.com/pg";
const CASHFREE_APP_ID = process.env.CASHFREE_APP_ID!;
const CASHFREE_SECRET_KEY = process.env.CASHFREE_SECRET_KEY!;
const CASHFREE_API_VERSION = "2023-08-01";

export async function POST(req: Request) {
  try {
    const { amount, customerDetails } = await req.json();
    const orderId = `order_${Date.now()}`;

    const orderData = {
      order_amount: amount,
      order_currency: "INR",
      order_id: orderId,
      customer_details: {
        customer_id: customerDetails.customerId || `cust_${Date.now()}`,
        customer_phone: customerDetails.customerPhone,
      },
      order_meta: {
        return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment-result?order_id={order_id}`,
      },
    };

    const response = await axios.post(`${CASHFREE_API_URL}/orders`, orderData, {
      headers: {
        "x-client-id": CASHFREE_APP_ID,
        "x-client-secret": CASHFREE_SECRET_KEY,
        "x-api-version": CASHFREE_API_VERSION,
        "Content-Type": "application/json",
        Accept: "application/json",
      },
    });

    console.log("Cashfree order created:", response.data);

    return NextResponse.json({ success: true, order: response.data });
  } catch (error) {
    console.error("Error creating Cashfree order:", error);
    if (axios.isAxiosError(error) && error.response) {
      return NextResponse.json(
        { success: false, error: error.response.data },
        { status: error.response.status }
      );
    }
    return NextResponse.json(
      { success: false, error: "Failed to create Cashfree order" },
      { status: 500 }
    );
  }
}
