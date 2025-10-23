import { CreditCard, DollarSign } from 'lucide-react';
import { Badge } from './badge';

interface PaymentInfoProps {
  payments: Array<{
    id: string;
    amount: number;
    status: string;
    method: string;
    createdAt: string;
  }>;
}

export function PaymentInfo({ payments }: PaymentInfoProps) {
  if (!payments || payments.length === 0) {
    return (
      <div className="mt-2">
        <Badge variant="outline" className="text-yellow-600 bg-yellow-50">
          No payments
        </Badge>
      </div>
    );
  }

  return (
    <div className="mt-2 space-y-2">
      {payments.map((payment) => (
        <div
          key={payment.id}
          className="flex items-center justify-between p-2 bg-gray-50 rounded-md"
        >
          <div className="flex items-center gap-2">
            {payment.method === 'CASH' ? (
              <DollarSign className="w-4 h-4 text-green-600" />
            ) : (
              <CreditCard className="w-4 h-4 text-blue-600" />
            )}
            <span className="text-sm font-medium">
              {payment.amount.toLocaleString('en-US', {
                style: 'currency',
                currency: 'PKR',
              })}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant={
                payment.status === 'COMPLETED'
                  ? 'success'
                  : payment.status === 'PENDING'
                  ? 'warning'
                  : 'destructive'
              }
            >
              {payment.status}
            </Badge>
            <span className="text-xs text-gray-500">
              {new Date(payment.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}