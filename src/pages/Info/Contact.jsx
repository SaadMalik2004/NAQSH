import { useState } from "react";
import { Mail, Phone, MapPin, Clock, CheckCircle2 } from "lucide-react";
import FormField from "../../components/common/FormField";
import { Spinner } from "../../components/common/Spinner";
import { useDocumentTitle } from "../../hooks/useDocumentTitle";
import { submitContactMessage } from "../../services/contactService";
import { SITE } from "../../config/site";
import { getErrorMessage } from "../../utils/errors";
import { limiters, formatWait } from "../../utils/rateLimit";
import { all, clean, cleanMultiline, email as emailRule, hasErrors, maxLen, minLen, required, validate } from "../../utils/validators";

const schema = {
  name: all(required("Name"), minLen("Name", 2), maxLen("Name", 100)),
  email: emailRule,
  subject: all(required("Subject"), minLen("Subject", 3), maxLen("Subject", 150)),
  message: all(required("Message"), (v) => (cleanMultiline(v).length < 10 ? "Message must be at least 10 characters" : ""), maxLen("Message", 2000)),
  website: () => "", // honeypot
};

export default function Contact() {
  useDocumentTitle("Contact Us");
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState("");
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);
  const set = (f) => (e) => setForm((v) => ({ ...v, [f]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setFormError("");
    if (form.website) { setSent(true); return; } // bots fill hidden fields — pretend success
    const found = validate(form, schema);
    setErrors(found);
    if (hasErrors(found)) return;
    const gate = limiters.contact.check();
    if (!gate.allowed) return setFormError(`You've sent several messages already. Please try again in ${formatWait(gate.retryAfterMs)}.`);

    setBusy(true);
    try {
      limiters.contact.hit();
      await submitContactMessage({
        name: clean(form.name, 100),
        email: clean(form.email, 254).toLowerCase(),
        subject: clean(form.subject, 150),
        message: cleanMultiline(form.message, 2000),
      });
      setSent(true);
    } catch (error) {
      setFormError(getErrorMessage(error, "We couldn't send your message. Please try again."));
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="bg-[#FAF8F5] min-h-screen py-14">
      <div className="max-w-6xl mx-auto px-6">
        <p className="uppercase tracking-[5px] text-xs font-semibold text-blue-600 mb-2">GET IN TOUCH</p>
        <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">Contact Us</h1>
        <p className="text-gray-500 max-w-xl mb-10">Questions about sizing, an order, or a custom request? Send us a message and we'll reply as soon as we can.</p>

        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            {[
              { icon: Mail, label: "Email", value: SITE.email },
              { icon: Phone, label: "Phone / WhatsApp", value: SITE.phone },
              { icon: MapPin, label: "Studio", value: SITE.address },
              { icon: Clock, label: "Hours", value: SITE.hours },
            ].map(({ icon: Icon, label, value }) => (
              <div key={label} className="bg-white rounded-2xl p-5 border border-gray-100 flex gap-4">
                <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center shrink-0"><Icon size={18} /></div>
                <div><p className="text-xs text-gray-400">{label}</p><p className="text-sm font-semibold text-slate-900">{value}</p></div>
              </div>
            ))}
          </div>

          <div className="lg:col-span-2 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs">
            {sent ? (
              <div className="text-center py-10 space-y-3">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto"><CheckCircle2 size={32} /></div>
                <h2 className="text-2xl font-black text-slate-900">Message sent</h2>
                <p className="text-sm text-gray-500">Thank you for reaching out. We'll get back to you by email.</p>
              </div>
            ) : (
              <form onSubmit={onSubmit} noValidate className="grid sm:grid-cols-2 gap-4">
                {formError && <div className="sm:col-span-2 bg-red-50 border border-red-100 text-red-600 text-xs rounded-xl px-4 py-3" role="alert">{formError}</div>}
                <FormField label="Your name" autoComplete="name" value={form.name} onChange={set("name")} error={errors.name} maxLength={100} />
                <FormField label="Email" type="email" autoComplete="email" value={form.email} onChange={set("email")} error={errors.email} maxLength={254} />
                <FormField className="sm:col-span-2" label="Subject" value={form.subject} onChange={set("subject")} error={errors.subject} maxLength={150} />
                <FormField className="sm:col-span-2" label="Message" as="textarea" rows={6} value={form.message} onChange={set("message")} error={errors.message} maxLength={2000} />
                {/* honeypot — hidden from people, bots fill it in */}
                <input type="text" name="website" tabIndex={-1} autoComplete="off" value={form.website} onChange={set("website")} className="hidden" aria-hidden="true" />
                <div className="sm:col-span-2">
                  <button disabled={busy} className="bg-slate-900 text-white px-8 py-3.5 rounded-full text-sm font-semibold hover:bg-black transition disabled:opacity-60 flex items-center gap-2">
                    {busy && <Spinner size={14} />} Send message
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
