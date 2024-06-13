import styles from './Button.module.css'
import { ButtonVariant } from './ButtonVariants'

type BaseButtonAttributes = React.ComponentPropsWithoutRef<'button'>

interface ButtonProps extends BaseButtonAttributes {
  isLoading?: boolean
  disabled?: boolean
  variant: ButtonVariant
  onClick: () => void
  type?: 'button' | 'submit'
}

export const Button: React.FC<ButtonProps> = (props: ButtonProps) => {
  const { variant, onClick, children, isLoading, type, ...rest } = props

  return (
    <button
      {...rest}
      type={type}
      className={`${styles.button} ${styles[variant]} ${isLoading ? styles.disabled : ''}`}
      onClick={onClick}
    >
      {children}
    </button>
  )
}
