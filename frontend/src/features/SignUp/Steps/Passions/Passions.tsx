import React, { Fragment, useEffect, useState } from 'react'
import { Layout } from '../../components/Layout/Layout.tsx'
import styles from './Passion.module.css'
import { ProceedArrowIcon } from '../../../../components/shared/Icons/Icons.tsx'
import { Chip } from '../../components/Chip/Chip.tsx'
import { useAppDispatch, useAppSelector } from '../../../../hooks/redux.ts'
import { setTagsSphere } from '../../../../store/slices/signUp.ts'
import { fetchPassions } from '../../../../services/http.ts'
import { useLogout } from '../../../../hooks/useLogout.ts'
import { Loader } from '../../../../components/shared/Loader/Loader.tsx'
import { MatcherBigIcon } from '../../../../components/shared/Icons/MatcherBigIcon.tsx'

interface PassionsProps {
  initialPassions?: string[]
  onBackButtonClick: () => void
  onSuccessfulSubmit: (chosenPassions: string[]) => void | Promise<void>
  isSubmitted?: boolean
  showMainButton: boolean
}
export const Passions: React.FC<PassionsProps> = ({
  initialPassions = [],
  onBackButtonClick,
  onSuccessfulSubmit,
  isSubmitted,
  showMainButton = true,
}) => {
  const { tagsSphere } = useAppSelector((state) => state.signUp)
  const [chosenPassions, setChosenPassions] = useState<string[]>(tagsSphere)
  const [passions, setPassions] = useState<string[]>([])
  const { checkError } = useLogout()

  useEffect(() => {
    getPassions()
  }, [])

  useEffect(() => {
    if (isSubmitted && chosenPassions.length >= 3) {
      onSubmit()
    }
  }, [isSubmitted])

  const getPassions = async () => {
    try {
      const res = await fetchPassions()
      const { passions } = res.data
      if (initialPassions?.length) {
        setChosenPassions(initialPassions)
        setPassions(
          passions.filter((pass: string) => !initialPassions.includes(pass))
        )
        return
      }
      setPassions(passions)
    } catch (e) {
      await checkError(e)
    }
  }

  const onSubmit = () => {
    // ну тут должна быть валидация типа
    onSuccessfulSubmit(chosenPassions)
  }

  const onChipSelect = (passion: string) => {
    if (chosenPassions.length >= 10) return
    setChosenPassions((prevState) => [...prevState, passion])
    setPassions((prevState) => prevState.filter((pass) => pass !== passion))
  }

  const onChipUnselect = (passion: string) => {
    setPassions((prevState) => [...prevState, passion])
    setChosenPassions((prevState) =>
      prevState.filter((pass) => pass !== passion)
    )
  }

  const disableForward = chosenPassions.length < 3

  return (
    <Layout
      disableForward={disableForward}
      title={`Pick your passions`}
      onBackClick={onBackButtonClick}
      forwardButtonText={'Continue'}
      subtext={'Up to 10'}
      showMainButton={showMainButton}
      // forwardButtonText={
      //   <>
      //     Continue
      //     <span className={styles.forwardIcon}>
      //       <ProceedArrowIcon width="18px" height="18px" />
      //     </span>
      //   </>
      // }
      onForwardClick={onSubmit}
    >
      {!passions.length ? (
        <div className={styles.passionsStepLoader}>
          <MatcherBigIcon />
        </div>
      ) : (
        <Fragment />
      )}
      <div className={styles.passionsStep}>
        {chosenPassions.length ? (
          <div className={styles.chosenChipsList}>
            {chosenPassions.map((passion) => (
              <div key={passion} className={styles.chipWrapper}>
                <Chip onClick={onChipUnselect} text={passion} chosen={true} />
              </div>
            ))}
          </div>
        ) : null}
        <div className={styles.passionsList}>
          {passions.map((passion) => (
            <div key={passion} className={styles.chipWrapper}>
              <Chip onClick={onChipSelect} text={passion} chosen={false} />
            </div>
          ))}
        </div>
      </div>
    </Layout>
  )
}
