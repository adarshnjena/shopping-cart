// File: store/checkoutStore.ts

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Address, CartData } from "@/types/shop";

interface CheckoutState {
  cartData: CartData | null;
  address: Address | null;
  paymentMethod: "card" | "upi" | "cod" | "banktransfer" | null;
  orderStatus: "success" | "failure" | "pending" | null;
  setCartData: (data: CartData) => void;
  updateProductQuantity: (productId: number, quantity: number) => void;
  removeProduct: (productId: number) => void;
  setAddress: (address: Address) => void;
  setPaymentMethod: (
    method: "card" | "upi" | "cod" | "banktransfer" | null
  ) => void;
  setOrderStatus: (status: "success" | "failure" | "pending") => void;
  clearCart: () => void;
  completedSteps: number[];
  setCompletedStep: (step: number) => void;
  paymentCompleted: boolean;
  setPaymentCompleted: (status: boolean) => void;
}

export const useCheckoutStore = create<CheckoutState>()(
  persist(
    (set) => ({
      cartData: null,
      address: null,
      paymentMethod: null,
      orderStatus: null,
      setCartData: (data) => set({ cartData: data }),
      updateProductQuantity: (productId, quantity) =>
        set((state) => {
          if (!state.cartData) return { cartData: null };

          const updatedProducts = state.cartData.products.map((p) =>
            p.id === productId
              ? {
                  ...p,
                  quantity,
                  total: p.price * quantity,
                  discountedTotal:
                    (p.price * quantity * (100 - p.discountPercentage)) / 100,
                }
              : p
          );

          const newTotal = updatedProducts.reduce((sum, p) => sum + p.total, 0);
          const newDiscountedTotal = updatedProducts.reduce(
            (sum, p) => sum + p.discountedTotal,
            0
          );
          const newTotalQuantity = updatedProducts.reduce(
            (sum, p) => sum + p.quantity,
            0
          );

          return {
            cartData: {
              ...state.cartData,
              products: updatedProducts,
              total: newTotal,
              discountedTotal: newDiscountedTotal,
              totalQuantity: newTotalQuantity,
            },
          };
        }),
      removeProduct: (productId) =>
        set((state) => {
          if (!state.cartData) return { cartData: null };

          const updatedProducts = state.cartData.products.filter(
            (p) => p.id !== productId
          );
          const newTotal = updatedProducts.reduce((sum, p) => sum + p.total, 0);
          const newDiscountedTotal = updatedProducts.reduce(
            (sum, p) => sum + p.discountedTotal,
            0
          );
          const newTotalQuantity = updatedProducts.reduce(
            (sum, p) => sum + p.quantity,
            0
          );

          return {
            cartData: {
              ...state.cartData,
              products: updatedProducts,
              total: newTotal,
              discountedTotal: newDiscountedTotal,
              totalProducts: updatedProducts.length,
              totalQuantity: newTotalQuantity,
            },
          };
        }),
      setAddress: (address) => set({ address }),
      setPaymentMethod: (method) => set({ paymentMethod: method }),
      setOrderStatus: (status) => set({ orderStatus: status }),
      clearCart: () =>
        set({
          cartData: null,
          address: null,
          paymentMethod: null,
          orderStatus: null,
        }),
      completedSteps: [1], // Cart is always considered completed
      setCompletedStep: (step) =>
        set((state) => {
          const newCompletedSteps = state.completedSteps.includes(step)
            ? state.completedSteps
            : [...state.completedSteps, step].sort((a, b) => a - b);
          return { completedSteps: newCompletedSteps };
        }),
      paymentCompleted: false,
      setPaymentCompleted: (status) => set({ paymentCompleted: status }),
    }),
    {
      name: "checkout-store",
    }
  )
);
