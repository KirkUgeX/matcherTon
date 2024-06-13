import styles from './TagsSphereEditing.module.css'
import { Passions } from '../../../SignUp/Steps/Passions/Passions.tsx'
import { Button } from '../../../../components/shared/Button/Button.tsx'
import { ButtonVariant } from '../../../../components/shared/Button/ButtonVariants.ts'
import { SubmitIcon } from '../../../../components/shared/Icons/Icons.tsx'
import { useState } from 'react'
import { BackButton } from '@twa-dev/sdk/react'

interface TagsSphereProps {
  tagsSpheres: string[]
  onSubmit: (chosenPassions: string[]) => void
  onClose: () => void
}

export const TagsSphereEditing = ({
  tagsSpheres,
  onSubmit,
  onClose,
}: TagsSphereProps) => {
  const [isSubmitted, setIsSubmitted] = useState(false)
  return (
    <div className={styles.tagsSphereEditing}>
      <Passions
        initialPassions={tagsSpheres}
        onSuccessfulSubmit={onSubmit}
        onBackButtonClick={() => {}}
        isSubmitted={isSubmitted}
        showMainButton={false}
      />
      <Button
        variant={ButtonVariant.Primary}
        onClick={() => setIsSubmitted(true)}
        type="button"
      >
        Save and return <SubmitIcon />
      </Button>
      <BackButton onClick={onClose} />
    </div>
  )
}
