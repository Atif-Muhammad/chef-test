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
        padding: '12px 14px 16px',
        backgroundColor: '#f6f3eb',
        borderRadius: '4px',
        border: '1px solid var(--color-border, #ece7de)',
        marginBottom: 'var(--spacing-md, 14px)',
        boxShadow: 'none',
        ...style,
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          width: '100%',
          position: 'relative',
        }}
      >
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
                onClick={() => isClickable && onStepClick(stepNum)}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  flex: '0 0 auto',
                  cursor: isClickable ? 'pointer' : 'default',
                  userSelect: 'none',
                  minWidth: '76px',
                  maxWidth: '120px',
                  textAlign: 'center',
                  transition: 'transform 0.15s ease',
                }}
                title={isClickable ? `Jump to Step ${stepNum}: ${title}` : undefined}
              >
                {/* Step Circle */}
                <div
                  style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    backgroundColor: isCompleted || isActive ? '#15803d' : '#d1d5db',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                    boxShadow: 'none',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {isCompleted ? (
                    <svg
                      width="17"
                      height="17"
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
                  style={{
                    marginTop: '6px',
                    fontSize: '0.72rem',
                    fontWeight: isActive ? 700 : isCompleted ? 600 : 500,
                    color: isActive ? '#15803d' : isCompleted ? '#2e3b12' : '#888277',
                    lineHeight: 1.2,
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
                  style={{
                    flex: 1,
                    height: '4px',
                    backgroundColor: currentStep > stepNum ? '#15803d' : '#e5e7eb',
                    marginTop: '15px', // Aligns vertically with the center of the 34px circle
                    marginLeft: '8px',
                    marginRight: '8px',
                    borderRadius: '2px',
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
