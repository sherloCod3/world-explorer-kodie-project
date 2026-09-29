# AGENTS — Engineering Workflow

This document defines how engineering work should be executed.

Follow explicit user intent and authorization first, then the engineering principles defined by `SOUL.md`, then project-specific rules, then task-specific workflow and tooling.

---

## 1. TASK WEIGHT

Classify the task before acting.

### Quick
Use:

Understand → Execute → Validate

Examples:
- single-file correction
- simple query change
- small documentation update
- isolated formatting change

### Multi-step
Use:

Understand → Plan → Implement → Review → Validate

Examples:
- related changes across multiple files
- non-trivial SQL changes
- behavior changes requiring several edits

### Heavy
Use:

Understand → Context → Plan → stages → Implement → Code Review → Diff Review → Validate → Record State → Semantic Commit → Prioritize → Next Action

Examples:
- architectural changes
- complex debugging
- risky data changes
- large refactors
- production-sensitive work
- multi-system changes

Do not create unnecessary process for simple tasks.

---

## 2. BEFORE EDITING

Before changing anything:

1. Understand the objective.
2. Identify the affected area.
3. Establish the current baseline.
4. Identify the source of truth.
5. Identify dependencies and consumers.
6. Identify relevant constraints and invariants.
7. Check project-specific rules and established patterns.
8. Identify risks and validation requirements.

Do not guess project conventions.

Project-specific rules should be supported by:
- existing code
- configuration
- history
- documentation
- validation
- observed behavior
- explicit user/project instructions

If the source of truth is unclear, determine it before editing.

---

## 3. PLAN BEFORE MULTI-FILE CHANGES

For multi-file, risky, or behavior-changing work, create a concise plan before implementation.

The plan should identify:
- affected files/components
- intended change
- dependencies
- important invariants
- validation strategy
- potential risks

Do not turn planning into unnecessary documentation.

---

## 4. SURGICAL CHANGE CYCLE

For meaningful changes:

### Baseline
Understand the current state before editing.

### Discover
Look for:
- related errors
- dependencies
- invariants
- hidden constraints
- validation requirements
- existing precedents

### Surgical Edit
Change only what is necessary.

### Diff
Inspect the actual changes.

### Review
Check correctness, scope, regressions, and consistency.

### Validate
Run the strongest practical validation.

### Record State
Record relevant state when continuity or recovery requires it.

### Semantic Commit
Commit a coherent logical change when appropriate.

---

## 5. SURGICAL CHANGES

Prefer:
- localized edits
- existing patterns
- minimal dependencies
- preserved behavior
- reversible operations

Avoid:
- unrelated cleanup
- speculative refactoring
- unnecessary dependency changes
- broad formatting changes
- architecture changes without justification

A smaller diff is desirable, but correctness takes priority over artificial minimality.

---

## 6. DISCOVERED ISSUES

Discovery does not automatically authorize scope expansion.

Classify discovered issues as:

### BLOCKING
Prevents correctness, validation, build, tests, or safe completion.

Fix it or explicitly stop/escalate.

### RELATED
Directly connected to the current work and small, safe, and low-risk.

May be fixed when clearly beneficial.

### SAFE FOLLOW-UP
Real issue but not required for current completion.

Record it and use it when determining the next action.

### UNRELATED
Not materially connected to the current task.

Do not modify it.

### HIGH-RISK
Requires broader architectural, behavioral, or authorization decisions.

Do not silently expand scope. Record and recommend appropriate follow-up.

### Scope Rule

**Scope controls what is changed.  
Discovery controls what is known.  
Prioritization controls what happens next.**

Never silently ignore:
- failures introduced by the current change
- blocking validation failures
- correctness problems in the affected implementation

---

## 7. MULTI-FILE EDITING

Before editing multiple files:
- identify relationships between them
- determine dependency order
- preserve consistent state
- validate the combined result

Avoid partial implementation that leaves the repository knowingly inconsistent.

---

## 8. GIT AND DIFF REVIEW

Use Git as an engineering tool.

Before completion:
- inspect the diff
- check for accidental changes
- check for unrelated files
- verify the intended files changed
- inspect deletions carefully
- confirm generated or temporary artifacts are handled correctly

Do not rely only on the final file contents.

---

## 9. SOURCE OF TRUTH AND ARTIFACT BOUNDARIES

Identify the repository's primary product/source artifacts.

Distinguish:
- source-of-truth artifacts
- supporting artifacts
- generated outputs
- temporary files
- backups
- validation artifacts

Do not modify, regenerate, delete, or commit supporting/generated artifacts without understanding their role.

Generated output is not automatically the source of truth.

When multiple representations exist, determine which one controls behavior before editing.

---

## 10. PROJECT PRECEDENTS

When a materially similar, known-good implementation or workflow exists:

- inspect it before designing a new approach
- prefer established patterns when evidence supports them
- reuse proven structures where appropriate
- do not assume historical precedent is automatically correct
- validate the precedent against the current objective and constraints

Historical examples are evidence, not unquestionable authority.

---

## 11. VALIDATION STANDARD

Validation should be proportional to risk.

Possible validation includes:
- syntax checks
- XML validation
- compilation
- linting
- type checking
- unit/integration tests
- query validation
- generated output inspection
- runtime checks
- diff review
- structural checks

Use the strongest practical validation available.

Do not silently ignore validation failures.

Failures caused by the current change must be resolved or explicitly escalated before completion.

### Cross-Structure Invariants

When correctness depends on multiple structures remaining synchronized, validate the relationship between them.

Examples:
- query fields ↔ declared fields
- parameters ↔ query parameters
- schema ↔ migration
- API contract ↔ consumer
- configuration ↔ required resources
- source definition ↔ generated output

Do not validate related structures independently when correctness depends on their relationship.

---

## 12. SELF-REVIEW

Before declaring completion, ask:

- Did I solve the actual objective?
- Did I change only what was necessary?
- Did I preserve existing behavior?
- Did I discover relevant constraints or issues?
- Did I verify the source of truth?
- Did I validate important invariants?
- Did I inspect the diff?
- Did validation pass?
- Did I leave known blocking problems unresolved?
- Did I accidentally expand scope?
- Is the resulting state understandable and recoverable?

---

## 13. DEBUGGING

Debug from evidence.

Preferred order:

1. Reproduce or observe the failure.
2. Establish the baseline.
3. Identify the failing boundary.
4. Trace the dependency/data flow.
5. Form a root-cause hypothesis.
6. Make the smallest useful change.
7. Validate.
8. Review the result.

Do not stack speculative fixes.

Each failed attempt should reduce uncertainty.

---

## 14. SUB-AGENTS

Delegate when delegation materially improves speed, specialization, or context management.

When delegating:
- provide precise context
- define the expected output
- keep authorization boundaries clear
- avoid redundant work

The executor performs the delegated task.

The main agent remains responsible for:
- reviewing the result
- inspecting the diff
- validating correctness
- checking scope
- deciding whether the result is acceptable

**Delegation does not replace verification.**

---

## 15. PROJECT BRIEFING

Before substantial work, maintain a compact understanding of:

- project purpose
- relevant architecture
- source of truth
- important constraints
- validation commands
- known risks
- important dependencies
- established project patterns

Do not build a briefing larger than necessary.

---

## 16. PROJECT RESUME

When continuing existing work:

1. inspect current state
2. inspect recent changes
3. inspect relevant diffs
4. identify incomplete work
5. identify pending validation
6. confirm the current objective
7. continue from evidence, not memory or assumptions

Do not repeat completed work unnecessarily.

---

## 17. CHANGE LOG

Record meaningful state changes when they help:
- continuity
- recovery
- handoff
- debugging
- traceability

Do not create documentation solely for ceremony.

---

## 18. MEMORY

Store only reusable engineering knowledge.

Prefer:
- project conventions
- stable architectural facts
- recurring constraints
- known validation requirements
- established patterns
- important decisions

Avoid storing:
- temporary task details
- guesses
- redundant information
- sensitive data unless explicitly required and permitted

---

## 19. CONTEXT COST

Use context deliberately.

Prefer:
- relevant files
- targeted searches
- concise plans
- focused validation
- summaries of established facts

Avoid:
- rereading irrelevant content
- repeating known information
- loading unnecessary files
- excessive process narration

Context is a limited engineering resource.

---

## 20. TASK COMPLETION GATE

Before declaring the task complete:

- [ ] Objective satisfied
- [ ] Scope respected
- [ ] Relevant discoveries classified
- [ ] Source of truth confirmed
- [ ] Important invariants validated
- [ ] Diff reviewed
- [ ] Validation completed
- [ ] Validation failures addressed or explicitly reported
- [ ] Blocking issues resolved or escalated
- [ ] Relevant state recorded
- [ ] Semantic commit created when appropriate
- [ ] Next Action determined

Do not declare completion merely because the requested edit was made.

---

## 21. FINAL OUTPUT

The final response should clearly communicate:

- what changed
- what was validated
- relevant discovered issues
- important remaining risks
- current state
- next action

### Next Action Decision

Determine the next action using:

- correctness
- blockers
- dependencies
- validation state
- implementation order
- risk
- scope
- impact on subsequent work

When one action is clearly preferable:

**Next Action:** `<specific action>`

**Why:** `<brief reason>`

When multiple actions genuinely have equal priority:
- rank them
- explain the trade-off briefly
- identify the default recommendation when possible

Avoid vague recommendations such as:
- “continue development”
- “keep testing”
- “review later”

The next action should be concrete and logically connected to the current state.

---

# FINAL WORKFLOW

### Quick
**Understand → Execute → Validate**

### Multi-step
**Understand → Plan → Implement → Review → Validate**

### Heavy
**Understand → Context → Plan → stages → Implement → Code Review → Diff Review → Validate → Record State → Semantic Commit → Prioritize → Next Action**

### Always

**Scope narrowly.  
Discover broadly.  
Execute surgically.  
Verify aggressively.  
Commit semantically.  
Recommend the next logical action.**
