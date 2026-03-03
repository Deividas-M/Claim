import { useEffect, useMemo, useState } from "react";

import { getClaimFormLookups } from "./api/claimFormDataSource";
import { ClaimForm } from "./components/ClaimForm";
import { ClaimsMonitor } from "./components/ClaimsMonitor";
import { Button } from "./components/ui/Button";
import { Card } from "./components/ui/Card";
import { Dialog } from "./components/ui/Dialog";
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
    <main className="mx-auto grid w-full max-w-[1080px] gap-3.5 p-5">
      <Card>
        <div className="flex items-end justify-between gap-3 max-[900px]:flex-col max-[900px]:items-stretch">
          <h1>Claim Registration</h1>
          <div className="flex items-end gap-2.5 max-[900px]:flex-col max-[900px]:items-stretch">
            <label className="grid min-w-[260px] gap-1.5 text-xs max-[900px]:min-w-0">
              <span>User</span>
              <select value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)}>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.mainGroup})
                  </option>
                ))}
              </select>
            </label>
            <Button
              type="button"
              className="w-auto whitespace-nowrap"
              onClick={() => setIsNewClaimOpen(true)}
              disabled={!selectedUser}
            >
              New claim
            </Button>
          </div>
        </div>
        <p className="text-xs text-slate-500">Stage 1 claim form (mock data source)</p>
      </Card>
      <Dialog
        open={isNewClaimOpen}
        onClose={() => setIsNewClaimOpen(false)}
        title="New claim"
        className="max-w-[1180px] max-h-[calc(100vh-24px)] overflow-auto"
        closeOnOverlayClick={false}
      >
        <ClaimForm
          selectedUser={selectedUser}
          onClaimCreated={(claim) => {
            setClaims((prev) => [claim, ...prev]);
            setIsNewClaimOpen(false);
          }}
        />
      </Dialog>
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
