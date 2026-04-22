import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'
import { createBrowserRouter, RouterProvider} from 'react-router-dom'
import LoginPage from './page/auth/login'
import ProtectedRoute from './utils/protectedRoute'


const router = createBrowserRouter([
  {
    path : '/', 
    element : <App />,
    children : [
      {
        path : '/',
        element : <ProtectedRoute>
                    <LoginPage />
                  </ProtectedRoute>
      },
      {
        path : '/login', 
        element : <LoginPage />
        
      }
    ]
  }
])

createRoot(document.getElementById('root')).render(
  <RouterProvider router={router} >
  </RouterProvider>

)
