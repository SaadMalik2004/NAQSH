import { Link } from "react-router-dom";

export default function Hero() {
  return (
    <section className="bg-[#F8F5F1] overflow-hidden">
      <div className="max-w-[1800px] mx-auto min-h-[95vh] flex items-center pl-6 sm:pl-8">

        <div className="grid lg:grid-cols-[35%_65%] items-center w-full gap-10">

          {/* LEFT */}

          <div className="pr-6 sm:pr-10 py-10 lg:py-0">
            <p className="uppercase tracking-[7px] text-blue-600 font-semibold mb-6">
              NAQSH COUTURE & ARCHIVE
            </p>

            <h1 className="text-6xl lg:text-[88px] font-black leading-[0.94] text-slate-900 tracking-tight">
              Wear Your
              <br />
              <span className="text-blue-600">Identity.</span>
            </h1>

            <p className="mt-8 text-slate-600 text-xl leading-9 max-w-lg">
              Embrace timeless Pakistani heritage, bespoke craftsmanship, and contemporary silhouettes.
              From regal raw silk and festive lawn to authentic handcrafted Peshawaris.
            </p>

            <div className="flex flex-wrap gap-4 mt-12">
              <Link
                to="/shop"
                className="bg-slate-900 text-white px-8 sm:px-10 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-black hover:scale-105 hover:shadow-2xl inline-block"
              >
                Shop Now
              </Link>

              <Link
                to="/shop"
                className="border-2 border-slate-900 px-8 sm:px-10 py-4 rounded-full font-semibold transition-all duration-300 hover:bg-slate-900 hover:text-white hover:scale-105 hover:shadow-xl inline-block"
              >
                Explore
              </Link>
            </div>

            <div className="flex flex-wrap gap-x-12 gap-y-6 mt-16">
              <div>
                <h2 className="text-4xl font-bold">4</h2>
                <p className="text-gray-500 mt-2">Curated Collections</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold">$100+</h2>
                <p className="text-gray-500 mt-2">Free Shipping</p>
              </div>

              <div>
                <h2 className="text-4xl font-bold">30</h2>
                <p className="text-gray-500 mt-2">Day Exchanges</p>
              </div>
            </div>
          </div>

          {/* RIGHT */}

          <div className="relative h-[60vh] lg:h-[95vh] overflow-hidden rounded-l-[40px]">

            <img
              src="/hero.webp"
              alt="NAQSH models wearing Pakistani heritage fashion"
              fetchPriority="high"
              decoding="async"
              className="w-full h-full object-cover object-left shadow-[0_40px_80px_rgba(0,0,0,0.18)]"
            />

          </div>

        </div>

      </div>
    </section>
  );
}