import { useCallback, useMemo } from "react";
import { valuesForFields } from "../engine/values";
import { SubmissionStatus, useSubmission } from "../hooks/useSubmission";
import type { FormValues, FormSchema } from "../schema/types";
import { useFormSession } from "../store/formSession";
import styles from "./FormWidget.module.css";
import { ErrorScreen, PendingScreen, SuccessScreen } from "./screens";
import { StepForm } from "./StepForm";

export function FormWidget({ schema }: { schema: FormSchema }) {
  const stepIndex = useFormSession((s) => s.stepIndex);
  const values = useFormSession((s) => s.values);
  const saveValues = useFormSession((s) => s.saveValues);
  const goToStep = useFormSession((s) => s.goToStep);
  const { status, message, submit, reset } = useSubmission();

  const step = schema.steps[stepIndex];
  const isLast = stepIndex === schema.steps.length - 1;

  const allFields = useMemo(
    () => schema.steps.flatMap((s) => s.fields),
    [schema],
  );

  const handleNext = useCallback(
    (stepValues: FormValues) => {
      saveValues(stepValues);
      if (isLast)
        submit(valuesForFields(allFields, { ...values, ...stepValues }));
      else goToStep(stepIndex + 1);
    },
    [saveValues, isLast, submit, allFields, values, goToStep, stepIndex],
  );

  const handleBack = useCallback(
    (draft: FormValues) => {
      saveValues(draft);
      goToStep(stepIndex - 1);
    },
    [saveValues, goToStep, stepIndex],
  );

  const handleRetry = useCallback(
    () => submit(valuesForFields(allFields, values)),
    [submit, allFields, values],
  );

  switch (status) {
    case SubmissionStatus.Pending:
      return <PendingScreen />;
    case SubmissionStatus.Success:
      return <SuccessScreen onRestart={reset} />;
    case SubmissionStatus.Error:
      return (
        <ErrorScreen
          message={message ?? "Unknown error"}
          onRetry={handleRetry}
          onBackToForm={reset}
        />
      );
    case SubmissionStatus.Idle:
      return (
        <div className={styles.widget}>
          <header className={styles.header}>
            <h1>{schema.title}</h1>
            <p className={styles.progress}>
              Step {stepIndex + 1} of {schema.steps.length}
            </p>
            <h2>{step.title}</h2>
          </header>
          <StepForm
            key={step.id}
            step={step}
            values={values}
            isFirst={stepIndex === 0}
            isLast={isLast}
            onBack={handleBack}
            onNext={handleNext}
          />
        </div>
      );
  }
}
