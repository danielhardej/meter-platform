# Solar feed-in credit in tariff quotes

## Story link

TBD

## Status

Draft

## Owner

Product owner (name TBD)

## User story

As a solar customer, I want my quote to show a feed-in credit for the energy I export, so that I can compare plans fairly.

## Acceptance criteria

### AC-1: Apply a feed-in credit

Given 10 kWh consumed, 5 kWh exported and a read time of `2026-11-02T10:00:00Z`
When a quote is requested
Then the quote returns `currency: AUD`, usage `amount: 3.20`, `feedInCredit: 0.40` and `netAmount: 2.80`.

### AC-2: Show the quote breakdown

Given the quote form contains 10 kWh consumed and 5 kWh exported
And the quote request succeeds with the AC-1 breakdown
When the result is shown
Then the customer sees separately labelled usage charge, feed-in credit and net amount in AUD.

### AC-3: Represent excess export as a credit

Given 1 kWh consumed, 10 kWh exported and a peak read time
When a quote is requested
Then the quote returns usage `amount: 0.32`, `feedInCredit: 0.80` and `netAmount: -0.48`.

### AC-4: Preserve existing quote requests

Given an existing caller omits `exportedKWh`
When it requests a quote
Then its usage charge is unchanged, `feedInCredit` is zero and `netAmount` equals `amount`.

### AC-5: Reject negative exported energy

Given a quote request contains a negative `exportedKWh`
When it is submitted
Then the API rejects it with HTTP 400 RFC 7807 problem details and does not calculate a quote.

### AC-6: Round each component to cents

Given 1.234 kWh consumed and 1.234 kWh exported at a peak read time
When a quote is calculated
Then usage and credit are rounded independently to `amount: 0.39` and `feedInCredit: 0.10`
And the resulting `netAmount` is `0.29`.

## Constraints

- Keep tariff and feed-in calculations pure and free of I/O — root `AGENTS.md` and `docs/architecture.md`.
- Validate the route payload with zod and return RFC 7807 errors — `.github/instructions/api.instructions.md` and ADR 0001.
- Preserve the existing `calculateTariff` signature and consumption behaviour — `docs/architecture.md`.
- Use Vitest with Arrange/Act/Assert and one behaviour per test — `.github/instructions/tests.instructions.md`.
- Add no dependency — `.github/instructions/review.instructions.md` and ADR 0002.
- Do not edit `generated/` or `infra/` — root `AGENTS.md`.

## In scope

- Optional non-negative `exportedKWh` on `POST /quotes`, defaulting to zero when omitted.
- A fixed fictional feed-in rate of 8 cents per exported kWh.
- Separate usage charge, feed-in credit and net amount in the quote response.
- Negative net amounts when export credit exceeds usage charge.
- Quote-form input and labelled display of the breakdown.
- Cent rounding and invalid-export behaviour.

## Non-goals

- Multiple plans, configurable plan selection, dynamic rates or time-of-use feed-in rates.
- Changes to meter-reading ingestion, persisted readings, billing runs, payments or tariff preview.
- Signed `kWh` values or changing the meaning of consumption `kWh`.
- NMI or customer identification for quote requests.
- Editing the separately maintained generated OpenAPI or client artifacts.

## Open questions and decisions

- Export input — product owner — decided: optional `exportedKWh`; `kWh` remains consumption.
- Feed-in tariff — product owner — decided: flat 8 cents per kWh for the first version.
- Response — product owner — decided: retain `amount` as usage charge and add `feedInCredit` and `netAmount`.
- Excess export — product owner — decided: permit negative `netAmount`.
- Story link and named owner — product owner — pending administrative metadata.

## Verification

- AC-1: Domain calculation test and Fastify injection test for the exact standard breakdown.
- AC-2: React interaction test entering export and asserting all three labelled AUD values.
- AC-3: Domain and route tests asserting a negative net amount.
- AC-4: Existing-payload route test asserting the unchanged charge and zero-credit breakdown; retain existing billing and preview tests.
- AC-5: Route test asserting HTTP 400 and RFC 7807 content for negative export; domain test asserting direct callers reject it.
- AC-6: Domain test asserting independent cent rounding and the resulting net amount.
- Repo: Run `npm run verify` with Node 22.

## Behaviour slices

- Slice 1: Domain and API quote breakdown — covers AC-1, AC-3, AC-4, AC-5 and AC-6 — ships independently as an additive API capability.
- Slice 2: Solar quote form and visible breakdown — covers AC-2 — ships after slice 1 and completes the user-facing story.

## Ready for planning check

- [x] Every criterion is observable and testable.
- [x] The criteria include at least one unhappy path.
- [x] Constraints are referenced rather than repeated.
- [x] Non-goals are explicit.
- [x] Behaviour decisions are answered or have an owner.
- [x] Behaviour slices are named.
- [x] A new team member could build the behaviour without further clarification.