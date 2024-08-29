"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

interface CartData {
  products: Array<{
    id: number;
    title: string;
    price: number;
    quantity: number;
  }>;
  total: number;
  discountedTotal: number;
}

interface PaymentFormProps {
  cartData: CartData;
  onPaymentSuccess: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({ onPaymentSuccess }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState<string | null>(null);
  const [processing, setProcessing] = useState<boolean>(false);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setProcessing(true);

    if (!stripe || !elements) {
      return;
    }

    const cardElement = elements.getElement(CardElement);

    if (cardElement) {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
      });

      if (error) {
        console.log("Error", error);
        setError(error.message ?? "An unknown error occurred");
        setProcessing(false);
      } else {
        console.log("PaymentMethod", paymentMethod);
        onPaymentSuccess();
      }
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CardElement className="w-full mt-4 p-4 border text-black border-gray-200 rounded-lg dark:border-gray-700 dark:bg-zinc-200 " />
      {error && (
        <div className="text-red-500 mt-2 dark:text-red-400">{error}</div>
      )}
      <button
        type="submit"
        disabled={!stripe || processing}
        className="w-full mt-4 bg-black text-white py-2 rounded-lg dark:bg-gray-700 dark:text-gray-300"
      >
        {processing ? "Processing..." : "Pay"}
      </button>
    </form>
  );
};

type PaymentMethod = "Card" | "UPI" | "Cash on Delivery" | null;

const PaymentPage: React.FC = () => {
  const { setPaymentMethod, cartData, setCompletedStep, setPaymentCompleted } =
    useCheckoutStore();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);
  const [upiId, setUpiId] = useState<string>("");

  const handlePaymentSuccess = () => {
    if (selectedMethod) {
      setPaymentMethod(selectedMethod.toLowerCase() as "upi" | "card" | "cod");
      setCompletedStep(3);
      setPaymentCompleted(true); // Set payment as completed
      router.push("/confirmation");
    }
  };

  const handleUpiPayment = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("UPI payment with ID:", upiId);
    handlePaymentSuccess();
  };

  const handleCodPayment = () => {
    handlePaymentSuccess();
  };

  if (!cartData) {
    return <div>Loading cart data...</div>;
  }

  return (
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
                  {(["Card", "UPI", "Cash on Delivery"] as const).map(
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

          {selectedMethod === "Card" && (
            <Elements stripe={stripePromise}>
              <PaymentForm
                cartData={cartData}
                onPaymentSuccess={handlePaymentSuccess}
              />
            </Elements>
          )}

          {selectedMethod === "UPI" && (
            <form onSubmit={handleUpiPayment}>
              <input
                type="text"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="Enter UPI ID"
                className="w-full p-2 border rounded mb-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              <button
                type="submit"
                className="w-full bg-black text-white py-2 rounded-lg dark:bg-gray-700 dark:text-gray-300"
              >
                Pay with UPI
              </button>
            </form>
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
  );
};

export default PaymentPage;
