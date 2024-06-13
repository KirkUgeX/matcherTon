import { AppTab } from '../features/Main/constants.ts'

export const routes = {
  login: {
    route: '/',
    toRoute: '/',
  },
  signUp: {
    route: '/sign-up',
    toRoute: '/sign-up',
  },
  main: {
    route: '/app/*',
    toRoute: (tab: AppTab) => `/app${tab}`,
    routes: {
      home: {
        toRoute: '/app/',
        route: '/',
      },
      chat: {
        toRoute: '/app/chat',
        route: 'chat',
      },
      profile: {
        toRoute: '/app/profile',
        route: 'profile',
      },
    },
  },
}
