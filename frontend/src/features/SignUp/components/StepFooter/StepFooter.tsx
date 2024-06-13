import styles from './StepFooter.module.css'
import {
  ButtonVariant,
  ButtonVariantColor,
  ButtonVariantTextColor,
} from '../../../../components/shared/Button/ButtonVariants.ts'
import { ReactElement } from 'react'
import { BackButton, MainButton } from '@twa-dev/sdk/react'

interface StepFooterProps {
  onBack: () => void
  onForward: () => void | Promise<void>
  forwardButtonText: string
  disableForward?: boolean
  showMainButton: boolean
}

export const StepFooter = ({
  onBack,
  onForward,
  forwardButtonText,
  disableForward = false,
  showMainButton,
}: StepFooterProps) => {
  return (
    <div className={styles.stepFooter}>
      <div className={styles.backButtonWrapper}>
        <BackButton
          // variant={ButtonVariant.Secondary}
          onClick={onBack}
        />
      </div>
      {showMainButton ? (
        <MainButton
          disabled={disableForward}
          textColor={
            disableForward
              ? ButtonVariantTextColor.Disabled
              : ButtonVariantTextColor.Primary
          }
          color={
            disableForward
              ? ButtonVariantColor.Disabled
              : ButtonVariantColor.Primary
          }
          // variant={
          //   disableForward ? ButtonVariant.Disabled : ButtonVariant.Primary
          // }
          onClick={onForward}
          text={forwardButtonText}
          // type="button"
          // className={styles.forwardButton}
        />
      ) : null}
    </div>
  )
}
