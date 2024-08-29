"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutStore } from "@/store/store";
import { useRouter } from "next/navigation";
import {
  FaCreditCard,
  FaPaypal,
  FaMoneyBillWave,
  FaChevronDown,
  FaQrcode,
} from "react-icons/fa";
import Image from "next/image";

const PaymentPage = () => {
  const { setPaymentMethod, cartData, setCompletedStep } = useCheckoutStore();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<
    "upi" | "card" | "cod" | null
  >(null);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [upiOption, setUpiOption] = useState<"qr" | "id" | null>(null);
  const [paymentDetails, setPaymentDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiryDate: "",
    cvv: "",
    upiId: "",
  });

  const handlePayment = () => {
    if (selectedMethod) {
      setPaymentMethod(selectedMethod);
      setCompletedStep(3);
      router.push("/confirmation");
    }
  };

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen);
  };

  const selectPaymentMethod = (method: "upi" | "card" | "cod") => {
    setSelectedMethod(method);
    setIsDropdownOpen(false);
    if (method === "upi") {
      setUpiOption(null);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPaymentDetails({
      ...paymentDetails,
      [e.target.name]: e.target.value,
    });
  };

  if (!cartData) {
    return <div>Loading...</div>;
  }

  const paymentMethods = [
    { id: "card", icon: FaCreditCard, label: "Credit/Debit Card" },
    { id: "upi", icon: FaPaypal, label: "UPI" },
    { id: "cod", icon: FaMoneyBillWave, label: "Cash on Delivery" },
  ];

  const renderPaymentForm = () => {
    switch (selectedMethod) {
      case "card":
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 space-y-4"
          >
            <input
              type="text"
              name="cardNumber"
              placeholder="Card Number"
              value={paymentDetails.cardNumber}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <input
              type="text"
              name="cardName"
              placeholder="Name on Card"
              value={paymentDetails.cardName}
              onChange={handleInputChange}
              className="w-full p-2 border rounded"
            />
            <div className="flex space-x-4">
              <input
                type="text"
                name="expiryDate"
                placeholder="MM/YY"
                value={paymentDetails.expiryDate}
                onChange={handleInputChange}
                className="w-1/2 p-2 border rounded"
              />
              <input
                type="text"
                name="cvv"
                placeholder="CVV"
                value={paymentDetails.cvv}
                onChange={handleInputChange}
                className="w-1/2 p-2 border rounded"
              />
            </div>
          </motion.div>
        );
      case "upi":
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 space-y-4"
          >
            <div className="flex space-x-4">
              <button
                onClick={() => setUpiOption("qr")}
                className={`flex-1 p-2 border rounded ${
                  upiOption === "qr"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                <FaQrcode className="inline mr-2" /> QR Code
              </button>
              <button
                onClick={() => setUpiOption("id")}
                className={`flex-1 p-2 border rounded ${
                  upiOption === "id"
                    ? "bg-black text-white"
                    : "bg-white text-black"
                }`}
              >
                UPI ID
              </button>
            </div>
            {upiOption === "qr" && (
              <div className="flex justify-center items-center space-y-4 flex-col">
                <Image
                  width={400}
                  height={400}
                  src="/qr.png"
                  alt="QR Code Placeholder"
                  className="border rounded mt-4 p-2"
                />
                <p className="text-center mt-4">Scan the QR code above ( something&apos;s intresting 😉 )</p>
              </div>
            )}
            {upiOption === "id" && (
              <input
                type="text"
                name="upiId"
                placeholder="Enter UPI ID"
                value={paymentDetails.upiId}
                onChange={handleInputChange}
                className="w-full p-2 border rounded"
              />
            )}
          </motion.div>
        );
      case "cod":
        return (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="mt-4 p-4 bg-gray-100 rounded"
          >
            <p>Cash on Delivery selected. No additional details required.</p>
          </motion.div>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8">Payment</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Select Payment Method</h2>
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="p-4 border rounded-lg cursor-pointer flex justify-between items-center"
              onClick={toggleDropdown}
            >
              <span className="font-medium">
                {selectedMethod
                  ? paymentMethods.find((m) => m.id === selectedMethod)?.label
                  : "Select a payment method"}
              </span>
              <FaChevronDown
                className={`transition-transform ${
                  isDropdownOpen ? "rotate-180" : ""
                }`}
              />
            </motion.div>
            <AnimatePresence>
              {isDropdownOpen && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="absolute z-10 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg"
                >
                  {paymentMethods.map((method) => (
                    <motion.div
                      key={method.id}
                      whileHover={{ backgroundColor: "#f3f4f6" }}
                      className="p-4 cursor-pointer flex items-center"
                      onClick={() =>
                        selectPaymentMethod(method.id as "upi" | "card" | "cod")
                      }
                    >
                      <method.icon className="text-2xl mr-3" />
                      <span className="font-medium">{method.label}</span>
                    </motion.div>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
          {renderPaymentForm()}
          <motion.button
            whileHover={{ scale: 1.009 }}
            whileTap={{ scale: 0.95 }}
            onClick={handlePayment}
            disabled={!selectedMethod}
            className={`w-full mt-6 py-3 rounded-lg font-semibold ${
              selectedMethod
                ? "bg-black text-white hover:bg-gray-800"
                : "bg-gray-300 text-gray-500 cursor-not-allowed"
            } transition-colors`}
          >
            {selectedMethod
              ? "Proceed to Confirmation"
              : "Select a Payment Method"}
          </motion.button>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="border border-gray-200 rounded-lg p-6"
        >
          <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
          {cartData.products.map((item) => (
            <div
              key={item.id}
              className="flex justify-between items-center mb-2"
            >
              <span>
                {item.title} x {item.quantity}
              </span>
              <span>${(item.price * item.quantity).toFixed(2)}</span>
            </div>
          ))}
          <div className="border-t border-gray-200 my-4"></div>
          <div className="flex justify-between mb-2">
            <span>Subtotal:</span>
            <span>${cartData.total.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2 text-green-600">
            <span>Discount:</span>
            <span>
              -${(cartData.total - cartData.discountedTotal).toFixed(2)}
            </span>
          </div>
          <div className="flex justify-between text-xl font-semibold mt-4">
            <span>Total:</span>
            <span>${cartData.discountedTotal.toFixed(2)}</span>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default PaymentPage;
