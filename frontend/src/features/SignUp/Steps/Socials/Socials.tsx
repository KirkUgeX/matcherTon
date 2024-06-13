import React from 'react'
import { Layout } from '../../components/Layout/Layout.tsx'
import {
  LinkedInIcon,
  ProceedArrowIcon,
  TelegramIcon,
  TwitterIcon,
} from '../../../../components/shared/Icons/Icons.tsx'
import { Input } from '../../../../components/shared/Input/Input.tsx'
import { FormProvider, useForm } from 'react-hook-form'
import { object, string, ValidationError } from 'yup'
import styles from './Socials.module.css'
import { yupResolver } from '@hookform/resolvers/yup'
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux.ts'
import { setSocials } from '../../../../store/slices/signUp.ts'

const SocialsSchema = object().shape({
  x: string().optional(),
  linkedin: string().optional(),
  telegram: string().optional(),
})
// .test('telegram', 'at-least-one-filled', function (values) {
//   const { x, linkedin, telegram } = values
//   if (!x && !linkedin && !telegram) {
//     return new ValidationError('At least one field must be filled', null, 'x')
//   }
//   return true
// })

interface SocialsProps {
  onBackButtonClick: () => void
  onSuccessfulSubmit: () => void | Promise<void>
}
export const Socials: React.FC<SocialsProps> = ({
  onBackButtonClick,
  onSuccessfulSubmit,
}) => {
  const { socials } = useAppSelector((state) => state.signUp)
  const dispatch = useAppDispatch()
  const formMethods = useForm({
    resolver: yupResolver(SocialsSchema),
    defaultValues: {
      x: socials.x,
      linkedin: socials.linkedin,
      telegram: socials.telegram,
    },
  })

  const onSubmit = (values: any) => {
    if (!values.x && !values.linkedin && !values.telegram) {
      formMethods.setError('x', {
        message: 'At least one field must be filled',
      })
      formMethods.setError('linkedin', {
        message: 'At least one field must be filled',
      })
      formMethods.setError('telegram', {
        message: 'At least one field must be filled',
      })
      return
    }
    dispatch(setSocials(values))
    onSuccessfulSubmit()
  }

  return (
    <Layout
      // disableForward={}
      title={`Fill in your socials`}
      onBackClick={onBackButtonClick}
      forwardButtonText={'Continue'}
      subtext={'Required just one'}
      // forwardButtonText={
      //   <>
      //     Continue
      //     <span>
      //       <ProceedArrowIcon width="18px" height="18px" />
      //     </span>
      //   </>
      // }
      onForwardClick={formMethods.handleSubmit(onSubmit)}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <div className={styles.inputWrapper}>
            <Input
              name="linkedin"
              register={formMethods.register}
              hint="linkedin.com/"
              iconToRender={() => <LinkedInIcon />}
              placeholder="Input text"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              name="x"
              register={formMethods.register}
              hint="twitter.com/"
              iconToRender={() => <TwitterIcon />}
              placeholder="Input text"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              name="telegram"
              register={formMethods.register}
              hint="t.me/"
              iconToRender={() => <TelegramIcon />}
              placeholder="Input text"
            />
          </div>
        </form>
      </FormProvider>
    </Layout>
  )
}
