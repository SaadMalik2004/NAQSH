
import Hero from "../../components/home/Hero";
import Brands from "../../components/home/Brands";
import Categories from "../../components/home/Categories";
import FeaturedProducts from "../../components/home/FeaturedProducts";
import WhyChooseUs from "../../components/home/WhyChooseUs";
import Testimonials from "../../components/home/Testimonials";
import Newsletter from "../../components/home/Newsletter";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Hero />
      <Brands />
      <Categories />
      <FeaturedProducts />
      <WhyChooseUs />
      <Testimonials />
      <Newsletter />
    </div>
  );
}