export type LookupItem = { id: string; name: string };

export type CurrentUser = {
  id: string;
  mainGroup: "Customer" | "Production" | "Administration";
  organization: string;
  group: string;
  subgroup: string;
  name: string;
  email: string;
};

export type ClaimFormInput = {
  primaryClaimTypeId: string;
  groupId: string;
  subgroupId: string;
  informPersonIds: string[];
  actionRequiredId: string;
  customerImprovementCategoryId: string;
  claimMessage: string;
  replacementOrders: Array<{
    orderId: string;
    parts: Array<{
      partSerial: string;
      qty: string;
    }>;
  }>;
  damagedMaterialArticleQuery: string;
  damagedMaterialArticleId: string;
  damagedMaterialCategoryId: string;
  damagedMaterialQty: string;
  damagedMaterialQtyUnit: string;
  search: {
    order: string;
    orderLine: string;
    component: string;
  };
};

export type ClaimNote = {
  id: string;
  message: string;
  createdAt: string;
  createdBy: string;
};

export type ClaimRecord = {
  id: string;
  userId: string;
  userName: string;
  claimTypeId: string;
  claimTypeName: string;
  statusId: string;
  priorityId: string;
  createdAt: string;
  message: string;
  notes: ClaimNote[];
};
