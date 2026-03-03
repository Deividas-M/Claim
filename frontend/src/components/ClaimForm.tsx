import {
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";

import { getClaimFormLookups } from "../api/claimFormDataSource";
import type { ClaimFormInput, ClaimRecord, CurrentUser } from "../types";
import { FormField } from "./FormField";
import { MessageEditor } from "./MessageEditor";
import { OrderSelectionTree } from "./OrderSelectionTree";

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
  search: {
    order: "",
    orderLine: "",
    component: "",
  },
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

export function ClaimForm({ selectedUser, onClaimCreated }: ClaimFormProps) {
  const [lookups, setLookups] = useState<Lookups | null>(null);
  const [claimId] = useState<string>(generateClaimId);
  const [form, setForm] = useState<ClaimFormInput>(initialForm);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [isUserModalOpen, setIsUserModalOpen] = useState(false);
  const [claimMessageHasContent, setClaimMessageHasContent] = useState(false);
  const [informSearch, setInformSearch] = useState("");
  const [isInformListOpen, setIsInformListOpen] = useState(false);

  useEffect(() => {
    getClaimFormLookups().then(setLookups);
  }, []);

  const availableClaimTypes = useMemo(() => {
    if (!lookups || !selectedUser) return [];
    if (selectedUser.mainGroup === "Customer") {
      return lookups.claimTypes.filter(
        (t) => t.id === "improvment" || t.id === "reclamation"
      );
    }
    if (selectedUser.mainGroup === "Production") {
      return lookups.claimTypes.filter((t) => t.id !== "reclamation");
    }
    return lookups.claimTypes.filter(
      (t) => t.id === "improvment" || t.id === "internal-error"
    );
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
    if (selectedUser.mainGroup === "Customer") {
      return lookups.customerImprovementCategories;
    }
    return [...lookups.customerImprovementCategories, ...lookups.staffImprovementCategories];
  }, [lookups, selectedUser]);
  const groupOptions = useMemo(() => {
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
  const autoInformPersonIds = useMemo(() => {
    if (!lookups || !selectedUser || !form.primaryClaimTypeId) return [];
    const ids = new Set<string>();
    const byGroup = lookups.informPersons.filter((x) => x.group === selectedUser.mainGroup);
    if (byGroup[0]) ids.add(byGroup[0].id);

    if (form.primaryClaimTypeId === "internal-error") {
      ids.add("p-admin-it");
      ids.add("p-prod-qa");
    } else if (form.primaryClaimTypeId === "improvment") {
      if (selectedUser.mainGroup === "Customer") {
        ids.add("p-cs-coord");
      } else {
        ids.add("p-admin-ops");
      }
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

    return lookups.informPersons
      .filter((x) => ids.has(x.id))
      .map((x) => x.id);
  }, [form.primaryClaimTypeId, lookups, selectedUser]);
  const lockedInformPersonIds = useMemo(() => {
    if (!lookups || !selectedUser || !form.primaryClaimTypeId) return [];
    const locked = new Set<string>();
    const byGroup = lookups.informPersons.filter((x) => x.group === selectedUser.mainGroup);
    if (byGroup[0]) {
      locked.add(byGroup[0].id);
    }
    if (form.primaryClaimTypeId === "internal-error") {
      locked.add("p-admin-it");
    } else if (form.primaryClaimTypeId === "reclamation") {
      locked.add("p-cs-lead");
    } else if (form.primaryClaimTypeId === "replacment") {
      locked.add("p-prod-plan");
    } else if (form.primaryClaimTypeId === "damaged-materials") {
      locked.add("p-prod-qa");
    }
    return lookups.informPersons
      .filter((x) => locked.has(x.id))
      .map((x) => x.id);
  }, [form.primaryClaimTypeId, lookups, selectedUser]);
  const subgroupOptions = useMemo(() => {
    const map: Record<string, Array<{ id: string; name: string }>> = {
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
    return form.groupId ? map[form.groupId] ?? [] : [];
  }, [form.groupId]);
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
    if (isImprovementFlow) return;
    if (form.customerImprovementCategoryId) {
      setForm((prev) => ({
        ...prev,
        customerImprovementCategoryId: "",
      }));
    }
  }, [form.customerImprovementCategoryId, isImprovementFlow]);

  useEffect(() => {
    if (!hasClaimTypeSelected) {
      setForm((prev) => (prev.informPersonIds.length > 0 ? { ...prev, informPersonIds: [] } : prev));
      setInformSearch("");
      setIsInformListOpen(false);
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
      setForm((prev) => ({
        ...prev,
        groupId: "",
        subgroupId: "",
        actionRequiredId: "",
      }));
    }
  }, [form.actionRequiredId, form.groupId, form.subgroupId, isInternalErrorFlow]);

  useEffect(() => {
    if (showReplacementCards) return;
    if (
      form.replacementOrders.some(
        (card) => card.orderId || card.parts.some((x) => x.partSerial || x.qty)
      )
    ) {
      setForm((prev) => ({
        ...prev,
        replacementOrders: [{ orderId: "", parts: [{ partSerial: "", qty: "" }] }],
      }));
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
    if (!selectedUser || !form.primaryClaimTypeId) {
      return false;
    }
    if (form.informPersonIds.length === 0) {
      return false;
    }
    if (isInternalErrorFlow && (!form.groupId || !form.subgroupId)) {
      return false;
    }
    if (isInternalErrorFlow && !form.actionRequiredId) {
      return false;
    }
    if (isImprovementFlow) {
      if (!form.customerImprovementCategoryId) {
        return false;
      }
    }
    if (isOrderTreeFlow) {
      if (!form.search.order.trim()) {
        return false;
      }
    }
    if (showReplacementCards) {
      const nonEmptyCards = form.replacementOrders.filter(
        (card) => card.orderId.trim() || card.parts.some((p) => p.partSerial.trim() || p.qty.trim())
      );
      if (requiresReplacementCards && nonEmptyCards.length === 0) {
        return false;
      }
      if (!requiresReplacementCards && nonEmptyCards.length === 0) {
        return claimMessageHasContent;
      }
      const allCardsValid = nonEmptyCards.every((card) => {
        if (!card.orderId.trim()) return false;
        const validParts = card.parts.filter((p) => p.partSerial.trim() && Number(p.qty) > 0);
        return validParts.length > 0;
      });
      if (!allCardsValid) return false;
    }
    if (isDamagedMaterialFlow) {
      const hasArticle = Boolean(form.damagedMaterialArticleId);
      const hasCategory = Boolean(form.damagedMaterialCategoryId);
      if (!hasArticle && !hasCategory) {
        return false;
      }
      if (hasArticle && !form.damagedMaterialQty.trim()) {
        return false;
      }
    }
    return claimMessageHasContent;
  }, [
    claimMessageHasContent,
    form.customerImprovementCategoryId,
    form.groupId,
    form.informPersonIds,
    form.actionRequiredId,
    form.subgroupId,
    form.damagedMaterialArticleId,
    form.damagedMaterialCategoryId,
    form.damagedMaterialQty,
    form.replacementOrders,
    form.primaryClaimTypeId,
    form.search,
    isDamagedMaterialFlow,
    isInternalErrorFlow,
    isInternalErrorFixedWithReplacement,
    isImprovementFlow,
    isOrderTreeFlow,
    requiresReplacementCards,
    showReplacementCards,
    selectedUser,
  ]);

  function setSearch(scope: "order" | "orderLine" | "component", value: string) {
    setForm((prev) => ({
      ...prev,
      search: {
        ...prev.search,
        [scope]: value,
      },
    }));
  }

  function toggleInformPerson(personId: string) {
    setForm((prev) => {
      const alreadySelected = prev.informPersonIds.includes(personId);
      if (alreadySelected) {
        if (lockedInformPersonIds.includes(personId)) {
          return prev;
        }
        return {
          ...prev,
          informPersonIds: prev.informPersonIds.filter((id) => id !== personId),
        };
      }
      return {
        ...prev,
        informPersonIds: [...prev.informPersonIds, personId],
      };
    });
  }

  const shouldShowInformList = isInformListOpen || informSearch.trim().length > 0;

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
    setForm((prev) => ({
      ...prev,
      damagedMaterialArticleQuery: value,
      damagedMaterialArticleId: "",
      damagedMaterialQtyUnit: "",
    }));
  }

  function setReplacementOrder(cardIndex: number, value: string) {
    setForm((prev) => ({
      ...prev,
      replacementOrders: prev.replacementOrders.map((card, i) =>
        i === cardIndex ? { orderId: value, parts: [{ partSerial: "", qty: "" }] } : card
      ),
    }));
  }

  function setReplacementPart(
    cardIndex: number,
    partIndex: number,
    field: "partSerial" | "qty",
    value: string
  ) {
    setForm((prev) => ({
      ...prev,
      replacementOrders: prev.replacementOrders.map((card, i) =>
        i === cardIndex
          ? {
              ...card,
              parts: card.parts.map((item, j) =>
                j === partIndex ? { ...item, [field]: value } : item
              ),
            }
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
      return {
        ...prev,
        replacementOrders: prev.replacementOrders.filter((_, i) => i !== cardIndex),
      };
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
      const claimTypeName =
        lookups.claimTypes.find((x) => x.id === form.primaryClaimTypeId)?.name ?? form.primaryClaimTypeId;
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
      console.log("submit-claim", {
        claimId,
        user: selectedUser,
        ...form,
      });
      await new Promise((resolve) => setTimeout(resolve, 300));
      setMessage("Claim form captured (mock).");
      onClaimCreated?.(createdClaim);
    } finally {
      setSubmitting(false);
    }
  }

  if (!lookups) {
    return <section className="panel">Loading mock data...</section>;
  }

  return (
    <form className="panel stack" onSubmit={handleSubmit}>
      <div className="title-row">
        <h2>Claim {claimId}</h2>
        <button
          disabled={!selectedUser}
          type="button"
          className="user-icon-btn"
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
        </button>
      </div>

      <section className="subpanel stack">
        <h3>Claim Type</h3>
        <FormField label="Primary selection">
          <select
            disabled={!selectedUser}
            value={form.primaryClaimTypeId}
            onChange={(e) =>
              setForm((prev) => ({
                ...prev,
                primaryClaimTypeId: e.target.value,
              }))
            }
          >
            <option value="">Select claim type</option>
            {availableClaimTypes.map((item) => (
              <option key={item.id} value={item.id}>
                {item.name}
              </option>
            ))}
          </select>
        </FormField>
        {isInternalErrorFlow ? (
          <div className="grid three">
            <FormField label="Group">
              <select
                disabled={!selectedUser}
                value={form.groupId}
                onChange={(e) =>
                  setForm((prev) => ({
                    ...prev,
                    groupId: e.target.value,
                    subgroupId: "",
                  }))
                }
              >
                <option value="">Select group</option>
                {groupOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>
            <FormField label="Subgroup">
              <select
                disabled={!form.groupId}
                value={form.subgroupId}
                onChange={(e) => setForm((prev) => ({ ...prev, subgroupId: e.target.value }))}
              >
                <option value="">Select subgroup</option>
                {subgroupOptions.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.name}
                  </option>
                ))}
              </select>
            </FormField>
          </div>
        ) : null}
        {hasClaimTypeSelected ? (
          <FormField label="Inform persons">
            <div className="inform-picker">
              <div className="inform-selected">
                {form.informPersonIds.length === 0 ? (
                  <span className="muted">No persons selected</span>
                ) : (
                  form.informPersonIds.map((id) => {
                    const person = lookups.informPersons.find((x) => x.id === id);
                    if (!person) return null;
                    return (
                      <button
                        key={person.id}
                        type="button"
                        className={`inform-chip selected ${lockedInformPersonIds.includes(person.id) ? "locked" : ""}`}
                        onClick={() => toggleInformPerson(person.id)}
                        title={lockedInformPersonIds.includes(person.id) ? "Locked person" : "Remove person"}
                        disabled={lockedInformPersonIds.includes(person.id)}
                      >
                        {person.name}
                        {lockedInformPersonIds.includes(person.id) ? " (locked)" : ""}
                      </button>
                    );
                  })
                )}
              </div>
              <div className="inform-search-row">
                <input
                  type="search"
                  value={informSearch}
                  onChange={(e) => {
                    const next = e.target.value;
                    setInformSearch(next);
                    if (next.trim().length > 0) {
                      setIsInformListOpen(true);
                    } else if (!isInformListOpen) {
                      setIsInformListOpen(false);
                    }
                  }}
                  placeholder="Search by name, email, group"
                />
                <button
                  type="button"
                  className="icon-action dropdown-toggle"
                  onClick={() => setIsInformListOpen((prev) => !prev)}
                  title="Toggle persons list"
                >
                  {shouldShowInformList ? "▴" : "▾"}
                </button>
              </div>
              {shouldShowInformList ? (
                <div className="inform-list" role="listbox" aria-label="Inform persons">
                  {filteredInformPersons.map((person) => {
                    const checked = form.informPersonIds.includes(person.id);
                    return (
                      <label key={person.id} className={`inform-item ${checked ? "active" : ""}`}>
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={checked && lockedInformPersonIds.includes(person.id)}
                          onChange={() => toggleInformPerson(person.id)}
                        />
                        <span>
                          {person.name} ({person.group}) - {person.email}
                        </span>
                      </label>
                    );
                  })}
                  {filteredInformPersons.length === 0 ? (
                    <p className="muted">No matching persons.</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          </FormField>
        ) : null}
        {isInternalErrorFlow ? (
          <FormField label="Action required">
            <select
              value={form.actionRequiredId}
              onChange={(e) => setForm((prev) => ({ ...prev, actionRequiredId: e.target.value }))}
            >
              <option value="">Select action</option>
              <option value="waiting-for-fix">Waiting for fix before further action</option>
              <option value="fixed-myself-informing">Fixed myself, informing for future</option>
              <option value="fixed-myself-informing-replacement">
                Fixed myself, informing + replacment
              </option>
            </select>
          </FormField>
        ) : null}
      </section>

      {isImprovementFlow ? (
        <section className="subpanel stack">
          <h3>Improvment</h3>
          <FormField label="Category">
            <select
              value={form.customerImprovementCategoryId}
              onChange={(e) =>
                setForm((prev) => ({
                  ...prev,
                  customerImprovementCategoryId: e.target.value,
                }))
              }
            >
              <option value="">Select category</option>
              {improvementCategories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.name}
                </option>
                ))}
              </select>
          </FormField>
        </section>
      ) : null}

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

      {showReplacementCards ? (
        <section className="subpanel stack replacement-section">
          <div className="replacement-head">
            <h3>{isInternalErrorFixedWithReplacement ? "Replacment used in fix" : "Replacment Orders"}</h3>
            <button type="button" className="icon-action" onClick={addReplacementOrderCard} title="Add order">
              + Order
            </button>
          </div>

          <div className="replacement-cards-grid">
            {form.replacementOrders.map((card, cardIndex) => (
              <article className="replacement-card" key={`replacement-card-${cardIndex}`}>
                <div className="replacement-card-head">
                  <h4>Order {cardIndex + 1}</h4>
                  <button
                    type="button"
                    className="icon-action danger"
                    onClick={() => removeReplacementOrderCard(cardIndex)}
                    disabled={form.replacementOrders.length === 1}
                    title="Remove order card"
                  >
                    Remove
                  </button>
                </div>

                <FormField label="Order">
                  <input
                    className="input-limited"
                    type="search"
                    list={`replacement-orders-${cardIndex}`}
                    value={card.orderId}
                    onChange={(e) => setReplacementOrder(cardIndex, e.target.value)}
                    placeholder="Select order"
                  />
                  <datalist id={`replacement-orders-${cardIndex}`}>
                    {lookups.orderSuggestions.map((x) => (
                      <option key={x.id} value={x.name} />
                    ))}
                  </datalist>
                </FormField>

                {card.parts.map((part, partIndex) => (
                  <div className="replacement-part-row" key={`replacement-${cardIndex}-${partIndex}`}>
                    <FormField label={`Serial #${partIndex + 1}`}>
                      <input
                        className="input-limited"
                        type="search"
                        list={`replacement-part-serials-${cardIndex}-${partIndex}`}
                        value={part.partSerial}
                        onChange={(e) => setReplacementPart(cardIndex, partIndex, "partSerial", e.target.value)}
                        placeholder="Part serial"
                        disabled={!card.orderId.trim()}
                      />
                      <datalist id={`replacement-part-serials-${cardIndex}-${partIndex}`}>
                        {lookups.replacementPartSerials
                          .filter((x) => x.orderId === card.orderId)
                          .map((x) => (
                            <option key={`${x.serial}-${cardIndex}-${partIndex}`} value={x.serial}>
                              {x.name}
                            </option>
                          ))}
                      </datalist>
                    </FormField>

                    <FormField label="Qty">
                      <input
                        className="input-xs"
                        type="number"
                        min="0"
                        step="1"
                        inputMode="numeric"
                        value={part.qty}
                        onChange={(e) => setReplacementPart(cardIndex, partIndex, "qty", e.target.value)}
                        placeholder="0"
                        disabled={!card.orderId.trim()}
                      />
                    </FormField>

                  <button
                    type="button"
                    className="icon-action danger compact"
                    onClick={() => removeReplacementPart(cardIndex, partIndex)}
                    disabled={card.parts.length === 1}
                    title="Remove part"
                  >
                      -
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  className="icon-action"
                  onClick={() => addReplacementPart(cardIndex)}
                  title="Add part"
                >
                  + Part
                </button>
              </article>
            ))}
          </div>

          <p className="muted">Add multiple order cards when the same issue affects multiple orders.</p>
        </section>
      ) : null}

      {isDamagedMaterialFlow ? (
        <section className="subpanel stack">
          <h3>Damaged Material</h3>
          <div className="grid three">
            <FormField label="Search damaged article">
              <input
                type="search"
                list="damaged-material-articles"
                value={form.damagedMaterialArticleQuery}
                onChange={(e) => onDamagedArticleSearchChange(e.target.value)}
                placeholder="Search by article id or name"
              />
              <datalist id="damaged-material-articles">
                {lookups.materialArticles.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </datalist>
            </FormField>
            <FormField label="Category">
              <select
                value={form.damagedMaterialCategoryId}
                onChange={(e) => setForm((prev) => ({ ...prev, damagedMaterialCategoryId: e.target.value }))}
              >
                <option value="">Select category</option>
                {lookups.materialCategories.map((x) => (
                  <option key={x.id} value={x.id}>
                    {x.name}
                  </option>
                ))}
              </select>
            </FormField>
            {form.damagedMaterialArticleId || form.damagedMaterialCategoryId ? (
              <FormField label={`Damaged qty${form.damagedMaterialQtyUnit ? ` (${form.damagedMaterialQtyUnit})` : ""}`}>
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  inputMode="decimal"
                  value={form.damagedMaterialQty}
                  onChange={(e) => setForm((prev) => ({ ...prev, damagedMaterialQty: e.target.value }))}
                  placeholder={form.damagedMaterialQtyUnit ? `Qty in ${form.damagedMaterialQtyUnit}` : "Qty"}
                />
              </FormField>
            ) : null}
          </div>
          <p className="muted">
            Search article to auto-fill category and qty unit. If unknown, choose category and continue with message.
          </p>
        </section>
      ) : null}

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

      <div className="actions">
        <button type="submit" disabled={!isValid || submitting}>
          {submitting ? "Saving..." : "Save Claim"}
        </button>
      </div>
      {message ? <p className="muted">{message}</p> : null}
      {isUserModalOpen ? (
        <div className="modal-overlay" onClick={() => setIsUserModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
            <div className="modal-head">
              <h3>User details</h3>
              <button type="button" className="close-btn" onClick={() => setIsUserModalOpen(false)}>
                Close
              </button>
            </div>
            <div className="readonly-grid">
              <ReadOnlyField label="Main Group" value={selectedUser?.mainGroup ?? ""} />
              <ReadOnlyField label="Organization" value={selectedUser?.organization ?? ""} />
              <ReadOnlyField label="Group" value={selectedUser?.group ?? ""} />
              <ReadOnlyField label="Subgroup" value={selectedUser?.subgroup ?? ""} />
              <ReadOnlyField label="Name" value={selectedUser?.name ?? ""} />
              <ReadOnlyField label="Email" value={selectedUser?.email ?? ""} />
            </div>
          </div>
        </div>
      ) : null}
    </form>
  );
}

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="field">
      <span>{label}</span>
      <input value={value} readOnly />
    </div>
  );
}
