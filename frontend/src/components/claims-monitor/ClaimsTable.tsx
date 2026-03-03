import type { ClaimRecord, LookupItem } from "../../types";

type Props = {
  claims: ClaimRecord[];
  statuses: LookupItem[];
  priorities: LookupItem[];
  onSelectClaim: (claimId: string) => void;
  onStatusChange: (claimId: string, statusId: string) => void;
};

function resolveName(items: LookupItem[], id: string): string {
  return items.find((x) => x.id === id)?.name ?? id;
}

export function ClaimsTable({ claims, statuses, priorities, onSelectClaim, onStatusChange }: Props) {
  return (
    <div className="overflow-auto rounded-lg border border-slate-200">
      <table className="w-full border-collapse text-[13px]">
        <thead>
          <tr>
            <th className="border-b border-slate-200 bg-slate-50 p-2 text-left font-semibold">Claim</th>
            <th className="border-b border-slate-200 bg-slate-50 p-2 text-left font-semibold">User</th>
            <th className="border-b border-slate-200 bg-slate-50 p-2 text-left font-semibold">Claim type</th>
            <th className="border-b border-slate-200 bg-slate-50 p-2 text-left font-semibold">Priority</th>
            <th className="border-b border-slate-200 bg-slate-50 p-2 text-left font-semibold">Status</th>
            <th className="border-b border-slate-200 bg-slate-50 p-2 text-left font-semibold">Created</th>
          </tr>
        </thead>
        <tbody>
          {claims.length === 0 ? (
            <tr>
              <td colSpan={6} className="p-2 text-xs text-slate-500">
                No claims found.
              </td>
            </tr>
          ) : (
            claims.map((claim) => (
              <tr
                key={claim.id}
                onClick={() => onSelectClaim(claim.id)}
                className="cursor-pointer border-b border-slate-200 hover:bg-slate-50"
              >
                <td className="p-2 align-middle">{claim.id}</td>
                <td className="p-2 align-middle">{claim.userName}</td>
                <td className="p-2 align-middle">{claim.claimTypeName}</td>
                <td className="p-2 align-middle">{resolveName(priorities, claim.priorityId)}</td>
                <td className="p-2 align-middle" onClick={(e) => e.stopPropagation()}>
                  <select value={claim.statusId} onChange={(e) => onStatusChange(claim.id, e.target.value)}>
                    {statuses.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="p-2 align-middle">{new Date(claim.createdAt).toLocaleString()}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
