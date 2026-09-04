import React from 'react'

const UI_KEYS = [
  'fu-active-tab',
  'fu-monster-search',
  'fu-monster-filters',
  'fu-item-filters',
  'fu-db-pagination',
  'fu-db-view-modes',
  'fu-db-favorites-only',
  'fu-db-selection',
  'fu-db-recent',
  'fu-db-advanced-search',
  'fu-monster-profile-filters',
  'fu-item-catalog-type',
  'fu-db-tools-open',
]

type State = { error: Error | null }

export default class AppErrorBoundary extends React.Component<React.PropsWithChildren, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    console.error('Fabula Ultima Tools runtime error', error, info)
  }

  private resetUi = () => {
    for (const key of UI_KEYS) localStorage.removeItem(key)
    sessionStorage.clear()
    window.location.reload()
  }

  render() {
    if (!this.state.error) return this.props.children

    return <main className="runtimeRecovery" role="alert">
      <section className="panel runtimeRecoveryPanel">
        <div className="eyebrow">RECOVERY MODE</div>
        <h1>The interface hit an error</h1>
        <p>Your saved monsters and items have not been deleted. The app stopped this screen instead of failing to a blank page.</p>
        <pre>{this.state.error.message || String(this.state.error)}</pre>
        <div className="buttonRow">
          <button className="primary" onClick={() => window.location.reload()}>Reload</button>
          <button onClick={this.resetUi}>Reset interface settings</button>
        </div>
        <p className="muted">Reset interface settings only clears filters, tabs and display preferences. It does not clear <code>fu-monsters</code> or <code>fu-items</code>.</p>
      </section>
    </main>
  }
}
