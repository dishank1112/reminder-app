import { useEffect, useState } from "react";
import { AuthPage } from "./components/AuthPage.jsx";
import { api } from "./services/api.js";
import { Home } from "./pages/Home.jsx";

export default function App() {
  const [user, setUser] = useState(null);
  const [isCheckingAuth, setIsCheckingAuth] = useState(Boolean(api.getStoredToken()));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    async function restoreSession() {
      if (!api.getStoredToken()) {
        return;
      }

      try {
        setUser(await api.me());
      } catch {
        api.logout();
      } finally {
        setIsCheckingAuth(false);
      }
    }

    restoreSession();
  }, []);

  async function handleLogin(data) {
    try {
      setIsSubmitting(true);
      setError("");
      setUser(await api.login(data));
    } catch (loginError) {
      setError(loginError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleRegister(data) {
    try {
      setIsSubmitting(true);
      setError("");
      setUser(await api.register(data));
    } catch (registerError) {
      setError(registerError.message);
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleLogout() {
    api.logout();
    setUser(null);
  }

  if (isCheckingAuth) {
    return (
      <main className="auth-shell">
        <p className="empty-state">Loading...</p>
      </main>
    );
  }

  if (!user) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
        error={error}
        isSubmitting={isSubmitting}
      />
    );
  }

  return <Home user={user} onLogout={handleLogout} />;
}
