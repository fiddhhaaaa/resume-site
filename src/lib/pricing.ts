import { prices, CountryCode, DEFAULT_COUNTRY } from "@/config/prices";

export function resolveCountry(value?: string): CountryCode {
  return value === "AE" || value === "IN" ? value : DEFAULT_COUNTRY;
}

export function formatPrice(country: CountryCode): string {
  const { currency, amount } = prices[country];
  const locale = country === "IN" ? "en-IN" : "en-AE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Both INR and AED have 2 decimals, so multiply by 100
export function minorAmount(country: CountryCode): number {
  return Math.round(prices[country].amount * 100);
}

export function formatMoney(currency: string, minor: number): string {
  const locale = currency === "INR" ? "en-IN" : "en-AE";
  return new Intl.NumberFormat(locale, {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(minor / 100);
}