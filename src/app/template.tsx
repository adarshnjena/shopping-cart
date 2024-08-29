"use client";

import React from "react";
import Stepper from "@/components/Stepper";
import { usePathname } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const getCurrentStep = () => {
    switch (pathname) {
      case "/cart":
        return 1;
      case "/delivery":
        return 2;
      case "/payment":
        return 3;
      case "/confirmation":
        return 4;
      default:
        return 1;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
          <h1 className="text-3xl font-bold text-gray-900">Checkout Process</h1>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="bg-white overflow-hidden border border-gray-200 rounded-lg">
          <div className="px-4 py-5 sm:p-6">
            <Stepper currentStep={getCurrentStep()} />
            {children}
          </div>
        </div>
      </main>
    </div>
  );
};

export default Layout;
