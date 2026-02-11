import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Layout from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import Admin from './pages/Admin';
import SopUpload from './components/sop/SopUpload';
import SopList from './components/sop/SopList';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="chat" element={<Chat />} />
          <Route path="upload" element={<SopUpload />} />
          <Route path="sop-list" element={<SopList />} />
          <Route path="admin" element={<Admin />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
