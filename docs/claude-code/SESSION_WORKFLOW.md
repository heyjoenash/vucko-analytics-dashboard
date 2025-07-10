# Claude Code Session Workflow - A to Z Guide

Complete workflow for managing Claude Code sessions effectively from session startup through completion and handoff.

## 🚀 Session Startup (A-D)

### A. Pre-Session Assessment
**When to start a new session:**
- Current session approaching context limit (>150k tokens)
- Major context shift (different feature/bug)
- Previous session ended with natural stopping point
- Need fresh perspective on complex problem

**Session readiness checklist:**
- [ ] Development environment available
- [ ] Git repository accessible
- [ ] Time block allocated (minimum 30 minutes)
- [ ] Clear objective or task identified

### B. Context Loading (First 5 minutes)
**Priority order for context loading:**

1. **Essential Context (Always read these first):**
   ```
   CLAUDE.md                           # Current priorities and state
   docs/claude-code/CURRENT_STATE.md   # Live project status
   docs/claude-code/SESSION_HANDOFF.md # Previous session context
   ```

2. **Active Work Context:**
   ```
   docs/tasks/active/                  # Current work items
   git status                          # Uncommitted changes
   git log --oneline -5               # Recent commits
   ```

3. **Domain-Specific Context (as needed):**
   ```
   docs/core/ARCHITECTURE.md          # System understanding
   docs/core/DATABASE.md               # Data model
   docs/QUICKSTART.md                  # Setup procedures
   ```

### C. Environment Verification
**Essential system checks:**
```bash
# 1. Application status
cd app && python3 -m http.server 4200
# Verify http://localhost:4200 loads

# 2. API proxy (if needed)
cd api-proxy && npm start
# Verify http://localhost:3001/health responds

# 3. Database connectivity (browser console)
supabaseClient.from('tenants').select('count').single()

# 4. Git status
git status
git branch
```

### D. Task Planning
**Establish session scope:**
- [ ] Review active tasks in `docs/tasks/active/`
- [ ] Identify primary objective for session
- [ ] Estimate complexity (simple/medium/complex)
- [ ] Plan testing approach
- [ ] Consider dependencies and blockers

## 🛠️ Active Development (E-M)

### E. Task Creation/Update
**For new work:**
```bash
# Create task document using template
cp docs/tasks/TEMPLATE.md docs/tasks/active/FEATURE_name_$(date +%Y-%m-%d).md
# Fill in requirements, acceptance criteria, implementation plan
```

**For continuing work:**
- [ ] Update task status to "in_progress"
- [ ] Review previous notes and decisions
- [ ] Update timeline if needed
- [ ] Note any new requirements discovered

### F. Implementation Workflow
**Development cycle:**
1. **Read before write** - Always read files before editing
2. **Small iterations** - Make incremental changes
3. **Test immediately** - Verify each change works
4. **Document decisions** - Update task files with key choices
5. **Commit frequently** - Save progress with descriptive messages

### G. Testing Strategy
**Testing sequence:**
```bash
# 1. Unit-level testing
# Test specific functionality in isolation

# 2. Integration testing
open tests/manual/test-import.html
# Use Run ID: qEDjxfcGtjl6vcMZk

# 3. User workflow testing
# Test complete user journeys end-to-end

# 4. Regression testing
# Verify existing features still work
```

### H. Error Handling
**When things break:**
1. **Don't panic** - Document the exact error
2. **Reproduce consistently** - Identify reliable reproduction steps
3. **Isolate the cause** - Use debugging tools and logs
4. **Create bug task** - Document issue with reproduction steps
5. **Implement fix** - Test thoroughly before marking complete

### I. Code Quality Checks
**Before marking work complete:**
- [ ] No console errors in browser
- [ ] Proper error handling implemented
- [ ] User-facing messages are helpful
- [ ] Code follows project conventions
- [ ] No hardcoded sensitive data
- [ ] Documentation updated where needed

### J. Git Management
**Commit best practices:**
```bash
# Stage changes carefully
git add .
git reset app/config.js  # Never commit config

# Descriptive commit messages
git commit -m "🐛 Fix profile photo loading with error handling

- Added onerror handlers for failed image loads
- Implemented consistent placeholder system  
- Tested with 283 profiles, 95% load success rate
- Updated task documentation with implementation notes

Closes: docs/tasks/active/BUG_profile_photos_not_loading_2025-01-10.md

🤖 Generated with [Claude Code](https://claude.ai/code)

Co-Authored-By: Claude <noreply@anthropic.com>"

# Push when ready
git push origin main
```

### K. Documentation Updates
**Keep documentation current:**
- [ ] Update task status and progress notes
- [ ] Add entries to `CHANGELOG.md` for user-facing changes
- [ ] Update `docs/claude-code/CURRENT_STATE.md` with significant changes
- [ ] Update `CLAUDE.md` priorities as work is completed

### L. Performance Monitoring
**Watch for degradation:**
- Page load times (should be <2 seconds)
- Database query performance
- API response times
- Memory usage in browser

### M. Scope Management
**Stay focused:**
- Resist scope creep within sessions
- Create new tasks for discovered work
- Time-box complex problems
- Know when to ask for help or research

## 📊 Session Monitoring (N-R)

### N. Progress Tracking
**Every 30-60 minutes, assess:**
- [ ] Are you making progress toward session objective?
- [ ] Is the current approach working?
- [ ] Any blockers that need different strategy?
- [ ] Time remaining vs. work remaining

### O. Context Management
**Watch for context limits:**
- **Warning signs:**
  - Responses getting shorter
  - Missing important context
  - Repeating previous work
  - Making contradictory decisions

- **When to consider new session:**
  - >150k tokens in current session
  - Approaching complex context limit
  - Need to shift to different domain
  - Current session lacks focus

### P. Quality Assurance
**Continuous quality checks:**
- Test changes immediately after implementation
- Verify no regressions in existing functionality
- Check for console errors or warnings
- Validate user experience flows

### Q. Blocker Management
**When stuck:**
1. **Document the blocker** clearly in task files
2. **Try alternative approaches** (time-box: 15-30 min)
3. **Research solutions** in documentation/code
4. **Create research task** if needs investigation
5. **Move to different task** if completely blocked

### R. Decision Documentation
**Record key decisions:**
- Technical approach chosen and why
- Alternative approaches considered
- Trade-offs made
- Future considerations
- Impact on other features

## 🎯 Session Completion (S-Z)

### S. Task Completion Verification
**Before marking tasks complete:**
- [ ] All acceptance criteria met
- [ ] Testing completed and documented
- [ ] No known bugs or issues
- [ ] Documentation updated
- [ ] Code committed and pushed

### T. Session Summary Creation
**Document session outcomes:**
```markdown
## Session Summary - $(date +%Y-%m-%d)
**Duration**: X hours
**Primary Focus**: Brief description

### ✅ Completed Tasks:
- Task 1: Brief description and verification steps
- Task 2: Brief description and testing notes

### 🔄 In Progress Tasks:
- Task 3: Current status, next steps, estimated completion
- Task 4: Blockers encountered, potential solutions

### 🐛 Issues Discovered:
- Issue 1: Description and impact assessment
- Issue 2: Workaround applied, permanent fix needed

### 📋 Next Session Priorities:
1. High priority item with clear next steps
2. Medium priority item with requirements defined
3. Research/investigation items

### 🔑 Key Decisions Made:
- Decision 1: Rationale and impact
- Decision 2: Alternative approaches considered

### 📊 Session Metrics:
- Lines of code modified: ~X
- Files changed: X
- Tests added/updated: X
- Documentation updated: X pages
```

### U. Documentation Updates
**Final documentation review:**
- [ ] Update `docs/claude-code/CURRENT_STATE.md`
- [ ] Add entries to `CHANGELOG.md`
- [ ] Update `CLAUDE.md` immediate priorities
- [ ] Complete task documentation
- [ ] Update any relevant guides or troubleshooting docs

### V. Code Cleanup
**Pre-commit cleanup:**
```bash
# Remove debug code
# Clean up console.log statements
# Remove commented-out code
# Verify no TODO comments left

# Final git status check
git status
git diff
```

### W. Environment Cleanup
**Clean session artifacts:**
- Remove temporary files
- Clear browser cache if testing
- Close unnecessary browser tabs
- Save any useful debugging queries

### X. Handoff Preparation
**Prepare for next session:**
- [ ] All changes committed and pushed
- [ ] Task statuses updated accurately
- [ ] Blockers clearly documented
- [ ] Next steps explicitly defined
- [ ] Any required context noted

### Y. Session Archival
**Archive session work:**
- Move completed tasks to `docs/tasks/completed/`
- Update active task priorities
- Add session summary to appropriate location
- Clean up any temporary documentation

### Z. Final Verification
**Session completion checklist:**
- [ ] Application is functional (test key workflows)
- [ ] No uncommitted changes in git
- [ ] Documentation is current and accurate
- [ ] Next session can start immediately with clear context
- [ ] All promises/commitments documented

## 🔄 Special Workflows

### Emergency Session Procedures
**When things are broken:**
1. **Assess impact** - What's broken and how severely?
2. **Stabilize first** - Get basic functionality working
3. **Document everything** - Error messages, reproduction steps
4. **Fix incrementally** - Small, testable changes
5. **Verify thoroughly** - Test all related functionality

### Context Transfer Workflows
**Moving to new session:**
1. **Complete current task** or reach logical stopping point
2. **Document exact state** in task files and CURRENT_STATE.md
3. **Clean git state** - commit or stash all changes
4. **Create handoff summary** with clear next steps
5. **Test that new session can continue** with provided context

### Long-term Project Workflows
**Multi-session features:**
1. **Break into phases** with clear deliverables
2. **Document dependencies** between phases
3. **Plan testing strategy** for each phase
4. **Regular architecture review** to maintain consistency
5. **Progress tracking** across sessions

## 📈 Workflow Optimization

### Session Efficiency Tips
- Keep frequently used files/docs bookmarked
- Use consistent naming conventions for tasks
- Batch similar operations (all testing, all documentation)
- Pre-plan complex changes before implementing
- Use git effectively for rollback safety

### Common Pitfalls to Avoid
- Starting new tasks near session end
- Making large changes without testing
- Forgetting to update documentation
- Leaving broken functionality
- Poor task status management

### Success Metrics
- **Productivity**: Tasks completed per session
- **Quality**: Regression rate, bug reports
- **Consistency**: Documentation accuracy
- **Handoff**: Next session startup speed
- **User Impact**: Feature delivery rate

This workflow ensures consistent, high-quality development while maximizing the effectiveness of Claude Code sessions for long-term project success.