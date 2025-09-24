import React from 'react';

export default function Dashboard(){
  const user = JSON.parse(localStorage.getItem('dsc_user') || 'null');
  const payments = JSON.parse(localStorage.getItem('dsc_payments') || '[]');
  const teams = JSON.parse(localStorage.getItem('dsc_teams') || '[]');

  if(!user) return (
    <div className="container my-4">
      <div className="alert alert-warning">Please login to see your dashboard</div>
    </div>
  );

  return (
    <div className="container my-4">
      <header className="mb-3">
        <h4>Welcome, {user.user} ({user.role})</h4>
      </header>

      <div className="row g-3">
        {user.role === 'manager' && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Your Teams</h5>
                <ul className="list-unstyled mb-0">
                  {teams.map(t=> <li key={t.id}>{t.teamName}  {t.players? t.players.length:0} players</li>)}
                </ul>
              </div>
            </div>
          </div>
        )}

        {user.role === 'player' && (
          <div className="col-md-6">
            <div className="card">
              <div className="card-body">
                <h5 className="card-title">Player Feed</h5>
                <p>Recent updates and notices.</p>
              </div>
            </div>
          </div>
        )}

        {user.role === 'coach' && (
          <>
            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Coach Tools</h5>
                  <p>Manage rosters and tactics.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Team Formation</h5>
                  <p>Visualize and adjust team formations.</p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card">
                <div className="card-body">
                  <h5 className="card-title">Player Position Management</h5>
                  <p>Assign and manage player positions.</p>
                </div>
              </div>
            </div>
          </>
        )}

        <div className="col-12 col-md-6">
          <div className="card">
            <div className="card-body">
              <h5 className="card-title">Payments</h5>
              <p>Total transactions: {payments.length}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
