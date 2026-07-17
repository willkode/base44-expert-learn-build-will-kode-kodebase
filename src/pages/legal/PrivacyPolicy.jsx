import React from "react";
import { Link } from "react-router-dom";
import LegalLayout from "@/components/legal/LegalLayout";

export default function PrivacyPolicy() {
  return (
    <LegalLayout
      title="Privacy Policy"
      description="How KodeBase collects, uses, and protects your personal information."
      path="/privacy"
      updated="July 17, 2026"
    >
      <section>
        <h2>1. Overview</h2>
        <p>
          This Privacy Policy explains how KodeBase (kodebase.us) collects, uses, and protects your
          information when you use our website, digital products, and services. By using our
          services, you consent to the practices described here.
        </p>
      </section>
      <section>
        <h2>2. Information We Collect</h2>
        <ul>
          <li><strong>Account information</strong> — email address, name, and password when you register.</li>
          <li><strong>Purchase information</strong> — items purchased, amounts, and payment status. Card details are handled by our payment processor and never stored by us.</li>
          <li><strong>Usage data</strong> — pages visited, features used, and interactions, collected through analytics tools such as Google Analytics.</li>
          <li><strong>Content you provide</strong> — project details, assessment answers, form submissions, and messages you send us.</li>
        </ul>
      </section>
      <section>
        <h2>3. How We Use Your Information</h2>
        <ul>
          <li>To provide, operate, and improve our products and services.</li>
          <li>To process purchases and deliver downloadable products.</li>
          <li>To send transactional emails such as receipts, download links, and account notices.</li>
          <li>To send marketing emails if you have opted in — you can unsubscribe at any time.</li>
          <li>To analyze usage and improve site performance and content.</li>
          <li>To prevent fraud and enforce our <Link to="/terms" className="text-primary hover:underline">Terms of Service</Link>.</li>
        </ul>
      </section>
      <section>
        <h2>4. Cookies and Analytics</h2>
        <p>
          We use cookies and similar technologies for authentication, preferences, and analytics.
          Google Analytics helps us understand how visitors use the site; the data collected is
          aggregated and does not identify you personally. You can control cookies through your
          browser settings.
        </p>
      </section>
      <section>
        <h2>5. Sharing of Information</h2>
        <p>
          We do not sell your personal information. We share data only with service providers who
          help us operate — such as payment processors, email delivery services, and analytics
          providers — and only as needed to provide the service. We may disclose information if
          required by law.
        </p>
      </section>
      <section>
        <h2>6. Data Security</h2>
        <p>
          We use industry-standard measures to protect your data, including encrypted connections
          and access controls. Purchased files are stored privately and delivered through
          time-limited secure links. No method of transmission or storage is 100% secure, and we
          cannot guarantee absolute security.
        </p>
      </section>
      <section>
        <h2>7. Data Retention</h2>
        <p>
          We retain account and purchase records for as long as your account is active or as needed
          to comply with legal obligations, resolve disputes, and enforce agreements.
        </p>
      </section>
      <section>
        <h2>8. Your Rights</h2>
        <p>
          You may request access to, correction of, or deletion of your personal information by
          contacting us. You can unsubscribe from marketing emails at any time using the link in
          each email.
        </p>
      </section>
      <section>
        <h2>9. Children's Privacy</h2>
        <p>
          Our services are not directed to children under 13, and we do not knowingly collect
          personal information from children.
        </p>
      </section>
      <section>
        <h2>10. Changes to This Policy</h2>
        <p>
          We may update this Privacy Policy from time to time. Material changes will be reflected
          by the "Last updated" date above.
        </p>
      </section>
      <section>
        <h2>11. Contact</h2>
        <p>
          Privacy questions? Reach out through our{" "}
          <Link to="/contact" className="text-primary hover:underline">contact page</Link>.
        </p>
      </section>
    </LegalLayout>
  );
}