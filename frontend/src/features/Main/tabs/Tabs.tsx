import styles from './Tabs.module.css'
import React from 'react'
import { Home } from './Home/Home.tsx'
import { Profile } from '../../Profile/Profile.tsx'
import { ChatList } from '../../ChatList/ChatList.tsx'
import { Route, Routes } from 'react-router-dom'
import { routes } from '../../../routes/routes.ts'

interface TabsProps {
  currentTab: string
}

export const Tabs: React.FC<TabsProps> = () => {
  return (
    <div className={styles.tabs}>
      <Routes>
        <Route path={routes.main.routes.home.route} element={<Home />} />
        <Route path={routes.main.routes.chat.route} element={<ChatList />} />
        <Route path={routes.main.routes.profile.route} element={<Profile />} />
      </Routes>
    </div>
  )
}
