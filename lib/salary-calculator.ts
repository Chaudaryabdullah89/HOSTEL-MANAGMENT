import { PayPeriod, SalaryAdjustmentType } from "@prisma/client";

export interface SalaryCalculationInput {
  baseSalary: number;
  hourlyRate?: number;
  hoursWorked?: number;
  overtimeHours?: number;
  payPeriod: PayPeriod;
  adjustments: Array<{
    type: SalaryAdjustmentType;
    amount: number;
    isActive: boolean;
  }>;
}

export interface SalaryCalculationResult {
  baseAmount: number;
  overtimeAmount: number;
  bonusAmount: number;
  deductions: number;
  adjustments: number;
  grossAmount: number;
  netAmount: number;
  breakdown: {
    regular: number;
    overtime: number;
    bonuses: number;
    deductions: number;
  };
}

export class SalaryCalculator {
  static calculateSalary(input: SalaryCalculationInput): SalaryCalculationResult {
    const {
      baseSalary,
      hourlyRate = 0,
      hoursWorked = 0,
      overtimeHours = 0,
      payPeriod,
      adjustments
    } = input;

    // Calculate base amount based on pay period
    let baseAmount = 0;
    
    if (hourlyRate > 0 && hoursWorked > 0) {
      // Hourly calculation
      baseAmount = hourlyRate * hoursWorked;
    } else {
      // Salary calculation based on pay period
      baseAmount = this.getPeriodAmount(baseSalary, payPeriod);
    }

    // Calculate overtime (typically 1.5x regular rate)
    const overtimeRate = hourlyRate > 0 ? hourlyRate * 1.5 : (baseSalary / this.getHoursInPeriod(payPeriod)) * 1.5;
    const overtimeAmount = overtimeHours * overtimeRate;

    // Process adjustments
    let bonusAmount = 0;
    let deductions = 0;
    let adjustmentTotal = 0;

    adjustments.forEach(adjustment => {
      if (!adjustment.isActive) return;

      switch (adjustment.type) {
        case "BONUS":
        case "COMMISSION":
          bonusAmount += adjustment.amount;
          break;
        case "DEDUCTION":
        case "PENALTY":
          deductions += adjustment.amount;
          break;
        case "RAISE":
          // Raises are typically applied to base salary, not as separate amounts
          adjustmentTotal += adjustment.amount;
          break;
        case "OVERTIME":
          // Overtime is calculated separately
          break;
        default:
          adjustmentTotal += adjustment.amount;
      }
    });

    const grossAmount = baseAmount + overtimeAmount + bonusAmount + adjustmentTotal;
    const netAmount = grossAmount - deductions;

    return {
      baseAmount,
      overtimeAmount,
      bonusAmount,
      deductions,
      adjustments: adjustmentTotal,
      grossAmount,
      netAmount,
      breakdown: {
        regular: baseAmount,
        overtime: overtimeAmount,
        bonuses: bonusAmount,
        deductions: deductions
      }
    };
  }

  private static getPeriodAmount(annualSalary: number, payPeriod: PayPeriod): number {
    switch (payPeriod) {
      case "WEEKLY":
        return annualSalary / 52;
      case "BIWEEKLY":
        return annualSalary / 26;
      case "MONTHLY":
        return annualSalary / 12;
      case "QUARTERLY":
        return annualSalary / 4;
      case "ANNUAL":
        return annualSalary;
      default:
        return annualSalary / 12; // Default to monthly
    }
  }

  private static getHoursInPeriod(payPeriod: PayPeriod): number {
    switch (payPeriod) {
      case "WEEKLY":
        return 40;
      case "BIWEEKLY":
        return 80;
      case "MONTHLY":
        return 173.33; // Average hours per month
      case "QUARTERLY":
        return 520;
      case "ANNUAL":
        return 2080;
      default:
        return 173.33;
    }
  }

  static calculatePayrollSummary(salaries: Array<{
    amount: number;
    status: string;
    payDate: Date;
  }>): {
    totalPaid: number;
    totalPending: number;
    totalFailed: number;
    averageSalary: number;
    payrollByMonth: Record<string, number>;
  } {
    const summary = {
      totalPaid: 0,
      totalPending: 0,
      totalFailed: 0,
      averageSalary: 0,
      payrollByMonth: {} as Record<string, number>
    };

    let totalAmount = 0;
    let count = 0;

    salaries.forEach(salary => {
      totalAmount += salary.amount;
      count++;

      // Group by month
      const monthKey = salary.payDate.toISOString().substring(0, 7); // YYYY-MM
      summary.payrollByMonth[monthKey] = (summary.payrollByMonth[monthKey] || 0) + salary.amount;

      switch (salary.status) {
        case "PAID":
          summary.totalPaid += salary.amount;
          break;
        case "PENDING":
          summary.totalPending += salary.amount;
          break;
        case "FAILED":
          summary.totalFailed += salary.amount;
          break;
      }
    });

    summary.averageSalary = count > 0 ? totalAmount / count : 0;

    return summary;
  }
}
