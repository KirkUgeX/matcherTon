import { Navigate, Route, Routes } from 'react-router-dom'
import { Login } from '../features/Login/Login.tsx'
import { SignUp } from '../features/SignUp/SignUp.tsx'
import { Main } from '../features/Main/Main.tsx'
import { routes } from './routes.ts'

export const AppRouter = () => {
  return (
    <Routes>
      <Route path={routes.login.route} element={<Login />} />
      <Route path={routes.signUp.route} element={<SignUp />} />
      <Route path={routes.main.route} element={<Main />} />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  )
}
