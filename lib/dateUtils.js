// Simple utility function to calculate days between two dates
export const getDaysBetween = (startDate, endDate) => {
  const start = new Date(startDate);
  const end = new Date(endDate);
  
  const diffTime = end - start;
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  return Math.max(1, diffDays); // At least 1 day
};

// Usage examples:
// getDaysBetween("Oct 28, 2025", "Oct 30, 2025") // Returns 2
// getDaysBetween("2025-10-28", "2025-10-30") // Returns 2
// getDaysBetween("Oct 28, 2025", "Oct 28, 2025") // Returns 1
