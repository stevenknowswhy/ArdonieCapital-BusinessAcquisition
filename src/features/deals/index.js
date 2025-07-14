/**
 * Deals Feature Module
 * Barrel export for deal management functionality
 * Provides comprehensive business acquisition deal processing
 */

// Services
export { dealManagementService } from './services/deal-management.service.js';
export { timelineTrackingService } from './services/timeline-tracking.service.js';
export { documentManagementService } from './services/document-management.service.js';

// Components (to be created)
// export { DealDashboard } from './components/deal-dashboard.component.js';
// export { DealTimeline } from './components/deal-timeline.component.js';
// export { DocumentUpload } from './components/document-upload.component.js';
// export { DealForm } from './components/deal-form.component.js';

// Hooks (to be created)
// export { useDeal } from './hooks/use-deal.hook.js';
// export { useDeals } from './hooks/use-deals.hook.js';
// export { useDealTimeline } from './hooks/use-deal-timeline.hook.js';
// export { useDealDocuments } from './hooks/use-deal-documents.hook.js';

// Utils (to be created)
// export { dealUtils } from './utils/deal.utils.js';
// export { timelineUtils } from './utils/timeline.utils.js';

// Constants
export const DEAL_STATUSES = {
    INITIAL_INTEREST: 'initial_interest',
    NDA_SIGNED: 'nda_signed',
    DUE_DILIGENCE: 'due_diligence',
    NEGOTIATION: 'negotiation',
    FINANCING: 'financing',
    LEGAL_REVIEW: 'legal_review',
    CLOSING: 'closing',
    COMPLETED: 'completed',
    CANCELLED: 'cancelled',
    EXPIRED: 'expired'
};

export const DEAL_PRIORITIES = {
    LOW: 'low',
    MEDIUM: 'medium',
    HIGH: 'high',
    URGENT: 'urgent'
};

export const DOCUMENT_TYPES = {
    NDA: 'nda',
    FINANCIAL_STATEMENT: 'financial_statement',
    TAX_RETURN: 'tax_return',
    LEASE_AGREEMENT: 'lease_agreement',
    PURCHASE_AGREEMENT: 'purchase_agreement',
    DUE_DILIGENCE_REPORT: 'due_diligence_report',
    INSPECTION_REPORT: 'inspection_report',
    LEGAL_DOCUMENT: 'legal_document',
    OTHER: 'other'
};

export const TIMELINE_MILESTONES = [
    {
        name: 'Initial Interest',
        description: 'Buyer expresses interest in the business',
        days_from_offer: 0,
        is_critical: true
    },
    {
        name: 'NDA Signed',
        description: 'Non-disclosure agreement executed',
        days_from_offer: 2,
        is_critical: true
    },
    {
        name: 'Financial Review',
        description: 'Review of financial statements and records',
        days_from_offer: 7,
        is_critical: true
    },
    {
        name: 'Due Diligence',
        description: 'Comprehensive business analysis and verification',
        days_from_offer: 14,
        is_critical: true
    },
    {
        name: 'Negotiation',
        description: 'Price and terms negotiation',
        days_from_offer: 21,
        is_critical: true
    },
    {
        name: 'Financing Approval',
        description: 'Secure financing and funding approval',
        days_from_offer: 28,
        is_critical: true
    },
    {
        name: 'Legal Review',
        description: 'Legal documentation and contract review',
        days_from_offer: 31,
        is_critical: true
    },
    {
        name: 'Closing',
        description: 'Final transaction and ownership transfer',
        days_from_offer: 34,
        is_critical: true
    }
];
