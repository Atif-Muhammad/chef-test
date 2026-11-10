import React from 'react';

/**
 * StepProgressBar
 * Multi-step navigation progress bar matching the design reference:
 * - Completed steps: solid green circle with white checkmark
 * - Current active step: solid green circle with step number
 * - Upcoming steps: light gray circle with step number
 * - Connecting lines: green when previous step completed, light gray otherwise
 * - Step labels centered below each circle
 */
export default function StepProgressBar({
  steps = [],
  currentStep = 1,
  onStepClick = null,
  allowClickCompletedOnly = true,
  className = '',
  style = {},
}) {
  return (
    <div
      className={`step-progress-bar ${className}`}
      style={{
        width: '100%',
        backgroundColor: '#f6f3eb',
        borderRadius: '4px',
        border: '1px solid var(--color-border, #ece7de)',
        boxShadow: 'none',
        ...style,
      }}
    >
      <div className="step-progress-track">
        {steps.map((step, idx) => {
          const stepNum = idx + 1;
          const isCompleted = stepNum < currentStep;
          const isActive = stepNum === currentStep;
          const isClickable = Boolean(
            onStepClick && (!allowClickCompletedOnly || isCompleted || isActive)
          );

          const title = typeof step === 'string' ? step : step.title;
          const subtitle = typeof step === 'object' ? step.subtitle : '';

          return (
            <React.Fragment key={idx}>
              {/* Step Circle & Label Node */}
              <div
                className="step-progress-node"
                onClick={() => isClickable && onStepClick(stepNum)}
                style={{
                  cursor: isClickable ? 'pointer' : 'default',
                  transition: 'transform 0.15s ease',
                }}
                title={isClickable ? `Jump to Step ${stepNum}: ${title}` : undefined}
              >
                {/* Step Circle */}
                <div
                  className="step-progress-circle"
                  style={{
                    backgroundColor: isCompleted || isActive ? '#15803d' : '#d1d5db',
                    color: '#ffffff',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  ) : (
                    <span>{stepNum}</span>
                  )}
                </div>

                {/* Step Title Label */}
                <span
                  className="step-progress-title"
                  style={{
                    fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                    color: isActive ? '#15803d' : isCompleted ? '#2e3b12' : '#888277',
                  }}
                >
                  {title}
                </span>

                {subtitle && (
                  <span
                    className="step-progress-subtitle"
                    style={{
                      fontSize: '0.64rem',
                      color: 'var(--color-text-muted, #716c62)',
                      marginTop: '2px',
                    }}
                  >
                    {subtitle}
                  </span>
                )}
              </div>

              {/* Connecting Line Between Steps */}
              {idx < steps.length - 1 && (
                <div
                  className="step-progress-line"
                  style={{
                    backgroundColor: currentStep > stepNum ? '#15803d' : '#e5e7eb',
                    transition: 'background-color 0.25s ease',
                  }}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
}
