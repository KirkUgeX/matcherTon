import styles from './Textarea.module.css'

interface TextareaProps extends React.InputHTMLAttributes<HTMLTextAreaElement> {
  hint?: string
  register?: any
  name?: string
}

export const Textarea: React.FC<TextareaProps> = ({
  hint,
  register,
  name,
  ...props
}) => {
  return (
    <div className={styles.textareaWrapper}>
      <div className={styles.textareaField}>
        <textarea {...props} {...register(name)} />
      </div>
      {hint && <div className={styles.hint}>{hint}</div>}
    </div>
  )
}
