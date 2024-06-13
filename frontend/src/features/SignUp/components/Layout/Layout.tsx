import React, { ReactElement } from 'react'
import { StepTitle } from '../StepTitle/StepTitle.tsx'
import styles from './Layout.module.css'
import { BackButton, MainButton } from '@twa-dev/sdk/react'
import {
  ButtonVariantColor,
  ButtonVariantTextColor,
} from '../../../../components/shared/Button/ButtonVariants.ts'

interface LayoutProps {
  title: string
  onBackClick: () => void
  children: ReactElement | ReactElement[] | null
  forwardButtonText: string
  onForwardClick: () => void | Promise<void>
  disableForward?: boolean
  subtext: string
  showMainButton?: boolean
}

export const Layout: React.FC<LayoutProps> = ({
  title,
  children,
  onBackClick,
  forwardButtonText,
  onForwardClick,
  disableForward = false,
  subtext,
  showMainButton = true,
}) => {
  // const onForwardClick = () => {}

  return (
    <div className={styles.stepLayout}>
      <div className={styles.title}>
        <StepTitle subtext={subtext}>{title}</StepTitle>
      </div>
      {children}
      <div className={styles.backButtonWrapper}>
        <BackButton
          // variant={ButtonVariant.Secondary}
          onClick={onBackClick}
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
          onClick={onForwardClick}
          text={forwardButtonText}
          // type="button"
          // className={styles.forwardButton}
        />
      ) : null}
      {/*<button onClick={onForwardClick}>Next</button>*/}
    </div>
  )
}
