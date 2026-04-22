import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import LoginPage from './page/auth/login'
import ProtectedRoute from './utils/protectedRoute'
import Dashboard from './features/dashboard/ui/dashbaord.ui'
import { Provider } from 'react-redux'
import store from './store/store'
import PublicRoute from './utils/publicRoute'


const router = createBrowserRouter([
  {
    path : '/', 
    element : <App />,
    children : [
      {
        path : '/',
        element : <ProtectedRoute >
                {/* direclty a dashboard remove when dashboard is made */}
                    <Dashboard />
                  </ProtectedRoute>
      },
      {
        path : '/login', 
        element : <PublicRoute >
               <LoginPage />
              </PublicRoute> 
        
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
