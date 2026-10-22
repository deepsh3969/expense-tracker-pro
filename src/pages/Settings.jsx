import { useState } from 'react'
import { useApp } from '../context/AppContext'
import { CURRENCIES, currencyMeta } from '../utils/currency'

export default function Settings() {
  const {
    profile,
    settings,
    updateProfile,
    setCurrency,
    setTheme,
    restoreSampleData,
    clearAllData,
  } = useApp()

  const [name, setName] = useState(profile.name)
  const [nameSaved, setNameSaved] = useState(false)

  function handleNameSubmit(event) {
    event.preventDefault()
    updateProfile(name)
    setName(name.trim() || 'Student')
    setNameSaved(true)
    window.setTimeout(() => setNameSaved(false), 2500)
  }

  return (
    <div className="page page-settings">
      <div className="page-head">
        <div>
          <h2 className="page-title">Settings</h2>
          <p className="page-sub">
            Personalise your experience. Preferences are saved in this browser.
          </p>
        </div>
      </div>

      <div className="settings-grid">
        <section className="panel settings-panel" aria-labelledby="settings-profile">
          <div className="panel-head">
            <h3 id="settings-profile" className="panel-title">
              Profile
            </h3>
          </div>
          <form onSubmit={handleNameSubmit} className="settings-form">
            <div className="form-field">
              <label className="form-label" htmlFor="settings-name">
                Display name
              </label>
              <input
                id="settings-name"
                type="text"
                className="form-input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                maxLength={40}
                placeholder="Your name"
              />
              <p className="form-hint">Shown in your dashboard greeting.</p>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary btn-sm">
                {nameSaved ? 'Saved ✓' : 'Save name'}
              </button>
            </div>
          </form>
        </section>

        <section className="panel settings-panel" aria-labelledby="settings-currency">
          <div className="panel-head">
            <h3 id="settings-currency" className="panel-title">
              Currency
            </h3>
          </div>
          <div className="settings-options" role="radiogroup" aria-label="Currency">
            {CURRENCIES.map((code) => (
              <label
                key={code}
                className={`settings-option${
                  settings.currency === code ? ' is-selected' : ''
                }`}
              >
                <input
                  type="radio"
                  name="currency"
                  value={code}
                  checked={settings.currency === code}
                  onChange={() => setCurrency(code)}
                />
                <span className="settings-option-symbol" aria-hidden="true">
                  {currencyMeta(code).symbol}
                </span>
                <span>
                  <strong>{code}</strong>
                  <em>{currencyMeta(code).name}</em>
                </span>
              </label>
            ))}
          </div>
        </section>

        <section className="panel settings-panel" aria-labelledby="settings-theme">
          <div className="panel-head">
            <h3 id="settings-theme" className="panel-title">
              Theme
            </h3>
          </div>
          <div className="settings-options settings-options--row" role="radiogroup" aria-label="Theme">
            <label
              className={`settings-option${
                settings.theme === 'light' ? ' is-selected' : ''
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="light"
                checked={settings.theme === 'light'}
                onChange={() => setTheme('light')}
              />
              <span>
                <strong>Light</strong>
                <em>Warm ivory · pastel default</em>
              </span>
            </label>
            <label
              className={`settings-option${
                settings.theme === 'dark' ? ' is-selected' : ''
              }`}
            >
              <input
                type="radio"
                name="theme"
                value="dark"
                checked={settings.theme === 'dark'}
                onChange={() => setTheme('dark')}
              />
              <span>
                <strong>Dark</strong>
                <em>Cozy green · easy on the eyes</em>
              </span>
            </label>
          </div>
        </section>

        <section className="panel settings-panel" aria-labelledby="settings-data">
          <div className="panel-head">
            <h3 id="settings-data" className="panel-title">
              Data
            </h3>
          </div>
          <p className="panel-note">
            All data lives in your browser&apos;s localStorage. Clearing browser data or using a
            different browser will not carry your records over — there is no cloud account.
          </p>
          <div className="settings-data-actions">
            <button type="button" className="btn btn-soft" onClick={restoreSampleData}>
              Restore sample data
            </button>
            <button type="button" className="btn btn-danger" onClick={clearAllData}>
              Clear all data
            </button>
          </div>
          <p className="form-hint">
            Restoring sample data replaces current transactions and budgets. Clearing removes
            everything, including your name and preferences.
          </p>
        </section>

        <section className="panel settings-panel settings-panel--wide" aria-labelledby="settings-about">
          <div className="panel-head">
            <h3 id="settings-about" className="panel-title">
              About
            </h3>
          </div>
          <dl className="about-list">
            <div>
              <dt>Application</dt>
              <dd>Expense Tracker Pro · Student Edition</dd>
            </div>
            <div>
              <dt>Version</dt>
              <dd>1.0.0</dd>
            </div>
            <div>
              <dt>Built with</dt>
              <dd>HTML5 · CSS3 · JavaScript (ES6+) · React · React Router · Vite</dd>
            </div>
            <div>
              <dt>Storage</dt>
              <dd>Browser localStorage only — no backend, no accounts, no tracking.</dd>
            </div>
            <div>
              <dt>Note</dt>
              <dd>
                localStorage is convenient but not secure storage. Do not rely on it for
                sensitive financial records.
              </dd>
            </div>
          </dl>
        </section>
      </div>
    </div>
  )
}
