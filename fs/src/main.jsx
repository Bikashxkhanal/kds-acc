import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import LoginPage from './page/auth/login'
import ProtectedRoute from './utils/protectedRoute'
import Dashboard from './components/layout/dashbaord.ui'
import { Provider } from 'react-redux'
import store from './store/store'
import PublicRoute from './utils/publicRoute'
import CustomerMainUI from './features/customer/customer.main'
import MainContent from './features/dashboradUI/mainContent'
import AccountDetailsOfCustomer from './features/customer/accountdetails.customer.ui'
import StaffUI from './features/staff/staff.ui'
import StaffList from './features/staff/stafflist'
import StaffAccountDetails from './features/staff/staff.accountdetails.ui'


const router = createBrowserRouter([
 {
  path: '/',
  element: <App />,
  children: [

    {
      path: 'login',
      element: <PublicRoute><LoginPage /></PublicRoute>
    },

    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <Dashboard />, 
          children: [
            {
              index: true,
              element: <MainContent />
            },
            {
              path: 'customer',
              element: <CustomerMainUI />
            },
            {
              path: 'customer/:id',
              element: <AccountDetailsOfCustomer />
            },
            {
              path: 'staff',
              element: <StaffUI />
            },
            {
              path: 'staff/all',
              element: <StaffList />
            },
            {
              path: 'staff/:id',
              element: <StaffAccountDetails />
            },
            {
              path: 'billings',
              element: <h1>Billings</h1>
            }
          ]
        }
      ]
    }

  ]
}
])

createRoot(document.getElementById('root')).render(
  <Provider store={store}>
  <RouterProvider router={router} >
  </RouterProvider>
  </Provider>

)
