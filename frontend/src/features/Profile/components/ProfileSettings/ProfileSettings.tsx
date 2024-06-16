import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'
import { Input } from '../../../../components/shared/Input/Input'
import { useAppSelector } from '../../../../hooks/redux'
import styles from './ProfileSettings.module.css'
import React, { useState } from 'react'
import { updateProfileInfo, UserState } from '../../../../store/slices/user'
import { transformObject } from './utils'
import { updateProfile } from '../../../../services/http'
import { Button } from '../../../../components/shared/Button/Button'
import { ButtonVariant } from '../../../../components/shared/Button/ButtonVariants'
import { EditIcon, SaveIcon } from '../../../../components/shared/Icons/Icons'
import { Title } from '../../../../components/shared/Title/Title'
import { TitleVariant } from '../../../../components/shared/Title/TitleVariants'
import { useDispatch } from 'react-redux'
import toast from 'react-hot-toast'
import { ShowNotify } from '../../../../components/shared/Notify/NotifyMethods.tsx'
import { useLogout } from '../../../../hooks/useLogout.ts'

import { TagsSphereEditing } from '../TagsSphereEditing/TagsSphereEditing.tsx'
import { TagsSphere } from '../TagsSphere/TagsSphere.tsx'

interface ProfileSettingsProps {
  isEditing: boolean
  switchEditing: () => void
}

export const ProfileSettings = ({
  isEditing,
  switchEditing,
}: ProfileSettingsProps) => {
  const dispatch = useDispatch()
  const user = useAppSelector((state) => state.user)
  const {
    nickname,
    description,
    work: { company, position },
    socialLinks: { x, linkedin, telegram },
    tagsSphere,
  } = user

  console.log(x, linkedin, telegram);

  const formMethods = useForm<Partial<UserState>>({
    defaultValues: {
      nickname,
      description,
      work: {
        company,
        position,
      },
      socialLinks: {
        x,
        linkedin,
        telegram,
      },
    },
  })

  const [tagsSphereLocal, setTagsSphereLocal] = useState(tagsSphere)

  const { register, handleSubmit, watch } = formMethods

  const [isSpheresEditing, setIsSpheresEditing] = useState(false)
  const { checkError } = useLogout()

  const editToggle = () => switchEditing()

  const onSubmit: SubmitHandler<Partial<UserState>> = async (data) => {
    const updatedUser = {
      ...user,
      profileNickname: data.nickname,
      ...data,
      tagsSphere: tagsSphereLocal,
    }
    const transformedUser = transformObject(updatedUser)

    editToggle()
    try {
      await updateProfile(transformedUser)
    } catch (e) {
      await checkError(e)
    }

    // получить результат и вывести алерт
    dispatch(
      updateProfileInfo({
        nickname: transformedUser.profileNickname,
        description: transformedUser.description,
        socialLinks: transformedUser.socials,
        work: {
          company: transformedUser.work.company,
          position: transformedUser.work.position,
        },
      })
    )
    ShowNotify('Changes successfully saved', 'success')
  }

  const onTagsSphereUpdate = (chosenTags: string[]) => {
    setIsSpheresEditing(false)
    setTagsSphereLocal(chosenTags)
  }

  const renderActiveButton = (isEditing: boolean, data: Partial<UserState>) => {
    if (isEditing) {
      return (
        <Button
          onClick={handleSubmit(() => onSubmit(data))}
          variant={ButtonVariant.Primary}
          type="submit"
        >
          <SaveIcon />
          <p>Save</p>
        </Button>
      )
    } else {
      return (
        <Button onClick={editToggle} variant={ButtonVariant.Link} type="button">
          <EditIcon />
          <p>Edit</p>
        </Button>
      )
    }
  }

  return (
    <div className={styles.profileSettings}>
      <div className={styles.formHeader}>
        <div className={styles.titleWrapper}>
          <Title variant={TitleVariant.h2}>Settings</Title>
        </div>
        <div className={styles.buttonWrapper}>
          {renderActiveButton(isEditing, watch())}
        </div>
      </div>

      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputWrapper}>
            <Input
              disabled={!isEditing}
              labelText="User name"
              register={register}
              name="nickname"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              disabled={!isEditing}
              labelText="Description"
              register={register}
              name="description"
            />
          </div>
          <div className={styles.inputWrapper}>
            <TagsSphere
              disabled={!isEditing}
              tagsSphere={tagsSphereLocal}
              enableEditing={() => setIsSpheresEditing(true)}
            />
            {isSpheresEditing ? (
              <TagsSphereEditing
                tagsSpheres={tagsSphereLocal}
                onSubmit={onTagsSphereUpdate}
                onClose={() => setIsSpheresEditing(false)}
              />
            ) : null}
          </div>
          <div className={styles.inputWrapper}>
            <Input
              disabled={!isEditing}
              labelText="Company"
              register={register}
              name="work.company"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              disabled={!isEditing}
              labelText="Position"
              register={register}
              name="work.position"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              disabled={!isEditing}
              labelText="Twitter"
              register={register}
              name="socialLinks.x"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              disabled={!isEditing}
              labelText="Linkedin"
              register={register}
              name="socialLinks.linkedin"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              disabled={!isEditing}
              labelText="Telegram"
              register={register}
              name="socialLinks.telegram"
            />
          </div>
        </form>
      </FormProvider>
    </div>
  )
}
