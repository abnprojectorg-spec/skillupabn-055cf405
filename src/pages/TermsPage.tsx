import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const TermsPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold mb-8">Terms of Service</h1>
      <div className="prose-custom space-y-6 text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">Effective Date:</strong> January 1, 2026</p>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">1. Acceptance of Terms</h2>
          <p>By accessing or using SkillUp ("the Platform"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use the Platform.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">2. Use of the Platform</h2>
          <p>You may use the Platform for lawful purposes only. You agree not to misuse the Platform, including but not limited to unauthorized access, distribution of harmful content, or interference with the Platform's operations.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">3. User Accounts</h2>
          <p>You are responsible for maintaining the confidentiality of your account credentials. You agree to notify us immediately of any unauthorized use of your account.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">4. Course Content</h2>
          <p>All course materials, ebooks, and files available on the Platform are the intellectual property of SkillUp or its content creators. You may not copy, distribute, or resell any content without written permission.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">5. Payments</h2>
          <p>Payments are processed through manual verification. By submitting a payment request, you confirm that the transaction details provided are accurate. Approved payments grant access to the purchased content.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">6. Limitation of Liability</h2>
          <p>SkillUp is provided "as is" without warranties of any kind. We are not liable for any damages arising from the use or inability to use the Platform.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">7. Changes to Terms</h2>
          <p>We reserve the right to modify these terms at any time. Continued use of the Platform after changes constitutes acceptance of the new terms.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">8. Contact</h2>
          <p>For questions regarding these terms, contact us at <a href="mailto:abenezarofficial@gmail.com" className="text-primary hover:underline">abenezarofficial@gmail.com</a>.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default TermsPage;
