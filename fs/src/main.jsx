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


const router = createBrowserRouter([
  {
    path : '/', 
    element : <App />,
    children : [
      
      {
        path : '/login', 
        element : <PublicRoute >
               <LoginPage />
              </PublicRoute> 
        
      }, 
      {
        path : '/',
        element : <ProtectedRoute >
                {/* direclty a dashboard remove when dashboard is made */}
                <Dashboard />
              
                  </ProtectedRoute>,
      children : [
        {
          index : '/', 
          element : <MainContent />
        }, 
        {
          path : '/customer' , 
          element : <CustomerMainUI />
        }, 
        {
          path : '/staff', 
          element : <h1 className='w-full' >Staff</h1>
        },
        {
          path : '/billings', 
          element : <h1 className='w-full' >Billings</h1>
        }
      ]
      },
      {
        path : '/customer', 
        element : <ProtectedRoute>
          <CustomerMainUI />
            </ProtectedRoute>
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
