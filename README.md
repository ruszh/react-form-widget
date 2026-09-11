# Schema-driven multi-step form

A small form engine: the schema (steps, fields, validation rules) is fetched at
runtime, rendered one step per screen, validated from the schema on every
Next, persisted across reloads, and posted as one flat JSON object at the end.

## Run

```bash
npm install
cp .env-example .env   # VITE_SCHEMA_URL, VITE_SUBMIT_URL
npm run dev            # http://localhost:5173
npm run check          # tsc -b, oxlint, vitest
```

`.env` is gitignored; `.env-example` holds the schema and submit URLs used for
this assignment.

## How the schema flows

```
fetch (api.ts)
  → parseFormSchema (schema/parse.ts)        untrusted JSON becomes FormSchema, or a readable error
  → startSession (store/formSession.ts)      persisted session is bound to this schema
  → FormWidget (ui/FormWidget.tsx)           picks schema.steps[stepIndex], handles Next / Back / Submit
    → StepForm (ui/StepForm.tsx)             one react-hook-form instance per step
      → resolver (engine/resolver.ts)        adapter around the pure engine
        → validation (engine/validation.ts)  rules in schema order, first failing message wins
      → FieldRenderer (ui/fields/)           fieldControls[field.component] from the registry
```

- `schema/` is the contract. `types.ts` models it; `Field` is a discriminated
  union built from a mapped type keyed by `component`, so `FieldByComponent['select']`
  is the exact shape of a select field. `parse.ts` is the only place where fetched
  JSON becomes typed (no `as` casts downstream).
- `engine/` has no React or react-hook-form imports in `validation.ts`; the
  resolver is a thin adapter. Anything can validate a step with the same code.
- `store/` is the whole-form session. `hooks/` own the two async flows.
- `ui/` renders whatever the schema says. New fields or steps in the JSON need no
  code; only a new field *type* does (see below).

## Where state lives

| State | Owner | Persisted |
|---|---|---|
| Values and errors of the step on screen | react-hook-form in `StepForm` (remounted per step, seeded from the store) | No; committed to the store on Next (validated) or Back (draft) |
| Form id, step index, all answers | zustand store `useFormSession` | Yes, `localStorage` |
| The schema | `useFormSchema` | No, always fetched |
| Submission status | `useSubmission` | No, on purpose: a reload mid-request must not come back to a stuck pending screen |

## Decisions

- **Zustand with `persist`.** The persisted whole-form state (`formId`, `stepIndex`,
  `values`) is the entire reason for a store; `persist` gives "survives a reload"
  for free. Everything step-local stays in react-hook-form.
- **One `useForm` per step**, remounted with `key={step.id}`. A single instance for
  all steps would make `handleSubmit` validate fields of other steps and force a
  `trigger()` workaround. Every field of the step gets a default value so untouched
  selects and radio groups submit `''` rather than `null`.
- **Validation through a resolver, not `register` rules.** The rules live in one
  pure function that returns the schema's messages; the resolver just maps them
  into react-hook-form's error shape. `mode` and `reValidateMode` are both
  `'onSubmit'`, so messages change only when Next is pressed, never per keystroke
  (a shown message therefore stays until the next Next). `<form noValidate>` keeps
  the browser's own email/date bubbles out of the way.
- **Back keeps drafts.** Back saves the current values without validating, so
  nothing typed is lost; Next validates before saving and advancing. Every step
  before the current one has been validated at the moment the user advanced past
  it, so no whole-form re-validation runs before submit.
- **All values are strings.** Text, email, tel, date (`YYYY-MM-DD`), select and
  choice all produce a string, so `FormValues = Record<string, string>` and the POST
  body is exactly that. A component with a non-string value would widen this type.
- **Hand-written parser instead of zod.** ~90 lines with `unknown` narrowing and
  type predicates keep the types the source of truth and avoid a dependency for
  one boundary. In a larger codebase I would use zod/valibot here.
- **Submission.** A ref guards against a second click before React re-renders
  (react-hook-form's `handleSubmit` has no re-entrancy guard), and the form is
  replaced by a pending screen. The payload is built from the schema's field list,
  so it has exactly the schema's keys. On success the store is reset *before* the
  success screen shows, so a reload there cannot resurrect the answers.
- **Session reconciliation.** `startSession` runs after parsing: a different
  `formId` wipes the session, a shorter schema clamps `stepIndex`.
- **`localStorage`** rather than `sessionStorage`, so an accidentally closed tab
  also resumes. For a real product with PII the choice is worth revisiting.
- **CSS modules**, one per component that has layout; `index.css` is only a reset.

## Adding a field type

1. Add the key and its extra props to `FieldExtras` in `src/schema/types.ts`.
2. Accept it in `parseField` in `src/schema/parse.ts`; the `switch` stops compiling until you do.
3. Write the control in `src/ui/fields/controls.tsx` and add it to `fieldControls`
   in `src/ui/fields/registry.ts`; the mapped type stops compiling until every
   component has a control with matching props.

A new validation rule follows the same path: `ValidationRule` → `parseRule` →
`passes` in `src/engine/validation.ts`.

## Edge cases covered

- Schema load: HTTP errors, network errors, malformed JSON, unknown `component`
  or rule `type`, `select`/`choice` without options, a regex that does not
  compile, zero steps, duplicate field names. All surface as an error screen with
  Retry rather than a broken form.
- The fetch is aborted on unmount (StrictMode double-mount) without showing an error.
- Persisted session from another form id or a schema that lost steps.
- `min_age` compares calendar dates in local time (no `new Date('YYYY-MM-DD')`
  UTC shift), handles leap-day birthdays, and fails on malformed input.
- Optional fields: only `required` rejects an empty value; other rules are skipped.
- Double click on Submit sends one request; reload during or after submit behaves.

## Tests

`npm test` covers the pure parts: the parser's accept/reject cases and every
validation rule including `min_age` boundaries. The UI was verified by hand.

## Not done

- Component and end-to-end tests (react-testing-library / Playwright).
- Conditional fields, per-field `autocomplete` hints and input masking.
- Several widgets on one page: the store is a module singleton keyed by one
  storage key; a store factory per widget instance would be the next step.
- i18n, analytics, a date picker beyond `<input type="date">`.
