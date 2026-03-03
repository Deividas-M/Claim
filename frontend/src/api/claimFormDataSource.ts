import { CLAIM_FORM_MOCK, type ClaimFormLookups } from "../api/claimFormMock";

export async function getClaimFormLookups(): Promise<ClaimFormLookups> {
  return Promise.resolve(CLAIM_FORM_MOCK);
}
