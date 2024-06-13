import { Passions } from './Passions.tsx'
import { useDispatch } from 'react-redux'
import { setTagsSphere } from '../../../../store/slices/signUp.ts'

interface PassionsWrapperProps {
  onBackButtonClick: () => void
  onSuccessfulSubmit: () => void | Promise<void>
}

export const PassionsWrapper = ({
  onBackButtonClick,
  onSuccessfulSubmit,
}: PassionsWrapperProps) => {
  const dispatch = useDispatch()
  const onSubmit = (chosenPassions: string[]) => {
    if (chosenPassions.length < 3) return
    dispatch(setTagsSphere(chosenPassions))
    onSuccessfulSubmit()
  }
  return (
    <Passions
      onSuccessfulSubmit={onSubmit}
      onBackButtonClick={onBackButtonClick}
    />
  )
}
