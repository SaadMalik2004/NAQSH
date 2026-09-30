import { Sparkles, Truck, RefreshCw, ShieldCheck } from "lucide-react";

export default function WhyChooseUs() {
  const features = [
    {
      icon: Sparkles,
      title: "Heritage & Modern Drape",
      description:
        "Every kurta, lawn ensemble, and tailored silhouette is engineered to honor authentic Pakistani roots with contemporary poise.",
    },
    {
      icon: ShieldCheck,
      title: "Quality Fabrics & Finishing",
      description:
        "Raw silk, cotton, lawn and leather, selected with care and checked before every dispatch.",
    },
    {
      icon: Truck,
      title: "Free Shipping Over $100",
      description:
        "Free standard delivery on orders of $100 or more, packed carefully and delivered to your door.",
    },
    {
      icon: RefreshCw,
      title: "30-Day Exchanges",
      description:
        "If the size isn't right, request an exchange within 30 days. See our Shipping & Returns page for details.",
    },
  ];

  return (
    <section className="py-20 bg-[#F8F5F1] border-y border-stone-200">
      <div className="max-w-7xl mx-auto px-6">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature, idx) => {
            const Icon = feature.icon;
            return (
              <div
                key={idx}
                className="bg-white p-8 rounded-3xl border border-stone-100 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between"
              >
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-stone-100 text-slate-900 flex items-center justify-center mb-6">
                    <Icon size={26} />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-stone-500 text-sm leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
