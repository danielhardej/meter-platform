name: Specification
description: Define what done looks like and why before planning implementation.
title: "[Spec]: "
labels:
  - needs-plan
body:
  - type: markdown
    attributes:
      value: >-
        A specification describes what and why, not how. Keep it focused on one story, make each criterion observable, and leave implementation decisions for the plan. Use docs/specs/TEMPLATE.md when the specification belongs next to the code.

  - type: input
    id: story-link
    attributes:
      label: Story link
      description: Link the story or issue that explains the user need.
      placeholder: "#123"
    validations:
      required: true

  - type: dropdown
    id: status
    attributes:
      label: Status
      options:
        - Draft
        - Ready for plan
        - Planned
        - Done
    validations:
      required: true

  - type: input
    id: owner
    attributes:
      label: Owner
      description: Name the person or role responsible for resolving open questions.
      placeholder: Product owner
    validations:
      required: true

  - type: textarea
    id: user-story
    attributes:
      label: User story
      description: State the need in the user's words.
      placeholder: As a … I want … so that …
    validations:
      required: true

  - type: textarea
    id: acceptance-criteria
    attributes:
      label: Acceptance criteria
      description: Use Given / When / Then with concrete values and one observable behaviour per criterion. Include at least one unhappy path.
      value: |-
        AC-1: Given …
        When …
        Then …

        AC-2: Given …
        When …
        Then …
    validations:
      required: true

  - type: textarea
    id: constraints
    attributes:
      label: Constraints
      description: Reference the brief, path rules, nearest AGENTS.md and ADRs. Do not repeat them.
      placeholder: "- Constraint — source"
    validations:
      required: true

  - type: textarea
    id: in-scope
    attributes:
      label: In scope
      description: List the behaviours and outcomes this specification includes.
      placeholder: "- Included behaviour or outcome"
    validations:
      required: true

  - type: textarea
    id: non-goals
    attributes:
      label: Non-goals
      description: List what must not change or be included.
      placeholder: "- Out-of-scope behaviour, file or system"
    validations:
      required: true

  - type: textarea
    id: open-questions
    attributes:
      label: Open questions and decisions
      description: List each business decision, its owner and its answer. Write None if there are no open questions.
      placeholder: "- Question — owner — answer or Pending"
    validations:
      required: true

  - type: textarea
    id: verification
    attributes:
      label: Verification
      description: Map every criterion to the test or check that will prove it, then include the repo-level check.
      placeholder: |-
        AC-1: Test or check
        AC-2: Test or check
        Repo: Verification command or check
    validations:
      required: true

  - type: textarea
    id: slices
    attributes:
      label: Behaviour slices
      description: Name PR-sized behaviours, the criteria each covers and whether each can ship on its own.
      placeholder: |-
        Slice 1: Behaviour — covers AC-1 — ships on its own
        Slice 2: Behaviour — covers AC-2 — ships on its own

  - type: checkboxes
    id: ready
    attributes:
      label: Ready for planning check
      options:
        - label: Every criterion is observable and testable.
        - label: The criteria include at least one unhappy path.
        - label: Constraints are referenced rather than repeated.
        - label: Non-goals are explicit.
        - label: Open questions are answered or have an owner.
        - label: Behaviour slices are named.
        - label: A new team member could build the right thing from this specification without asking anything.