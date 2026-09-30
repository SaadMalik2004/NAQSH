import { Link } from "react-router-dom";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { SITE } from "../../config/site";

// Shared layout for the static policy / about pages.
function InfoLayout({ title, eyebrow, updated, children }) {
  useDocumentTitle(title);
  return (
    <div className="bg-[#FAF8F5] min-h-screen py-14">
      <div className="max-w-3xl mx-auto px-6">
        <p className="uppercase tracking-[5px] text-xs font-semibold text-blue-600 mb-2">{eyebrow}</p>
        <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">{title}</h1>
        {updated && <p className="text-xs text-gray-400 mb-8">Last updated: {updated}</p>}
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-xs space-y-6 text-sm text-gray-600 leading-relaxed [&_h2]:text-lg [&_h2]:font-bold [&_h2]:text-slate-900 [&_h2]:mb-1 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>
      </div>
    </div>
  );
}

const Section = ({ title, children }) => (
  <section>
    <h2>{title}</h2>
    {children}
  </section>
);

const contactLine = (
  <p>
    Questions? <Link to="/contact" className="underline font-semibold text-slate-900">Contact us</Link> or email {SITE.email}.
  </p>
);

export function About() {
  return (
    <InfoLayout title="About NAQSH" eyebrow="OUR STORY">
      <p>NAQSH — meaning "impression" or "imprint" — is a Pakistani fashion label built around one idea: wear your identity. We bring together heritage craft and contemporary silhouettes.</p>
      <Section title="What we make">
        <p>Eastern menswear such as kurta shalwar and waistcoats, festive lawn and embroidered pret for women, artisan footwear like Peshawari chappals and khussas, and heritage accessories including shawls and leather goods.</p>
      </Section>
      <Section title="Our promise">
        <ul>
          <li>Carefully selected fabrics and finishing checked before every dispatch</li>
          <li>Honest sizing help through our Fit Advisor</li>
          <li>Simple exchanges within 30 days of delivery</li>
        </ul>
      </Section>
      {contactLine}
    </InfoLayout>
  );
}

export function Shipping() {
  return (
    <InfoLayout title="Shipping & Returns" eyebrow="CUSTOMER CARE" updated="2026">
      <Section title="Delivery">
        <p>Orders are confirmed by phone or email, then dispatched. Delivery usually takes 3–7 working days within Pakistan. Shipping is free on orders of $100 or more; otherwise a flat $15 fee applies.</p>
      </Section>
      <Section title="Payment">
        <p>We currently accept Cash on Delivery and bank / mobile wallet transfer. We never ask for card details on this website.</p>
      </Section>
      <Section title="Exchanges & returns">
        <ul>
          <li>Request an exchange within 30 days of delivery.</li>
          <li>Items must be unworn, unwashed and in their original condition.</li>
          <li>Customised or altered pieces cannot be returned.</li>
        </ul>
      </Section>
      <Section title="Cancelling an order">
        <p>You can cancel a pending order yourself from <Link to="/orders" className="underline font-semibold">My Orders</Link>. Once an order is confirmed, please contact us.</p>
      </Section>
      {contactLine}
    </InfoLayout>
  );
}

export function SizeGuide() {
  const rows = [["XS", "34", "28", "26"], ["S", "36", "30", "27"], ["M", "38–40", "32", "28"], ["L", "42", "34", "29"], ["XL", "44–46", "36", "30"]];
  return (
    <InfoLayout title="Size Guide" eyebrow="FIND YOUR FIT">
      <p>Approximate body measurements in inches. If you're between sizes, we recommend sizing up. Use the Fit Advisor on any apparel product page for a personalised suggestion.</p>
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-100 rounded-xl overflow-hidden">
          <thead className="bg-stone-50 text-slate-900"><tr>{["Size", "Chest", "Waist", "Sleeve"].map((h) => <th key={h} className="px-4 py-3 font-bold">{h}</th>)}</tr></thead>
          <tbody>{rows.map((r) => <tr key={r[0]} className="border-t border-gray-100">{r.map((c, i) => <td key={i} className={`px-4 py-3 ${i === 0 ? "font-bold text-slate-900" : ""}`}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <p>Footwear is sized in EU sizes (40–44). Accessories are one size.</p>
      {contactLine}
    </InfoLayout>
  );
}

export function Privacy() {
  return (
    <InfoLayout title="Privacy Policy" eyebrow="LEGAL" updated="2026">
      <Section title="What we collect">
        <p>Account details (name, email, phone), delivery addresses, order history, wishlist and any messages you send us.</p>
      </Section>
      <Section title="How we use it">
        <ul>
          <li>To create your account and process and deliver orders</li>
          <li>To reply to your messages and provide customer support</li>
          <li>To send our newsletter, only if you subscribed</li>
        </ul>
      </Section>
      <Section title="How it's stored">
        <p>Data is stored with our database provider, Supabase, and protected with access rules so customers can only see their own information. Passwords are never stored in readable form. We do not store payment card details.</p>
      </Section>
      <Section title="Your choices">
        <p>You can update your details from your profile at any time. To delete your account or data, contact us and we'll take care of it.</p>
      </Section>
      {contactLine}
    </InfoLayout>
  );
}

export function Terms() {
  return (
    <InfoLayout title="Terms of Service" eyebrow="LEGAL" updated="2026">
      <Section title="Orders">
        <p>Placing an order is an offer to buy. We may contact you to confirm it, and we may cancel an order if an item is unavailable or details cannot be verified.</p>
      </Section>
      <Section title="Prices & availability">
        <p>Prices are shown in US dollars and may change. The price charged is the one calculated when your order is placed. Stock is limited and shown as available at that moment.</p>
      </Section>
      <Section title="Your account">
        <p>Keep your password private. You are responsible for activity on your account.</p>
      </Section>
      <Section title="Exchanges">
        <p>Exchanges are handled as described on our Shipping & Returns page.</p>
      </Section>
      {contactLine}
    </InfoLayout>
  );
}
