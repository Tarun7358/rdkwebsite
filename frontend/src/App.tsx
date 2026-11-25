import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import PaymentPage from './pages/PaymentPage';
import { useAuth } from './hooks/useAuth';

function App() {
  // Initialize user session monitoring
  useAuth();

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/pay" element={<PaymentPage />} />
        <Route path="/pay/:productId" element={<PaymentPage />} />
      </Routes>
    </Router>
  );
}

export default App;
