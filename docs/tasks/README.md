# Task Documentation System

This directory contains documentation for individual tasks, features, and bug fixes organized for optimal Claude Code session management.

## 📁 Directory Structure

```
tasks/
├── README.md                    # This file
├── TEMPLATE.md                  # Standard template for new tasks
├── active/                      # Currently active tasks
├── completed/                   # Completed tasks (archive)
├── planning/                    # Tasks in planning phase
└── backlog/                     # Future tasks and ideas
```

## 📋 Task Types

### Feature Tasks
New functionality or major enhancements to existing features.
- **Naming**: `FEATURE_[name]_[date].md`
- **Example**: `FEATURE_profile_enrichment_2025-01-10.md`

### Bug Fix Tasks
Issues that need to be resolved.
- **Naming**: `BUG_[description]_[date].md`
- **Example**: `BUG_profile_photos_not_loading_2025-01-10.md`

### Enhancement Tasks
Improvements to existing functionality.
- **Naming**: `ENHANCEMENT_[description]_[date].md`
- **Example**: `ENHANCEMENT_manual_data_override_2025-01-10.md`

### Research Tasks
Investigation or analysis work.
- **Naming**: `RESEARCH_[topic]_[date].md`
- **Example**: `RESEARCH_linkedin_api_alternatives_2025-01-10.md`

## 🔄 Task Lifecycle

### 1. Planning Phase
- Create task document using `TEMPLATE.md`
- Define requirements and acceptance criteria
- Estimate effort and timeline
- Place in `planning/` directory

### 2. Active Development
- Move to `active/` directory
- Update status regularly
- Track progress against milestones
- Document decisions and blockers

### 3. Completion
- Complete all checklist items
- Update final status and completion date
- Move to `completed/` directory
- Document lessons learned

### 4. Archive
- Keep completed tasks for reference
- Organize by completion date
- Extract reusable patterns for future work

## 📊 Current Active Tasks

### High Priority
1. **Profile Photos Fix** - `active/BUG_profile_photos_not_loading_2025-01-10.md`
2. **Manual Data Override** - `active/ENHANCEMENT_manual_data_override_2025-01-10.md`
3. **Import Process Debug** - `active/BUG_import_process_debug_2025-01-10.md`

### Medium Priority
1. **Profile Enrichment Integration** - `planning/FEATURE_profile_enrichment_2025-01-10.md`
2. **Advanced Filtering** - `planning/ENHANCEMENT_advanced_filtering_2025-01-10.md`

## 🎯 Task Management for Claude Code

### Session Handoff
When starting a new Claude Code session:
1. Review `active/` directory for in-progress work
2. Check task status and last updates
3. Continue work from documented stopping point
4. Update progress as work proceeds

### Documentation Standards
- **Clear Objectives**: Every task has specific, measurable goals
- **Implementation Details**: Step-by-step technical approach
- **Testing Strategy**: How to verify the solution works
- **Dependencies**: What must be completed first
- **Completion Criteria**: Specific checklist items

### Cross-References
- Link related tasks in the "Related Tasks" section
- Reference relevant documentation files
- Include links to code files and line numbers
- Connect to issues in external systems (GitHub, etc.)

## 🔧 Tools and Utilities

### Task Creation Script
```bash
#!/bin/bash
# create-task.sh
TASK_TYPE=$1  # FEATURE, BUG, ENHANCEMENT, RESEARCH
TASK_NAME=$2
DATE=$(date +%Y-%m-%d)
FILENAME="${TASK_TYPE}_${TASK_NAME}_${DATE}.md"

cp TEMPLATE.md "planning/${FILENAME}"
echo "Created task: planning/${FILENAME}"
```

### Task Status Check
```bash
#!/bin/bash
# check-status.sh
echo "=== ACTIVE TASKS ==="
ls -la active/

echo "=== PLANNING TASKS ==="
ls -la planning/

echo "=== RECENT COMPLETIONS ==="
ls -la completed/ | head -10
```

## 📈 Metrics and Tracking

### Task Completion Metrics
- Average time from planning to completion
- Success rate of initial estimates
- Common blockers and how to prevent them
- Reusable patterns for similar tasks

### Quality Metrics
- Code review feedback patterns
- Testing coverage and bug detection
- User acceptance test results
- Post-deployment issues

## 🚨 Emergency Task Handling

### Critical Bugs
1. Create task document immediately
2. Mark as **Priority: Critical**
3. Skip planning phase if necessary
4. Focus on immediate fix, document thoroughly
5. Follow up with proper root cause analysis

### Hotfixes
1. Document the fix in existing task or create new one
2. Include rollback plan
3. Track in `active/` until verified in production
4. Move to `completed/` with lessons learned

## 🔗 Integration with Development Workflow

### Git Integration
- Reference task files in commit messages
- Link pull requests to task documentation
- Use task completion as merge criteria

### Code Comments
```javascript
// Related to: docs/tasks/active/FEATURE_profile_enrichment_2025-01-10.md
// Implements profile photo error handling (Phase 2, Step 3)
function handleProfilePhotoError(imageUrl) {
    // Implementation here
}
```

### Testing Integration
- Reference task acceptance criteria in test cases
- Use task completion checklist for test planning
- Document test results in task files

## 📚 Best Practices

### Writing Task Documentation
1. **Be Specific**: Clear, actionable requirements
2. **Include Context**: Why this task is important
3. **Define Success**: Measurable completion criteria
4. **Plan Testing**: How to verify it works
5. **Document Decisions**: Why you chose this approach

### Managing Dependencies
1. **Identify Early**: List all dependencies upfront
2. **Track Blockers**: Keep dependency status updated
3. **Communicate**: Note when dependencies are resolved
4. **Adapt**: Update plans when dependencies change

### Handoff Documentation
1. **Current State**: Where work stopped
2. **Next Steps**: What to do next
3. **Known Issues**: Problems discovered during work
4. **Context**: Decisions made and why

This task documentation system ensures that every piece of work is properly planned, tracked, and documented for optimal Claude Code session management and project continuity.