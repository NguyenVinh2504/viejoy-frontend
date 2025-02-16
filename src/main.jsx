import { createRoot } from 'react-dom/client'
import App from './App'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import theme from './theme'
import { Provider } from 'react-redux'
import { persistor, store } from '~/redux/store'
import { PersistGate } from 'redux-persist/integration/react'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { ConfirmProvider } from 'material-ui-confirm'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import { BrowserRouter } from 'react-router-dom'
import SocketProvider from './context/Socket'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 6, // 6p
      staleTime: 1000 * 60 * 5, // 5p
      retry: 0,
      refetchOnWindowFocus: false,
      refetchOnReconnect: false
    }
  }
})

createRoot(document.getElementById('root')).render(
  <BrowserRouter
    future={{
      v7_startTransition: true,
      v7_relativeSplatPath: true
    }}
  >
    <Provider store={store}>
      <PersistGate loading={null} persistor={persistor}>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider theme={theme}>
            <ConfirmProvider
              defaultOptions={{
                allowClose: false,
                confirmationButtonProps: {
                  color: 'secondary',
                  variant: 'contained'
                },
                cancellationButtonProps: {
                  color: 'secondary',
                  variant: 'contained'
                },
                confirmationText: 'Xác nhận',
                cancellationText: 'Hủy'
              }}
            >
              <CssBaseline />
              <SocketProvider>
                <App />
                <ReactQueryDevtools initialIsOpen={false} position='bottom' />
                <ToastContainer
                  position='bottom-left'
                  autoClose={3000}
                  hideProgressBar={true}
                  newestOnTop={false}
                  closeOnClick
                  rtl={false}
                  pauseOnFocusLoss={false}
                  draggable
                  style={{ fontSize: '16px' }}
                  pauseOnHover
                  theme='dark'
                />
              </SocketProvider>
            </ConfirmProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </PersistGate>
    </Provider>
  </BrowserRouter>
)
