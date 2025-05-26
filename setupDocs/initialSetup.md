**Project: Modern Frontend Starter for [Your Platform Name] - A Business Acquisition Platform**

**Platform Mission (to guide design):**
"[Your Platform Name] is to transform how entrepreneurs and investors buy and sell small businesses—streamlining acquisitions from months to weeks. By combining intelligent matchmaking, integrated legal and financial tools, standardized processes, and hands-on support, we deliver faster, simpler, and more trusted transactions that fuel economic opportunity."

**Platform Vision (to guide design):**
"[Your Platform Name] is to redefine small business acquisitions by building the leading platform where entrepreneurs and investors connect to buy and sell with speed, trust, and simplicity. By powering billions in future transactions through innovative technology, strategic partnerships, and standardized deal infrastructure, we aim to unlock a more accessible, dynamic market that drives economic growth across communities."

**Objective:**
Generate the HTML structure and Tailwind CSS styling for the key frontend pages of [Your Platform Name]. The design should be exceptionally modern, intuitive, trustworthy, and efficient, directly reflecting our mission to streamline and simplify business acquisitions. It should feel like a sophisticated fintech or SaaS platform, going beyond a traditional listing site.

**Core Pages to Generate (MVP with modern enhancements):**

1.  **Homepage (`index.html`)**
2.  **Search & Discovery Page (`search-discovery.html`)** (Evolved from simple search results)
3.  **Business Profile Page (`business-profile.html`)** (Evolved from listing detail)
4.  **User Dashboard (`dashboard.html`)** (For buyers/sellers)
5.  **(Conceptual) Deal Room / Acquisition Workflow Page (`deal-room.html`)** (Focus on layout and key component placeholders)

**General Styling & UX/UI Best Practices:**

*   **Aesthetic:** Clean, minimalist, sophisticated, data-driven, and trustworthy. Think modern SaaS/Fintech.
*   **Color Palette:**
    *   Primary: A strong, modern blue (e.g., `bg-indigo-600`, `text-indigo-600`) or a professional dark teal.
    *   Secondary: Lighter shades of the primary, or complementary grays (e.g., `bg-slate-100`, `text-slate-700`).
    *   Accent: A vibrant color for key CTAs that signals action and progress (e.g., a bright green `bg-green-500` for success/next step, or a dynamic orange).
    *   Neutrals: Off-whites, various shades of gray for text, backgrounds, and borders (`bg-white`, `text-slate-900`, `border-slate-200`).
*   **Typography:**
    *   Font Family: Modern, highly legible sans-serif (e.g., Inter, Manrope, or similar via Tailwind's default sans stack). Prioritize clarity and hierarchy.
    *   Spacing: Generous whitespace, consistent padding/margins for a breathable layout. Use Tailwind's spacing scale effectively.
*   **Interactivity (Visual Cues & Structure for JS):**
    *   Hover states, focus states for all interactive elements.
    *   Smooth transitions (can be suggested with Tailwind classes, actual implementation is JS/CSS).
    *   Placeholders for interactive elements like charts, progress bars, dynamic filters.
*   **Iconography:**
    *   Use modern, clean line icons. Suggest using a popular library like Heroicons (SVG) or Lucide Icons if the AI can structure for them (e.g., `<!-- [ICON: search] -->` or `<svg>...</svg>` if it can generate).
*   **Components:**
    *   Buttons: Clear visual distinction between primary, secondary, and tertiary actions. Pill-shaped or slightly rounded.
    *   Cards: Modern card design with clean information hierarchy, potentially with subtle hover effects.
    *   Forms: User-friendly, with clear labels, inline validation message placeholders, and logical grouping.
    *   Modals & Popovers: Structure for these common interactive elements.
    *   Progress Indicators: For multi-step processes (e.g., in the Deal Room).
*   **Accessibility (Considerations for Structure):**
    *   Semantic HTML5.
    *   Good color contrast (implied by palette choices).
    *   Keyboard navigation affordances (focus states).

---

**Page-Specific Requirements (Modernized):**

**1. Homepage (`index.html`)**

*   **Header:**
    *   [Your Platform Name] Logo (left).
    *   Navigation: "Explore Opportunities," "Sell Your Business," "How It Works," "Resources," "Login," "Sign Up" (as a prominent CTA button).
*   **Hero Section:**
    *   Headline reflecting speed and trust (e.g., "The Future of Business Acquisitions. Faster, Simpler, Smarter.")
    *   Sub-headline reinforcing value.
    *   "Smart Search" Bar: Keyword, Location, *perhaps an AI-suggestion dropdown or a "I'm looking to..." selector*.
    *   CTAs: "Find a Business" and "List Your Business."
*   **"Why [Your Platform Name]?" Section:**
    *   Icon + Text blocks highlighting key differentiators: Intelligent Matchmaking, Integrated Tools, Standardized Process, Expert Support.
*   **"Featured Opportunities / Trending" Section:**
    *   Visually appealing grid/carousel of modern "Business Summary Cards."
*   **"How We Streamline Acquisitions" Section:**
    *   Visual representation of the simplified process (e.g., a 3-4 step graphic).
*   **Testimonials / Social Proof Section:**
*   **Call to Action Section:** Reinforce benefits and guide to sign up or explore.
*   **Footer:** Standard links + social media, "Powered by [Your Platform Name]".

**2. Search & Discovery Page (`search-discovery.html`)**

*   **Header & Footer.**
*   **Advanced Search & Filtering Bar (Top or Sticky Left Sidebar):**
    *   Keywords, Location (with map view toggle placeholder `<!-- [ICON: map-pin] -->`).
    *   Interactive Filters:
        *   Industry (multi-select with search).
        *   Financials (sliders for Asking Price, Revenue, Cash Flow - `<!-- Placeholder for interactive sliders -->`).
        *   Business Size, Years Established, etc.
        *   "Saved Searches" option.
    *   Real-time filter application indicators (e.g., "Applying filters...").
*   **Results Area:**
    *   Sort options (Relevance, Newest, Price, Match Score - if "intelligent matchmaking" is a theme).
    *   Toggle between "List View" and "Grid View" for results.
    *   Modern "Business Summary Cards" (see component below).
    *   "Recommended for You" section (placeholder).
    *   Pagination with clear current page indication.

**3. Business Profile Page (`business-profile.html`)**

*   **Header & Footer.**
*   **Profile Header:**
    *   Business Name & Tagline.
    *   Key metrics displayed prominently (Price, Cash Flow, Location, Industry) with icons.
    *   High-quality image gallery/carousel.
    *   CTAs: "Request Information," "Save to Watchlist," "Start Acquisition Process" (if logged in and appropriate).
*   **Main Content (Tabbed or well-sectioned layout):**
    *   **Overview:** Rich text description, video embed placeholder.
    *   **Financials:** Clear presentation of key financial data (tables, perhaps placeholder for simple charts `<!-- [Placeholder for Financial Chart] -->`).
    *   **Operations & Assets:** Details on facilities, team, IP, etc.
    *   **Market & Competition:**
    *   **Reason for Selling:**
    *   **Documents (Placeholder):** Section for NDAs, CIMs (visible if permissioned). `<!-- [ICON: lock] Secure Documents -->`
*   **Seller/Broker Information Section.**
*   **"Similar Opportunities" Section.**

**4. User Dashboard (`dashboard.html`)**

*   **Sidebar Navigation:** "Overview," "My Listings" (if seller), "My Inquiries/Offers," "Saved Businesses," "Deal Rooms," "My Profile," "Settings," "Support."
*   **Main Content Area (Contextual based on sidebar selection):**
    *   **Overview:** Summary widgets (e.g., New Messages, Active Deals, Recommended Businesses).
    *   **My Listings:** Table/Grid of businesses they are selling, with stats (views, inquiries) and management options.
    *   **Saved Businesses:** Cards of businesses they are tracking.
    *   **Deal Rooms:** List of active acquisition processes with status indicators/progress bars.

**5. (Conceptual) Deal Room / Acquisition Workflow Page (`deal-room.html`)**

*   **Header (minimal, focused on the deal).**
*   **Deal Title & Key Parties.**
*   **Workflow/Progress Bar:** Visualizing stages (e.g., NDA > LOI > Due Diligence > Closing). Current stage highlighted.
*   **Main Sections (Tabbed or Accordion):**
    *   **Communication Hub:** Secure messaging area `<!-- Placeholder for messaging component -->`.
    *   **Document Management:** Upload, share, sign (e-sign placeholder) `<!-- [ICON: file-upload] -->`.
    *   **Checklists & Tasks:** For due diligence, legal steps.
    *   **Financials & Offer Details:**
    *   **Support Chat/Contact:** `<!-- [ICON: help-circle] Get Support -->`

**Shared Component: Modern Business Summary Card**
*   Container: Clean, minimal shadow or border, `bg-white`, `rounded-lg p-4 md:p-6`.
*   Image: Prominent, high-quality placeholder, potentially with a "Verified" badge overlay.
*   Title: Clear, bold (`text-lg md:text-xl font-semibold text-slate-800`).
*   Location & Industry: Subtler text with icons (`text-sm text-slate-600 flex items-center`).
*   Key Metrics: "Asking Price: $X", "Cash Flow: $Y" (clear, distinct, `text-indigo-600 font-medium`).
*   Short Blurb/Tagline.
*   CTAs: "View Details" button, "Save" icon button.
*   (Optional) "Match Score: XX%" or "Hot Opportunity" badge.

---

**Technical Requirements:**

*   Use **HTML5** semantic markup.
*   Use **Tailwind CSS** (latest version) for all styling. Maximize use of utility classes.
*   Ensure excellent **responsiveness** for mobile, tablet, and desktop.
*   Include **comments** for sections, complex components, and interactivity placeholders.
*   Structure HTML to be **JavaScript-friendly** for future interactivity (e.g., unique IDs for elements to be manipulated, proper data attributes).
*   Consider **Dark Mode** readiness (e.g., use Tailwind's `dark:` variants where appropriate, even if not fully implemented by the AI).

**Output:**
Please provide the content for `index.html`, `search-discovery.html`, `business-profile.html`, `dashboard.html`, and `deal-room.html` as separate, complete HTML files with embedded Tailwind CSS (or linked if the AI can manage a base CSS file with Tailwind imports).