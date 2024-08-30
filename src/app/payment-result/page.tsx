"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaSpinner } from "react-icons/fa";
import { useCheckoutStore } from "@/store/store";

const PaymentResult = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { setPaymentCompleted, setCompletedStep } = useCheckoutStore();

  useEffect(() => {
    const orderId = searchParams.get("order_id");
    if (orderId) {
      checkPaymentStatus(orderId);
    } else {
      setIsLoading(false);
      setPaymentStatus("ERROR");
    }
  }, [searchParams]);

  const checkPaymentStatus = async (orderId: string) => {
    try {
      const response = await fetch(`/api/payment-result?order_id=${orderId}`);
      const data = await response.json();

      console.log("Payment status data:", data);

      if (data.success) {
        setPaymentStatus(data.status);
        setPaymentCompleted(true);
        setCompletedStep(3);
        setTimeout(() => {
          router.push("/confirmation");
        }, 3000);
      }
    } catch (error) {
      console.error("Error checking payment status:", error);
      setPaymentStatus("ERROR");
    } finally {
      setIsLoading(false);
    }
  };

  const renderStatusContent = () => {
    switch (paymentStatus) {
      case "PAID":
        return (
          <div className="text-center text-green-600">
            <FaCheckCircle className="text-6xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p>You will be redirected to the confirmation page shortly.</p>
          </div>
        );
      case "FAILED":
        return (
          <div className="text-center text-red-600">
            <FaTimesCircle className="text-6xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-2">Payment Failed</h2>
            <p>
              Unfortunately, your payment was not successful. Please try again.
            </p>
            <button
              onClick={() => router.push("/payment")}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Return to Payment Page
            </button>
          </div>
        );
      case "PENDING":
        return (
          <div className="text-center text-yellow-600">
            <FaSpinner className="text-6xl mb-4 mx-auto animate-spin" />
            <h2 className="text-2xl font-bold mb-2">Payment Pending</h2>
            <p>Your payment is still being processed. Please wait...</p>
          </div>
        );
      case "ERROR":
        return (
          <div className="text-center text-red-600">
            <FaTimesCircle className="text-6xl mb-4 mx-auto" />
            <h2 className="text-2xl font-bold mb-2">Error</h2>
            <p>An error occurred while checking the payment status.</p>
            <button
              onClick={() => router.push("/payment")}
              className="mt-4 bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition-colors"
            >
              Return to Payment Page
            </button>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8 text-center">Payment Result</h1>
      {isLoading ? (
        <div className="text-center">
          <FaSpinner className="text-6xl mb-4 mx-auto animate-spin text-blue-500" />
          <p>Checking payment status...</p>
        </div>
      ) : (
        renderStatusContent()
      )}
    </div>
  );
};

const PaymentResultPage = () => {
  return (
    <Suspense>
      <PaymentResult />
    </Suspense>
  );
};

export default PaymentResultPage;
