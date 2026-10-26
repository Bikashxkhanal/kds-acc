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
import AccountDetailsOfCustomer from './features/customer/accountdetails.customer.ui'
import StaffUI from './features/staff/staff.ui'
import StaffList from './features/staff/stafflist'
import StaffAccountDetails from './features/staff/staff.accountdetails.ui'
import BillingsList from './features/billing/billings.list'
import BillingForm from './features/billing/billing.form'
import BillingDetail from './features/billing/billing.detail'
import SalesPage from './features/sales/sales.page'
import DashboardPage from './features/dashboard/dashboard.page'
import PurchasesPage from './features/purchases/purchases.page'
import StaffForm from './features/staff/staff.form'
import { I18nProvider } from './i18n/I18nProvider.jsx'
import AdminRoute from './utils/adminRoute.jsx'
import ActivityLogPage from './features/admin/activity-log.page.jsx'
import UserManagementPage from './features/admin/user-management.page.jsx'
import ChangePasswordPage from './features/auth/change-password.page.jsx'
import DateDebug from './__date_debug.jsx'


const router = createBrowserRouter([
 {
  path: '/',
  element: <App />,
  children: [
    { path: '__date-debug', element: <DateDebug /> },

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
              element: <DashboardPage />
            },
            { path: 'change-password', element: <ChangePasswordPage /> },
            {
              path: 'customer',
              element: <CustomerMainUI />
            },
            {
              path: 'customer/:id',
              element: <AccountDetailsOfCustomer />
            },
            { path: 'customers', element: <CustomerMainUI /> },
            { path: 'customers/:id', element: <AccountDetailsOfCustomer /> },
            { path: 'sales', element: <SalesPage /> },
            { path: 'purchases', element: <PurchasesPage /> },
            { path: 'purchases/:id', element: <PurchasesPage /> },
            {
              path: 'staff/new',
              element: <StaffForm />
            },
            {
              path: 'staff/:id/edit',
              element: <AdminRoute><StaffForm /></AdminRoute>
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
              element: <BillingsList />
            },
            {
              path: 'billings/new',
              element: <BillingForm />
            },
            {
              path: 'billings/:id/edit',
              element: <AdminRoute><BillingForm /></AdminRoute>
            },
            { path: 'activity-log', element: <AdminRoute><ActivityLogPage /></AdminRoute> },
            { path: 'users', element: <AdminRoute><UserManagementPage /></AdminRoute> },
            {
              path: 'billings/:id',
              element: <BillingDetail />
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
  <I18nProvider>
  <RouterProvider router={router} >
  </RouterProvider>
  </I18nProvider>
  </Provider>

)
