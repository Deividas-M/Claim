import type { InformPerson, LookupItem } from "../../types";
import { FormField } from "../FormField";
import { InformPersonsPicker } from "./InformPersonsPicker";
import { InternalErrorSection } from "./InternalErrorSection";

type Props = {
  primaryClaimTypeId: string;
  hasClaimTypeSelected: boolean;
  isInternalErrorFlow: boolean;
  groupId: string;
  subgroupId: string;
  actionRequiredId: string;
  groupOptions: LookupItem[];
  subgroupOptions: LookupItem[];
  availableClaimTypes: LookupItem[];
  informPersonIds: string[];
  lockedInformPersonIds: string[];
  informPersons: InformPerson[];
  informSearch: string;
  shouldShowInformList: boolean;
  filteredInformPersons: InformPerson[];
  onPrimaryClaimTypeChange: (value: string) => void;
  onGroupChange: (value: string) => void;
  onSubgroupChange: (value: string) => void;
  onActionRequiredChange: (value: string) => void;
  onToggleInformPerson: (personId: string) => void;
  onInformSearchChange: (value: string) => void;
  onToggleInformList: () => void;
  disabled?: boolean;
};

export function ClaimTypeSection({
  primaryClaimTypeId,
  hasClaimTypeSelected,
  isInternalErrorFlow,
  groupId,
  subgroupId,
  actionRequiredId,
  groupOptions,
  subgroupOptions,
  availableClaimTypes,
  informPersonIds,
  lockedInformPersonIds,
  informPersons,
  informSearch,
  shouldShowInformList,
  filteredInformPersons,
  onPrimaryClaimTypeChange,
  onGroupChange,
  onSubgroupChange,
  onActionRequiredChange,
  onToggleInformPerson,
  onInformSearchChange,
  onToggleInformList,
  disabled = false,
}: Props) {
  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm grid gap-3">
      <h3>Claim Type</h3>
      <FormField label="Primary selection">
        <select disabled={disabled} value={primaryClaimTypeId} onChange={(e) => onPrimaryClaimTypeChange(e.target.value)}>
          <option value="">Select claim type</option>
          {availableClaimTypes.map((item) => (
            <option key={item.id} value={item.id}>
              {item.name}
            </option>
          ))}
        </select>
      </FormField>

      <InternalErrorSection
        isVisible={isInternalErrorFlow}
        groupId={groupId}
        subgroupId={subgroupId}
        actionRequiredId={actionRequiredId}
        groupOptions={groupOptions}
        subgroupOptions={subgroupOptions}
        onGroupChange={onGroupChange}
        onSubgroupChange={onSubgroupChange}
        onActionRequiredChange={onActionRequiredChange}
      />

      <InformPersonsPicker
        isVisible={hasClaimTypeSelected}
        informPersonIds={informPersonIds}
        lockedInformPersonIds={lockedInformPersonIds}
        informPersons={informPersons}
        informSearch={informSearch}
        shouldShowInformList={shouldShowInformList}
        filteredInformPersons={filteredInformPersons}
        onToggle={onToggleInformPerson}
        onSearchChange={onInformSearchChange}
        onToggleList={onToggleInformList}
      />
    </section>
  );
}
