import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { RETENTION } from "@/config/retention";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: `How ${site.name} collects, uses and protects your personal data.`,
};

export default function PrivacyPage() {
  return (
    <LegalLayout title="Privacy Policy">
      <p>
        This policy explains what personal data {site.name} collects, why, who
        sees it, and how long we keep it.
      </p>

      <h2>Who we are</h2>
      <p>
        {site.name} is run by {site.legalName}, {site.address}. You can reach us
        at <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>

      <h2>What we collect and why</h2>
      <ul>
        <li>
          <strong>The free resume check.</strong> The file you upload is read to
          calculate your score. We do not keep the file or its text. We keep the
          result (your score and the advice) for {RETENTION.unclaimedReportDays}{" "}
          days. The choices you make (career level, country, job) are used only
          for the check. Text you paste from a job ad is used for the check and
          is not stored.
        </li>

        <li>
          <strong>Your full report by email.</strong> If you ask for it, we keep
          your email address, the country and career level you chose, and your
          report. The report link stays valid for {RETENTION.emailedReportDays}{" "}
          days. We keep your email address until you ask us to delete it.
        </li>

        <li>
          <strong>Marketing emails.</strong> We send tips or offers only if you
          tick the box asking for them. You can withdraw that choice at any time.
        </li>

        <li>
          <strong>Orders.</strong> When you order a resume rewrite we collect your
          name, email address, the resume you send us, the job details and notes
          you give us, and the amount and reference of your payment. We use this
          to do the work, deliver it and handle support and refunds.
        </li>

        <li>
          <strong>Payment details.</strong> Payments are handled by our payment
          provider. We never see or store your card or bank details.
        </li>

        <li>
          <strong>Your country.</strong> We guess your country from your internet
          connection to show prices in the right currency. We save your choice in
          a small cookie named &quot;country&quot; for one year.
        </li>

        <li>
          <strong>Abuse protection.</strong> To stop automated misuse, we turn
          your IP address into a scrambled code that cannot be reversed into the
          address, and we delete it within 2 days.
        </li>

        <li>
          <strong>Spam protection.</strong> Our forms use Cloudflare Turnstile to
          check that a visitor is a real person. Cloudflare receives technical
          information from your browser for this check.
        </li>

        <li>
          <strong>Cookies and analytics.</strong> We do not use advertising or
          analytics cookies at this time.
        </li>
      </ul>

      <h2>Who we share data with</h2>
      <p>We do not sell your data. We use these services to run the site:</p>

      <ul>
        <li>Website hosting: Vercel.</li>

        <li>
          Database: [Client: confirm the database provider, for example Neon or Supabase].
        </li>

        <li>Sending email: Resend.</li>

        <li>
          Payments: [Client: confirm the payment provider, for example Razorpay].
        </li>

        <li>Spam protection: Cloudflare (Turnstile).</li>

        <li>
          Our writers and support team, who see your name, email, resume and
          notes only to do your order.
        </li>
      </ul>

      <p>
        These providers may store or process data in other countries. We also
        share data when the law requires it.
      </p>

      <h2>How long we keep data</h2>
      <ul>
        <li>
          Check results: {RETENTION.unclaimedReportDays} days, or{" "}
          {RETENTION.emailedReportDays} days if you asked for the report by email.
        </li>

        <li>
          Your resume and the finished resume: deleted{" "}
          {RETENTION.filesAfterDeliveryDays} days after delivery.
        </li>

        <li>
          Orders that were never paid: deleted after {RETENTION.unpaidOrderDays} days.
        </li>

        <li>
          Order records (name, email, amount, dates): [Client: period required for
          accounting and tax, for example 7 years].
        </li>

        <li>Your email address on our list: until you ask us to delete it.</li>
      </ul>

      <h2>Your choices and rights</h2>
      <p>
        You can ask us to show you the data we hold about you, correct it,
        delete it, or stop sending you marketing emails. Write to{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a> from the
        email address you used. We reply {site.responseTime}. Some payment
        records may have to be kept for the period above even after a deletion
        request, but we will remove your name, email, files and details.
      </p>

      <h2>Security</h2>
      <p>
        Connections to our site are encrypted. Uploaded files are stored
        privately and are not public. Order and report links contain a long
        random code, so keep them to yourself. No system is perfectly secure, but
        we limit who can see your data and delete it when it is no longer needed.
      </p>

      <h2>Children</h2>
      <p>Our service is not meant for people under 18.</p>

      <h2>Changes to this policy</h2>
      <p>
        If we change this policy, we will update the date at the top of this
        page.
      </p>

      <h2>Contact</h2>
      <p>
        Questions about your data? Write to{" "}
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>.
      </p>
    </LegalLayout>
  );
}