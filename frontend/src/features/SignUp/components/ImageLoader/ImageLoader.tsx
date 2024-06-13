import { ChangeEvent, useRef, useState } from 'react'
import { UploadButtonIcon } from '../../../../components/shared/Icons/Icons'
import styles from './ImageLoader.module.css'

interface FileLoaderProps {
  onImageUpload?: (image: string) => void
}

export const ImageLoader = ({ onImageUpload }: FileLoaderProps) => {
  const [image, setImage] = useState<string>('')
  const fileInputRef = useRef<HTMLInputElement>(null)

  const onIconClickHandler = () => {
    fileInputRef.current?.click()
  }
  const onChangeHandler = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]

    // Максимальный размер картинки обсуждаемый, либо посмотрим, мб на беке будут ограничения
    const maxSize = 10 * 1024 * 1024 // 10 MB

    if (file && file.size <= maxSize) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const imageData = e.target?.result as string
        // Update state with base64 string
        setImage(imageData || '')
        onImageUpload && onImageUpload(imageData || '')
      }
      reader.readAsDataURL(file)
    } else {
      alert('The image is too big')
      // Clear the file input
      event.target.value = ''
      // Clear the previously displayed image if any
      setImage('')
    }
  }
  // Показывать картинку тут скорей всего не будем, а будет отсылать на слой выше и там уже где-то отправлять на бек на минт
  // if (!image) {
  return (
    <div className={styles.container}>
      <div className={styles.icon} onClick={onIconClickHandler}>
        <UploadButtonIcon />
      </div>
      <div className={styles.title}>Upload your photo</div>
      <input
        ref={fileInputRef}
        className={styles.input}
        type="file"
        accept="image/*"
        onChange={onChangeHandler}
      />
    </div>
  )
  // }
  // return (
  //   <div className={styles.container}>
  //     <img className={styles.image} src={image} alt="image" />
  //   </div>
  // )
}
