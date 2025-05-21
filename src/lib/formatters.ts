
export const formatCurrency = (value: number | null | undefined, currency: string = 'USD'): string => {
  if (value === null || value === undefined) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 1,
    notation: 'compact',
  }).format(value);
};

export const formatDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'N/A';
  
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};
