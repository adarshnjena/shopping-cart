"use client";

import React, { useEffect } from "react";
import { motion } from "framer-motion";
import { useCheckoutStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaTimesCircle, FaHourglassHalf } from "react-icons/fa";

const OrderConfirmationPage = () => {
  const {
    cartData,
    address,
    paymentMethod,
    orderStatus,
    setOrderStatus,
    clearCart,
    paymentCompleted,
  } = useCheckoutStore();
  const router = useRouter();

  useEffect(() => {
    // Simulate order processing
    const statuses = ["success", "failure", "pending"] as const;
    const randomStatus = statuses[Math.floor(Math.random() * statuses.length)];

    const timer = setTimeout(() => {
      setOrderStatus(randomStatus);
    }, 2000);

    return () => clearTimeout(timer);
  }, [setOrderStatus]);

  const handleContinueShopping = () => {
    clearCart();
    router.push("/");
  };

  if (!cartData || !address || !paymentMethod) {
    return <div>Loading...</div>;
  }

  if (!paymentCompleted) {
    router.push("/payment");
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8 dark:text-white"
    >
      <h1 className="text-3xl font-bold mb-8">Order Confirmation</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 rounded-lg p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4">Order Status</h2>
          {!orderStatus ? (
            <div className="flex items-center justify-center h-32">
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                className="w-12 h-12 border-t-4 border-blue-500 border-solid rounded-full"
              ></motion.div>
            </div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 10 }}
              className="flex flex-col items-center"
            >
              {orderStatus === "success" && (
                <FaCheckCircle className="text-6xl text-green-500 mb-4" />
              )}
              {orderStatus === "failure" && (
                <FaTimesCircle className="text-6xl text-red-500 mb-4" />
              )}
              {orderStatus === "pending" && (
                <FaHourglassHalf className="text-6xl text-yellow-500 mb-4" />
              )}
              <p className="text-2xl font-semibold">
                {orderStatus === "success" && "Order Confirmed!"}
                {orderStatus === "failure" && "Order Failed"}
                {orderStatus === "pending" && "Order Pending"}
              </p>
            </motion.div>
          )}
          <motion.button
            whileHover={{ scale: 1.009 }}
            whileTap={{ scale: 0.95 }}
            onClick={handleContinueShopping}
            className="w-full mt-6 bg-black text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors dark:bg-gray-900 dark:hover:bg-gray-700"
          >
            Continue Shopping
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border border-gray-200 rounded-lg p-6 dark:border-gray-700 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4">Order Details</h2>
          <div className="space-y-4">
            <div>
              <h3 className="font-medium">Shipping Address</h3>
              <p>
                {address.firstName} {address.lastName}
              </p>
              <p>{address.streetAddress}</p>
              <p>
                {address.city}, {address.state} {address.postalCode}
              </p>
              <p>{address.country}</p>
            </div>
            <div>
              <h3 className="font-medium">Payment Method</h3>
              <p>
                {paymentMethod === "card"
                  ? "Credit/Debit Card"
                  : paymentMethod === "upi"
                  ? "UPI"
                  : "Cash on Delivery"}
              </p>
            </div>
            <div>
              <h3 className="font-medium">Order Summary</h3>
              {cartData.products.map((item) => (
                <div
                  key={item.id}
                  className="flex justify-between items-center"
                >
                  <span>
                    {item.title} x {item.quantity}
                  </span>
                  <span>${(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-gray-200 my-2 dark:border-gray-600"></div>
              <div className="flex justify-between font-semibold">
                <span>Total:</span>
                <span>${cartData.discountedTotal.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrderConfirmationPage;
