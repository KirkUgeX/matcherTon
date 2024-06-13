import styles from './Stepper.module.css'

interface StepperProps {
  totalSteps: number
  currentStep: number
}

export const Stepper = ({ totalSteps, currentStep }: StepperProps) => {
  const renderSteps = () => {
    const steps = []

    const stepWidth = (100 - (totalSteps - 1)) / totalSteps

    for (let i = 0; i < totalSteps; i++) {
      const stepStyles =
        currentStep === i + 1
          ? styles.stepCurrent
          : i < currentStep
          ? styles.stepPrevious
          : styles.stepFollowing
      steps.push(
        <div
          key={i}
          className={stepStyles}
          style={{ width: `${stepWidth}%` }}
        ></div>
      )
    }

    return steps
  }

  return <div className={styles.stepper}>{renderSteps()}</div>
}
