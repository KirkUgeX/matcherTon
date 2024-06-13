export const isTokenInvalid = (jwtPayload: any): boolean => {
  if (!jwtPayload) return true
  if (jwtPayload.exp * 1000 < Date.now()) return true
  return false
}
