import type { ClaimRecord, CurrentUser, LookupItem } from "../../types";
import { MessageEditor } from "../MessageEditor";
import { Button } from "../ui/Button";
import { Dialog } from "../ui/Dialog";

type Props = {
  claim: ClaimRecord | null;
  priorities: LookupItem[];
  currentUser: CurrentUser | null;
  noteMessage: string;
  onNoteMessageChange: (value: string) => void;
  onClose: () => void;
  onAddNote: (claimId: string, message: string, createdBy: string) => void;
};

function resolveName(items: LookupItem[], id: string): string {
  return items.find((x) => x.id === id)?.name ?? id;
}

export function ClaimDetailsDialog({
  claim,
  priorities,
  currentUser,
  noteMessage,
  onNoteMessageChange,
  onClose,
  onAddNote,
}: Props) {
  return (
    <Dialog
      open={Boolean(claim)}
      onClose={onClose}
      title={`Claim Details: ${claim?.id ?? ""}`}
      className="max-w-[900px] max-h-[calc(100vh-24px)] overflow-auto"
    >
      {claim ? (
        <>
          <div className="grid gap-2.5 md:grid-cols-3">
            <div className="grid gap-1.5 text-xs">
              <span>User</span>
              <input readOnly value={claim.userName} />
            </div>
            <div className="grid gap-1.5 text-xs">
              <span>Type</span>
              <input readOnly value={claim.claimTypeName} />
            </div>
            <div className="grid gap-1.5 text-xs">
              <span>Priority</span>
              <input readOnly value={resolveName(priorities, claim.priorityId)} />
            </div>
          </div>
          <MessageEditor
            asPanel={false}
            readOnly
            title="Message"
            label="Claim message"
            placeholder=""
            value={claim.message}
            onChange={() => {}}
          />
          <div className="grid gap-3">
            <h4>Notes</h4>
            <div className="grid max-h-[200px] gap-2 overflow-auto">
              {claim.notes.length === 0 ? (
                <p className="text-xs text-slate-500">No notes yet.</p>
              ) : (
                claim.notes.map((note) => (
                  <article
                    key={note.id}
                    className="grid gap-1.5 rounded-lg border border-slate-200 bg-white p-2"
                  >
                    <p>{note.message}</p>
                    <span className="text-xs text-slate-500">
                      {note.createdBy} - {new Date(note.createdAt).toLocaleString()}
                    </span>
                  </article>
                ))
              )}
            </div>
            <div className="grid gap-1.5 text-xs">
              <span>Add note</span>
              <textarea
                value={noteMessage}
                onChange={(e) => onNoteMessageChange(e.target.value)}
                placeholder="Write note..."
              />
            </div>
            <div className="flex justify-end max-[900px]:justify-stretch">
              <Button
                type="button"
                disabled={!noteMessage.trim()}
                onClick={() => {
                  if (!currentUser || !noteMessage.trim()) return;
                  onAddNote(claim.id, noteMessage.trim(), currentUser.name);
                  onNoteMessageChange("");
                }}
              >
                Add note
              </Button>
            </div>
          </div>
        </>
      ) : null}
    </Dialog>
  );
}
