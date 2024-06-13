import toast from 'react-hot-toast'
import { CloseIcon, SuccessIcon } from '../Icons/Icons'
import { NotifyTypes } from './NotifyMethods'
import styles from './Notify.module.css'
import { Button } from '../Button/Button'
import { ButtonVariant } from '../Button/ButtonVariants'

interface NotifyProps {
  message: string
  type: NotifyTypes
}

const renderIcon = (type: NotifyTypes) => {
  if (type === 'success') {
    return <SuccessIcon />
  } else {
    return null
  }
}

export const Notify: React.FC<NotifyProps> = ({ message, type }) => {
  return (
    <div className={styles.toastInner}>
      <span className={styles.toastIcon}>{renderIcon(type)}</span>
      <p className={styles.toastMessage}>{message}</p>
      <div className={styles.buttonWrapper}>
        <Button variant={ButtonVariant.Link} onClick={() => toast.dismiss()}>
          <CloseIcon />
        </Button>
      </div>
    </div>
  )
}
