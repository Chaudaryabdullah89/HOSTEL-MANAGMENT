import { CreditCard } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Payment {
  id: string;
  amount: number;
  status: string;
  method: string;
  createdAt: string;
}

interface BookingPaymentInfoProps {
  payments: Payment[];
}

export function BookingPaymentInfo({ payments }: BookingPaymentInfoProps) {
  if (!payments || !Array.isArray(payments)) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <p className="text-md font-medium flex items-center gap-2">
          <CreditCard className="w-4 h-4" />
          <span className="text-sm font-semibold text-gray-800">
            Payment Status
          </span>
        </p>
        <Badge variant="outline" className="text-xs">
          {payments.length} payment(s)
        </Badge>
      </div>
      <div className="space-y-2">
        {payments.length > 0 ? (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex flex-col gap-1 border-b pb-2 last:border-0"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">
                  {typeof payment.amount === 'number'
                    ? payment.amount.toLocaleString('en-US', {
                      style: 'currency',
                      currency: 'PKR'
                    })
                    : 'N/A'
                  }
                </span>
                <Badge variant={
                  payment.status === 'COMPLETED' ? 'default' :
                    payment.status === 'PENDING' ? 'secondary' : 'destructive'
                }>
                  {payment.status}
                </Badge>
              </div>
              <p className="text-xs text-gray-500">
                {payment.method} • {new Date(payment.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))
        ) : (
          <div className="text-center py-2">
            <p className="text-xs text-gray-500">No payments recorded</p>
          </div>
        )}
      </div>
    </div>
  );
}