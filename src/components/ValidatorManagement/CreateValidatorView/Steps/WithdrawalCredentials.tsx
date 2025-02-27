import { FC, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import addClassString from '../../../../../utilities/addClassString'
import { ValidatorCandidate } from '../../../../types'
import CheckBox from '../../../CheckBox/CheckBox'
import InfoBox, { InfoBoxType } from '../../../InfoBox/InfoBox'
import Typography from '../../../Typography/Typography'
import ValidatorCredentialRow from '../../../ValidatorCredentialRow/ValidatorCredentialRow'
import StepOptions from '../StepOptions'

export interface WithdrawalCredentialsProps {
  onNextStep: () => void
  onBackStep: () => void
  candidates: ValidatorCandidate[]
  onValidatorChange: (vals: ValidatorCandidate[]) => void
  isActive: boolean
  onShowRisk: () => void
  sharedCredentials?: string | undefined
  onUpdateSharedCredentials: (credentials?: string) => void
}

const WithdrawalCredentials: FC<WithdrawalCredentialsProps> = ({
  onNextStep,
  onBackStep,
  candidates,
  onValidatorChange,
  isActive,
  onShowRisk,
  sharedCredentials,
  onUpdateSharedCredentials,
}) => {
  const { t } = useTranslation()
  const valCount = candidates.length
  const [isAll, setIsAll] = useState(false)
  const [isSharedCredentialVerified, setIsSharedCredentialVerified] = useState(false)

  useEffect(() => {
    setIsAll(valCount > 1)
  }, [valCount])

  const isValidAddress = isAll
    ? Boolean(sharedCredentials)
    : candidates.every(({ withdrawalCredentials }) => Boolean(withdrawalCredentials))
  const isVerifiedAddress = isAll
    ? isSharedCredentialVerified
    : candidates.every(({ isVerifiedCredentials }) => isVerifiedCredentials)

  const updateSharedCandidateData = (_id: string, candidate: ValidatorCandidate) => {
    const { withdrawalCredentials, isVerifiedCredentials } = candidate

    setIsSharedCredentialVerified(Boolean(isVerifiedCredentials))
    onUpdateSharedCredentials(withdrawalCredentials)
  }

  const updateCandidate = (id: string, candidate: ValidatorCandidate) => {
    const index = candidates.findIndex((item) => item.id === id)
    if (index !== -1) {
      const updatedCandidates = [...candidates]
      updatedCandidates[index] = candidate
      onValidatorChange(updatedCandidates)
    }
  }

  const toggleAssignAllCredentials = (): void => {
    onUpdateSharedCredentials(undefined)
    const updatedCandidates = candidates.map((validator) => ({
      ...validator,
      withdrawalCredentials: '',
      isVerifiedCredentials: false,
    }))
    onValidatorChange(updatedCandidates)
    setIsAll((prev) => !prev)
    setIsSharedCredentialVerified(false)
  }

  const moveToNextStep = (): void => {
    if (!isVerifiedAddress) {
      onShowRisk()
      return
    }
    onNextStep()
  }

  const checkBoxClass = addClassString('flex space-x-4', [
    valCount < 2 && 'opacity-0 pointer-events-none',
  ])

  return (
    <div className='w-full h-full relative space-y-6'>
      <div>
        <Typography type='text-caption1'>
          {t('validatorManagement.withdrawalCredentials.title')} --
        </Typography>
        <Typography type='text-subtitle2' fontWeight='font-light'>
          {t('validatorManagement.withdrawalCredentials.subTitle')}
        </Typography>
      </div>
      <div className='mt-4 w-full max-w-[800px] space-y-8'>
        <div className='w-full'>
          <InfoBox
            isActive={isActive}
            animDelay={0.4}
            text={t('validatorManagement.withdrawalCredentials.warningText')}
            type={InfoBoxType.NOTICE}
          />
        </div>
        <div className='w-full'>
          <div className='w-full border-style px-4 py-2 flex space-x-2'>
            <div className='w-[250px] border-r border-r-style pr-2'>
              <Typography type='text-caption1'>{t('validatorManagement.validators')}</Typography>
            </div>
            <div className='flex-1 flex items-center justify-between'>
              <div className={checkBoxClass}>
                <CheckBox
                  checked={isAll}
                  onChange={toggleAssignAllCredentials}
                  id='all_credentials'
                />
                <Typography type='text-caption1'>
                  {t('validatorManagement.withdrawalCredentials.assignAllValidators')}
                </Typography>
              </div>
              <div className='border-r dark:border-r-primary pr-2'>
                <Typography>{valCount}</Typography>
              </div>
            </div>
          </div>
          <div className='overflow-scroll w-full max-h-[200px]'>
            {isAll ? (
              <ValidatorCredentialRow
                validatorCandidate={
                  {
                    id: 'all',
                    name: t('validatorManagement.withdrawalCredentials.validatorGroup'),
                    withdrawalCredentials: sharedCredentials,
                    isVerifiedCredentials: isVerifiedAddress,
                  } as ValidatorCandidate
                }
                onUpdateCandidate={updateSharedCandidateData}
              />
            ) : (
              candidates.map((validator, index) => (
                <ValidatorCredentialRow
                  key={index}
                  validatorCandidate={validator}
                  onUpdateCandidate={updateCandidate}
                />
              ))
            )}
          </div>
        </div>
        <StepOptions
          onBackStep={onBackStep}
          onNextStep={moveToNextStep}
          isDisabledNext={!isValidAddress}
        />
      </div>
    </div>
  )
}

export default WithdrawalCredentials
