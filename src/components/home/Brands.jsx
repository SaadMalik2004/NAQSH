export default function Brands() {
  const heritageHouses = [
    { name: "PESHAWAR", craft: "Handmade Chappal Guild" },
    { name: "LAHORE", craft: "Festive Pret & Zardozi" },
    { name: "MULTAN", craft: "Hand-loomed Boski & Lawn" },
    { name: "KASHMIR", craft: "Pure Wool Pashmina" },
    { name: "KARACHI", craft: "Contemporary Silhouettes" },
    { name: "SWAT", craft: "Heritage Silk Weaves" },
  ];

  return (
    <section className="bg-white py-20 border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-6">
        {/* Heading */}
        <div className="text-center mb-14">
          <p className="uppercase tracking-[8px] text-blue-600 text-xs font-bold mb-3">
            ARTISAN HERITAGE
          </p>

          <h2 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight">
            Inspired by Traditional Craft Centres
          </h2>

          <p className="text-gray-500 mt-3 max-w-2xl mx-auto text-sm">
            Our designs draw on the textile, embroidery and footwear traditions of Pakistan's historic craft centres.
          </p>
        </div>

        {/* Brand / Guild Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-5">
          {heritageHouses.map((item) => (
            <div
              key={item.name}
              className="
                bg-[#FAF8F5]
                rounded-2xl
                p-5
                h-32
                flex
                flex-col
                items-center
                justify-center
                text-center
                border
                border-gray-200/70
                transition-all
                duration-300
                hover:bg-white
                hover:border-slate-900
                hover:shadow-xl
                hover:-translate-y-1.5
                cursor-default
                group
              "
            >
              <span className="text-lg md:text-xl font-black text-slate-800 tracking-[3px] group-hover:text-blue-600 transition">
                {item.name}
              </span>
              <span className="text-[10px] text-gray-500 font-medium mt-1 uppercase tracking-wider">
                {item.craft}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}