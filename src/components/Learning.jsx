function ComponentCard({title, children}){ return <div className="learn-card card"><h4>{title}</h4><div>{children}</div></div> }

function Learning(){
  return (
    <div>
      <div className="card">
        <h3>Component Library — Learning</h3>
        <p className="muted">This page shows UI components used by the registration system. Use for documentation and prototype testing on phones.</p>
      </div>

      <div className="learn-grid">
        <ComponentCard title="Announcement">
          <div className="announcement-sample">Announcement sample text — registration open now.</div>
        </ComponentCard>

        <ComponentCard title="Registration Buttons">
          <div className="reg-grid-sample">
            <button className="btn btn-green">Player</button>
            <button className="btn btn-orange">Coach</button>
            <button className="btn btn-purple">Manager</button>
            <button className="btn btn-gold">Team</button>
          </div>
        </ComponentCard>

        <ComponentCard title="Table / Manager">
          <table className="table"><thead><tr><th>Team</th><th>Players</th></tr></thead><tbody><tr><td>Keiyo United</td><td>15</td></tr></tbody></table>
        </ComponentCard>
      </div>
    </div>
  )
}
