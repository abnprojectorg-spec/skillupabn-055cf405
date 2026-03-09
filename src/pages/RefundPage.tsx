import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const RefundPage = () => (
  <div className="min-h-screen bg-background">
    <Navbar />
    <main className="mx-auto max-w-3xl px-4 py-16 sm:px-6 lg:px-8">
      <h1 className="font-display text-4xl font-bold mb-8">Refund Policy</h1>
      <div className="space-y-6 text-muted-foreground leading-relaxed">
        <p><strong className="text-foreground">Effective Date:</strong> January 1, 2026</p>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">1. Digital Products</h2>
          <p>All courses, ebooks, and digital files sold on SkillUp are digital products. Due to the nature of digital content, all sales are generally considered final once access has been granted.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">2. Eligibility for Refund</h2>
          <p>Refunds may be considered in the following cases:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Duplicate payment for the same product</li>
            <li>Payment was approved but access was not granted within 48 hours</li>
            <li>Technical issues preventing access to purchased content</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">3. How to Request a Refund</h2>
          <p>To request a refund, contact us within 7 days of purchase with your transaction ID and reason for the request:</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Email: <a href="mailto:abenezarofficial@gmail.com" className="text-primary hover:underline">abenezarofficial@gmail.com</a></li>
            <li>Telegram: <a href="https://t.me/abenezar_official" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">@abenezar_official</a></li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">4. Processing Time</h2>
          <p>Approved refunds will be processed within 7-14 business days. Refunds will be returned using the original payment method when possible.</p>
        </section>

        <section>
          <h2 className="font-display text-xl font-semibold text-foreground mb-2">5. Non-Refundable</h2>
          <p>Refunds will not be issued if the content has been substantially accessed or downloaded, or if the refund request is made after 7 days of purchase.</p>
        </section>
      </div>
    </main>
    <Footer />
  </div>
);

export default RefundPage;
