// Central place for business details shown across the site (footer, contact page, policies).
// TODO(owner): replace the placeholder values below with your real business details.
export const SITE = {
  name: "NAQSH",
  tagline: "Wear Your Identity",
  email: "support@naqsh.example",
  phone: "+92 300 0000000",
  address: "NAQSH Studio, Lahore, Pakistan",
  hours: "Mon – Sat, 10:00 – 18:00 (PKT)",
  socials: {
    instagram: "https://www.instagram.com/",
    facebook: "https://www.facebook.com/",
  },
};

// Business rules shown in the UI. The database function place_order() enforces
// the same numbers on the server (see supabase/schema.sql) — change both together.
export const SHOP_RULES = {
  freeShippingThreshold: 100,
  flatShippingFee: 15,
  maxQtyPerItem: 10,
};

export const PAYMENT_METHODS = [
  {
    id: "cod",
    label: "Cash on Delivery",
    hint: "Pay in cash when your order arrives",
  },
  {
    id: "bank_transfer",
    label: "Bank / Mobile Wallet Transfer",
    hint: "We email you the account details after you place the order",
  },
];
