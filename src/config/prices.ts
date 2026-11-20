export type CountryCode = "IN" | "AE";

export const prices: Record<CountryCode, { currency: string; amount: number }> = {
  IN: { currency: "INR", amount: 600 },
  AE: { currency: "AED", amount: 29 }, // placeholder until the client confirms
};

export const DEFAULT_COUNTRY: CountryCode = "IN";