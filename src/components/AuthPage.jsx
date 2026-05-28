import { useState } from "react";

const loginForm = {
  email: "",
  password: ""
};

const registerForm = {
  name: "",
  email: "",
  password: ""
};

export function AuthPage({ onLogin, onRegister, error, isSubmitting }) {
  const [mode, setMode] = useState("login");
  const [login, setLogin] = useState(loginForm);
  const [register, setRegister] = useState(registerForm);
  const isLogin = mode === "login";

  function updateLogin(event) {
    const { name, value } = event.target;
    setLogin((current) => ({ ...current, [name]: value }));
  }

  function updateRegister(event) {
    const { name, value } = event.target;
    setRegister((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();

    if (isLogin) {
      await onLogin(login);
    } else {
      await onRegister(register);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-panel">
        <div className="auth-heading">
          <p className="eyebrow">Reminder app</p>
          <h1>{isLogin ? "Sign in" : "Create account"}</h1>
        </div>

        <div className="auth-tabs" aria-label="Authentication mode">
          <button
            type="button"
            className={isLogin ? "is-selected" : ""}
            onClick={() => setMode("login")}
          >
            Sign in
          </button>
          <button
            type="button"
            className={!isLogin ? "is-selected" : ""}
            onClick={() => setMode("register")}
          >
            Register
          </button>
        </div>

        {error && <p className="error-banner">{error}</p>}

        <form className="auth-form" onSubmit={submit}>
          {!isLogin && (
            <div className="field">
              <label htmlFor="name">Name</label>
              <input
                id="name"
                name="name"
                type="text"
                value={register.name}
                onChange={updateRegister}
                maxLength={80}
                autoComplete="name"
                required
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              value={isLogin ? login.email : register.email}
              onChange={isLogin ? updateLogin : updateRegister}
              maxLength={160}
              autoComplete="email"
              required
            />
          </div>

          <div className="field">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              value={isLogin ? login.password : register.password}
              onChange={isLogin ? updateLogin : updateRegister}
              minLength={isLogin ? undefined : 8}
              autoComplete={isLogin ? "current-password" : "new-password"}
              required
            />
          </div>

          <button className="primary-button" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Please wait..." : isLogin ? "Sign in" : "Create account"}
          </button>
        </form>
      </section>
    </main>
  );
}
