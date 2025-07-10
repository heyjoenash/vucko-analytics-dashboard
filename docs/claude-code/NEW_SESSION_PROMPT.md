# Comprehensive New Session Prompt

Use this prompt when starting a new Claude Code session for the Signals & Actions project to ensure optimal context loading and session effectiveness.

## 🎯 The Prompt

```
I'm starting a new Claude Code session for the Signals & Actions project - a LinkedIn engagement analytics platform. Please help me continue development effectively.

## Project Context
This is a LinkedIn engagement analytics platform that tracks post interactions, enriches contact data, and provides CRM pipeline functionality for B2B sales teams. The app is built with vanilla JavaScript, uses Supabase PostgreSQL for data, integrates with LinkedIn API and Apify scrapers.

## Essential Context Loading
Please read these files in order to understand the current state:

1. **Current State & Priorities:**
   - `CLAUDE.md` - Overall project context and current focus
   - `docs/claude-code/CURRENT_STATE.md` - Live project status and immediate priorities

2. **Session Management:**
   - `docs/claude-code/SESSION_HANDOFF.md` - Template and context from previous sessions
   - `docs/tasks/active/` - Currently active tasks and their status

3. **Project Understanding:**
   - `docs/QUICKSTART.md` - 5-minute setup guide and essential commands
   - `docs/core/ARCHITECTURE.md` - System architecture overview (if needed for context)

## Immediate Verification
After loading context, please verify the application status:

1. **Check if app is running:** The frontend should be accessible at http://localhost:4200
2. **Review git status:** Check for any uncommitted changes or recent commits
3. **Identify active work:** Look at tasks in `docs/tasks/active/` to understand current work items

## Session Objectives
Based on the context you load, please:
- Summarize the current project state and any immediate issues
- Identify the highest priority tasks or problems to focus on
- Confirm the application is functional or help debug if not
- Suggest the best approach for this session based on current priorities

## Development Context
- **Tech Stack:** Vanilla JS + Tailwind CSS frontend, Node.js API proxy, Supabase PostgreSQL
- **Data Sources:** Apify LinkedIn scraper, LinkedIn Marketing API, manual imports
- **Current Data:** ~283 people, ~126 companies, functional import/export system
- **Key Features:** People analytics, company insights, post engagement tracking, CRM pipeline

## Documentation Structure
The project has comprehensive documentation:
- `docs/core/` - Architecture, database, API, deployment guides  
- `docs/guides/` - User and developer guides, troubleshooting
- `docs/tasks/` - Task management with templates and active work
- `docs/claude-code/` - Claude Code specific documentation and workflows

## Session Management Guidelines
Please follow the established workflows in:
- `docs/claude-code/SESSION_WORKFLOW.md` - Complete A-Z session management
- `docs/claude-code/BEST_PRACTICES.md` - Development best practices
- `docs/claude-code/COMMANDS.md` - Common commands and debugging procedures

## Important Notes
- This project uses a comprehensive task management system - always update task status as work progresses
- All API keys are in `app/config.js` (excluded from git) - verify this exists and is properly configured
- The app has been through significant reorganization recently - the structure should be clean and professional
- Profile photos are currently having loading issues - this may be a high priority item
- Test imports can be done with Apify Run ID: `qEDjxfcGtjl6vcMZk`

Please start by loading the essential context and giving me a summary of the current state and your recommended focus for this session.
```

## 📋 Prompt Customization

### For Specific Focus Areas

**Bug Fixing Session:**
Add to the prompt:
```
I'm particularly focused on debugging and fixing issues today. Please pay special attention to:
- Any error reports in the current state documentation
- Failed tests or broken functionality
- Performance issues or user experience problems
```

**Feature Development Session:**
Add to the prompt:
```
I'm planning to work on new feature development today. Please review:
- Planned features in the project roadmap
- Current architecture to understand how new features should integrate
- Any design patterns or conventions established in the codebase
```

**Documentation/Organization Session:**
Add to the prompt:
```
I'm focusing on documentation and project organization today. Please assess:
- Documentation completeness and accuracy
- Project structure and file organization
- Task management system effectiveness
```

**Emergency/Recovery Session:**
Add to the prompt:
```
I'm responding to a critical issue or recovery situation. Please prioritize:
- Application functionality and basic operations
- Any emergency recovery procedures documented
- Critical path operations that must be working
```

## 🔧 Prompt Optimization Tips

### For Faster Context Loading
If you need to limit context due to session constraints:
```
Please focus on loading only the most essential context:
1. CLAUDE.md - Current priorities
2. docs/claude-code/CURRENT_STATE.md - Immediate status
3. docs/tasks/active/ - Active work items

Skip the broader architecture docs unless needed for the specific task at hand.
```

### For Continuing Previous Work
If you're continuing from a specific task:
```
I'm continuing work on a specific task from the previous session:
- Task file: docs/tasks/active/[SPECIFIC_TASK_FILE]
- Please load this task context first, then the general project context
- Focus on understanding where the previous session left off
```

### For New Team Members
If someone new is joining the project:
```
This is a new team member's first session with the project. Please:
- Load the full context including architecture and setup docs
- Provide a comprehensive overview of the system
- Recommend starting with the quickstart guide
- Suggest good "first tasks" for getting familiar with the codebase
```

## 📊 Expected Response Pattern

A good Claude Code response to this prompt should include:

1. **Context Loading Confirmation:**
   - "I've loaded the essential context files..."
   - Summary of current project state
   - Identification of immediate priorities

2. **System Status Assessment:**
   - Application functionality status
   - Git repository state
   - Active tasks summary

3. **Session Recommendations:**
   - Suggested focus for this session
   - Priority order for tasks
   - Any blockers or dependencies to be aware of

4. **Readiness Confirmation:**
   - "I'm ready to help with [specific task/area]"
   - Clear next steps
   - Questions about session objectives if needed

## 🚀 Session Startup Verification

After using this prompt, verify the session is properly set up:

- [ ] Claude has loaded the essential context
- [ ] Current project state is understood
- [ ] Active tasks are identified
- [ ] Session focus is established
- [ ] Application status is confirmed
- [ ] Ready to begin productive development work

This prompt ensures consistent, effective session startup with proper context and clear direction for productive development work.