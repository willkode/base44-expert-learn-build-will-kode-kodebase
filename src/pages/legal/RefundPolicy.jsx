import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "@/components/legal/LegalLayout";

export default function RefundPolicy() {
  return (
    <LegalLayout
      title="Refund Policy"
      description="KodeBase refund policy for digital products and professional services."
      path="/refund-policy"
      updated="July 17, 2026"
    >
      <section>
        <h2>1. Digital Products</h2>
        <p>
          KodeBase digital products — including prompt packs, knowledge bases, kits, and other
          downloadable content — are delivered instantly after purchase.
        </p>
        <p>
          <strong>Once a digital product has been downloaded, it is not eligible for a refund.</strong>{" "}
          Because the full value of a digital product is transferred at the moment of download, we
          cannot accept returns or issue refunds for downloaded content.
        </p>
        <p>
          If you purchased a product but have <strong>not</strong> downloaded it and believe the
          purchase was made in error, contact us and we will review your request.
        </p>
      </section>
      <section>
        <h2>2. Services</h2>
        <p>
          Professional services — such as consulting sessions, audits, and migration work — are
          refundable <strong>only if the work was not performed</strong>.
        </p>
        <ul>
          <li>If you purchased a service and no work has begun, you may request a full refund.</li>
          <li>Once work has been performed or a session has been delivered, the service is non-refundable.</li>
          <li>For multi-phase projects, refunds apply only to phases where work has not started.</li>
        </ul>
      </section>
      <section>
        <h2>3. How to Request a Refund</h2>
        <p>
          To request a refund, contact us through our{" "}
          <Link to="/contact" className="text-primary hover:underline">contact page</Link> with your
          order details (the email used at purchase and the product or service name). Eligible
          refunds are processed to your original payment method, typically within 5–10 business
          days depending on your payment provider.
        </p>
      </section>
      <section>
        <h2>4. Chargebacks</h2>
        <p>
          If you have an issue with a purchase, please contact us first — we're happy to help.
          Filing a chargeback on a downloaded digital product or a delivered service violates this
          policy and our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}