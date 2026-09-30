import { Link } from "react-router-dom";

const categories = [
  {
    title: "Men",
    subtitle: "Kurta Shalwar & Waistcoats",
    image: "/products/men-black-raw-silk-kurta.webp",
  },
  {
    title: "Women",
    subtitle: "Lawn & Embroidered Pret",
    image: "/products/women-noor-lawn-suit.webp",
  },
  {
    title: "Footwear",
    subtitle: "Peshawari & Khussa",
    image: "/products/peshawari-chappal-black.webp",
  },
  {
    title: "Accessories",
    subtitle: "Shawls & Artisan Leather",
    image: "/products/pashmina-shawl-luxury.webp",
  },
];

export default function Categories() {
  return (
    <section className="bg-[#F8F5F1] py-24">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-16">
          <p className="uppercase tracking-[6px] text-blue-600 font-semibold text-sm mb-4">
            CURATED ARCHIVES
          </p>

          <h2 className="text-4xl md:text-6xl font-black text-slate-900 mb-5 tracking-tight">
            Shop by Category
          </h2>

          <p className="text-gray-500 text-lg max-w-2xl mx-auto">
            Explore bespoke Pakistani silhouettes, handcrafted footwear, and modern essentials. Wear Your Identity.
          </p>
        </div>

        {/* Cards Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {categories.map((category) => (
            <Link
              key={category.title}
              to={`/shop?category=${encodeURIComponent(category.title)}`}
              className="group relative h-[480px] rounded-[28px] overflow-hidden shadow-xl cursor-pointer block"
            >
              <img
              loading="lazy"
                src={category.image}
                alt={category.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
              />

              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent"></div>

              <div className="absolute bottom-6 left-6 right-6">
                <p className="uppercase tracking-[3px] text-white/80 text-xs font-semibold mb-1">
                  {category.subtitle}
                </p>

                <h3 className="text-white text-3xl font-black mb-4">
                  {category.title}
                </h3>

                <span className="inline-block bg-white text-slate-900 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-300 group-hover:bg-slate-900 group-hover:text-white shadow-md">
                  Explore →
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}