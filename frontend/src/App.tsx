import { useEffect, useMemo, useState } from "react";

import { getClaimFormLookups } from "./api/claimFormDataSource";
import { ClaimForm } from "./components/ClaimForm";
import { ClaimsMonitor } from "./components/ClaimsMonitor";
import type { ClaimRecord, CurrentUser } from "./types";

type Lookups = Awaited<ReturnType<typeof getClaimFormLookups>>;

export function App() {
  const [users, setUsers] = useState<CurrentUser[]>([]);
  const [selectedUserId, setSelectedUserId] = useState("");
  const [isNewClaimOpen, setIsNewClaimOpen] = useState(false);
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [claims, setClaims] = useState<ClaimRecord[]>([]);

  useEffect(() => {
    getClaimFormLookups().then((data) => {
      setLookups(data);
      setUsers(data.users);
      if (data.users.length > 0) {
        setSelectedUserId(data.users[0].id);
      }
      setClaims([
        {
          id: "CLM-20260303-10001",
          userId: data.users[0]?.id ?? "",
          userName: data.users[0]?.name ?? "Unknown",
          claimTypeId: "improvment",
          claimTypeName: data.claimTypes.find((x) => x.id === "improvment")?.name ?? "Improvment",
          statusId: "new",
          priorityId: "p1",
          createdAt: new Date().toISOString(),
          message: "Initial mock claim",
          notes: [],
        },
      ]);
    });
  }, []);

  const selectedUser = useMemo(
    () => users.find((u) => u.id === selectedUserId) ?? null,
    [users, selectedUserId]
  );

  return (
    <main className="page">
      <section className="panel">
        <div className="app-head">
          <h1>Claim Registration</h1>
          <div className="app-head-actions">
            <label className="field user-switch">
              <span>User</span>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.mainGroup})
                  </option>
                ))}
              </select>
            </label>
            <button
              type="button"
              className="new-claim-btn"
              onClick={() => setIsNewClaimOpen(true)}
              disabled={!selectedUser}
            >
              New claim
            </button>
          </div>
        </div>
        <p className="muted">Stage 1 claim form (mock data source)</p>
      </section>
      {isNewClaimOpen ? (
        <div className="modal-overlay claim-modal-overlay" onClick={() => setIsNewClaimOpen(false)}>
          <div
            className="modal claim-modal"
            onClick={(e) => e.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label="New claim form"
          >
            <div className="modal-head">
              <h3>New claim</h3>
              <button type="button" className="close-btn" onClick={() => setIsNewClaimOpen(false)}>
                Close
              </button>
            </div>
            <ClaimForm
              selectedUser={selectedUser}
              onClaimCreated={(claim) => {
                setClaims((prev) => [claim, ...prev]);
                setIsNewClaimOpen(false);
              }}
            />
          </div>
        </div>
      ) : null}
      {lookups ? (
        <ClaimsMonitor
          claims={claims}
          users={users}
          statuses={lookups.statuses}
          priorities={lookups.priorities}
          claimTypes={lookups.claimTypes}
          currentUser={selectedUser}
          onStatusChange={(claimId, statusId) =>
            setClaims((prev) =>
              prev.map((item) => (item.id === claimId ? { ...item, statusId } : item))
            )
          }
          onAddNote={(claimId, message, createdBy) =>
            setClaims((prev) =>
              prev.map((item) =>
                item.id === claimId
                  ? {
                      ...item,
                      notes: [
                        ...item.notes,
                        {
                          id: `${claimId}-note-${item.notes.length + 1}`,
                          message,
                          createdAt: new Date().toISOString(),
                          createdBy,
                        },
                      ],
                    }
                  : item
              )
            )
          }
        />
      ) : null}
    </main>
  );
}
