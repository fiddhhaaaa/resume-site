import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Contact us",
  description: `How to reach ${site.name} for questions about your check, order or data.`,
};

export default function ContactPage() {
  return (
    <LegalLayout title="Contact us" showDate={false}>
      <p>
        Questions about your resume check, your order or your data? Write to us
        and we will reply {site.responseTime}.
      </p>

      <h2>Email</h2>
      <p>
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>

      <h2>Business details</h2>
      <p>
        {site.legalName}
        <br />
        {site.address}
      </p>

      <h2>Privacy requests</h2>
      <p>
        To see, correct or delete your data, email us from the address you used
        with us. See our <a href="/privacy">Privacy Policy</a>.
      </p>
    </LegalLayout>
  );
}