import { Title } from '../../../../components/shared/Title/Title.tsx'
import { TitleVariant } from '../../../../components/shared/Title/TitleVariants.ts'
import styles from './StepTitle.module.css'

interface StepTitleProps {
  children: string
  subtext?: string
}

export const StepTitle: React.FC<StepTitleProps> = ({ children, subtext }) => {
  return (
    <div className={styles.stepTitle}>
      <h2 className={styles.title}>{children}</h2>
      <div className={styles.subtext}>{subtext}</div>
    </div>
  )
}
