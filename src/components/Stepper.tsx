"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useCheckoutStore } from "@/store/store";
import {
  FaShoppingCart,
  FaTruck,
  FaCreditCard,
  FaCheckCircle,
} from "react-icons/fa";

interface StepperProps {
  currentStep: number;
}

const steps = [
  { icon: FaShoppingCart, label: "Cart", path: "/cart" },
  { icon: FaTruck, label: "Delivery", path: "/delivery" },
  { icon: FaCreditCard, label: "Payment", path: "/payment" },
  { icon: FaCheckCircle, label: "Confirmation", path: "/confirmation" },
];

const Stepper: React.FC<StepperProps> = ({ currentStep }) => {
  const router = useRouter();
  const { completedSteps } = useCheckoutStore();

  const handleStepClick = (index: number) => {
    const maxAllowedStep = Math.max(...completedSteps, currentStep);
    if (index + 1 <= maxAllowedStep) {
      router.push(steps[index].path);
    }
  };

  return (
    <div className="w-full mb-12 mt-8 relative">
      {/* Connecting Lines */}
      <div
        className="absolute top-4 left-0 h-0.5 bg-gray-300"
        style={{ width: `calc(100% - 32px)` }}
      />
      <div
        className="absolute top-4 left-0 h-0.5 bg-black transition-all duration-300 ease-in-out"
        style={{ width: `${(currentStep - 1) * 32}%` }}
      />

      {/* Step Circles and Labels */}
      <div className="flex justify-between relative">
        {steps.map((step, index) => (
          <div key={step.label} className="flex flex-col items-center">
            <div
              className={`w-12 h-12 rounded-full flex items-center justify-center cursor-pointer z-10
                ${
                  index + 1 <= currentStep
                    ? "bg-black text-white"
                    : "bg-white text-gray-400 border-2 border-gray-300"
                }
                ${
                  index + 1 <= Math.max(...completedSteps, currentStep)
                    ? "hover:bg-gray-800"
                    : "cursor-not-allowed"
                }
              `}
              onClick={() => handleStepClick(index)}
            >
              <step.icon size={16} />
            </div>
            <span
              className={`mt-2 text-xs font-medium ${
                index + 1 <= currentStep ? "text-black" : "text-gray-400"
              }`}
            >
              {step.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Stepper;
