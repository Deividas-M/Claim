import { useEffect, useMemo, useState, type FormEvent } from "react";

import { getClaimFormLookups } from "../api/claimFormDataSource";
import type { ClaimFormInput, ClaimRecord, CurrentUser, LookupItem } from "../types";
import { ClaimTypeSection } from "./claim-form/ClaimTypeSection";
import { DamagedMaterialSection } from "./claim-form/DamagedMaterialSection";
import { ImprovementSection } from "./claim-form/ImprovementSection";
import { ReplacementOrdersSection } from "./claim-form/ReplacementOrdersSection";
import { UserDetailsDialog } from "./claim-form/UserDetailsDialog";
import { MessageEditor } from "./MessageEditor";
import { OrderSelectionTree } from "./OrderSelectionTree";
import { Button } from "./ui/Button";
import { useInformPickerState } from "../hooks/useInformPickerState";

type Lookups = Awaited<ReturnType<typeof getClaimFormLookups>>;

const initialForm: ClaimFormInput = {
  primaryClaimTypeId: "",
  groupId: "",
  subgroupId: "",
  informPersonIds: [],
  actionRequiredId: "",
  customerImprovementCategoryId: "",
  claimMessage: "",
  replacementOrders: [{ orderId: "", parts: [{ partSerial: "", qty: "" }] }],
  damagedMaterialArticleQuery: "",
  damagedMaterialArticleId: "",
  damagedMaterialCategoryId: "",
  damagedMaterialQty: "",
  damagedMaterialQtyUnit: "",
  search: { order: "", orderLine: "", component: "" },
};

function generateClaimId(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const t = now.getTime().toString().slice(-5);
  return `CLM-${y}${m}${d}-${t}`;
}

type ClaimFormProps = {
  selectedUser: CurrentUser | null;
  onClaimCreated?: (claim: ClaimRecord) => void;
};

const subgroupMap: Record<string, LookupItem[]> = {
  "customer-service": [
    { id: "cs-local", name: "Local Accounts" },
    { id: "cs-export", name: "Export Accounts" },
  ],
  sales: [
    { id: "sales-b2b", name: "B2B" },
    { id: "sales-projects", name: "Projects" },
  ],
  assembly: [
    { id: "asm-line-a", name: "Line A" },
    { id: "asm-line-b", name: "Line B" },
  ],
  cnc: [
    { id: "cnc-panels", name: "Panel Cutting" },
    { id: "cnc-drill", name: "Drilling" },
  ],
  finishing: [
    { id: "finish-edge", name: "Edge Banding" },
    { id: "finish-paint", name: "Paint/Lacquer" },
  ],
  "claims-office": [
    { id: "claims-triage", name: "Triage" },
    { id: "claims-resolution", name: "Resolution" },
  ],
  it: [
    { id: "it-support", name: "Support" },
    { id: "it-platform", name: "Platform" },
  ],
  operations: [
    { id: "ops-planning", name: "Planning" },
    { id: "ops-quality", name: "Quality" },
  ],
};

export function ClaimForm({ selectedUser, onClaimCreated }: ClaimFormProps) {
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [claimId] = useState<string>(generateClaimId);
  const [form, setForm] = useState<ClaimFormInput>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [claimMessageHasContent, setClaimMessageHasContent] = useState(false);
  const {
    informSearch,
    shouldShowInformList,
    onInformSearchChange,
    resetInformPicker,
    toggleInformList,
  } = useInformPickerState();

  useEffect(() => {
    getClaimFormLookups().then(setLookups);
  }, []);

  const availableClaimTypes = useMemo(() => {
    if (!lookups || !selectedUser) return [];
    if (selectedUser.mainGroup === "Customer") {
      return lookups.claimTypes.filter((t) => t.id === "improvment" || t.id === "reclamation");
    }
    if (selectedUser.mainGroup === "Production") {
      return lookups.claimTypes.filter((t) => t.id !== "reclamation");
    }
    return lookups.claimTypes.filter((t) => t.id === "improvment" || t.id === "internal-error");
  }, [lookups, selectedUser]);

  const isImprovementFlow = form.primaryClaimTypeId === "improvment";
  const isInternalErrorFlow = form.primaryClaimTypeId === "internal-error";
  const isInternalErrorFixedWithReplacement =
    isInternalErrorFlow && form.actionRequiredId === "fixed-myself-informing-replacement";
  const isOrderTreeFlow = form.primaryClaimTypeId === "reclamation";
  const isReplacementFlow =
    selectedUser?.mainGroup === "Production" && form.primaryClaimTypeId === "replacment";
  const showReplacementCards = isReplacementFlow || isInternalErrorFixedWithReplacement;
  const requiresReplacementCards = isReplacementFlow;
  const isDamagedMaterialFlow =
    selectedUser?.mainGroup === "Production" && form.primaryClaimTypeId === "damaged-materials";
  const hasClaimTypeSelected = Boolean(form.primaryClaimTypeId);
  const showGlobalMessage = hasClaimTypeSelected;

  const improvementCategories = useMemo(() => {
    if (!lookups || !selectedUser) return [];
    if (selectedUser.mainGroup === "Customer") return lookups.customerImprovementCategories;
    return [...lookups.customerImprovementCategories, ...lookups.staffImprovementCategories];
  }, [lookups, selectedUser]);

  const groupOptions = useMemo((): LookupItem[] => {
    if (!selectedUser) return [];
    if (selectedUser.mainGroup === "Customer") {
      return [
        { id: "customer-service", name: "Customer Service" },
        { id: "sales", name: "Sales" },
      ];
    }
    if (selectedUser.mainGroup === "Production") {
      return [
        { id: "assembly", name: "Assembly" },
        { id: "cnc", name: "CNC" },
        { id: "finishing", name: "Finishing" },
      ];
    }
    return [
      { id: "claims-office", name: "Claims Office" },
      { id: "it", name: "IT" },
      { id: "operations", name: "Operations" },
    ];
  }, [selectedUser]);

  const subgroupOptions = useMemo(() => (form.groupId ? subgroupMap[form.groupId] ?? [] : []), [form.groupId]);

  const autoInformPersonIds = useMemo(() => {
    if (!lookups || !selectedUser || !form.primaryClaimTypeId) return [];
    const ids = new Set<string>();
    const byGroup = lookups.informPersons.filter((x) => x.group === selectedUser.mainGroup);
    if (byGroup[0]) ids.add(byGroup[0].id);

    if (form.primaryClaimTypeId === "internal-error") {
      ids.add("p-admin-it");
      ids.add("p-prod-qa");
    } else if (form.primaryClaimTypeId === "improvment") {
      ids.add(selectedUser.mainGroup === "Customer" ? "p-cs-coord" : "p-admin-ops");
    } else if (form.primaryClaimTypeId === "reclamation") {
      ids.add("p-cs-lead");
      ids.add("p-admin-claims");
    } else if (form.primaryClaimTypeId === "replacment") {
      ids.add("p-prod-plan");
      ids.add("p-cs-coord");
    } else if (form.primaryClaimTypeId === "damaged-materials") {
      ids.add("p-warehouse");
      ids.add("p-prod-qa");
    }
    return lookups.informPersons.filter((x) => ids.has(x.id)).map((x) => x.id);
  }, [form.primaryClaimTypeId, lookups, selectedUser]);

  const lockedInformPersonIds = useMemo(() => {
    if (!lookups || !selectedUser || !form.primaryClaimTypeId) return [];
    const locked = new Set<string>();
    const byGroup = lookups.informPersons.filter((x) => x.group === selectedUser.mainGroup);
    if (byGroup[0]) locked.add(byGroup[0].id);
    if (form.primaryClaimTypeId === "internal-error") locked.add("p-admin-it");
    if (form.primaryClaimTypeId === "reclamation") locked.add("p-cs-lead");
    if (form.primaryClaimTypeId === "replacment") locked.add("p-prod-plan");
    if (form.primaryClaimTypeId === "damaged-materials") locked.add("p-prod-qa");
    return lookups.informPersons.filter((x) => locked.has(x.id)).map((x) => x.id);
  }, [form.primaryClaimTypeId, lookups, selectedUser]);

  const filteredInformPersons = useMemo(() => {
    if (!lookups) return [];
    const q = informSearch.trim().toLowerCase();
    if (!q) return lookups.informPersons;
    return lookups.informPersons.filter(
      (x) =>
        x.name.toLowerCase().includes(q) ||
        x.email.toLowerCase().includes(q) ||
        x.group.toLowerCase().includes(q)
    );
  }, [informSearch, lookups]);

  useEffect(() => {
    if (!form.primaryClaimTypeId) return;
    const stillAllowed = availableClaimTypes.some((x) => x.id === form.primaryClaimTypeId);
    if (!stillAllowed) {
      setForm((prev) => ({
        ...prev,
        primaryClaimTypeId: "",
        groupId: "",
        subgroupId: "",
        informPersonIds: [],
        actionRequiredId: "",
        customerImprovementCategoryId: "",
        claimMessage: "",
        replacementOrders: [{ orderId: "", parts: [{ partSerial: "", qty: "" }] }],
        damagedMaterialArticleQuery: "",
        damagedMaterialArticleId: "",
        damagedMaterialCategoryId: "",
        damagedMaterialQty: "",
        damagedMaterialQtyUnit: "",
      }));
    }
  }, [availableClaimTypes, form.primaryClaimTypeId]);

  useEffect(() => {
    if (isImprovementFlow || !form.customerImprovementCategoryId) return;
    setForm((prev) => ({ ...prev, customerImprovementCategoryId: "" }));
  }, [form.customerImprovementCategoryId, isImprovementFlow]);

  useEffect(() => {
    if (!hasClaimTypeSelected) {
      setForm((prev) => (prev.informPersonIds.length > 0 ? { ...prev, informPersonIds: [] } : prev));
      resetInformPicker();
      return;
    }
    setForm((prev) => {
      const nextIds = autoInformPersonIds;
      if (
        prev.informPersonIds.length === nextIds.length &&
        prev.informPersonIds.every((id, i) => id === nextIds[i])
      ) {
        return prev;
      }
      return { ...prev, informPersonIds: nextIds };
    });
  }, [autoInformPersonIds, hasClaimTypeSelected]);

  useEffect(() => {
    if (isInternalErrorFlow) return;
    if (form.groupId || form.subgroupId || form.actionRequiredId) {
      setForm((prev) => ({ ...prev, groupId: "", subgroupId: "", actionRequiredId: "" }));
    }
  }, [form.actionRequiredId, form.groupId, form.subgroupId, isInternalErrorFlow]);

  useEffect(() => {
    if (showReplacementCards) return;
    if (form.replacementOrders.some((card) => card.orderId || card.parts.some((x) => x.partSerial || x.qty))) {
      setForm((prev) => ({ ...prev, replacementOrders: [{ orderId: "", parts: [{ partSerial: "", qty: "" }] }] }));
    }
  }, [form.replacementOrders, showReplacementCards]);

  useEffect(() => {
    if (isDamagedMaterialFlow) return;
    if (
      form.damagedMaterialArticleQuery ||
      form.damagedMaterialArticleId ||
      form.damagedMaterialCategoryId ||
      form.damagedMaterialQty ||
      form.damagedMaterialQtyUnit
    ) {
      setForm((prev) => ({
        ...prev,
        damagedMaterialArticleQuery: "",
        damagedMaterialArticleId: "",
        damagedMaterialCategoryId: "",
        damagedMaterialQty: "",
        damagedMaterialQtyUnit: "",
      }));
    }
  }, [
    form.damagedMaterialArticleId,
    form.damagedMaterialArticleQuery,
    form.damagedMaterialCategoryId,
    form.damagedMaterialQty,
    form.damagedMaterialQtyUnit,
    isDamagedMaterialFlow,
  ]);

  useEffect(() => {
    if (showGlobalMessage) return;
    if (form.claimMessage || claimMessageHasContent) {
      setForm((prev) => ({ ...prev, claimMessage: "" }));
      setClaimMessageHasContent(false);
    }
  }, [claimMessageHasContent, form.claimMessage, showGlobalMessage]);

  const isValid = useMemo(() => {
    if (!selectedUser || !form.primaryClaimTypeId) return false;
    if (form.informPersonIds.length === 0) return false;
    if (isInternalErrorFlow && (!form.groupId || !form.subgroupId || !form.actionRequiredId)) return false;
    if (isImprovementFlow && !form.customerImprovementCategoryId) return false;
    if (isOrderTreeFlow && !form.search.order.trim()) return false;
    if (showReplacementCards) {
      const nonEmptyCards = form.replacementOrders.filter(
        (card) => card.orderId.trim() || card.parts.some((p) => p.partSerial.trim() || p.qty.trim())
      );
      if (requiresReplacementCards && nonEmptyCards.length === 0) return false;
      if (!requiresReplacementCards && nonEmptyCards.length === 0) return claimMessageHasContent;
      const allCardsValid = nonEmptyCards.every((card) => {
        if (!card.orderId.trim()) return false;
        return card.parts.filter((p) => p.partSerial.trim() && Number(p.qty) > 0).length > 0;
      });
      if (!allCardsValid) return false;
    }
    if (isDamagedMaterialFlow) {
      const hasArticle = Boolean(form.damagedMaterialArticleId);
      const hasCategory = Boolean(form.damagedMaterialCategoryId);
      if (!hasArticle && !hasCategory) return false;
      if (hasArticle && !form.damagedMaterialQty.trim()) return false;
    }
    return claimMessageHasContent;
  }, [
    claimMessageHasContent,
    form.actionRequiredId,
    form.customerImprovementCategoryId,
    form.damagedMaterialArticleId,
    form.damagedMaterialCategoryId,
    form.damagedMaterialQty,
    form.groupId,
    form.informPersonIds,
    form.primaryClaimTypeId,
    form.replacementOrders,
    form.search,
    form.subgroupId,
    isDamagedMaterialFlow,
    isImprovementFlow,
    isInternalErrorFlow,
    isOrderTreeFlow,
    requiresReplacementCards,
    selectedUser,
    showReplacementCards,
  ]);

  function setSearch(scope: "order" | "orderLine" | "component", value: string) {
    setForm((prev) => ({ ...prev, search: { ...prev.search, [scope]: value } }));
  }

  function toggleInformPerson(personId: string) {
    setForm((prev) => {
      const alreadySelected = prev.informPersonIds.includes(personId);
      if (alreadySelected) {
        if (lockedInformPersonIds.includes(personId)) return prev;
        return { ...prev, informPersonIds: prev.informPersonIds.filter((id) => id !== personId) };
      }
      return { ...prev, informPersonIds: [...prev.informPersonIds, personId] };
    });
  }

  function onDamagedArticleSearchChange(value: string) {
    const normalized = value.trim().toLowerCase();
    const found = lookups?.materialArticles.find(
      (x) => x.id.toLowerCase() === normalized || x.name.toLowerCase() === normalized
    );
    if (found) {
      setForm((prev) => ({
        ...prev,
        damagedMaterialArticleQuery: value,
        damagedMaterialArticleId: found.id,
        damagedMaterialCategoryId: found.categoryId,
        damagedMaterialQtyUnit: found.qtyUnit,
      }));
      return;
    }
    setForm((prev) => ({ ...prev, damagedMaterialArticleQuery: value, damagedMaterialArticleId: "", damagedMaterialQtyUnit: "" }));
  }

  function setReplacementOrder(cardIndex: number, value: string) {
    setForm((prev) => ({
      ...prev,
      replacementOrders: prev.replacementOrders.map((card, i) =>
        i === cardIndex ? { orderId: value, parts: [{ partSerial: "", qty: "" }] } : card
      ),
    }));
  }

  function setReplacementPart(cardIndex: number, partIndex: number, field: "partSerial" | "qty", value: string) {
    setForm((prev) => ({
      ...prev,
      replacementOrders: prev.replacementOrders.map((card, i) =>
        i === cardIndex
          ? { ...card, parts: card.parts.map((item, j) => (j === partIndex ? { ...item, [field]: value } : item)) }
          : card
      ),
    }));
  }

  function addReplacementPart(cardIndex: number) {
    setForm((prev) => ({
      ...prev,
      replacementOrders: prev.replacementOrders.map((card, i) =>
        i === cardIndex ? { ...card, parts: [...card.parts, { partSerial: "", qty: "" }] } : card
      ),
    }));
  }

  function removeReplacementPart(cardIndex: number, partIndex: number) {
    setForm((prev) => {
      const target = prev.replacementOrders[cardIndex];
      if (!target || target.parts.length === 1) return prev;
      return {
        ...prev,
        replacementOrders: prev.replacementOrders.map((card, i) =>
          i === cardIndex ? { ...card, parts: card.parts.filter((_, j) => j !== partIndex) } : card
        ),
      };
    });
  }

  function addReplacementOrderCard() {
    setForm((prev) => ({
      ...prev,
      replacementOrders: [...prev.replacementOrders, { orderId: "", parts: [{ partSerial: "", qty: "" }] }],
    }));
  }

  function removeReplacementOrderCard(cardIndex: number) {
    setForm((prev) => {
      if (prev.replacementOrders.length === 1) return prev;
      return { ...prev, replacementOrders: prev.replacementOrders.filter((_, i) => i !== cardIndex) };
    });
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!lookups || !isValid) {
      setMessage("Fill required fields for selected claim type.");
      return;
    }

    setSubmitting(true);
    setMessage("");
    try {
      const claimTypeName = lookups.claimTypes.find((x) => x.id === form.primaryClaimTypeId)?.name ?? form.primaryClaimTypeId;
      const priorityId =
        form.primaryClaimTypeId === "internal-error" || form.primaryClaimTypeId === "damaged-materials"
          ? "p3"
          : form.primaryClaimTypeId === "replacment"
            ? "p2"
            : "p1";
      const createdClaim: ClaimRecord = {
        id: claimId,
        userId: selectedUser?.id ?? "",
        userName: selectedUser?.name ?? "Unknown",
        claimTypeId: form.primaryClaimTypeId,
        claimTypeName,
        statusId: "new",
        priorityId,
        createdAt: new Date().toISOString(),
        message: form.claimMessage,
        notes: [],
      };
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMessage("Claim form captured (mock).");
      onClaimCreated?.(createdClaim);
    } finally {
      setSubmitting(false);
    }
  }

  if (!lookups) {
    return (
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        Loading mock data...
      </section>
    );
  }

  return (
    <form className="grid gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm" onSubmit={handleSubmit}>
      <div className="flex items-center justify-between">
        <h2>Claim {claimId}</h2>
        <Button
          disabled={!selectedUser}
          type="button"
          size="icon"
          className="h-[38px] w-[38px] rounded-full border border-slate-900 bg-slate-900 p-0 text-[12px] font-bold text-white hover:bg-slate-800"
          onClick={() => setIsUserModalOpen(true)}
          aria-label="Open user details"
          title="Open user details"
        >
          {(selectedUser?.name ?? "NA")
            .split(" ")
            .map((x) => x[0])
            .join("")
            .slice(0, 2)
            .toUpperCase()}
        </Button>
      </div>

      <ClaimTypeSection
        disabled={!selectedUser}
        primaryClaimTypeId={form.primaryClaimTypeId}
        hasClaimTypeSelected={hasClaimTypeSelected}
        isInternalErrorFlow={isInternalErrorFlow}
        groupId={form.groupId}
        subgroupId={form.subgroupId}
        actionRequiredId={form.actionRequiredId}
        groupOptions={groupOptions}
        subgroupOptions={subgroupOptions}
        availableClaimTypes={availableClaimTypes}
        informPersonIds={form.informPersonIds}
        lockedInformPersonIds={lockedInformPersonIds}
        informPersons={lookups.informPersons}
        informSearch={informSearch}
        shouldShowInformList={shouldShowInformList}
        filteredInformPersons={filteredInformPersons}
        onPrimaryClaimTypeChange={(value) => setForm((prev) => ({ ...prev, primaryClaimTypeId: value }))}
        onGroupChange={(value) => setForm((prev) => ({ ...prev, groupId: value, subgroupId: "" }))}
        onSubgroupChange={(value) => setForm((prev) => ({ ...prev, subgroupId: value }))}
        onActionRequiredChange={(value) => setForm((prev) => ({ ...prev, actionRequiredId: value }))}
        onToggleInformPerson={toggleInformPerson}
        onInformSearchChange={onInformSearchChange}
        onToggleInformList={toggleInformList}
      />

      <ImprovementSection
        isVisible={isImprovementFlow}
        value={form.customerImprovementCategoryId}
        categories={improvementCategories}
        onChange={(value) => setForm((prev) => ({ ...prev, customerImprovementCategoryId: value }))}
      />

      {isOrderTreeFlow ? (
        <OrderSelectionTree
          order={form.search.order}
          orderLine={form.search.orderLine}
          component={form.search.component}
          orderSuggestions={lookups.orderSuggestions}
          orderLineSuggestions={lookups.orderLineSuggestions}
          componentSuggestions={lookups.componentSuggestions}
          onChange={setSearch}
        />
      ) : null}

      <ReplacementOrdersSection
        isVisible={showReplacementCards}
        isInternalErrorFixedWithReplacement={isInternalErrorFixedWithReplacement}
        replacementOrders={form.replacementOrders}
        orderSuggestions={lookups.orderSuggestions}
        replacementPartSerials={lookups.replacementPartSerials}
        onAddOrder={addReplacementOrderCard}
        onRemoveOrder={removeReplacementOrderCard}
        onSetOrder={setReplacementOrder}
        onAddPart={addReplacementPart}
        onRemovePart={removeReplacementPart}
        onSetPart={setReplacementPart}
      />

      <DamagedMaterialSection
        isVisible={isDamagedMaterialFlow}
        articleQuery={form.damagedMaterialArticleQuery}
        articleId={form.damagedMaterialArticleId}
        categoryId={form.damagedMaterialCategoryId}
        qty={form.damagedMaterialQty}
        qtyUnit={form.damagedMaterialQtyUnit}
        materialArticles={lookups.materialArticles}
        materialCategories={lookups.materialCategories}
        onArticleQueryChange={onDamagedArticleSearchChange}
        onCategoryChange={(value) => setForm((prev) => ({ ...prev, damagedMaterialCategoryId: value }))}
        onQtyChange={(value) => setForm((prev) => ({ ...prev, damagedMaterialQty: value }))}
      />

      {showGlobalMessage ? (
        <MessageEditor
          title="Message"
          label="Describe your claim"
          placeholder="Write claim details"
          value={form.claimMessage}
          onChange={(nextJson, hasContent) => {
            setForm((prev) => ({ ...prev, claimMessage: nextJson }));
            setClaimMessageHasContent(hasContent);
          }}
        />
      ) : null}

      <div className="flex justify-end max-[900px]:justify-stretch">
        <Button type="submit" disabled={!isValid || submitting}>
          {submitting ? "Saving..." : "Save Claim"}
        </Button>
      </div>
      {message ? <p className="text-xs text-slate-500">{message}</p> : null}

      <UserDetailsDialog open={isUserModalOpen} user={selectedUser} onClose={() => setIsUserModalOpen(false)} />
    </form>
  );
}
