import { TitleVariant } from './TitleVariants'
import styles from './Title.module.css'

interface TitleProps {
  variant: TitleVariant
  children: React.ReactNode
  size?: 'sm' | 'lg'
}

export const Title: React.FC<TitleProps> = ({ variant, size, children }) => {
  const Tag = variant as keyof JSX.IntrinsicElements

  return (
    <div className={`${styles.title} ${size && styles[size]} '`}>
      <Tag>{children}</Tag>
    </div>
  )
}
