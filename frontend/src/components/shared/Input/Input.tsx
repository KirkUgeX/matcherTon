import styles from './Input.module.css'
import { useFormContext } from 'react-hook-form'

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  name: string
  // should fix any
  register: any
  hint?: string
  labelText?: string
  hasError?: boolean
  disabled?: boolean
  iconToRender?: () => React.ReactNode
}

export const Input: React.FC<InputProps> = ({
  register,
  name,
  hint,
  labelText,
  iconToRender,
  hasError,
  disabled,
  ...props
}) => {
  const {
    formState: { errors },
  } = useFormContext()
  const isError = hasError || Boolean(errors[name])
  const bottomMessage = (errors[name]?.message as string) || hint
  return (
    <div
      className={`${styles.inputWrapper} ${
        isError ? styles.inputHasError : ''
      } ${disabled ? styles.disabled : ''}`}
    >
      {labelText && <label className={styles.label}>{labelText}</label>}
      <div
        className={`${styles.inputField} ${
          iconToRender ? styles.inputHasIcon : ''
        }`}
      >
        <span className={styles.icon}>{iconToRender && iconToRender()}</span>
        <input {...props} {...register(name)} disabled={disabled} />
      </div>
      {bottomMessage && (
        <span className={`${styles.hint} ${isError ? styles.errorsField : ''}`}>
          {bottomMessage}
        </span>
      )}
    </div>
  )
}
