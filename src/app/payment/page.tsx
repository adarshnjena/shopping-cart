"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useCheckoutStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { FaChevronDown } from "react-icons/fa";
import Image from "next/image";

type PaymentMethod = "card" | "upi" | "cod" | "banktransfer" | null;
type UPIChannel = "link" | "collect" | "qrcode";

interface FormErrors {
  [key: string]: string;
}

interface UPILinkData {
  bhim: string;
  default: string;
  gpay: string;
  paytm: string;
  phonepe: string;
  web: string;
}

const PaymentPage: React.FC = () => {
  const { setPaymentMethod, cartData, setCompletedStep, setPaymentCompleted } =
    useCheckoutStore();
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = useState<PaymentMethod>(null);
  const [upiChannel, setUPIChannel] = useState<UPIChannel>("link");
  const [isDropdownOpen, setIsDropdownOpen] = useState<boolean>(false);

  // Card details
  const [cardNumber, setCardNumber] = useState("");
  const [cardExpiry, setCardExpiry] = useState("");
  const [cardCVV, setCardCVV] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");

  // UPI details
  const [upiId, setUpiId] = useState("");

  // Customer details
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  // UPI response data
  const [qrCodeData, setQRCodeData] = useState<string | null>(null);
  const [upiLinkData, setUPILinkData] = useState<UPILinkData | null>(null);
  const [upiCollectUrl, setUPICollectUrl] = useState<string | null>(null);
  const [upiCollectStatus, setUPICollectStatus] = useState<string | null>(null);

  // Error handling
  const [errors, setErrors] = useState<FormErrors>({});

  const validateForm = () => {
    const newErrors: FormErrors = {};

    if (selectedMethod === "card") {
      if (!cardNumber) newErrors.cardNumber = "Card number is required";
      if (!cardExpiry) newErrors.cardExpiry = "Card expiry is required";
      if (!cardCVV) newErrors.cardCVV = "CVV is required";
      if (!cardHolderName)
        newErrors.cardHolderName = "Card holder name is required";
    } else if (selectedMethod === "upi" && upiChannel === "collect") {
      if (!upiId) newErrors.upiId = "UPI ID is required";
    }

    if (!customerEmail) newErrors.customerEmail = "Email is required";
    if (!customerPhone) newErrors.customerPhone = "Phone number is required";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const getPaymentDetails = () => {
    switch (selectedMethod) {
      case "card":
        return {
          card: {
            channel: "link",
            card_number: cardNumber,
            card_holder_name: cardHolderName,
            card_expiry_mm: cardExpiry.split("/")[0],
            card_expiry_yy: cardExpiry.split("/")[1],
            card_cvv: cardCVV,
          },
        };
      case "upi":
        return {
          upi: {
            channel: upiChannel,
            ...(upiChannel === "collect" && { upi_id: upiId }),
          },
        };
      case "banktransfer":
        return { banktransfer: { channel: "link" } };
      default:
        return {};
    }
  };

  const handlePayment = async () => {
    if (!validateForm()) return;

    try {
      // Step 1: Create order
      const orderResponse = await fetch("/api/create-cashfree-order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: cartData?.discountedTotal,
          customerDetails: {
            customerId: `cust_${Date.now()}`,
            customerEmail,
            customerPhone,
          },
        }),
      });
      const orderData = await orderResponse.json();
      if (!orderData.success)
        throw new Error(orderData.error || "Failed to create order");

      // Step 2: Create payment session
      const sessionResponse = await fetch("/api/create-payment-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentSessionId: orderData.order.payment_session_id,
          paymentMethod: selectedMethod,
          paymentDetails: getPaymentDetails(),
        }),
      });
      const sessionData = await sessionResponse.json();
      if (!sessionData.success)
        throw new Error(
          sessionData.error || "Failed to create payment session"
        );

      // Handle the session response
      handlePaymentSessionResponse(sessionData.session);
    } catch (error) {
      console.error("Payment error:", error);
      setErrors({ payment: "An error occurred during payment processing" });
    }
  };

  const handlePaymentSessionResponse = (sessionResponse: any) => {
    if (sessionResponse.payment_method === "upi") {
      switch (sessionResponse.channel) {
        case "qrcode":
          if (sessionResponse.data?.payload?.qrcode) {
            setQRCodeData(sessionResponse.data.payload.qrcode);
          }
          break;
        case "link":
          if (sessionResponse.data?.payload) {
            setUPILinkData(sessionResponse.data.payload);
          }
          break;
        case "collect":
          if (sessionResponse.data?.url) {
            setUPICollectUrl(sessionResponse.data.url);
            window.location.href = sessionResponse.data.url;
          } else {
            setUPICollectStatus("Waiting for payment...");
            // Here you might want to implement a polling mechanism to check the payment status
          }
          break;
      }
    } else if (sessionResponse.payment_method === "card") {
      // Handle card payment (possibly redirect to a Cashfree hosted page)
    }
    // Handle other payment methods as needed
  };

  const handleCodPayment = () => {
    setPaymentMethod("cod");
    setCompletedStep(3);
    setPaymentCompleted(true);
    router.push("/confirmation");
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
                  {(["card", "upi", "cod", "banktransfer"] as const).map(
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

          {selectedMethod === "upi" && (
            <div className="space-y-4">
              <select
                value={upiChannel}
                onChange={(e) => setUPIChannel(e.target.value as UPIChannel)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              >
                <option value="link">UPI Link</option>
                <option value="collect">UPI Collect</option>
                <option value="qrcode">UPI QR Code</option>
              </select>
              {upiChannel === "collect" && (
                <input
                  type="text"
                  placeholder="UPI ID"
                  value={upiId}
                  onChange={(e) => setUpiId(e.target.value)}
                  className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                />
              )}
              {errors.upiId && <p className="text-red-500">{errors.upiId}</p>}
            </div>
          )}

          {selectedMethod === "card" && (
            <div className="space-y-4">
              <input
                type="text"
                placeholder="Card Number"
                value={cardNumber}
                onChange={(e) => setCardNumber(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              {errors.cardNumber && (
                <p className="text-red-500">{errors.cardNumber}</p>
              )}
              <input
                type="text"
                placeholder="MM/YY"
                value={cardExpiry}
                onChange={(e) => setCardExpiry(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              {errors.cardExpiry && (
                <p className="text-red-500">{errors.cardExpiry}</p>
              )}
              <input
                type="text"
                placeholder="CVV"
                value={cardCVV}
                onChange={(e) => setCardCVV(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              {errors.cardCVV && (
                <p className="text-red-500">{errors.cardCVV}</p>
              )}
              <input
                type="text"
                placeholder="Card Holder Name"
                value={cardHolderName}
                onChange={(e) => setCardHolderName(e.target.value)}
                className="w-full p-2 border rounded dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              {errors.cardHolderName && (
                <p className="text-red-500">{errors.cardHolderName}</p>
              )}
            </div>
          )}

          {(selectedMethod === "card" ||
            selectedMethod === "upi" ||
            selectedMethod === "banktransfer") && (
            <>
              <input
                type="email"
                placeholder="Email"
                value={customerEmail}
                onChange={(e) => setCustomerEmail(e.target.value)}
                className="w-full p-2 border rounded mt-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              {errors.customerEmail && (
                <p className="text-red-500">{errors.customerEmail}</p>
              )}
              <input
                type="tel"
                placeholder="Phone"
                value={customerPhone}
                onChange={(e) => setCustomerPhone(e.target.value)}
                className="w-full p-2 border rounded mt-4 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
              />
              {errors.customerPhone && (
                <p className="text-red-500">{errors.customerPhone}</p>
              )}
              <button
                onClick={handlePayment}
                className="w-full bg-black text-white py-2 rounded-lg mt-4 dark:bg-gray-700 dark:text-gray-300"
              >
                Pay with Cashfree
              </button>
            </>
          )}

          {selectedMethod === "cod" && (
            <button
              onClick={handleCodPayment}
              className="w-full bg-black text-white py-2 rounded-lg mt-4 dark:bg-gray-700 dark:text-gray-300"
            >
              Place COD Order
            </button>
          )}

          {errors.payment && (
            <p className="text-red-500 mt-4">{errors.payment}</p>
          )}

          {qrCodeData && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Scan QR Code to Pay
              </h3>
              <Image
                src={qrCodeData}
                alt="UPI QR Code"
                width={200}
                height={200}
                className="mx-auto"
              />
              <p className="text-sm text-center mt-2">
                Scan this QR code with your UPI app to complete the payment
              </p>
            </div>
          )}

          {upiLinkData && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Choose your UPI app
              </h3>
              <div className="grid grid-cols-2 gap-4">
                {Object.entries(upiLinkData).map(([key, value]) => (
                  <a
                    key={key}
                    href={value}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="bg-blue-500 text-white py-2 px-4 rounded text-center hover:bg-blue-600 transition-colors"
                  >
                    {key.toUpperCase()}
                  </a>
                ))}
              </div>
            </div>
          )}

          {upiCollectUrl && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">
                Complete UPI Payment
              </h3>
              <p className="text-sm mb-2">
                Click the button below to proceed with the UPI payment:
              </p>
              <a
                href={upiCollectUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full bg-blue-500 text-white py-2 rounded text-center hover:bg-blue-600 transition-colors"
              >
                Proceed to UPI Payment
              </a>
            </div>
          )}

          {upiCollectStatus && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold mb-2">UPI Payment Status</h3>
              <p className="text-sm">{upiCollectStatus}</p>
              {/* You might want to add a refresh button or implement auto-refresh here */}
            </div>
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
