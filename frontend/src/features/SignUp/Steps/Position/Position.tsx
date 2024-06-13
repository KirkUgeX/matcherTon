import React from 'react'
import { Layout } from '../../components/Layout/Layout.tsx'
import { ProceedArrowIcon } from '../../../../components/shared/Icons/Icons.tsx'
import { Controller, FormProvider, useForm } from 'react-hook-form'
import { Input } from '../../../../components/shared/Input/Input.tsx'
import { object, string } from 'yup'
import { yupResolver } from '@hookform/resolvers/yup'
import styles from './Position.module.css'
import { useDispatch } from 'react-redux'
import { setWork } from '../../../../store/slices/signUp.ts'
import { useAppSelector } from '../../../../hooks/redux.ts'

const PositionSchema = object().shape({
  company: string()
    .min(1, 'Please fill out this field')
    .max(100, 'Company must not exceed 80 characters')
    .required('This field is required'),
  position: string()
    .min(1, 'Please fill out this field')
    .max(100, 'Company must not exceed 80 characters')
    .required(),
})

interface PositionProps {
  onBackButtonClick: () => void
  onSuccessfulSubmit: () => void | Promise<void>
}
export const Position: React.FC<PositionProps> = ({
  onBackButtonClick,
  onSuccessfulSubmit,
}) => {
  const dispatch = useDispatch()
  const { work } = useAppSelector((state) => state.signUp)
  const formMethods = useForm({
    resolver: yupResolver(PositionSchema),
    mode: 'onChange',
    defaultValues: { company: work.company, position: work.position },
  })

  const { handleSubmit, register } = formMethods

  const onSubmit = (values: any) => {
    dispatch(setWork(values))
    onSuccessfulSubmit()
  }

  return (
    <Layout
      title={`Fill in your job`}
      onBackClick={onBackButtonClick}
      forwardButtonText={'Continue'}
      subtext={'Important for best recommendations'}
      // forwardButtonText={
      //   <>
      //     Continue
      //     <span>
      //       <ProceedArrowIcon width="18px" height="18px" />
      //     </span>
      //   </>
      // }
      onForwardClick={handleSubmit(onSubmit)}
    >
      <FormProvider {...formMethods}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={styles.inputWrapper}>
            <Input
              name="company"
              register={register}
              labelText="Company"
              placeholder="Input text"
            />
          </div>
          <div className={styles.inputWrapper}>
            <Input
              name="position"
              register={register}
              labelText="Role"
              placeholder="Input text"
            />
          </div>
          {/*<Controller*/}
          {/*  name="position"*/}
          {/*  control={control}*/}
          {/*  render={({ field: { onChange, value } }: any) => (*/}
          {/*    <Dropdown*/}
          {/*      placeholder="Select option"*/}
          {/*      onChange={onChange}*/}
          {/*      value={value}*/}
          {/*      label="Role"*/}
          {/*      options={options}*/}
          {/*    />*/}
          {/*  )}*/}
          {/*/>*/}
        </form>
      </FormProvider>
    </Layout>
  )
}
