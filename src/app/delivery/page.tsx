"use client";

import React from "react";
import { motion } from "framer-motion";
import { useForm } from "react-hook-form";
import { useCheckoutStore } from "@/store/store";
import { useRouter } from "next/navigation";
import { DeliveryFormInputs } from "@/types/shop";

const DeliveryPage = () => {
  const { setAddress, cartData, setCompletedStep } = useCheckoutStore();
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<DeliveryFormInputs>();

  const onSubmit = (data: DeliveryFormInputs) => {
    setAddress(data);
    setCompletedStep(2);
    router.push("/payment");
  };

  if (!cartData) {
    return <div>Loading...</div>;
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="container mx-auto px-4 py-8"
    >
      <h1 className="text-3xl font-bold mb-8 dark:text-white">
        Delivery Details
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <motion.div
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Shipping Address
          </h2>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="firstName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  First Name
                </label>
                <input
                  {...register("firstName", {
                    required: "First name is required",
                  })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
                />
                {errors.firstName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.firstName.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="lastName"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Last Name
                </label>
                <input
                  {...register("lastName", {
                    required: "Last name is required",
                  })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
                />
                {errors.lastName && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.lastName.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="streetAddress"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Street Address
              </label>
              <input
                {...register("streetAddress", {
                  required: "Street address is required",
                })}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
              />
              {errors.streetAddress && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.streetAddress.message}
                </p>
              )}
            </div>
            <div>
              <label
                htmlFor="apartment"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Apartment, suite, etc. (optional)
              </label>
              <input
                {...register("apartment")}
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="city"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  City
                </label>
                <input
                  {...register("city", { required: "City is required" })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
                />
                {errors.city && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.city.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="state"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  State / Province
                </label>
                <input
                  {...register("state", { required: "State is required" })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
                />
                {errors.state && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.state.message}
                  </p>
                )}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="postalCode"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Postal Code
                </label>
                <input
                  {...register("postalCode", {
                    required: "Postal code is required",
                  })}
                  type="number"
                  step={1}
                  minLength={6}
                  maxLength={6}
                  placeholder="12345"
                  autoComplete="postal-code"
                  required
                  inputMode="numeric"
                  pattern="[0-9][0-9][0-9][0-9][0-9][0-9]"
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
                />
                {errors.postalCode && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.postalCode.message}
                  </p>
                )}
              </div>
              <div>
                <label
                  htmlFor="country"
                  className="block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Country
                </label>
                <input
                  {...register("country", { required: "Country is required" })}
                  className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
                />
                {errors.country && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                    {errors.country.message}
                  </p>
                )}
              </div>
            </div>
            <div>
              <label
                htmlFor="phoneNumber"
                className="block text-sm font-medium text-gray-700 dark:text-gray-300"
              >
                Phone Number
              </label>
              <input
                {...register("phoneNumber", {
                  required: "Phone number is required",
                })}
                type="tel"
                inputMode="tel"
                pattern="[0-9]{3}[0-9]{3}[0-9]{4}"
                placeholder="1234567890"
                maxLength={10}
                minLength={10}
                autoComplete="tel"
                required
                className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black dark:focus:ring-white focus:border-black dark:focus:border-white bg-white dark:bg-gray-700 dark:text-gray-200"
              />
              {errors.phoneNumber && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400">
                  {errors.phoneNumber.message}
                </p>
              )}
            </div>
            <motion.button
              whileHover={{ scale: 1.009 }}
              whileTap={{ scale: 0.95 }}
              type="submit"
              className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-lg font-semibold mt-6 hover:bg-gray-800 dark:hover:bg-gray-200 transition-colors"
            >
              Proceed to Payment
            </motion.button>
          </form>
        </motion.div>
        <motion.div
          initial={{ x: 20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="border border-gray-200 dark:border-gray-700 rounded-lg p-6 dark:bg-gray-800"
        >
          <h2 className="text-xl font-semibold mb-4 dark:text-white">
            Order Summary
          </h2>
          <div className="space-y-4">
            {cartData.products.map((item) => (
              <div key={item.id} className="flex justify-between items-center">
                <div className="text-gray-700 dark:text-gray-300">
                  {item.title} x {item.quantity}
                </div>
                <div className="font-semibold text-gray-900 dark:text-gray-100">
                  ${item.price * item.quantity}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 dark:border-gray-700 mt-6 pt-6">
            <div className="flex justify-between items-center text-lg font-semibold">
              <span className="text-gray-900 dark:text-gray-100">Total:</span>
              <span className="text-gray-900 dark:text-gray-100">
                ${cartData.total}
              </span>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default DeliveryPage;
