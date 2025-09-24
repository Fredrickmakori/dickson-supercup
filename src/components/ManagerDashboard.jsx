import React, { useState, useEffect } from 'react';

function ManagerDashboard({onEdit}){
  const [teams,setTeams]=useState([]);

  useEffect(()=>{
    const data=JSON.parse(localStorage.getItem('dsc_teams')||'[]');
    setTeams(data);
  },[]);

  function refresh(){
    const data=JSON.parse(localStorage.getItem('dsc_teams')||'[]');
    setTeams(data);
  }

  function toggleApprove(id){
    const data=JSON.parse(localStorage.getItem('dsc_teams')||'[]');
    const next=data.map(t=>t.id===id?{...t,status:t.status==='approved'?'pending':'approved'}:t);
    localStorage.setItem('dsc_teams',JSON.stringify(next));
    refresh();
  }

  return (
    <div className="container my-4">
      <h2 className="mb-3">Manager Dashboard</h2>

      <div className="row mb-3">
        <div className="col-md-4">
          <div className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">Team Management</h5>
              <p className="card-text">Manage team rosters, schedules, and performance.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">Player Transfers</h5>
              <p className="card-text">Handle player transfers between teams.</p>
            </div>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card mb-2">
            <div className="card-body">
              <h5 className="card-title">Coach Management</h5>
              <p className="card-text">Assign and manage coaches for teams.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-striped">
          <thead>
            <tr>
              <th>Team</th>
              <th>Coach</th>
              <th>Players</th>
              <th>Paid</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teams.length===0 && <tr><td colSpan={6}>No registrations yet.</td></tr>}
            {teams.map(t=> (
              <tr key={t.id}>
                <td>{t.teamName}</td>
                <td>{t.coachName}</td>
                <td>{t.players.length}</td>
                <td>{t.paid? 'KES 2,000' : '\u2014'}</td>
                <td>{t.status==='approved'? <span className="badge bg-success">Approved</span> : <span className="badge bg-warning text-dark">Pending</span>}</td>
                <td>
                  <button className="btn btn-sm btn-outline-primary me-2" onClick={()=>onEdit(t.id)}>Edit</button>
                  <button className="btn btn-sm btn-outline-secondary" onClick={()=>toggleApprove(t.id)}>{t.status==='approved'?'Revoke':'Approve'}</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagerDashboard;
