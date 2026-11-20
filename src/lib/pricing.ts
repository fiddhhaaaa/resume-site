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