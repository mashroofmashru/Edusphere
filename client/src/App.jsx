import { useEffect, useState } from 'react';
import Home from './pages/Home';
import Loginsignup from './pages/LoginSignup';
export default function App() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    // Call Express directly (CORS enabled above)
    fetch('http://localhost:3000/')
      .then((r) => r.json())
      .then((data) => setUsers(data))
      .catch((err) => console.error(err))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <p>Loading…</p>;

  return (
    <main>
      {/* <Home/> */}
      <Loginsignup/>
    </main>
  );
}