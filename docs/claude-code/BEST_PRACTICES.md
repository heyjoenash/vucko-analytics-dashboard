# Claude Code Best Practices - Signals & Actions

This document outlines best practices for working with the Signals & Actions project using Claude Code to ensure efficient, consistent, and high-quality development.

## 🚀 Session Startup Best Practices

### 1. Context Loading Priority
Always load context in this order:
1. **CLAUDE.md** - Current project state and priorities
2. **docs/claude-code/CURRENT_STATE.md** - Live project status
3. **docs/claude-code/SESSION_HANDOFF.md** - If continuing from another session
4. **docs/tasks/active/** - Current work items
5. **docs/QUICKSTART.md** - If new to the project

### 2. Essential First Commands
```bash
# 1. Verify application status
cd app && python3 -m http.server 4200
# Check http://localhost:4200 loads correctly

# 2. Check git status
git status

# 3. Review active tasks
ls docs/tasks/active/

# 4. Verify database connectivity (in browser console)
supabaseClient.from('tenants').select('*').then(console.log);
```

### 3. Project State Assessment
Before starting work, always:
- [ ] Confirm application is running and functional
- [ ] Review any breaking changes or critical issues
- [ ] Check for uncommitted changes in git
- [ ] Verify API keys are properly configured
- [ ] Review immediate priorities in CLAUDE.md

## 📝 Development Workflow Best Practices

### 1. Task Management
- **Always** use the task system in `docs/tasks/`
- Create task documents for any non-trivial work
- Update task status as work progresses
- Mark tasks complete only when fully tested

### 2. Code Changes
- **Read first**: Always read files before editing
- **Test immediately**: Verify changes work before continuing
- **Small iterations**: Make incremental changes and test
- **Document decisions**: Update task files with key decisions

### 3. Documentation Updates
- Update `docs/claude-code/CURRENT_STATE.md` with any significant changes
- Add entries to `CHANGELOG.md` for user-facing changes
- Update `CLAUDE.md` priorities as work is completed
- Create new task documents for discovered issues

## 🗄️ Database Best Practices

### 1. Safe Operations
```sql
-- Always check before destructive operations
SELECT COUNT(*) FROM persons WHERE tenant_id = '00000000-0000-0000-0000-000000000001';

-- Use transactions for multi-step operations
BEGIN;
-- Your operations here
COMMIT; -- or ROLLBACK if issues
```

### 2. Migration Safety
- Test migrations in development first
- Keep backup of current schema
- Document all schema changes in task files
- Verify data integrity after migrations

### 3. Data Import Verification
```bash
# Always test imports with known data first
# Use test Run ID: qEDjxfcGtjl6vcMZk
# Expected: 283 people, 126 companies, 283 engagements
```

## 🔧 Debugging Best Practices

### 1. Systematic Debugging
1. **Reproduce the issue** consistently
2. **Check browser console** for JavaScript errors
3. **Verify API connectivity** (Network tab)
4. **Check database state** with direct queries
5. **Test with minimal data** to isolate issues

### 2. Error Documentation
- Create bug task documents immediately
- Include reproduction steps
- Document error messages exactly
- Note browser/environment details

### 3. Testing Strategy
- Use manual test files in `tests/manual/`
- Test with both real and sample data
- Verify across different browsers if UI issues
- Test edge cases (empty data, invalid inputs)

## 📁 File Management Best Practices

### 1. File Organization
- **Production files**: Only in `app/` directory
- **Test files**: Always in `tests/manual/`
- **Scripts**: Organized by purpose in `scripts/`
- **Documentation**: Proper categorization in `docs/`

### 2. Git Practices
```bash
# Never commit sensitive data
git add .
git reset app/config.js  # Always exclude config

# Use descriptive commit messages
git commit -m "🐛 Fix profile photo loading with error handling

- Added onerror handlers for failed image loads
- Implemented consistent placeholder system
- Tested with 283 profiles, 95% load success rate

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"
```

### 3. Configuration Security
- Never commit `app/config.js`
- Use placeholder values in documentation
- Keep sensitive data in environment variables
- Regular security audit of committed files

## 🎯 Performance Best Practices

### 1. Frontend Optimization
- Load data in chunks (50 records per page)
- Use loading states for slow operations
- Implement error boundaries for failures
- Cache API responses appropriately

### 2. Database Optimization
- Use proper indexes for common queries
- Limit query results with pagination
- Use views for complex aggregations
- Monitor query performance

### 3. API Integration
- Respect rate limits (LinkedIn: 500/hour)
- Implement proper error handling
- Use caching for repeated requests
- Graceful degradation when APIs fail

## 🧪 Testing Best Practices

### 1. Manual Testing Workflow
```bash
# 1. Test core functionality
open tests/manual/test-import.html
# Use Run ID: qEDjxfcGtjl6vcMZk

# 2. Test profile photos
open tests/manual/test-profile-photos.html

# 3. Test database integrity
open tests/manual/check-database-schema.html

# 4. Test API connectivity
open tests/manual/test-linkedin-api.html
```

### 2. User Acceptance Testing
- Test all user workflows end-to-end
- Verify error messages are helpful
- Check responsive design on mobile
- Test with real user data volumes

### 3. Regression Testing
- Test existing features after changes
- Verify performance hasn't degraded
- Check for broken links or UI issues
- Validate data integrity maintained

## 📋 Documentation Best Practices

### 1. Code Documentation
```javascript
// Reference task documentation
// Related to: docs/tasks/active/FEATURE_profile_enrichment_2025-01-10.md
// Implements error handling for profile photos (Phase 2)
function handleProfilePhotoError(imageUrl) {
    // Implementation with clear comments
}
```

### 2. User Documentation
- Update guides when functionality changes
- Include screenshots for complex workflows
- Provide troubleshooting steps
- Keep quickstart guide current

### 3. Technical Documentation
- Document architectural decisions
- Keep API integration docs updated
- Maintain deployment procedures
- Document emergency recovery steps

## 🚨 Emergency Procedures

### 1. Application Down
```bash
# 1. Check server status
curl http://localhost:4200
curl http://localhost:3001/health

# 2. Restart servers
lsof -ti:4200,3001 | xargs kill -9
cd app && python3 -m http.server 4200 &
cd api-proxy && npm start &

# 3. Verify functionality
# Test import with known data
```

### 2. Database Issues
```sql
-- Check tenant table exists
SELECT * FROM tenants;

-- If missing, run migration
-- Copy: database/migrations/fix_tenant_constraints.sql

-- Verify data integrity
SELECT COUNT(*) FROM persons;
SELECT COUNT(*) FROM engagements;
```

### 3. Import Failures
1. Check Apify API token validity
2. Verify Supabase connection
3. Test with known working Run ID
4. Check tenant_id constraints
5. Review error logs in browser console

## 🔄 Session Handoff Best Practices

### 1. Before Ending Session
- [ ] Update `docs/claude-code/CURRENT_STATE.md`
- [ ] Complete or update task documentation
- [ ] Commit all changes with descriptive messages
- [ ] Update `CLAUDE.md` with current priorities
- [ ] Note any blockers or pending decisions

### 2. Session Notes Template
```markdown
## Session Summary (DATE)
**Duration**: X hours
**Focus**: Brief description

### Completed:
- ✅ Task 1 with verification steps
- ✅ Task 2 with testing notes

### In Progress:
- 🔄 Task 3 - status and next steps
- 🔄 Task 4 - current blocker

### Discovered Issues:
- ❌ Issue 1 - needs investigation
- ❌ Issue 2 - potential solution

### Next Session Priorities:
1. High priority item
2. Medium priority item
3. Research needed item
```

### 3. Context Preservation
- Create task documents for incomplete work
- Document key decisions and rationale
- Note any temporary workarounds
- Update documentation with new findings

## 📊 Quality Assurance

### 1. Code Quality Checklist
- [ ] No console errors in browser
- [ ] Proper error handling implemented
- [ ] User-facing messages are helpful
- [ ] Code follows project conventions
- [ ] No hardcoded sensitive data

### 2. Documentation Quality
- [ ] README files are current
- [ ] API docs match implementation
- [ ] Troubleshooting guides are accurate
- [ ] Task documentation is complete

### 3. Security Checklist
- [ ] No API keys in committed code
- [ ] Sensitive files in .gitignore
- [ ] Input validation implemented
- [ ] Error messages don't expose secrets

## 🎓 Learning and Improvement

### 1. Knowledge Capture
- Document new insights in task files
- Update best practices with lessons learned
- Create troubleshooting entries for solved issues
- Share architectural decisions

### 2. Process Improvement
- Regular review of task management effectiveness
- Feedback on documentation usefulness
- Optimization of common workflows
- Tool and automation opportunities

### 3. Technical Debt Management
- Track known issues in task system
- Prioritize refactoring opportunities
- Document performance bottlenecks
- Plan for scalability improvements

## 🔮 Future Considerations

### 1. Scalability Planning
- Monitor performance as data grows
- Plan for multi-tenant architecture
- Consider caching strategies
- Database optimization opportunities

### 2. Feature Development
- Use task system for feature planning
- Document user requirements clearly
- Plan for testing and validation
- Consider impact on existing features

### 3. Maintenance Strategy
- Regular dependency updates
- Security vulnerability monitoring
- Performance benchmarking
- Backup and recovery testing

---

Following these best practices ensures consistent, high-quality development while maximizing the effectiveness of Claude Code sessions for the Signals & Actions project.