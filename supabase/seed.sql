-- =====================================================================
-- NAQSH — seed data. Run AFTER schema.sql. Safe to re-run (never overwrites
-- products you have edited in the admin panel).
-- =====================================================================
insert into public.promo_codes (code, percent, min_subtotal, is_active) values
  ('NAQSH15', 15, 0, true),
  ('FIT15',   15, 0, true)
on conflict (code) do nothing;

insert into public.products
  (id, name, category, sub_category, price, old_price, badge, image_url, description, sizes, stock, sort_order)
values
  (101, 'Royal Jet Black Raw Silk Kurta Shalwar', 'Men', 'Eastern', 135, 165, 'BESTSELLER', '/products/men-black-raw-silk-kurta.webp', 'Tailored from pure raw silk with subtle tonal hand-embroidery on the ban collar and cuffs. Paired with a classic loose-fit shalwar for supreme festive elegance.', array['XS','S','M','L','XL'], 25, 1),
  (102, 'Ivory Boski Silk Kameez Shalwar', 'Men', 'Eastern', 145, 180, 'HERITAGE', '/products/men-ivory-boski-kameez.webp', 'Authentic 6-pound Boski silk finish with an effortless liquid drape. Finished with mother-of-pearl buttons and crisp structural stitching.', array['XS','S','M','L','XL'], 25, 2),
  (103, 'Classic Textured Jamawar Waistcoat', 'Men', 'Eastern', 95, 120, 'FESTIVE', '/products/men-jamawar-waistcoat.webp', 'Intricately woven Jamawar fabric in charcoal and deep gold hues. Features a mandarin collar, welt pockets, and antique brass insignia buttons.', array['XS','S','M','L','XL'], 25, 3),
  (104, 'Embroidered Navy Blue Cotton Kurta', 'Men', 'Eastern', 79, 99, 'NEW', '/products/men-navy-embroidered-kurta.webp', 'Breathable long-staple Egyptian cotton kurta adorned with geometric thread embroidery across the placket. Ideal for Jumu''ah and evening gatherings.', array['XS','S','M','L','XL'], 25, 4),
  (201, 'Noor Luxury Embroidered Lawn 3-Piece', 'Women', 'Eastern', 155, 195, 'BESTSELLER', '/products/women-noor-lawn-suit.webp', 'Heavily embroidered schiffli lawn shirt with intricate floral motifs, accompanied by a digitally printed pure silk dupatta and dyed cambric trousers.', array['XS','S','M','L','XL'], 25, 5),
  (202, 'Royal Velvet Embroidered Shawl & Kurti', 'Women', 'Eastern', 185, 230, 'LUXURY', '/products/women-velvet-kurti-shawl.webp', 'Rich micro-velvet kurti in royal jewel tones paired with an artisan-embroidered tilla and dabka border shawl. The pinnacle of winter festivities.', array['XS','S','M','L','XL'], 25, 6),
  (203, 'Chikankari Ivory Anarkali Pishwas', 'Women', 'Eastern', 169, 210, 'TRENDING', '/products/women-chikankari-anarkali.webp', 'Flowing 16-kali cotton Anarkali pishwas adorned with delicate Lucknowi chikankari thread embroidery and shimmering mukaish accents.', array['XS','S','M','L','XL'], 25, 7),
  (204, 'Zari Embroidered Festive Raw Silk Pret', 'Women', 'Eastern', 139, 175, 'FESTIVE', '/products/women-zari-embroidered-festive.webp', 'Vibrant raw silk tunic with traditional gota patti, kora, and zardozi detailing. Designed with tailored straight pants and an organza dupatta.', array['XS','S','M','L','XL'], 25, 8),
  (301, 'Handcrafted Matte Black Peshawari Chappal', 'Footwear', 'Artisan', 89, 110, 'ICONIC', '/products/peshawari-chappal-black.webp', 'Authentic Norozi-cut Peshawari chappal hand-crafted from full-grain cowhide leather with a Goodyear welt and durable recycled tire sole.', array['40','41','42','43','44'], 25, 9),
  (302, 'Tan Heritage Kaptaan Chappal', 'Footwear', 'Artisan', 95, 120, 'BESTSELLER', '/products/kaptaan-chappal-tan.webp', 'Renowned double-sole Kaptaan design with high-arch support, premium buff leather upper, and hand-finished beeswax edging.', array['40','41','42','43','44'], 25, 10),
  (303, 'Zari & Tilla Embroidered Velvet Khussa', 'Footwear', 'Artisan', 69, 89, 'HANDCRAFTED', '/products/velvet-khussa-embroidered.webp', 'Pure velvet outer with delicate golden zari and tilla threadwork. Soft padded cow leather footbed ensures pinch-free comfort for weddings and Eid.', array['40','41','42','43','44'], 25, 11),
  (304, 'Minimalist White Leather Sneakers', 'Footwear', 'Footwear', 129, 159, 'POPULAR', '/products/white-sneakers.webp', 'Italian nappa leather low-top sneakers with Margom rubber cupsole and memory foam insoles.', array['39','40','41','42','43','44','45'], 25, 12),
  (401, 'Kashmiri Hand-Embroidered Pashmina Shawl', 'Accessories', 'Heritage', 189, 240, 'LUXURY', '/products/pashmina-shawl-luxury.webp', 'Hand-spun ultra-soft pure Himalayan Pashmina wool featuring traditional Sozni paisley needlework along the borders and hand-knotted fringe.', array['One Size'], 25, 13),
  (10, 'Artisan Tanned Leather Weekend Bag', 'Accessories', 'Leather', 149, 179, 'LUXURY', '/products/leather-bag.webp', 'Handcrafted from vegetable-tanned full-grain leather with antique brass hardware and cotton canvas lining.', array['One Size'], 25, 14),
  (11, 'Classic Embroidered NAQSH Cap', 'Accessories', 'Accessories', 39, 49, 'NEW', '/products/classic-cap.webp', 'Six-panel washed cotton twill cap featuring 3D tonal NAQSH embroidery and brass clasp slider.', array['One Size'], 25, 15),
  (1, 'Oversized White T-Shirt', 'Men', 'Streetwear', 69, 89, 'NEW', '/products/oversized-white-tshirt.webp', '320 GSM heavyweight combed organic cotton t-shirt with signature dropped shoulders and reinforced collar ribbing.', array['XS','S','M','L','XL'], 25, 16),
  (2, 'Black Oversized T-Shirt', 'Men', 'Streetwear', 65, 85, 'HOT', '/products/black-oversized-tshirt.webp', 'Pitch black pigment-dyed t-shirt. Deep saturated color fastness with dense, boxy architectural drape.', array['XS','S','M','L','XL'], 25, 17),
  (3, 'Premium Charcoal Hoodie', 'Unisex', 'Streetwear', 79, 99, 'BEST', '/products/premium-hoodie.webp', '420 GSM French Terry heavyweight fleece with double-lined hood and seamless kangaroo pouch pocket.', array['XS','S','M','L','XL'], 25, 18),
  (4, 'Slim Fit Indigo Denim Jacket', 'Men', 'Streetwear', 119, 149, 'SALE', '/products/slim-fit-denim-jacket.webp', 'Japanese selvedge denim jacket with custom NAQSH engraved shank buttons and contrast tobacco stitching.', array['XS','S','M','L','XL'], 25, 19),
  (5, 'Tailored Linen Casual Shirt', 'Men', 'Streetwear', 74, 94, 'NEW', '/products/linen-shirt.webp', 'Pure European flax linen shirt featuring a relaxed camp collar and mother-of-pearl buttons.', array['XS','S','M','L','XL'], 25, 20),
  (6, 'Architectural Tailored Blazer', 'Women', 'Contemporary', 99, 129, 'NEW', '/products/womens-blazer.webp', 'Structured wool-blend blazer featuring clean peak lapels and a sculpted waistline.', array['XS','S','M','L','XL'], 25, 21),
  (7, 'Minimalist Silk Slip Dress', 'Women', 'Contemporary', 109, 139, 'TRENDING', '/products/womens-dress.webp', 'Bias-cut mulberry silk dress with adjustable delicate straps and an effortless cascading hem.', array['XS','S','M','L','XL'], 25, 22),
  (9, 'Tactical Pleated Cargo Pants', 'Men', 'Streetwear', 89, 109, 'NEW', '/products/cargo-pants.webp', 'Heavyweight ripstop cotton cargo trousers with deep bellow pockets and adjustable ankle cinches.', array['XS','S','M','L','XL'], 25, 23)
on conflict (id) do nothing;

-- next admin-created product gets an id above the seeded ones
select setval(pg_get_serial_sequence('public.products', 'id'),
              greatest((select max(id) from public.products), 1000));
