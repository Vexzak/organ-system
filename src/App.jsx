import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import HomePage from './pages/HomePage'
import SystemPage from './pages/SystemPage'
import SimulationPage from './pages/SimulationPage'

function AppRoutes() {
  const location = useLocation()
  return (
    <Routes>
      <Route path="/"                     element={<HomePage />} />
      <Route path="/system/:systemId"     element={<SystemPage />} />
      <Route path="/simulation/:systemId" element={<SimulationPage key={location.key} />} />
    </Routes>
  )
}

export default function App() {
  return (
    <HashRouter>
      <AppRoutes />
    </HashRouter>
  )
}