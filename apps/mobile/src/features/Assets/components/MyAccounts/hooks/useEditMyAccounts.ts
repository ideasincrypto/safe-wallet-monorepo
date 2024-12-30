import { selectActiveSafe, setActiveSafe } from '@/src/store/activeSafeSlice'
import { toggleMode } from '@/src/store/myAccountsSlice'
import { removeSafe, SafesSliceItem, selectAllSafes, setSafes } from '@/src/store/safesSlice'
import { Address } from '@/src/types/address'
import { useMemo } from 'react'
import { DragEndParams } from 'react-native-draggable-flatlist'
import { useDispatch, useSelector } from 'react-redux'

type useEditMyAccountsReturn = {
  safes: SafesSliceItem[]
  onDragEnd: (params: DragEndParams<SafesSliceItem>) => void
  onSafeDeleted: (address: Address) => () => void
}

export const useEditMyAccounts = (): useEditMyAccountsReturn => {
  const dispatch = useDispatch()
  const safes = useSelector(selectAllSafes)
  const activeSafe = useSelector(selectActiveSafe)
  const memoizedSafes = useMemo(() => Object.values(safes), [safes])

  const onDragEnd = ({ data }: DragEndParams<SafesSliceItem>) => {
    const safes = data.reduce((acc, item) => ({ ...acc, [item.SafeInfo.address.value]: item }), {})
    dispatch(setSafes(safes))
  }

  const onSafeDeleted = (address: Address) => () => {
    if (activeSafe.address === address) {
      const safe = memoizedSafes.find((item) => item.SafeInfo.address.value !== address)

      if (safe) {
        dispatch(
          setActiveSafe({
            address: safe.SafeInfo.address.value as Address,
            chainId: safe.chains[0],
          }),
        )
      }
    }

    if (memoizedSafes.length <= 2) {
      dispatch(toggleMode())
    }

    dispatch(removeSafe(address))
  }

  return { safes: memoizedSafes, onDragEnd, onSafeDeleted }
}
