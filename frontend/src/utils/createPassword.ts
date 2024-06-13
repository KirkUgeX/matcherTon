export const createPassword = (signature: string, message: string) => {
  return `${signature}|||${message}`
}
