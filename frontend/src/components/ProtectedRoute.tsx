import { Route, RouteProps, useNavigate } from 'react-router-dom'

type ProtectedRouteProps = RouteProps & {
  shouldBeRegistered: boolean
  userInfo: any
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({
  path,
  element,
  shouldBeRegistered,
  userInfo,
}) => {
  const navigate = useNavigate()
  if (shouldBeRegistered && !userInfo.nickname) navigate('/')
  return <Route path={path} element={element} />
}
