import { useMemo, useState } from "react";

import type { ClaimRecord, CurrentUser, LookupItem } from "../types";

type Props = {
  claims: ClaimRecord[];
  users: CurrentUser[];
  statuses: LookupItem[];
  priorities: LookupItem[];
  claimTypes: LookupItem[];
  currentUser: CurrentUser | null;
  onStatusChange: (claimId: string, statusId: string) => void;
  onAddNote: (claimId: string, message: string, createdBy: string) => void;
};

export function ClaimsMonitor({
  claims,
  users,
  statuses,
  priorities,
  claimTypes,
  currentUser,
  onStatusChange,
  onAddNote,
}: Props) {
  const [statusFilter, setStatusFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [userFilter, setUserFilter] = useState("");
  const [claimTypeFilter, setClaimTypeFilter] = useState("");
  const [selectedClaimId, setSelectedClaimId] = useState("");
  const [noteMessage, setNoteMessage] = useState("");

  const filteredClaims = useMemo(() => {
    return claims.filter((claim) => {
      if (statusFilter && claim.statusId !== statusFilter) return false;
      if (priorityFilter && claim.priorityId !== priorityFilter) return false;
      if (userFilter && claim.userId !== userFilter) return false;
      if (claimTypeFilter && claim.claimTypeId !== claimTypeFilter) return false;
      return true;
    });
  }, [claimTypeFilter, claims, priorityFilter, statusFilter, userFilter]);

  const selectedClaim = useMemo(
    () => claims.find((x) => x.id === selectedClaimId) ?? null,
    [claims, selectedClaimId]
  );

  function resolveName(items: LookupItem[], id: string): string {
    return items.find((x) => x.id === id)?.name ?? id;
  }

  return (
    <section className="panel stack">
      <h2>Claims Monitor</h2>

      <div className="grid four">
        <label className="field">
          <span>Status</span>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
            <option value="">All statuses</option>
            {statuses.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Priority</span>
          <select value={priorityFilter} onChange={(e) => setPriorityFilter(e.target.value)}>
            <option value="">All priorities</option>
            {priorities.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>User</span>
          <select value={userFilter} onChange={(e) => setUserFilter(e.target.value)}>
            <option value="">All users</option>
            {users.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          <span>Claim type</span>
          <select value={claimTypeFilter} onChange={(e) => setClaimTypeFilter(e.target.value)}>
            <option value="">All claim types</option>
            {claimTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </label>
      </div>

      <div className="table-wrap">
        <table className="claims-table">
          <thead>
            <tr>
              <th>Claim</th>
              <th>User</th>
              <th>Claim type</th>
              <th>Priority</th>
              <th>Status</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {filteredClaims.length === 0 ? (
              <tr>
                <td colSpan={6} className="muted">
                  No claims found.
                </td>
              </tr>
            ) : (
              filteredClaims.map((claim) => (
                <tr key={claim.id} onClick={() => setSelectedClaimId(claim.id)} className="clickable-row">
                  <td>{claim.id}</td>
                  <td>{claim.userName}</td>
                  <td>{claim.claimTypeName}</td>
                  <td>{resolveName(priorities, claim.priorityId)}</td>
                  <td onClick={(e) => e.stopPropagation()}>
                    <select
                      value={claim.statusId}
                      onChange={(e) => onStatusChange(claim.id, e.target.value)}
                    >
                      {statuses.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td>{new Date(claim.createdAt).toLocaleString()}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {selectedClaim ? (
        <div className="modal-overlay" onClick={() => setSelectedClaimId("")}>
          <div className="modal claim-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-head">
              <h3>Claim Details: {selectedClaim.id}</h3>
              <button type="button" className="close-btn" onClick={() => setSelectedClaimId("")}>
                Close
              </button>
            </div>
            <div className="grid three">
              <div className="field">
                <span>User</span>
                <input readOnly value={selectedClaim.userName} />
              </div>
              <div className="field">
                <span>Type</span>
                <input readOnly value={selectedClaim.claimTypeName} />
              </div>
              <div className="field">
                <span>Priority</span>
                <input readOnly value={resolveName(priorities, selectedClaim.priorityId)} />
              </div>
            </div>
            <div className="field">
              <span>Message payload</span>
              <textarea value={selectedClaim.message} readOnly />
            </div>
            <div className="stack">
              <h4>Notes</h4>
              <div className="notes-list">
                {selectedClaim.notes.length === 0 ? (
                  <p className="muted">No notes yet.</p>
                ) : (
                  selectedClaim.notes.map((note) => (
                    <article key={note.id} className="note-item">
                      <p>{note.message}</p>
                      <span className="muted">
                        {note.createdBy} - {new Date(note.createdAt).toLocaleString()}
                      </span>
                    </article>
                  ))
                )}
              </div>
              <div className="field">
                <span>Add note</span>
                <textarea
                  value={noteMessage}
                  onChange={(e) => setNoteMessage(e.target.value)}
                  placeholder="Write note..."
                />
              </div>
              <div className="actions">
                <button
                  type="button"
                  disabled={!noteMessage.trim()}
                  onClick={() => {
                    if (!currentUser || !noteMessage.trim()) return;
                    onAddNote(selectedClaim.id, noteMessage.trim(), currentUser.name);
                    setNoteMessage("");
                  }}
                >
                  Add note
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

