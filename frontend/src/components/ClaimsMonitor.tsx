import { useMemo, useState } from "react";

import type { ClaimRecord, CurrentUser, LookupItem } from "../types";
import { ClaimDetailsDialog } from "./claims-monitor/ClaimDetailsDialog";
import { ClaimsFilters } from "./claims-monitor/ClaimsFilters";
import { ClaimsTable } from "./claims-monitor/ClaimsTable";
import { Card } from "./ui/Card";

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

  return (
    <Card className="grid gap-3">
      <h2>Claims Monitor</h2>

      <ClaimsFilters
        users={users}
        statuses={statuses}
        priorities={priorities}
        claimTypes={claimTypes}
        statusFilter={statusFilter}
        priorityFilter={priorityFilter}
        userFilter={userFilter}
        claimTypeFilter={claimTypeFilter}
        onStatusFilterChange={setStatusFilter}
        onPriorityFilterChange={setPriorityFilter}
        onUserFilterChange={setUserFilter}
        onClaimTypeFilterChange={setClaimTypeFilter}
      />

      <ClaimsTable
        claims={filteredClaims}
        statuses={statuses}
        priorities={priorities}
        onSelectClaim={setSelectedClaimId}
        onStatusChange={onStatusChange}
      />

      <ClaimDetailsDialog
        claim={selectedClaim}
        priorities={priorities}
        currentUser={currentUser}
        noteMessage={noteMessage}
        onNoteMessageChange={setNoteMessage}
        onClose={() => setSelectedClaimId("")}
        onAddNote={onAddNote}
      />
    </Card>
  );
}
