# Test Directory

This directory contains all test files organized by type and purpose.

## 📁 Directory Structure

### Manual Tests (`manual/`)
HTML-based test utilities for manual verification and debugging:

- **Database Tests**
  - `check-database-schema.html` - Verify database schema and structure
  - `check-posts.html` - Check post data integrity
  - `test-import.html` - Test data import functionality

- **Profile & Photo Tests**
  - `test-profile-photos.html` - Test profile photo loading and error handling
  - `run-profile-photo-migration.html` - Migration utility for profile photos

- **Analytics Tests**
  - `debug-post-analysis.html` - Debug post analysis functionality
  - `test-post-analysis.html` - Test post analysis features
  - `test-post-analysis-direct.html` - Direct post analysis testing

- **Data Operations**
  - `backfill-engagements.html` - Test engagement data backfill
  - `fix-engagement-distribution.html` - Test engagement distribution fixes
  - `run-action-status-migration.html` - Test action status migrations

- **API & Integration Tests**
  - `test-linkedin-api.html` - Test LinkedIn API integration
  - `test-enrichment-setup.html` - Test profile enrichment setup
  - `debug.html` - General debugging interface

- **Application Tests**
  - `test.html` - General application testing
  - `test-campaign-data.html` - Test campaign data functionality
  - `test-db-state.html` - Test database state
  - `test-new-schema.html` - Test new database schema

### Unit Tests (`unit/`)
*Coming Soon* - Automated unit tests for individual components

### Integration Tests (`integration/`)
*Coming Soon* - Automated integration tests for system components

### Test Data (`data/`)
Sample and test data files for testing scenarios

## 🧪 Running Manual Tests

### Prerequisites
1. Application running on http://localhost:4200
2. API proxy running on http://localhost:3001 (if testing LinkedIn features)
3. Valid configuration in `app/config.js`

### Common Testing Workflows

#### Database Testing
1. Open `manual/check-database-schema.html`
2. Verify all tables exist and constraints are correct
3. Run `manual/check-posts.html` to verify data integrity

#### Profile Photo Testing
1. Open `manual/test-profile-photos.html`
2. Click "Test Profile Photos" to check image loading
3. Review success/failure rates and error patterns

#### Import Testing
1. Open `manual/test-import.html`
2. Use test Apify Run ID: `qEDjxfcGtjl6vcMZk`
3. Verify all records import successfully

#### API Testing
1. Open `manual/test-linkedin-api.html`
2. Test connection and basic API functionality
3. Verify data retrieval and error handling

## 📊 Test Result Analysis

### Profile Photo Testing
- **Success Rate**: Aim for >95% photo loading success
- **Common Failures**: LinkedIn CORS restrictions, expired URLs
- **Fallback**: Placeholder system should handle all failures gracefully

### Data Import Testing
- **Success Rate**: Should be 100% with proper tenant setup
- **Common Issues**: Missing tenant_id, malformed JSON data
- **Verification**: Check person count, company aggregation, engagement links

### API Integration Testing
- **Response Times**: Should be <2 seconds for most requests
- **Error Handling**: Graceful degradation when APIs unavailable
- **Rate Limiting**: Respect LinkedIn API limits (500/hour)

## 🔧 Test Utilities

### Database Migrations
Use migration test files to verify schema changes before production:
- `run-profile-photo-migration.html`
- `run-action-status-migration.html`

### Data Fixes
Test data correction utilities:
- `backfill-engagements.html`
- `fix-engagement-distribution.html`

### Debugging
General debugging interfaces:
- `debug.html` - Main debugging dashboard
- `debug-post-analysis.html` - Specific to post analysis features

## 📝 Adding New Tests

1. **Manual Tests**: Create HTML files in `manual/` directory
2. **Follow Naming**: Use descriptive names like `test-[feature].html`
3. **Include Documentation**: Add brief description in this README
4. **Test Templates**: Follow existing patterns for consistency

## 🚨 Critical Tests

Before any deployment, run these essential tests:
1. `test-import.html` - Verify data import works
2. `check-database-schema.html` - Confirm database integrity
3. `test-profile-photos.html` - Check photo loading
4. `test-linkedin-api.html` - Verify API connectivity

This testing structure ensures comprehensive coverage of all system components while maintaining easy access for manual verification and debugging.