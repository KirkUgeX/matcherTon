import styles from './TagsSphere.module.css'
import { Chip } from '../../../SignUp/components/Chip/Chip.tsx'
import { EditIcon } from '../../../../components/shared/Icons/Icons.tsx'

interface TagsSphereProps {
  tagsSphere: string[]
  disabled: boolean
  enableEditing: () => void
}

export const TagsSphere = ({
  tagsSphere,
  disabled,
  enableEditing,
}: TagsSphereProps) => {
  return (
    <div className={styles.tagsSphereWrapper}>
      <span className={styles.tagsSphereName}>Passions</span>
      <div
        className={
          disabled ? styles.tagsSphereListDisabled : styles.tagsSphereList
        }
      >
        {tagsSphere.map((sphere: string) => (
          <Chip disabled={disabled} key={sphere} text={sphere} chosen={false} />
        ))}
        {!disabled ? (
          <span onClick={() => enableEditing()}>
            <EditIcon className={styles.editIcon} />
          </span>
        ) : null}
      </div>
    </div>
  )
}
