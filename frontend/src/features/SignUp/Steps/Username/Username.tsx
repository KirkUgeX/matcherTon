import { ProceedArrowIcon } from '../../../../components/shared/Icons/Icons.tsx'
import styles from './Username.module.css'
import { Input } from '../../../../components/shared/Input/Input.tsx'
import { Layout } from '../../components/Layout/Layout.tsx'
import { validateUsername } from '../../../../services/http.ts'
import { FormProvider, useForm } from 'react-hook-form'
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux.ts'
import { setUsername } from '../../../../store/slices/signUp.ts'
import { object, string } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import { useLogout } from '../../../../hooks/useLogout.ts'
import WebApp from "@twa-dev/sdk";

interface UsernameProps {
  onSuccessfulSubmit: () => void | Promise<void>
}

const PositionSchema = object().shape({
  username: string()
    .min(1, 'Please fill out this field')
    .max(100, 'Company must not exceed 80 characters')
    .required('This field is required'),
})

export const Username: React.FC<UsernameProps> = ({ onSuccessfulSubmit }) => {
  const { username } = useAppSelector((state) => state.signUp)
  const dispatch = useAppDispatch()
  const { checkError } = useLogout()
  const userInfo = WebApp.initDataUnsafe
  const formMethods = useForm({
    resolver: yupResolver(PositionSchema),
    defaultValues: { username: userInfo?.user?.username || '' },
    mode: 'onChange',
  })

  const onBackClickHandler = () => {}

  const onSubmit = async (values: any) => {
    // ну тут должна быть валидация типа
    if (formMethods.formState.isSubmitting) return
    try {
      const unique = await validateUsername(values.username)
      if (!unique) {
        // show fucking error
        formMethods.setError('username', {
          message: 'This username has already been taken',
          type: 'unique',
        })
        return
      }
      dispatch(setUsername(values.username))
      onSuccessfulSubmit()
    } catch (e) {
      await checkError(e)
    }
  }

  return (
    <Layout
      title="Write your username"
      onBackClick={onBackClickHandler}
      forwardButtonText={'Continue'}
      subtext={'This is how it will appear in Matcher'}
      // forwardButtonText={
      //   <>
      //     Continue
      //     <span className={styles.backButtonIcon}>
      //       <ProceedArrowIcon width="18px" height="18px" />
      //     </span>
      //   </>
      // }
      onForwardClick={formMethods.handleSubmit(onSubmit)}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={formMethods.handleSubmit(onSubmit)}>
          <Input
            placeholder="Enter your name"
            type="text"
            register={formMethods.register}
            name="username"
          />
        </form>
      </FormProvider>
    </Layout>
  )
}
