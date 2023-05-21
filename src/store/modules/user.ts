import useRouteStore from './route'
import useMenuStore from './menu'
import api from '@/api'

const useUserStore = defineStore(
  // 唯一ID
  'user',
  () => {
    const routeStore = useRouteStore()
    const menuStore = useMenuStore()

    const account = ref(localStorage.account ?? '')
    const token = ref(localStorage.token ?? '')
    const failure_time = ref(localStorage.failure_time ?? '')
    const permissions = ref<string[]>([])
    const isLogin = computed(() => {
      let retn = false
      if (token.value) {
        if (new Date().getTime() < parseInt(failure_time.value) * 1000) {
          retn = true
        }
      }
      return retn
    })

    // 登录
    async function login(data: {
      account: string
      password: string
    }) {
      const res = await api.post('server/login/doLogin', data)
      if (res.code === 0) {
        localStorage.setItem('account', res.data.userDetail.account)
        localStorage.setItem('token', res.data.token)
        localStorage.setItem('failure_time', res.data.expireAt)

        account.value = res.data.userDetail.account
        token.value = res.data.token
        failure_time.value = res.data.expireAt
      }
    }
    // 登出
    async function logout() {
      const res = await api.get('server/login/doLogout')
      if (res.code === 0) {
        localStorage.removeItem('account')
        localStorage.removeItem('token')
        localStorage.removeItem('failure_time')
        account.value = ''
        token.value = ''
        failure_time.value = ''
        routeStore.removeRoutes()
        menuStore.setActived(0)
      }
      else {
        console.warn('logout failed...')
      }
    }
    // 获取我的权限
    async function getPermissions() {
      // 通过 mock 获取权限
      const res = await api.get('member/permission', {
        baseURL: '/mock/',
        params: {
          account: account.value,
        },
      })
      permissions.value = res.data.permissions
      return permissions.value
    }
    // 修改密码
    async function editPassword(data: {
      password: string
      newpassword: string
    }) {
      await api.post('member/edit/password', {
        account: account.value,
        password: data.password,
        newpassword: data.newpassword,
      }, {
        baseURL: '/mock/',
      })
    }

    return {
      account,
      token,
      permissions,
      isLogin,
      login,
      logout,
      getPermissions,
      editPassword,
    }
  },
)

export default useUserStore
