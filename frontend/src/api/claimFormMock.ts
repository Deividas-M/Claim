import type { CurrentUser, LookupItem } from "../types";

export type ClaimFormLookups = {
  users: CurrentUser[];
  claimTypes: LookupItem[];
  informPersons: Array<{
    id: string;
    name: string;
    email: string;
    group: "Customer" | "Production" | "Administration";
  }>;
  customerImprovementCategories: LookupItem[];
  staffImprovementCategories: LookupItem[];
  replacementPartSerials: Array<{
    serial: string;
    orderId: string;
    name: string;
  }>;
  materialCategories: LookupItem[];
  materialArticles: Array<{
    id: string;
    name: string;
    categoryId: string;
    qtyUnit: string;
  }>;
  statuses: LookupItem[];
  priorities: LookupItem[];
  orderSuggestions: LookupItem[];
  orderLineSuggestions: LookupItem[];
  componentSuggestions: LookupItem[];
};

// Mock source for now. Later replace with API request(s) from backend/DB.
export const CLAIM_FORM_MOCK: ClaimFormLookups = {
  users: [
    {
      id: "u1",
      mainGroup: "Customer",
      organization: "Northwind Manufacturing",
      group: "Customer",
      subgroup: "Retail",
      name: "Alice Cooper",
      email: "alice.cooper@example.com",
    },
    {
      id: "u2",
      mainGroup: "Production",
      organization: "Northwind Manufacturing",
      group: "Production",
      subgroup: "Assembly",
      name: "Bob Stone",
      email: "bob.stone@example.com",
    },
    {
      id: "u3",
      mainGroup: "Administration",
      organization: "Northwind Manufacturing",
      group: "Administration",
      subgroup: "Claims Office",
      name: "Carla Diaz",
      email: "carla.diaz@example.com",
    }
  ],
  claimTypes: [
    { id: "internal-error", name: "Inernal-error" },
    { id: "improvment", name: "Improvment" },
    { id: "reclamation", name: "Reclamation" },
    { id: "replacment", name: "Replacment" },
    { id: "damaged-materials", name: "Damaged-materials" }
  ],
  informPersons: [
    { id: "p-cs-lead", name: "Nora Hale", email: "nora.hale@example.com", group: "Customer" },
    { id: "p-cs-coord", name: "Evan Fox", email: "evan.fox@example.com", group: "Customer" },
    { id: "p-prod-plan", name: "Marta Keen", email: "marta.keen@example.com", group: "Production" },
    { id: "p-prod-qa", name: "Iris Vale", email: "iris.vale@example.com", group: "Production" },
    { id: "p-warehouse", name: "Liam Shore", email: "liam.shore@example.com", group: "Production" },
    { id: "p-admin-claims", name: "Carla Diaz", email: "carla.diaz@example.com", group: "Administration" },
    { id: "p-admin-it", name: "Jon Pike", email: "jon.pike@example.com", group: "Administration" },
    { id: "p-admin-ops", name: "Rhea King", email: "rhea.king@example.com", group: "Administration" }
  ],
  customerImprovementCategories: [
    { id: "delivery-ux", name: "Delivery UX" },
    { id: "portal-navigation", name: "Portal Navigation" },
    { id: "packaging-labeling", name: "Packaging & Labeling" },
    { id: "response-time", name: "Response Time" }
  ],
  staffImprovementCategories: [
    { id: "internal-system-bugs", name: "Internal System Bugs" },
    { id: "process-automation", name: "Process Automation" },
    { id: "data-quality", name: "Data Quality" }
  ],
  replacementPartSerials: [
    { serial: "PSN-90001", orderId: "SO-100245", name: "Door Panel Left" },
    { serial: "PSN-90002", orderId: "SO-100245", name: "Door Panel Right" },
    { serial: "PSN-90114", orderId: "SO-100246", name: "Drawer Front 600" },
    { serial: "PSN-90115", orderId: "SO-100246", name: "Drawer Front 800" },
    { serial: "PSN-90300", orderId: "SO-100247", name: "Top Cover Panel" }
  ],
  materialCategories: [
    { id: "panel", name: "Panel" },
    { id: "surface", name: "surface" },
    { id: "edgeband", name: "edgeband" },
    { id: "paint-lacq", name: "Paint/lacq." },
    { id: "furniture", name: "furniture" }
  ],
  materialArticles: [
    { id: "MAT-1001", name: "Oak Veneer Sheet", categoryId: "surface", qtyUnit: "m2" },
    { id: "MAT-2004", name: "White MDF Panel 18mm", categoryId: "panel", qtyUnit: "pcs" },
    { id: "MAT-3110", name: "ABS Edgeband 22mm", categoryId: "edgeband", qtyUnit: "m" },
    { id: "MAT-4202", name: "Clear Lacquer A2", categoryId: "paint-lacq", qtyUnit: "L" },
    { id: "MAT-5107", name: "Handle Set HN-4", categoryId: "furniture", qtyUnit: "pcs" }
  ],
  statuses: [
    { id: "new", name: "New" },
    { id: "in_progress", name: "In Progress" },
    { id: "blocked", name: "Blocked" }
  ],
  priorities: [
    { id: "p1", name: "Low" },
    { id: "p2", name: "Medium" },
    { id: "p3", name: "High" }
  ],
  orderSuggestions: [
    { id: "SO-100245", name: "SO-100245" },
    { id: "SO-100246", name: "SO-100246" },
    { id: "SO-100247", name: "SO-100247" }
  ],
  orderLineSuggestions: [
    { id: "SO-100245-L1", name: "SO-100245-L1" },
    { id: "SO-100245-L2", name: "SO-100245-L2" },
    { id: "SO-100246-L1", name: "SO-100246-L1" }
  ],
  componentSuggestions: [
    { id: "CMP-AXLE-01", name: "CMP-AXLE-01" },
    { id: "CMP-PANEL-11", name: "CMP-PANEL-11" },
    { id: "CMP-COVER-08", name: "CMP-COVER-08" }
  ]
};
