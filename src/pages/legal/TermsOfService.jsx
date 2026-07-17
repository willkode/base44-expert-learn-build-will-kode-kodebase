import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "@/components/legal/LegalLayout";

export default function TermsOfService() {
  return (
    <LegalLayout
      title="Terms of Service"
      description="The terms that govern your use of KodeBase — our digital products, tools, and services."
      path="/terms"
      updated="July 17, 2026"
    >
      <section>
        <h2>1. Agreement to Terms</h2>
        <p>
          These Terms of Service ("Terms") govern your access to and use of the KodeBase website
          (kodebase.us), our digital products, tools, and services (collectively, the "Services").
          By creating an account, making a purchase, or otherwise using the Services, you agree to
          be bound by these Terms. If you do not agree, do not use the Services.
        </p>
        <p>
          <strong>By signing up for an account, you agree to these Terms of Service.</strong>
        </p>
      </section>
      <section>
        <h2>2. Accounts</h2>
        <p>
          You must provide accurate information when creating an account and keep your credentials
          secure. You are responsible for all activity that occurs under your account. We may
          suspend or terminate accounts that violate these Terms or misuse the Services.
        </p>
      </section>
      <section>
        <h2>3. Digital Products</h2>
        <p>
          KodeBase sells digital products such as prompt packs, knowledge bases, kits, and other
          downloadable content. Purchases grant you a personal, non-exclusive, non-transferable
          license to use the content for your own projects. You may not resell, redistribute,
          share, or republish purchased content, in whole or in part.
        </p>
        <p>
          Because digital products are delivered instantly, all sales are subject to our{" "}
          <Link to="/refund-policy" className="text-primary hover:underline">Refund Policy</Link> —
          products that have been downloaded are not eligible for a refund.
        </p>
      </section>
      <section>
        <h2>4. Services</h2>
        <p>
          KodeBase offers professional services such as consulting sessions, audits, migration
          planning, and related work. The scope of each service is described on its purchase page
          or agreed in writing. Services are refundable only if the work was not performed, as
          described in our Refund Policy.
        </p>
        <p>
          Migration and consulting services are independent offerings by KodeBase and are not
          affiliated with, endorsed by, or provided on behalf of any third-party platform.
        </p>
      </section>
      <section>
        <h2>5. Payments</h2>
        <p>
          Payments are processed by third-party payment providers. Prices are listed in USD and may
          change at any time. You agree to pay all charges associated with your purchases. Sale
          pricing and coupons apply only at the time of purchase.
        </p>
      </section>
      <section>
        <h2>6. Acceptable Use</h2>
        <ul>
          <li>Do not use the Services for any unlawful purpose.</li>
          <li>Do not attempt to gain unauthorized access to systems, data, or other accounts.</li>
          <li>Do not scrape, copy, or redistribute content from the Services without permission.</li>
          <li>Do not interfere with or disrupt the operation of the Services.</li>
        </ul>
      </section>
      <section>
        <h2>7. Intellectual Property</h2>
        <p>
          All content on the Services — including text, graphics, logos, tools, and digital
          products — is owned by KodeBase or its licensors and protected by intellectual property
          laws. Purchasing a product does not transfer ownership of the underlying content.
        </p>
      </section>
      <section>
        <h2>8. AI-Generated Content and Tools</h2>
        <p>
          Some Services use artificial intelligence to generate content, reports, blueprints, or
          recommendations. AI output is provided "as is" for informational purposes and may contain
          errors. You are responsible for reviewing and validating any AI-generated output before
          relying on it.
        </p>
      </section>
      <section>
        <h2>9. Disclaimer of Warranties</h2>
        <p>
          The Services are provided "as is" and "as available" without warranties of any kind,
          express or implied, including warranties of merchantability, fitness for a particular
          purpose, and non-infringement. We do not guarantee any specific results from using our
          products or services.
        </p>
      </section>
      <section>
        <h2>10. Limitation of Liability</h2>
        <p>
          To the maximum extent permitted by law, KodeBase shall not be liable for any indirect,
          incidental, special, consequential, or punitive damages, or any loss of profits, data, or
          business, arising from your use of the Services. Our total liability for any claim shall
          not exceed the amount you paid us in the twelve months preceding the claim.
        </p>
      </section>
      <section>
        <h2>11. Changes to These Terms</h2>
        <p>
          We may update these Terms from time to time. Continued use of the Services after changes
          take effect constitutes acceptance of the revised Terms.
        </p>
      </section>
      <section>
        <h2>12. Contact</h2>
        <p>
          Questions about these Terms? Reach out through our{" "}
          <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}