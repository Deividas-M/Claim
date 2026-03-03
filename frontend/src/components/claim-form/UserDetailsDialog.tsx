import type { CurrentUser } from "../../types";
import { Dialog } from "../ui/Dialog";

type Props = {
  open: boolean;
  user: CurrentUser | null;
  onClose: () => void;
};

export function UserDetailsDialog({ open, user, onClose }: Props) {
  return (
    <Dialog open={open} onClose={onClose} title="User details">
      <div className="grid gap-2.5 md:grid-cols-3">
        <ReadOnlyField label="Main Group" value={user?.mainGroup ?? ""} />
        <ReadOnlyField label="Organization" value={user?.organization ?? ""} />
        <ReadOnlyField label="Group" value={user?.group ?? ""} />
        <ReadOnlyField label="Subgroup" value={user?.subgroup ?? ""} />
        <ReadOnlyField label="Name" value={user?.name ?? ""} />
        <ReadOnlyField label="Email" value={user?.email ?? ""} />
      </div>
    </Dialog>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid gap-1.5 text-xs">
      <span>{label}</span>
      <input value={value} readOnly />
    </div>
  );
}
