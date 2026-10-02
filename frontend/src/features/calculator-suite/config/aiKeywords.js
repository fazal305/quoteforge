/**
 * Keyword dictionary for the local AI Pricing Assistant. This is plain
 * substring matching against lowercased input — no network call, no
 * external model, nothing sent anywhere. It is intentionally simple and
 * inspectable: if a phrase should trigger a feature/project type and
 * doesn't, add it here.
 */

export const projectTypeKeywords = {
  ecommerce_website: [
    "e-commerce",
    "ecommerce",
    "online store",
    "online shop",
    "clothing brand",
    "product catalog",
    "sell products",
    "shopping cart",
  ],
  restaurant_website: [
    "restaurant",
    "cafe",
    "menu",
    "food ordering",
    "caterer",
    "catering",
  ],
  booking_website: ["booking", "appointment", "reservation", "scheduling site"],
  blog_cms: ["blog", "articles", "content management", "news site"],
  saas_mvp: ["saas", "subscription product", "mvp", "multi-tenant"],
  web_application: [
    "web app",
    "web application",
    "internal tool",
    "custom dashboard",
  ],
  portfolio_website: ["portfolio", "personal website", "showcase my work"],
  landing_page: ["landing page", "one page site", "single page site"],
  business_website: ["business website", "company website", "corporate site"],
};

export const featureKeywords = {
  login: ["login", "log in", "sign in"],
  registration: [
    "registration",
    "sign up",
    "signup",
    "create account",
    "customer accounts",
    "user accounts",
  ],
  password_reset: ["password reset", "forgot password"],
  social_login: [
    "social login",
    "google login",
    "facebook login",
    "sign in with google",
  ],
  rbac: ["role-based", "roles and permissions", "multiple user roles"],

  simple_db: ["database", "store data", "store customer data"],

  admin_dashboard: [
    "admin panel",
    "admin dashboard",
    "admin area",
    "back office",
    "backend panel",
  ],
  cms: ["cms", "content management system"],
  user_management: ["manage users", "manage customers", "user management"],
  analytics_dashboard: ["analytics dashboard", "analytics"],

  stripe: ["stripe"],
  paypal: ["paypal"],
  local_payment_gateway: ["jazzcash", "easypaisa", "local payment gateway"],
  subscription_billing: [
    "subscription billing",
    "recurring billing",
    "recurring payments",
  ],

  email_integration: [
    "email notifications",
    "email confirmations",
    "send emails",
  ],
  whatsapp_integration: ["whatsapp"],
  sms_integration: ["sms", "text message notifications"],
  push_notifications: ["push notification"],

  google_maps: ["google maps", "location map", "map integration"],
  google_analytics: ["google analytics"],
  calendar_integration: ["calendar sync", "google calendar"],
  crm_integration: ["crm"],
  third_party_api: ["third-party api", "external api", "api integration"],

  ai_integration: [
    "ai feature",
    "chatbot",
    "ai assistant",
    "artificial intelligence",
  ],
  search: ["search bar", "search feature", "search functionality"],
  file_uploads: [
    "file upload",
    "upload images",
    "upload documents",
    "image upload",
  ],
  realtime_updates: ["real-time", "realtime", "live updates"],
  websockets: ["websocket", "live chat", "chat feature"],
  notifications_system: [
    "in-app notification",
    "notification center",
    "order tracking",
  ],
};

/** Generic payment mentions that don't name a specific gateway default to Stripe for review. */
export const genericPaymentKeywords = [
  "online payment",
  "payments",
  "payment gateway",
  "accept payments",
];
