import {
  ChatIcon,
  MenuStarIcon,
  MenuUserIcon,
} from '../../../../components/shared/Icons/Icons.tsx'
import styles from './Menu.module.css'
import React from 'react'
import { AppTab } from '../../constants.ts'

interface MenuProps {
  currentTab: string
  setCurrentTab: (tab: AppTab) => void
  haveNewMessage: boolean
}

const items = [
  { Icon: ChatIcon, tab: AppTab.Chat },
  { Icon: MenuStarIcon, tab: AppTab.Home },
  { Icon: MenuUserIcon, tab: AppTab.Profile },
]

export const Menu: React.FC<MenuProps> = ({
  currentTab,
  setCurrentTab,
  haveNewMessage,
}) => {
  const renderItems = () => {
    return items.map(({ Icon, tab }: any) => {
      return (
        <div
          key={tab}
          className={`${styles.menuItem} 
            ${tab === currentTab ? styles.menuItemActive : ''} 
            ${tab === AppTab.Chat && haveNewMessage ? styles.chatWithNewMessage : ''}
          `}
          onClick={() => setCurrentTab(tab)}
        >
          <Icon className={styles.menuItemIcon} />
        </div>
      )
    })
  }

  return (
    <nav className={styles.menu}>
      <div className={styles.itemsWrapper}>{renderItems()}</div>
    </nav>
  )
}
