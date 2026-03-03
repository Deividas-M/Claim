import type { CurrentUser, LookupItem } from "../../types";

type Props = {
  users: CurrentUser[];
  statuses: LookupItem[];
  priorities: LookupItem[];
  claimTypes: LookupItem[];
  statusFilter: string;
  priorityFilter: string;
  userFilter: string;
  claimTypeFilter: string;
  onStatusFilterChange: (value: string) => void;
  onPriorityFilterChange: (value: string) => void;
  onUserFilterChange: (value: string) => void;
  onClaimTypeFilterChange: (value: string) => void;
};

export function ClaimsFilters({
  users,
  statuses,
  priorities,
  claimTypes,
  statusFilter,
  priorityFilter,
  userFilter,
  claimTypeFilter,
  onStatusFilterChange,
  onPriorityFilterChange,
  onUserFilterChange,
  onClaimTypeFilterChange,
}: Props) {
  return (
    <div className="grid gap-2.5 md:grid-cols-2 xl:grid-cols-4">
      <label className="grid gap-1.5 text-xs">
        <span>Status</span>
        <select value={statusFilter} onChange={(e) => onStatusFilterChange(e.target.value)}>
          <option value="">All statuses</option>
          {statuses.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs">
        <span>Priority</span>
        <select value={priorityFilter} onChange={(e) => onPriorityFilterChange(e.target.value)}>
          <option value="">All priorities</option>
          {priorities.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs">
        <span>User</span>
        <select value={userFilter} onChange={(e) => onUserFilterChange(e.target.value)}>
          <option value="">All users</option>
          {users.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
      <label className="grid gap-1.5 text-xs">
        <span>Claim type</span>
        <select value={claimTypeFilter} onChange={(e) => onClaimTypeFilterChange(e.target.value)}>
          <option value="">All claim types</option>
          {claimTypes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
