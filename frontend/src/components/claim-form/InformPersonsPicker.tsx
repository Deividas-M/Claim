import type { InformPerson } from "../../types";
import { FormField } from "../FormField";
import { Button } from "../ui/Button";

type Props = {
  isVisible: boolean;
  informPersonIds: string[];
  lockedInformPersonIds: string[];
  informPersons: InformPerson[];
  informSearch: string;
  shouldShowInformList: boolean;
  filteredInformPersons: InformPerson[];
  onToggle: (personId: string) => void;
  onSearchChange: (value: string) => void;
  onToggleList: () => void;
};

export function InformPersonsPicker({
  isVisible,
  informPersonIds,
  lockedInformPersonIds,
  informPersons,
  informSearch,
  shouldShowInformList,
  filteredInformPersons,
  onToggle,
  onSearchChange,
  onToggleList,
}: Props) {
  if (!isVisible) return null;

  return (
    <FormField label="Inform persons">
      <div className="grid gap-2">
        <div className="flex min-h-[34px] flex-wrap items-center gap-1.5 rounded-md border border-slate-200 bg-slate-50 p-1.5">
          {informPersonIds.length === 0 ? (
            <span className="text-xs text-slate-500">No persons selected</span>
          ) : (
            informPersonIds.map((id) => {
              const person = informPersons.find((x) => x.id === id);
              if (!person) return null;
              const isLocked = lockedInformPersonIds.includes(person.id);
              return (
                <Button
                  key={person.id}
                  type="button"
                  size="sm"
                  className={
                    isLocked
                      ? "h-7 rounded-full bg-slate-700 px-2 text-xs hover:bg-slate-700"
                      : "h-7 rounded-full bg-slate-900 px-2 text-xs hover:bg-slate-800"
                  }
                  onClick={() => onToggle(person.id)}
                  title={isLocked ? "Locked person" : "Remove person"}
                  disabled={isLocked}
                >
                  {person.name}
                  {isLocked ? " (locked)" : ""}
                </Button>
              );
            })
          )}
        </div>
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-2">
          <input
            type="search"
            value={informSearch}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by name, email, group"
          />
          <Button
            type="button"
            variant="outline"
            size="icon"
            className="h-[34px] w-[34px]"
            onClick={onToggleList}
            title="Toggle persons list"
          >
            {shouldShowInformList ? "^" : "v"}
          </Button>
        </div>
        {shouldShowInformList ? (
          <div
            className="grid max-h-[170px] gap-1 overflow-auto rounded-md border border-slate-200 p-1"
            role="listbox"
            aria-label="Inform persons"
          >
            {filteredInformPersons.map((person) => {
              const checked = informPersonIds.includes(person.id);
              return (
                <label
                  key={person.id}
                  className={`flex cursor-pointer items-center gap-2 rounded-md p-1.5 ${
                    checked ? "border border-blue-200 bg-blue-50" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    disabled={checked && lockedInformPersonIds.includes(person.id)}
                    onChange={() => onToggle(person.id)}
                  />
                  <span>
                    {person.name} ({person.group}) - {person.email}
                  </span>
                </label>
              );
            })}
            {filteredInformPersons.length === 0 ? <p className="text-xs text-slate-500">No matching persons.</p> : null}
          </div>
        ) : null}
      </div>
    </FormField>
  );
}
