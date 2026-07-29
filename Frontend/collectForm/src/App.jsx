import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import TrainerForm from './components/TrainerForm';
import AdminDashboard from './components/AdminDashboard';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import './index.css';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TrainerForm />} />
        <Route path="/log" element={<Login />} />
        <Route 
          path="/trustcollecteddatastudents" 
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          } 
        />
      </Routes>
    </Router>
  );
}

export default App;
