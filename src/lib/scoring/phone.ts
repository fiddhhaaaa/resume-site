import { findPhoneNumbersInText, type CountryCode } from "libphonenumber-js/max";

import type { Market } from "@/lib/types";
const TRY_REGIONS: CountryCode[] = ["IN", "AE"];

export function scorePhone(text: string, applyingTo: Market) {
  const MAX = 3;
  const issues: string[] = [];

  for (const region of TRY_REGIONS) {
    for (const hit of findPhoneNumbersInText(text, region)) {
      if (!hit.number.isValid()) continue;

      const raw = text.slice(hit.startsAt, hit.endsAt).trim();
      const hasCountryCode = raw.startsWith("+") || raw.startsWith("00");
      const isAbroad = hit.number.country !== applyingTo;

      let points = 2; // the number is valid

      if (hasCountryCode || !isAbroad) {
        points += 1;
      } else {
        const where = applyingTo === "AE" ? "the UAE" : "India";
        issues.push(
          `Add your country code so employers in ${where} can dial you, for example ${hit.number.formatInternational()}.`
        );
      }

      if (hit.number.getType() === "FIXED_LINE") {
        points -= 1;
        issues.push("This looks like a landline. Recruiters prefer a mobile number.");
      }

      return { points, max: MAX, issues };
    }
  }

  // Nothing valid was found
  const anyFound =
    findPhoneNumbersInText(text, "IN").length > 0 ||
    findPhoneNumbersInText(text, "AE").length > 0;

  issues.push(
    anyFound
      ? "A phone number was found, but it doesn't look valid. Check the digits and the country code."
      : "No phone number found."
  );
  return { points: anyFound ? 1 : 0, max: MAX, issues };
}