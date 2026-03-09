import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const PrivacyPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold mb-8">Privacy Policy</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">Effective Date:</strong> January 1, 2026</p>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">1. Information We Collect</h2>
          <p>We collect information you provide when creating an account, including your name, email address, and payment transaction details. We also collect usage data such as pages visited and courses accessed.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">2. How We Use Your Information</h2>
          <p>Your information is used to provide and improve our services, process payments, communicate updates, and personalize your learning experience. We do not sell your personal information to third parties.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">3. Data Security</h2>
          <p>We implement reasonable security measures to protect your personal information. However, no method of transmission over the internet is 100% secure, and we cannot guarantee absolute security.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">4. Cookies</h2>
          <p>We use cookies and similar technologies to enhance your experience on the Platform. You can manage cookie preferences through your browser settings.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">5. Third-Party Services</h2>
          <p>We may use third-party services such as Firebase for authentication and data storage. These services have their own privacy policies that govern their use of your data.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">6. Your Rights</h2>
          <p>You have the right to access, update, or delete your personal information. Contact us at <a href="mailto:abenezarofficial@gmail.com" className="text-primary hover:underline">abenezarofficial@gmail.com</a> to exercise these rights.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">7. Changes to This Policy</h2>
          <p>We may update this Privacy Policy from time to time. We will notify users of significant changes through the Platform.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default PrivacyPage;
