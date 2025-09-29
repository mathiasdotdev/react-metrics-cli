---
description: Generate or update CHANGELOG.md based on local file modifications and git changes after completing development work
---

The user input to you can be provided directly by the agent or as a command argument - you **MUST** consider it before proceeding with the prompt (if not empty).

User input:

$ARGUMENTS

Goal: Analyze current project state, categorize changes, and update CHANGELOG.md with a properly formatted entry following the project's existing changelog patterns.

Execution steps:

1. **Analyze Current State**:
   - Run `git status --porcelain` to identify all modified, added, and deleted files
   - Read existing CHANGELOG.md to extract:
     - Latest version number (parse version from most recent entry)
     - Date of last changelog entry
     - Existing format and structure patterns
   - Check if there are recent commits since last changelog date with `git log --oneline --since="YYYY-MM-DD"`

   - Analyze each modified file to determine change type:
     - **Added**: New features, new files, new functionality (e.g., new commands, new modules)
     - **Changed**: Modifications to existing features, improvements (e.g., refactored logic, enhanced UX)
     - **Fixed**: Bug fixes, error corrections (e.g., resolved issues, corrected behavior)
     - **Technical**: Internal changes not affecting users (e.g., refactoring, deps, build, tests)
   - Group similar changes together and create concise, meaningful descriptions
   - Focus on user-facing impact for Added/Changed/Fixed categories

3. **Version Calculation**:
   - Based on change types, suggest semantic version bump:
     - **patch** (x.x.+1): Only fixes and technical changes
     - **minor** (x.+1.0): New features or significant improvements
     - **major** (+1.0.0): Breaking changes or major architectural overhauls
   - Present suggested version to user for confirmation
   - Allow manual version override if needed

4. **Generate Changelog Entry**:
   - Create properly formatted entry following existing CHANGELOG.md patterns
   - Structure: `## [VERSION] - YYYY-MM-DD` with current date
   - Organize sections in order: Added, Changed, Fixed, Technical (only include non-empty sections)
   - Use consistent bullet point formatting and descriptive language
   - Maintain existing style conventions (bold keywords, formatting patterns)

5. **Update CHANGELOG.md**:
   - Insert new entry at top of file (after "## [Non publiée]" if present)
   - Preserve all existing content and formatting
   - Show preview of changes before confirming
   - Ask for user approval before writing to file

Behavior Rules:
- **ALWAYS** analyze actual git status and file changes before proceeding
- **NEVER** assume changes without verification
- **MUST** follow existing CHANGELOG.md format and conventions
- **REQUIRE** user confirmation before writing any changes
- **PRESERVE** all existing content and formatting
- **PRIORITIZE** user-facing changes in descriptions
- If no significant changes detected, inform user and exit gracefully
- If CHANGELOG.md missing, offer to create using existing project patterns

Error Handling:
- Abort if not in a git repository with clear error message
- Handle corrupted or malformed CHANGELOG.md gracefully
- Provide actionable error messages with next steps
- Skip files that cannot be analyzed (binary, permission issues)

Success Criteria:
- Generated entry matches existing format perfectly
- All significant changes are captured and categorized correctly
- Version increment follows semantic versioning principles
- User approves final result before file modification
- No existing content is lost or corrupted

Integration with Development Workflow:
- Use this command after completing development work with `/implement` or other feature development
- Ideal for post-development changelog maintenance following specify workflows
- Complements project versioning and release processes
- Can be used before creating git commits to document changes properly

Context for execution: $ARGUMENTS