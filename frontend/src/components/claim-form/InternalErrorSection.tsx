import type { LookupItem } from "../../types";
import { FormField } from "../FormField";

type Props = {
  isVisible: boolean;
  groupId: string;
  subgroupId: string;
  actionRequiredId: string;
  groupOptions: LookupItem[];
  subgroupOptions: LookupItem[];
  onGroupChange: (value: string) => void;
  onSubgroupChange: (value: string) => void;
  onActionRequiredChange: (value: string) => void;
};

export function InternalErrorSection({
  isVisible,
  groupId,
  subgroupId,
  actionRequiredId,
  groupOptions,
  subgroupOptions,
  onGroupChange,
  onSubgroupChange,
  onActionRequiredChange,
}: Props) {
  if (!isVisible) return null;

  return (
    <>
      <div className="grid gap-2.5 md:grid-cols-3">
        <FormField label="Group">
          <select value={groupId} onChange={(e) => onGroupChange(e.target.value)}>
            <option value="">Select group</option>
            {groupOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>
        <FormField label="Subgroup">
          <select disabled={!groupId} value={subgroupId} onChange={(e) => onSubgroupChange(e.target.value)}>
            <option value="">Select subgroup</option>
            {subgroupOptions.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>
      </div>
      <FormField label="Action required">
        <select value={actionRequiredId} onChange={(e) => onActionRequiredChange(e.target.value)}>
          <option value="">Select action</option>
          <option value="waiting-for-fix">Waiting for fix before further action</option>
          <option value="fixed-myself-informing">Fixed myself, informing for future</option>
          <option value="fixed-myself-informing-replacement">Fixed myself, informing + replacment</option>
        </select>
      </FormField>
    </>
  );
}
