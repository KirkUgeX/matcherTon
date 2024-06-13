import styles from './Chip.module.css'
import icon from './icon.svg'

interface ChipProps {
  text: string
  chosen: boolean
  onClick?: (chip: string) => void
  disabled?: boolean
}

export const Chip: React.FC<ChipProps> = ({
  text,
  chosen,
  onClick,
  disabled = false,
}) => {
  const getClass = disabled
    ? 'chip--disabled'
    : chosen
      ? 'chip--chosen'
      : 'chip'

  const onClickHandler = () => {
    onClick && onClick(text)
  }

  return (
    <div onClick={onClickHandler} className={styles[getClass]}>
      <span>{text}</span>
      {chosen && <img className={styles.chipIcon} src={icon} alt="icon" />}
    </div>
  )
}
