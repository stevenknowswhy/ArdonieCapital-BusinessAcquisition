---
type: "always_apply"
---

The Definitive Modular Development Guide for VS Code Augment AI

Table of Contents

- Our Philosophy
- 1. Directory Structure: Feature-Colocation Model
- 2. Naming Conventions: Predictability and Searchability
- 3. Granularity & Responsibility: Small and Focused Units
- 4. State Management: Hierarchical and Localized
- 5. Dependency Management: Enforce API Contracts
- 6. Testing: Co-Located and Behavior-Focused
- 7. Error Handling and Resilience
- 8. Performance and Accessibility
- 9. Documentation and Code Quality
- 10. New: UI/UX Best Practices
- 11. New: Responsiveness and Styling
- 12. New: Data Fetching and Async Management
- 13. New: Backend Structure and Best Practices
- Enforcement and Evolution

Our Philosophy


Our primary goal is a scalable, maintainable codebase that's easy to navigate and evolve. We prioritize long-term health over short-term shortcuts: features are isolated, dependencies explicit, and code is understandable, testable, and deletable without side effects. This guide enforces modularity inspired by feature-driven development, ensuring Augment AI—a modern, responsive full-stack app—delivers excellent UI/UX while integrating intelligent VS Code tools. We embrace best practices for frontend (React/TypeScript) and backend (Node.js/Express) to build performant, secure, and user-centric experiences.

1. Directory Structure: Feature-Colocation Model


Organize by feature, not file type, to create self-contained modules. Extend this to backend for full-stack consistency.

Rule: Frontend: All files for a feature live under src/features/. Backend: Mirror with src/backend/features/ for APIs/services.
Rationale: Reduces cognitive load and simplifies full-stack refactoring.
Do: Export public APIs via index.ts.
Don't: Scatter files by type.

Example Structure (Frontend + Backend Snippet):


	src/
	├── features/  // Frontend
	│   └── user-profile/
	│       ├── components/
	│       ├── hooks/
	│       ├── tests/
	│       ├── user-profile.service.ts  // Frontend service (e.g., API calls)
	│       └── index.ts
	├── backend/
	│   ├── features/  // Backend mirrors frontend for alignment
	│   │   └── user-profile/
	│   │       ├── controllers/
	│   │       │   └── user-profile.controller.ts
	│   │       ├── services/
	│   │       │   └── user-profile.service.ts
	│   │       ├── models/
	│   │       │   └── user-profile.model.ts  // e.g., Prisma schema
	│   │       └── index.ts  // Public API
	│   ├── middleware/  // Global (e.g., auth)
	│   └── utils/       // Shared backend utils
	└── shared/  // Cross-stack (e.g., types, utils)

The shared/ Directory: For code used in 3+ places across frontend/backend. Review quarterly.

2. Naming Conventions: Predictability and Searchability


(Unchanged from previous version for brevity—see above for details.)

3. Granularity & Responsibility: Small and Focused Units


(Unchanged—see above.)

4. State Management: Hierarchical and Localized


(Unchanged—see above.)

5. Dependency Management: Enforce API Contracts


(Unchanged—see above.)

6. Testing: Co-Located and Behavior-Focused


Update: For backend, add unit/integration tests for controllers/services using Jest/Supertest. Include end-to-end tests for full-stack flows (e.g., API to UI).

7. Error Handling and Resilience


Update: Backend: Use centralized error handlers (e.g., Express middleware). Frontend: Integrate with TanStack Query for retry logic.

8. Performance and Accessibility


Update: Add lazy loading for routes (React.lazy/Suspense). For accessibility, use tools like axe-core in tests.

9. Documentation and Code Quality


Update: Include API docs with Swagger/OpenAPI for backend endpoints.

10. New: UI/UX Best Practices


Prioritize user-centered design for an intuitive, delightful experience.

Rule: Follow atomic design—build from atoms (e.g., buttons) to organisms (e.g., forms) to pages. Use compound components for flexibility.
Rule: Conduct UX audits: Focus on simplicity, consistency, and feedback (e.g., loading indicators, tooltips). Incorporate user testing early.
Rationale: Excellent UX differentiates Augment AI, especially for developers in VS Code.
Best Practices:


- Design System: Maintain a shared design system in shared/components/ with Storybook for visualization.
- Theming: Use CSS variables or Tailwind for dark/light modes.
- i18n: Integrate react-i18next for multi-language support.
- Example: For a form, use validation with react-hook-form and provide real-time feedback.

11. New: Responsiveness and Styling


Build mobile-first, responsive UIs that adapt seamlessly.

Rule: Use Tailwind CSS (or styled-components) for utility-first styling. Apply media queries and flex/grid for layouts.
Rule: Test on multiple devices; aim for breakpoints at 480px (mobile), 768px (tablet), 1024px+ (desktop).
Rationale: Ensures Augment AI works well in VS Code sidebars, web views, or standalone apps.
Best Practices:


- Mobile-First: Start with smallest screens; scale up.
- Performance: Minify CSS; use responsive images with srcset.
- Example:

	// user-avatar.component.tsx
	<div className="w-10 h-10 md:w-12 md:h-12 lg:w-16 lg:h-16 rounded-full bg-gray-200" />



Tip: Use Vite/PostCSS for build-time optimization.

12. New: Data Fetching and Async Management


Handle data efficiently for responsive, real-time experiences.

Rule: Use TanStack Query (formerly React Query) for caching, optimistic updates, and error handling in frontend.
Rule: Prefer RESTful APIs or GraphQL; avoid direct database access from frontend.
Rationale: Reduces boilerplate, improves UX with instant feedback, and scales for AI features (e.g., real-time code suggestions).
Best Practices:


- Frontend: Wrap fetches in hooks (e.g., useUserProfileQuery).
- Backend: Use pagination, rate limiting.
- Example:

	// use-user-profile.hook.ts
	import { useQuery } from '@tanstack/react-query';
	export const useUserProfile = () => useQuery({ queryKey: ['userProfile'], queryFn: fetchUserProfile });



13. New: Backend Structure and Best Practices


Mirror frontend modularity for a scalable, secure backend.

Rule: Use layered architecture: Controllers (handle requests), Services (business logic), Models (data access). Organize by feature under backend/features/.
Rule: Secure APIs with JWT/auth middleware; validate inputs with Joi/Zod.
Rationale: Ensures backend is as modular and maintainable as frontend, supporting full-stack features like AI integrations.
Best Practices:


- Framework: Node.js/Express or NestJS for structure.
- Database: Use ORM like Prisma for type-safe queries.
- API Design: RESTful endpoints (e.g., /api/user-profile); version APIs (e.g., /v1/).
- Security: Implement CORS, HTTPS, and OWASP top 10 protections.
- Performance: Cache with Redis; monitor with Prometheus.
- Example Structure: See Directory Structure above.
- Deployment: Use Docker for containerization; CI/CD with GitHub Actions.

Enforcement and Evolution

- Tools: ESLint/Prettier for code; Stylelint for CSS; SonarQube for quality scans. Add backend linters (e.g., TSLint).
- Reviews: Mandate UI/UX reviews in PRs; use Figma for designs.
- Evolution: This guide is living—propose changes via issues. Last updated: July 12, 2025.