# Search Alerts Implementation Guide

## Overview

The Search Alerts functionality allows users to save their search criteria and receive notifications when new business listings match their preferences. This feature enhances user engagement and provides automated matching capabilities.

## Architecture

### Database Layer
- **Table**: `saved_searches` - Stores user search criteria and alert preferences
- **Schema**: Includes search parameters, notification settings, and tracking metrics
- **Security**: Row Level Security (RLS) policies ensure users only access their own alerts

### Service Layer
- **SearchAlertService**: Handles CRUD operations for search alerts
- **SearchAlertNotificationService**: Background processing for matching and notifications
- **NotificationService**: Sends notifications to users

### UI Layer
- **SaveSearchAlertModal**: Modal interface for creating/editing alerts
- **SearchAlertsDashboard**: Management interface for viewing and managing alerts
- **Enhanced Listings Integration**: Save search button functionality

## Features

### Core Functionality
1. **Save Search Criteria**: Capture current search parameters and filters
2. **Notification Preferences**: Email, push notifications, frequency settings
3. **Alert Management**: View, edit, pause, and delete saved alerts
4. **Background Processing**: Automatic checking for new matches
5. **Statistics Tracking**: Match counts, last checked timestamps

### User Experience
- **One-Click Save**: Save current search with a single button click
- **Smart Naming**: Auto-generate alert names based on search criteria
- **Visual Dashboard**: Clean interface for managing multiple alerts
- **Real-time Updates**: Live notifications when matches are found

## Implementation Details

### Database Schema

```sql
CREATE TABLE saved_searches (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    search_name TEXT NOT NULL,
    search_query TEXT,
    filters JSONB DEFAULT '{}',
    is_active BOOLEAN DEFAULT TRUE,
    notification_frequency TEXT DEFAULT 'immediate',
    email_notifications BOOLEAN DEFAULT TRUE,
    push_notifications BOOLEAN DEFAULT FALSE,
    last_checked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    total_matches_found INTEGER DEFAULT 0,
    -- Additional fields...
);
```

### Service Integration

```javascript
// Save a search alert
const result = await searchAlertService.saveSearchAlert({
    search_name: 'Tech Startups in California',
    search_query: 'technology startup',
    filters: {
        business_type: 'Technology',
        location: 'California',
        price_max: 500000
    },
    notification_frequency: 'daily',
    email_notifications: true
});
```

### UI Integration

```javascript
// Show save search alert modal
import { saveSearchAlertModal } from '/src/features/search-alerts/components/save-search-alert-modal.js';

const criteria = extractCurrentSearchCriteria();
saveSearchAlertModal.show(criteria, (savedAlert) => {
    console.log('Alert saved:', savedAlert.search_name);
});
```

## File Structure

```
src/features/search-alerts/
├── services/
│   ├── search-alert.service.js
│   └── search-alert-notification.service.js
├── components/
│   ├── save-search-alert-modal.js
│   └── search-alerts-dashboard.js
└── tests/
    └── search-alerts-test.html

database/
└── saved-searches-schema.sql

assets/js/
└── enhanced-listings.js (updated)
```

## Deployment Steps

### 1. Database Deployment
```sql
-- Run in Supabase SQL Editor
\i database/saved-searches-schema.sql
```

### 2. Configuration Update
Add to `src/shared/services/supabase/supabase.config.js`:
```javascript
tables: {
    // ... existing tables
    saved_searches: 'saved_searches'
}
```

### 3. Frontend Integration
The enhanced-listings.js file has been updated to include the new functionality. The save search button will now:
- Extract current search criteria
- Show the save search alert modal
- Handle the complete save process

### 4. Dashboard Integration
Add to dashboard navigation:
```javascript
import { searchAlertsDashboard } from '/src/features/search-alerts/components/search-alerts-dashboard.js';
await searchAlertsDashboard.init('dashboard-container');
```

## Testing

### Comprehensive Test Suite
Use `tests/search-alerts-test.html` to verify:
- Database schema deployment
- Service functionality
- UI component behavior
- Notification system
- End-to-end workflows

### Test Scenarios
1. **Create Alert**: Save search with various criteria combinations
2. **Manage Alerts**: Edit, pause, activate, and delete alerts
3. **Notifications**: Verify background processing and notification delivery
4. **Edge Cases**: Handle empty searches, duplicate names, invalid data

## Security Considerations

### Row Level Security
- Users can only access their own search alerts
- Policies prevent unauthorized access to alert data
- Secure handling of notification preferences

### Data Validation
- Input sanitization for search queries and filters
- Validation of notification frequency settings
- Protection against SQL injection and XSS

## Performance Optimization

### Database Indexes
- User ID index for fast user queries
- Active alerts index for background processing
- GIN index on filters JSONB for complex queries

### Background Processing
- Configurable processing intervals
- Batch processing for efficiency
- Error handling and retry logic

## Monitoring and Analytics

### Metrics to Track
- Alert creation and deletion rates
- Notification delivery success rates
- User engagement with alerts
- Match accuracy and relevance

### Logging
- Service operations and errors
- Background processing status
- User interactions with alerts

## Future Enhancements

### Planned Features
1. **Advanced Matching**: ML-based compatibility scoring
2. **Smart Notifications**: Intelligent frequency adjustment
3. **Alert Templates**: Pre-configured alert types
4. **Bulk Operations**: Manage multiple alerts simultaneously
5. **Export/Import**: Backup and restore alert configurations

### Integration Opportunities
- Email service integration (SendGrid, Mailgun)
- Push notification services (Firebase, OneSignal)
- SMS notifications for urgent matches
- Slack/Teams integration for business users

## Troubleshooting

### Common Issues
1. **Database Connection**: Verify Supabase configuration
2. **RLS Policies**: Check user authentication and permissions
3. **Modal Not Showing**: Ensure proper module imports
4. **Notifications Not Working**: Verify background service initialization

### Debug Tools
- Browser console for client-side errors
- Supabase dashboard for database issues
- Test suite for comprehensive verification
- Network tab for API call debugging

## Support and Maintenance

### Regular Tasks
- Monitor alert processing performance
- Clean up inactive or old alerts
- Update notification templates
- Review and optimize database queries

### Version Updates
- Maintain backward compatibility
- Document schema changes
- Test migration procedures
- Update API documentation

---

## Quick Start

1. Deploy the database schema
2. Update configuration files
3. Test using the provided test suite
4. Integrate with existing search interfaces
5. Monitor performance and user adoption

The Search Alerts feature is now ready for production use and provides a solid foundation for enhanced user engagement and automated business matching.
