export type Transaction = {
  vendor?: string;
  amount: number;
  currency: string;
  date?: string;
  sourceMessageId?: string;
  description?: string;
};
