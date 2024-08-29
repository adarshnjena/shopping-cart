"use client";

import React from "react";
import Image from "next/image";
import { useCheckoutStore } from "@/store/store";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect } from "react";

const CartPage = () => {
  const {
    cartData,
    setCartData,
    updateProductQuantity,
    removeProduct,
    setCompletedStep,
  } = useCheckoutStore();

  useEffect(() => {
    const fetchCartData = async () => {
      try {
        const response = await fetch("/api/cart");
        if (!response.ok) {
          throw new Error("Failed to fetch cart data");
        }
        const data = await response.json();
        setCartData(data);
      } catch (error) {
        console.error("Error fetching cart data:", error);
      }
    };

    if (!cartData) {
      fetchCartData();
    }
  }, [cartData, setCartData]);

  if (!cartData || cartData.products.length === 0) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="flex flex-col items-center justify-center h-[70vh] dark:bg-gray-900"
      >
        <h2 className="text-2xl font-bold mb-4 dark:text-white">
          Your cart is empty
        </h2>
        <Link
          href="/"
          className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-600 underline"
        >
          Continue Shopping
        </Link>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8 dark:bg-gray-900"
    >
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        Your Shopping Cart
      </h1>
      <div className="border border-gray-200 rounded-lg overflow-hidden dark:border-gray-700">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Product
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Quantity
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Price
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider dark:text-gray-400">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200 dark:bg-gray-900 dark:divide-gray-700">
            <AnimatePresence>
              {cartData.products.map((product) => (
                <motion.tr
                  key={product.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.3 }}
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-10 w-10">
                        <Image
                          src={product.thumbnail}
                          alt={product.title}
                          width={40}
                          height={40}
                          className="rounded-full"
                        />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {product.title.length > 20
                            ? product.title.slice(0, 20) + " ..."
                            : product.title}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          description
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          updateProductQuantity(
                            product.id,
                            Math.max(1, product.quantity - 1)
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded-l-md dark:border-gray-600 dark:bg-gray-800"
                      >
                        -
                      </motion.button>
                      <span className="px-4 py-1 border-t border-b border-gray-300 dark:border-gray-600 dark:bg-gray-800">
                        {product.quantity}
                      </span>
                      <motion.button
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() =>
                          updateProductQuantity(
                            product.id,
                            product.quantity + 1
                          )
                        }
                        className="px-2 py-1 border border-gray-300 rounded-r-md dark:border-gray-600 dark:bg-gray-800"
                      >
                        +
                      </motion.button>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    ${(product.price * product.quantity).toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => removeProduct(product.id)}
                      className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-600"
                    >
                      Remove
                    </motion.button>
                  </td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="mt-8 border border-gray-200 rounded-lg p-6 dark:border-gray-700 dark:bg-gray-800"
      >
        <h2 className="text-xl font-semibold mb-4 dark:text-white">
          Order Summary
        </h2>
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
        <div className="border-t border-gray-200 my-4 dark:border-gray-600"></div>
        <div className="flex justify-between text-xl font-semibold dark:text-gray-100">
          <span>Total:</span>
          <span>${cartData.discountedTotal.toFixed(2)}</span>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
          Shipping will be calculated in the next step
        </p>
        <Link href="/delivery">
          <motion.button
            whileHover={{ scale: 1.009 }}
            whileTap={{ scale: 0.95 }}
            className="w-full bg-black text-white py-3 rounded-lg font-semibold mt-6 hover:bg-gray-800 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
          >
            Checkout
          </motion.button>
        </Link>
      </motion.div>
    </motion.div>
  );
};

export default CartPage;
