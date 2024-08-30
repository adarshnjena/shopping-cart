"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";
import Script from "next/script";

declare global {
  interface Window {
    Razorpay: any;
  }
}

type PaymentMethod = "Card/UPI" | "Cash on Delivery" | null;

const PaymentPage: React.FC = () => {
  const { setPaymentMethod, cartData, setCompletedStep, setPaymentCompleted } =
    useCheckoutStore();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [isRazorpayLoaded, setIsRazorpayLoaded] = useState(false);

  useEffect(() => {
    if (isRazorpayLoaded && selectedMethod === "Card/UPI") {
      handleRazorpayPayment();
    }
  }, [isRazorpayLoaded, selectedMethod]);

  const handlePaymentSuccess = (paymentMethod: "card" | "upi" | "cod") => {
    setPaymentMethod(paymentMethod);
    setCompletedStep(3);
    setPaymentCompleted(true);
    router.push("/confirmation");
  };

  const handleRazorpayPayment = async () => {
    try {
      const response = await fetch("/api/create-razorpay-order", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ amount: cartData?.discountedTotal }),
      });

      const order = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "Your Company Name",
        description: "Payment for your order",
        order_id: order.id,
        handler: function (response: any) {
          // Determine if it's a card or UPI payment based on the response
          const paymentMethod = response.razorpay_payment_id.startsWith("pay_")
            ? "card"
            : "upi";
          handlePaymentSuccess(paymentMethod);
        },
        prefill: {
          name: "Customer Name",
          email: "customer@example.com",
          contact: "9999999999",
        },
        theme: {
          color: "black",
        },
      };

      const paymentObject = new window.Razorpay(options);
      paymentObject.open();
    } catch (error) {
      console.error("Error creating Razorpay order:", error);
    }
  };

  const handleCodPayment = () => {
    handlePaymentSuccess("cod");
  };

  if (!cartData) {
    return <div>Loading cart data...</div>;
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        onLoad={() => setIsRazorpayLoaded(true)}
      />
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="container mx-auto px-4 py-8 dark:bg-gray-900"
      >
        <h1 className="text-3xl font-bold mb-8 dark:text-white">Payment</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="border border-gray-200 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Select Payment Method
            </h2>
            <div className="relative mb-4">
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-4 border rounded-lg cursor-pointer flex justify-between items-center dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              >
                <span className="font-medium">
                  {selectedMethod || "Select a payment method"}
                </span>
                <FaChevronDown
                  className={`transition-transform ${
                    isDropdownOpen ? "rotate-180" : ""
                  } dark:text-gray-300`}
                />
              </motion.div>
              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg dark:bg-gray-800 dark:border-gray-600"
                  >
                    {(["Card/UPI", "Cash on Delivery"] as const).map(
                      (method) => (
                        <motion.div
                          key={method}
                          className="p-4 cursor-pointer dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
                          onClick={() => {
                            setSelectedMethod(method);
                            setIsDropdownOpen(false);
                          }}
                        >
                          {method}
                        </motion.div>
                      )
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {selectedMethod === "Card/UPI" && (
              <button
                onClick={handleRazorpayPayment}
                className="w-full bg-black text-white py-2 rounded-lg dark:bg-gray-700 dark:text-gray-300"
              >
                Pay with Razorpay
              </button>
            )}

            {selectedMethod === "Cash on Delivery" && (
              <button
                onClick={handleCodPayment}
                className="w-full bg-black text-white py-2 rounded-lg dark:bg-gray-700 dark:text-gray-300"
              >
                Place COD Order
              </button>
            )}
          </motion.div>

          <motion.div
            initial={{ x: 20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="border border-gray-200 rounded-lg p-6 dark:bg-gray-800 dark:border-gray-700"
          >
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Order Summary
            </h2>
            {cartData.products.map((item) => (
              <div
                key={item.id}
                className="flex justify-between items-center mb-2 dark:text-gray-300"
              >
                <span>
                  {item.title} x {item.quantity}
                </span>
                <span>${(item.price * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-gray-200 my-4 dark:border-gray-700"></div>
            <div className="flex justify-between mb-2 dark:text-gray-300">
              <span>Subtotal:</span>
              <span>${cartData.total.toFixed(2)}</span>
            </div>
            <div className="flex justify-between mb-2 text-green-600 dark:text-green-400">
              <span>Discount:</span>
              <span>
                -${(cartData.total - cartData.discountedTotal).toFixed(2)}
              </span>
            </div>
            <div className="flex justify-between text-xl font-semibold mt-4 dark:text-white">
              <span>Total:</span>
              <span>${cartData.discountedTotal.toFixed(2)}</span>
            </div>
          </motion.div>
        </div>
      </motion.div>
    </>
  );
};

export default PaymentPage;
