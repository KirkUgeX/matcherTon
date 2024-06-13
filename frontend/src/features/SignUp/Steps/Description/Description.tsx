import styles from './Description.module.css'
import { ProceedArrowIcon } from '../../../../components/shared/Icons/Icons.tsx'
import { Layout } from '../../components/Layout/Layout.tsx'
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux.ts'
import { setDescription } from '../../../../store/slices/signUp.ts'
import { Textarea } from '../../../../components/shared/Textarea/Textarea.tsx'
import { FormProvider, useForm } from 'react-hook-form'

interface DescriptionProps {
  onBackButtonClick: () => void
  onSuccessfulSubmit: () => void | Promise<void>
}
export const Description: React.FC<DescriptionProps> = ({
  onBackButtonClick,
  onSuccessfulSubmit,
}) => {
  const { description } = useAppSelector((state) => state.signUp)
  const formMethods = useForm({
    defaultValues: { description },
  })
  const textareaValue = formMethods.watch('description')

  const { handleSubmit } = formMethods

  const dispatch = useAppDispatch()

  const onSubmit = (values: any) => {
    // ну тут должна быть валидация типа

    dispatch(setDescription(values.description))
    onSuccessfulSubmit()
  }

  return (
    <Layout
      title={`Fill in info about yourself`}
      onBackClick={onBackButtonClick}
      forwardButtonText={'Continue'}
      subtext={'Hobbies and looking for'}
      // forwardButtonText={
      //   <>
      //     Continue
      //     <span className={styles.backButtonIcon}>
      //       <ProceedArrowIcon width="18px" height="18px" />
      //     </span>
      //   </>
      // }
      onForwardClick={handleSubmit(onSubmit)}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <Textarea
            placeholder="Input text"
            maxLength={150}
            hint={`${textareaValue.length}/150`}
            register={formMethods.register}
            name="description"
          />
        </form>
      </FormProvider>
    </Layout>
  )
}
