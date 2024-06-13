import toast from 'react-hot-toast'
import { Notify } from './Notify'
import styles from './Notify.module.css'

export type NotifyTypes = 'warning' | 'success' | 'error'

export const ShowNotify = (message: string, type: NotifyTypes) =>
  toast(<Notify message={message} type={type} />, {
    className: `${styles.toast} ${styles[type]}`,
    duration: 2000,
  })
