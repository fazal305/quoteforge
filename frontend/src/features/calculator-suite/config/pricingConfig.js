/**
 * DEVELOPMENT DEFAULTS — pricing configuration engine.
 *
 * Every hour/multiplier below is a starting-point estimate, not a market
 * benchmark. All of it is meant to be edited from the Settings screen as
 * you learn what your own projects actually take. Nothing here is pulled
 * from external market data — see the AI/Market Context screens for the
 * distinction between "your configured estimate" and "externally sourced
 * data" (which is always labeled with a source and date when present).
 *
 * The calculation pipeline that consumes this config is:
 *
 *   base project hours (by project type)
 *     + page hours (by page type × quantity)
 *     + feature hours (by selected feature)
 *   × complexity multiplier
 *   -> hours -> cost via effective hourly rate
 *   effective hourly rate = recommended hourly rate
 *     × experience multiplier
 *     × market positioning multiplier
 *     × (1 + sum of specialization bonuses)
 *   subtotal × (1 + urgency multiplier - 1) ... see calculation engine
 *   + risk / contingency
 *   + optional maintenance / hosting (shown separately, not in core total)
 */

export const BREAKDOWN_CATEGORY_LABELS = {
  design: "Design & UX",
  frontend: "Frontend Development",
  backend: "Backend Development",
  database: "Database",
  admin: "Admin & Dashboard",
  integrations: "Integrations",
  testing: "Testing & QA",
  deployment: "Deployment",
};

export const FEATURE_CATEGORY_LABELS = {
  authentication: "Authentication",
  database: "Database",
  admin: "Admin",
  payments: "Payments",
  communication: "Communication",
  integrations: "Integrations",
  advanced: "Advanced",
};

export const complexityLevels = [
  {
    id: "simple",
    label: "Simple",
    description: "Few moving parts, mostly static content, minimal logic.",
    multiplier: 1.0,
  },
  {
    id: "standard",
    label: "Standard",
    description:
      "Typical business site: some dynamic content, a few integrations.",
    multiplier: 1.15,
  },
  {
    id: "complex",
    label: "Complex",
    description:
      "Multiple interacting systems, custom logic, non-trivial data model.",
    multiplier: 1.35,
  },
  {
    id: "very_complex",
    label: "Very Complex",
    description:
      "Many interdependent systems, real-time or AI components, high uncertainty.",
    multiplier: 1.6,
  },
];

export const pageTypes = [
  { id: "home", label: "Home", hours: 7, category: "design" },
  { id: "about", label: "About", hours: 3, category: "frontend" },
  { id: "services", label: "Services", hours: 4, category: "frontend" },
  { id: "contact", label: "Contact", hours: 3, category: "frontend" },
  { id: "blog_index", label: "Blog (index)", hours: 5, category: "frontend" },
  { id: "faq", label: "FAQ", hours: 2, category: "frontend" },
  {
    id: "portfolio",
    label: "Portfolio / Work",
    hours: 5,
    category: "frontend",
  },
  { id: "pricing", label: "Pricing", hours: 4, category: "frontend" },
  {
    id: "legal",
    label: "Legal (Privacy / Terms)",
    hours: 2,
    category: "frontend",
  },
];

export const DEFAULT_CUSTOM_PAGE_HOURS = 4;

export const projectTypes = [
  {
    id: "landing_page",
    label: "Landing Page",
    description: "Single-page site focused on one conversion goal.",
    baseHours: 12,
    defaultComplexity: "simple",
    suggestedPageIds: ["home"],
    suggestedFeatureIds: [],
  },
  {
    id: "business_website",
    label: "Business Website",
    description:
      "Multi-page informational site for a local or service business.",
    baseHours: 18,
    defaultComplexity: "standard",
    suggestedPageIds: ["home", "about", "services", "contact", "faq"],
    suggestedFeatureIds: ["email_integration", "google_analytics"],
  },
  {
    id: "portfolio_website",
    label: "Portfolio Website",
    description: "Personal or studio portfolio showcasing work.",
    baseHours: 14,
    defaultComplexity: "simple",
    suggestedPageIds: ["home", "about", "portfolio", "contact"],
    suggestedFeatureIds: [],
  },
  {
    id: "ecommerce_website",
    label: "E-commerce Website",
    description: "Online store with catalog, cart, and checkout.",
    baseHours: 36,
    defaultComplexity: "complex",
    suggestedPageIds: ["home", "about", "contact", "faq", "legal"],
    suggestedFeatureIds: [
      "simple_db",
      "file_uploads",
      "stripe",
      "user_management",
      "search",
    ],
  },
  {
    id: "restaurant_website",
    label: "Restaurant Website",
    description: "Menu, location, and (optionally) online ordering.",
    baseHours: 20,
    defaultComplexity: "standard",
    suggestedPageIds: ["home", "about", "contact"],
    suggestedFeatureIds: ["google_maps", "whatsapp_integration"],
  },
  {
    id: "booking_website",
    label: "Booking Website",
    description:
      "Appointment or reservation scheduling with availability logic.",
    baseHours: 28,
    defaultComplexity: "complex",
    suggestedPageIds: ["home", "about", "services", "contact", "faq"],
    suggestedFeatureIds: [
      "calendar_integration",
      "email_integration",
      "relational_db",
    ],
  },
  {
    id: "blog_cms",
    label: "Blog / CMS",
    description: "Content-driven site with an editable content backend.",
    baseHours: 22,
    defaultComplexity: "standard",
    suggestedPageIds: ["home", "about", "blog_index", "contact"],
    suggestedFeatureIds: ["cms", "simple_db", "search"],
  },
  {
    id: "web_application",
    label: "Web Application",
    description: "Custom application with accounts, data, and workflows.",
    baseHours: 46,
    defaultComplexity: "complex",
    suggestedPageIds: ["home", "about", "contact"],
    suggestedFeatureIds: [
      "login",
      "registration",
      "relational_db",
      "admin_dashboard",
    ],
  },
  {
    id: "saas_mvp",
    label: "SaaS MVP",
    description:
      "Multi-tenant product with subscriptions and an admin surface.",
    baseHours: 64,
    defaultComplexity: "very_complex",
    suggestedPageIds: ["home", "pricing", "faq"],
    suggestedFeatureIds: [
      "login",
      "registration",
      "rbac",
      "relational_db",
      "subscription_billing",
      "admin_dashboard",
      "analytics_dashboard",
    ],
  },
  {
    id: "custom_web_application",
    label: "Custom Web Application",
    description: "Doesn't fit the presets — scope it manually below.",
    baseHours: 30,
    defaultComplexity: "standard",
    suggestedPageIds: ["home"],
    suggestedFeatureIds: [],
  },
];

export const features = [
  // Authentication
  {
    id: "login",
    label: "Login",
    category: "authentication",
    breakdownCategory: "backend",
    hours: 6,
    complexity: "low",
    description: "Email/password sign-in with session handling.",
  },
  {
    id: "registration",
    label: "Registration",
    category: "authentication",
    breakdownCategory: "backend",
    hours: 6,
    complexity: "low",
    description: "Account creation with validation and confirmation.",
    relatedFeatureIds: ["login"],
  },
  {
    id: "password_reset",
    label: "Password Reset",
    category: "authentication",
    breakdownCategory: "backend",
    hours: 4,
    complexity: "low",
    description: "Forgot-password flow via email token.",
    relatedFeatureIds: ["login"],
  },
  {
    id: "social_login",
    label: "Social Login",
    category: "authentication",
    breakdownCategory: "backend",
    hours: 8,
    complexity: "medium",
    description: "Sign in with Google/Facebook/etc. via OAuth.",
    relatedFeatureIds: ["login"],
  },
  {
    id: "rbac",
    label: "Role-Based Access",
    category: "authentication",
    breakdownCategory: "backend",
    hours: 10,
    complexity: "high",
    description: "Multiple user roles with different permissions.",
    relatedFeatureIds: ["login", "user_management"],
  },

  // Database
  {
    id: "simple_db",
    label: "Simple Database",
    category: "database",
    breakdownCategory: "database",
    hours: 8,
    complexity: "low",
    description: "A handful of related tables/collections, basic CRUD.",
  },
  {
    id: "relational_db",
    label: "Relational Database",
    category: "database",
    breakdownCategory: "database",
    hours: 16,
    complexity: "medium",
    description: "Normalized schema with meaningful relationships.",
  },
  {
    id: "complex_relations",
    label: "Complex Data Relationships",
    category: "database",
    breakdownCategory: "database",
    hours: 28,
    complexity: "high",
    description: "Many-to-many, nested, or highly interdependent data models.",
    relatedFeatureIds: ["relational_db"],
  },

  // Admin
  {
    id: "admin_dashboard",
    label: "Admin Dashboard",
    category: "admin",
    breakdownCategory: "admin",
    hours: 20,
    complexity: "medium",
    description: "Internal screen for managing site content/data.",
  },
  {
    id: "cms",
    label: "CMS",
    category: "admin",
    breakdownCategory: "admin",
    hours: 24,
    complexity: "medium",
    description: "Structured content editing for non-technical users.",
  },
  {
    id: "user_management",
    label: "User Management",
    category: "admin",
    breakdownCategory: "admin",
    hours: 14,
    complexity: "medium",
    description: "Admin screens to view/edit/suspend user accounts.",
    relatedFeatureIds: ["login"],
  },
  {
    id: "analytics_dashboard",
    label: "Analytics Dashboard",
    category: "admin",
    breakdownCategory: "admin",
    hours: 16,
    complexity: "medium",
    description: "Internal charts/metrics view built from your own data.",
  },

  // Payments
  {
    id: "stripe",
    label: "Stripe",
    category: "payments",
    breakdownCategory: "backend",
    hours: 12,
    complexity: "medium",
    description: "Card payments via Stripe Checkout or Elements.",
  },
  {
    id: "paypal",
    label: "PayPal",
    category: "payments",
    breakdownCategory: "backend",
    hours: 10,
    complexity: "medium",
    description: "PayPal checkout integration.",
  },
  {
    id: "local_payment_gateway",
    label: "Local Payment Gateway",
    category: "payments",
    breakdownCategory: "backend",
    hours: 16,
    complexity: "high",
    description:
      "Regional gateway (e.g. JazzCash, Easypaisa) — thinner docs, more edge cases.",
  },
  {
    id: "subscription_billing",
    label: "Subscription Billing",
    category: "payments",
    breakdownCategory: "backend",
    hours: 20,
    complexity: "high",
    description: "Recurring plans, upgrades/downgrades, invoices.",
    relatedFeatureIds: ["stripe"],
  },

  // Communication
  {
    id: "email_integration",
    label: "Email",
    category: "communication",
    breakdownCategory: "backend",
    hours: 5,
    complexity: "low",
    description: "Transactional email (confirmations, notifications).",
  },
  {
    id: "whatsapp_integration",
    label: "WhatsApp",
    category: "communication",
    breakdownCategory: "integrations",
    hours: 10,
    complexity: "medium",
    description: "WhatsApp Business API or click-to-chat integration.",
  },
  {
    id: "sms_integration",
    label: "SMS",
    category: "communication",
    breakdownCategory: "integrations",
    hours: 8,
    complexity: "medium",
    description: "SMS notifications via a provider API.",
  },
  {
    id: "push_notifications",
    label: "Push Notifications",
    category: "communication",
    breakdownCategory: "integrations",
    hours: 10,
    complexity: "medium",
    description: "Browser or mobile push notifications.",
  },

  // Integrations
  {
    id: "google_maps",
    label: "Google Maps",
    category: "integrations",
    breakdownCategory: "integrations",
    hours: 4,
    complexity: "low",
    description: "Embedded map with location markers.",
  },
  {
    id: "google_analytics",
    label: "Google Analytics",
    category: "integrations",
    breakdownCategory: "integrations",
    hours: 2,
    complexity: "low",
    description: "Traffic/analytics tracking setup.",
  },
  {
    id: "calendar_integration",
    label: "Calendar",
    category: "integrations",
    breakdownCategory: "integrations",
    hours: 8,
    complexity: "medium",
    description: "Google Calendar or similar scheduling sync.",
  },
  {
    id: "crm_integration",
    label: "CRM",
    category: "integrations",
    breakdownCategory: "integrations",
    hours: 14,
    complexity: "high",
    description: "Sync leads/contacts with an external CRM.",
  },
  {
    id: "third_party_api",
    label: "Third-Party API (generic)",
    category: "integrations",
    breakdownCategory: "integrations",
    hours: 10,
    complexity: "medium",
    description: "A one-off integration with an external API not listed here.",
  },

  // Advanced
  {
    id: "ai_integration",
    label: "AI Integration",
    category: "advanced",
    breakdownCategory: "backend",
    hours: 18,
    complexity: "high",
    description:
      "LLM-backed feature (e.g. assistant, generation, classification).",
  },
  {
    id: "search",
    label: "Search",
    category: "advanced",
    breakdownCategory: "backend",
    hours: 10,
    complexity: "medium",
    description: "Full-text or filtered search across content/data.",
  },
  {
    id: "file_uploads",
    label: "File Uploads",
    category: "advanced",
    breakdownCategory: "backend",
    hours: 6,
    complexity: "low",
    description: "Image/document upload with storage.",
  },
  {
    id: "realtime_updates",
    label: "Real-Time Updates",
    category: "advanced",
    breakdownCategory: "backend",
    hours: 16,
    complexity: "high",
    description: "Live data updates without a page refresh.",
  },
  {
    id: "websockets",
    label: "WebSockets",
    category: "advanced",
    breakdownCategory: "backend",
    hours: 14,
    complexity: "high",
    description:
      "Persistent bidirectional connection (chat, live collaboration).",
    relatedFeatureIds: ["realtime_updates"],
  },
  {
    id: "notifications_system",
    label: "In-App Notifications",
    category: "advanced",
    breakdownCategory: "backend",
    hours: 8,
    complexity: "medium",
    description: "In-product notification center.",
  },
];

export const experienceLevels = [
  {
    id: "beginner",
    label: "Beginner",
    description: "Learning fundamentals, limited shipped project history.",
    rateMultiplier: 0.8,
  },
  {
    id: "junior",
    label: "Junior",
    description: "Can ship real projects independently with some guidance.",
    rateMultiplier: 1.0,
  },
  {
    id: "intermediate",
    label: "Intermediate",
    description: "Comfortable owning a project end-to-end.",
    rateMultiplier: 1.35,
  },
  {
    id: "senior",
    label: "Senior",
    description:
      "Deep experience, handles ambiguity and architecture decisions.",
    rateMultiplier: 1.8,
  },
  {
    id: "specialist",
    label: "Specialist",
    description: "Recognized expert in a specific, hard-to-find niche.",
    rateMultiplier: 2.4,
  },
];

export const specializations = [
  {
    id: "ai",
    label: "AI",
    description: "LLM/ML features and integration.",
    rateBonus: 0.3,
  },
  {
    id: "security",
    label: "Security",
    description: "Security-hardened builds.",
    rateBonus: 0.25,
  },
  {
    id: "performance",
    label: "Performance",
    description: "Performance-critical optimization work.",
    rateBonus: 0.2,
  },
  {
    id: "devops",
    label: "DevOps",
    description: "Infrastructure and deployment pipelines.",
    rateBonus: 0.2,
  },
  {
    id: "data_engineering",
    label: "Data Engineering",
    description: "Complex data pipelines/modeling.",
    rateBonus: 0.25,
  },
  {
    id: "complex_react",
    label: "Complex React",
    description: "Advanced state, rendering, or animation work.",
    rateBonus: 0.15,
  },
  {
    id: "backend_engineering",
    label: "Backend Engineering",
    description: "Deep backend architecture experience.",
    rateBonus: 0.15,
  },
  {
    id: "realtime_systems",
    label: "Real-Time Systems",
    description: "Live/collaborative system design.",
    rateBonus: 0.25,
  },
];

export const marketPositioning = [
  {
    id: "local",
    label: "Local Market",
    description: "Pricing calibrated to your local market and cost of living.",
    rateMultiplier: 1.0,
  },
  {
    id: "international",
    label: "International Market",
    description: "Pricing for clients paying in a stronger currency, remotely.",
    rateMultiplier: 1.4,
  },
  {
    id: "premium",
    label: "Premium Positioning",
    description:
      "Positioned as a premium specialist offering, not a commodity rate.",
    rateMultiplier: 1.9,
  },
];

export const urgencyLevels = [
  {
    id: "normal",
    label: "Normal",
    description: "Standard scheduling, no disruption to other work.",
    multiplier: 1.0,
    timelineImpact: "Standard timeline.",
  },
  {
    id: "priority",
    label: "Priority",
    description: "Moved ahead of some other work; modest schedule pressure.",
    multiplier: 1.15,
    timelineImpact: "Timeline compressed by roughly 20–30%.",
  },
  {
    id: "rush",
    label: "Rush",
    description: "Requires overtime and displacing other client work.",
    multiplier: 1.35,
    timelineImpact: "Timeline compressed by 40%+; other work is disrupted.",
  },
];

export const revisions = {
  includedRounds: 2,
  hoursPerAdditionalRound: 4,
};

export const maintenancePlans = [
  {
    id: "monthly",
    label: "Monthly Maintenance",
    cadence: "monthly",
    description: "Bug fixes, minor updates, and uptime monitoring.",
    hoursPerCycle: 3,
    includes: ["Bug fixes", "Minor content updates", "Uptime monitoring"],
  },
  {
    id: "quarterly",
    label: "Quarterly Maintenance",
    cadence: "quarterly",
    description: "Periodic updates and a security/backup review.",
    hoursPerCycle: 8,
    includes: ["Dependency updates", "Backups review", "Security patching"],
  },
  {
    id: "annual",
    label: "Annual Maintenance",
    cadence: "annual",
    description: "A yearly retainer bundling ongoing support.",
    hoursPerCycle: 26,
    includes: [
      "Everything in Quarterly",
      "Priority response time",
      "Content updates",
    ],
  },
];

export const hostingItems = [
  {
    id: "domain",
    label: "Domain Registration",
    type: "recurring",
    cadence: "annual",
    price: 14,
    currency: "USD",
    description: "A standard .com-equivalent domain, renewed yearly.",
  },
  {
    id: "shared_hosting",
    label: "Shared/Static Hosting",
    type: "recurring",
    cadence: "annual",
    price: 60,
    currency: "USD",
    description: "Hosting for a standard marketing/business site.",
  },
  {
    id: "ssl",
    label: "SSL Certificate",
    type: "recurring",
    cadence: "annual",
    price: 0,
    currency: "USD",
    description: "Usually free (Let's Encrypt) via most modern hosts.",
  },
  {
    id: "business_email",
    label: "Business Email",
    type: "recurring",
    cadence: "monthly",
    price: 6,
    currency: "USD",
    description: "Per-mailbox cost for a hosted business email provider.",
  },
  {
    id: "cloud_hosting",
    label: "Cloud/App Hosting",
    type: "recurring",
    cadence: "monthly",
    price: 12,
    currency: "USD",
    description: "For apps needing a server/runtime, not just static hosting.",
  },
  {
    id: "database_hosting",
    label: "Database Hosting",
    type: "recurring",
    cadence: "monthly",
    price: 10,
    currency: "USD",
    description: "Managed database instance.",
  },
  {
    id: "cdn",
    label: "CDN",
    type: "recurring",
    cadence: "monthly",
    price: 0,
    currency: "USD",
    description: "Often free at low traffic on most modern CDNs.",
  },
];

export const contingencyOptions = [
  {
    id: "low",
    label: "10%",
    percent: 10,
    description: "Well-understood scope, returning client, low ambiguity.",
  },
  {
    id: "standard",
    label: "15%",
    percent: 15,
    description: "Typical project with some unknowns.",
  },
  {
    id: "high",
    label: "20%",
    percent: 20,
    description: "New client, unclear requirements, or novel integrations.",
  },
];

export const defaultContingencyPercent = 15;

/** How baseline project-setup hours split across breakdown categories. Must sum to 1. */
export const baseHoursSplit = {
  design: 0.3,
  frontend: 0.5,
  deployment: 0.2,
};

/** Testing/QA hours, modeled as a percentage of all other development hours rather than a flat guess. */
export const testingPercentOfDevHours = 10;

export const quoteRange = {
  minimumFactor: 0.92,
  premiumFactor: 1.2,
};

export const pricingConfig = {
  projectTypes,
  complexityLevels,
  pageTypes,
  features,
  experienceLevels,
  specializations,
  marketPositioning,
  urgencyLevels,
  revisions,
  maintenancePlans,
  hostingItems,
  contingencyOptions,
  defaultContingencyPercent,
  baseHoursSplit,
  testingPercentOfDevHours,
  quoteRange,
};
