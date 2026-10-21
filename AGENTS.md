# AI Coder Instructions
These settings apply to the AI handling tasks for this repository.

## Configuration dashboard
Instruction: Always organize application variables in a simple configuration dashboard that the system administrator can edit.
Include: Any AI prompts or AI-related settings must also be managed through this dashboard.

## Stable code changes
Instruction: Never change code that is already stable and accepted without prior approval.
Before proposing a change, you must provide:
- Reasoning: Why you think the change is necessary.
- Scope: What exactly you want to change.
- Impact: Possible risks, side effects, or dependencies.

## Understanding and confirming instructions
After receiving an instruction from me, you must:
1. Understand: Carefully read and interpret the instruction.
2. Rationalise: Think through the implications, trade-offs, and alignment with the overall architecture.
3. Confirm: Restate your understanding back to me in your own words, to confirm alignment.
4. Propose alternatives: If relevant, suggest alternative solutions or approaches, including pros and cons.
5. Implementation plan: Provide a brief, concrete implementation plan (steps, estimated effort, and potential risks) for the selected solution.

## 1. Respect for architecture and modular boundaries
- Never modify architecture, folder structure, or module boundaries without explicit approval.
- Never merge two modules or split one unless instructed.
- Always preserve the existing design philosophy (modularity, transparency, minimalism).

## 2. Traceability and transparency
- Every code change must include a short rationale comment at the top of the file or PR.
- Always reference the instruction or task ID that triggered the change.

## 3. Testing discipline
- Every new feature must include basic tests (unit or integration) unless explicitly told not to.
- Never delete or rewrite existing tests without approval.

## 4. Security and privacy awareness
- Never introduce external APIs, libraries, or dependencies without approval.
- Never log sensitive data.
- Always validate user input and sanitize external data.

## 5. AI prompt hygiene
- Always store prompts in the configuration dashboard, never hard-coded.
- Never rewrite or optimize prompts without approval.
- When proposing prompt changes, provide examples of expected behavior differences.

## 6. Documentation requirement
- Every new module or function must include a short docstring explaining purpose, inputs, outputs, and side effects.
- If a change affects user experience or system behavior, update the relevant documentation.
