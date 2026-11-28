import type { Metadata } from "next";
import LegalLayout from "@/components/LegalLayout";
import { site } from "@/config/site";

export const metadata: Metadata = {
  title: "Terms of Service",
  description: `The terms for using ${site.name} and ordering a resume rewrite.`,
};

export default function TermsPage() {
  return (
    <LegalLayout title="Terms of Service">
      <p>
        These terms apply when you use {site.name} (run by {site.legalName}) or
        order from us. By using the site or placing an order, you agree to them.
      </p>

      <h2>What we offer</h2>
      <ul>
        <li>
          <strong>A free resume checker.</strong> It gives an estimate of how well
          hiring software may read and match your resume. Real employer systems
          work differently, so the score is guidance, not a guarantee.
        </li>
        <li>
          <strong>A paid resume rewrite.</strong> A professional writer rewrites
          your resume using the information you give us.
        </li>
      </ul>

      <h2>Using the free checker</h2>
      <p>
        Upload only your own resume, or one you have permission to upload. Do not
        misuse the site, send automated requests, or try to break or overload it.
        We may limit or block use that looks like abuse.
      </p>

      <h2>The resume rewrite</h2>
      <ul>
        <li>The rewrite includes: [Client: list what is included].</li>
        <li>
          Delivery time: {site.turnaround}, counted from when we receive your
          resume and details.
        </li>
        <li>
          You must give us accurate information. Our writers use only what you
          provide. We do not invent jobs, qualifications or results.
        </li>
        <li>
          Revisions: [Client: how many revisions and for how many days after
          delivery].
        </li>
        <li>
          We deliver your finished resume by a private link. Download it and keep
          your own copy, because the file is deleted after a set time as
          described in our <a href="/privacy">Privacy Policy</a>.
        </li>
      </ul>

      <h2>Prices and payment</h2>
      <p>
        Prices are shown in Indian rupees (INR) or UAE dirhams (AED) at checkout.
        The price you see when you pay is the price you are charged. Taxes:
        [Client: state whether prices include GST or VAT]. Payments are handled
        by [Client: payment provider].
      </p>

      <h2>No guarantee of results</h2>
      <p>
        We work to make your resume clear and strong, but we cannot promise
        interviews, job offers, or that any employer&apos;s system will accept or
        rank your resume.
      </p>

      <h2>Your content and ours</h2>
      <p>
        You keep ownership of your resume and the information you give us. You
        allow us to use it only to provide the service to you. The website, the
        checker and our other materials belong to {site.legalName}.
      </p>

      <h2>Refunds</h2>
      <p>
        Our <a href="/refund-policy">Refund Policy</a> explains when you can get
        your money back.
      </p>

      <h2>Our responsibility</h2>
      <p>
        To the extent the law allows, we are not responsible for indirect losses,
        such as lost job opportunities. Our total responsibility for any order is
        limited to the amount you paid for it. Nothing here limits rights you have
        under the law that cannot be limited.
      </p>

      <h2>Law and disputes</h2>
      <p>
        These terms are governed by the laws of {site.lawCountry}. Disputes are
        handled by the courts of {site.lawCity}.
      </p>

      <h2>Changes</h2>
      <p>
        We may update these terms. The date at the top shows the latest version.
        Orders you already placed stay under the terms that applied when you ordered.
      </p>

      <h2>Contact</h2>
      <p>
        <a href={`mailto:${site.supportEmail}`}>{site.supportEmail}</a>
      </p>
    </LegalLayout>
  );
}