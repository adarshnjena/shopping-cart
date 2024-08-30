declare module 'cashfree-sdk' {
    export namespace cashfree {
      interface CashfreeOptions {
        mode: 'sandbox' | 'production';
        appId: string;
        secretKey: string;
      }
  
      interface OrderData {
        orderId: string;
        orderAmount: number;
        orderCurrency: string;
      }
  
      interface PaymentOptions extends OrderData {
        customerName: string;
        customerEmail: string;
        customerPhone: string;
      }
  
      interface PaymentCallbacks {
        onSuccess: (data: any) => void;
        onFailure: (data: any) => void;
      }
  
      class Cashfree {
        constructor(options: CashfreeOptions);
        createOrder(orderData: OrderData): Promise<any>;
        makePayment(paymentOptions: PaymentOptions, callbacks: PaymentCallbacks): void;
      }
    }
  }