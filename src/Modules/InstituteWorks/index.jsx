import { useEffect, useMemo, useState } from "react";
import { useDispatch } from "react-redux";
import { useSelector } from "react-redux";
import { setActiveTab_ } from "../../redux/moduleslice";
import InstituteWorksShell from "./components/InstituteWorksShell";
import CreateRequestView from "./CreateRequestView";
import CreatedRequestsView from "./CreatedRequestsView";
import RequestsStatusView from "./RequestsStatusView";
import DirectorApprovedView from "./DirectorApprovedView";
import WorkProgressView from "./WorkProgressView";
import BudgetManagementView from "./BudgetManagementView";
import DeanDirectorQueueView from "./DeanDirectorQueueView";
import BillAuditView from "./BillAuditView";
import BillSettlementView from "./BillSettlementView";
import AdminApprovalQueueView from "./AdminApprovalQueueView";
import ProposalBuilderView from "./ProposalBuilderView";
import BillGenerationView from "./BillGenerationView";
import BillProcessingView from "./BillProcessingView";
import DeanProcessingQueueView from "./DeanProcessingQueueView";
import VendorManagementView from "./VendorManagementView";
import RequestsInProgressView from "./RequestsInProgressView";
// NEW SLA & INVENTORY VIEWS
import SLADashboardView from "./SLADashboardView";
import InventoryManagementView from "./InventoryManagementView";
import FeedbackView from "./FeedbackView";

const ENGINEER_ROLES = [
  "junior engineer",
  "executive engineer (civil)",
  "electrical_ae",
  "electrical_je",
  "ee",
  "civil_ae",
  "civil_je",
  "research engineer",
];

const WORKFLOW_ROLES = [
  "admin iwd",
  "director",
  "dean (p&d)",
  "deanpnd",
  "dean_s",
  "dean academic",
  "dean (r&d)",
  "dean_rspc",
  "hod (cse)",
  "hod (design)",
  "hod (ece)",
  "hod (me)",
  "hod (ns)",
  "hod (liberal arts)",
  "accounts admin",
  "auditor",
];

const DEAN_HOD_ROLES = [
  "dean (p&d)",
  "deanpnd",
  "dean_s",
  "dean academic",
  "dean (r&d)",
  "dean_rspc",
  "hod (cse)",
  "hod (design)",
  "hod (ece)",
  "hod (me)",
  "hod (ns)",
  "hod (liberal arts)",
  "hod",
];

function normalizeRole(role) {
  return String(role || "").trim().toLowerCase();
}

function isEngineerRole(normalizedRole) {
  return ENGINEER_ROLES.some((role) => normalizedRole.includes(role));
}

function isDeanProcessingRole(normalizedRole) {
  return DEAN_HOD_ROLES.some((role) => normalizedRole.includes(role));
}

function isVendorManagementRole(normalizedRole) {
  return (
    normalizedRole.includes("accounts admin") ||
    normalizedRole.includes("admin iwd")
  );
}

function canCreateAndTrackRequests(normalizedRole) {
  return (
    WORKFLOW_ROLES.some((role) => normalizedRole.includes(role)) ||
    isEngineerRole(normalizedRole) ||
    normalizedRole.includes("hod")
  );
}

function InstituteWorks() {
  const dispatch = useDispatch();
  const role = useSelector((state) => state.user.role);
  const [activeTab, setActiveTab] = useState("0");
  const normalizedRole = normalizeRole(role);
  const engineerUser = isEngineerRole(normalizedRole);

  const tabsConfig = useMemo(
    () => [
      {
        title: "Create Request",
        component: CreateRequestView,
        visible: canCreateAndTrackRequests(normalizedRole),
      },
      {
        title: "Created Requests",
        component: CreatedRequestsView,
        visible: canCreateAndTrackRequests(normalizedRole),
      },
      {
        title: "Request Status",
        component: RequestsStatusView,
        visible: true,
      },
      {
        title: "Admin Queue",
        component: AdminApprovalQueueView,
        visible: normalizedRole.includes("admin iwd"),
      },
      {
        title: "Proposal Builder",
        component: ProposalBuilderView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Director Approved",
        component: DirectorApprovedView,
        visible: normalizedRole.includes("director"),
      },
      {
        title: "Director Queue",
        component: DeanDirectorQueueView,
        visible: normalizedRole.includes("director"),
      },
      {
        title: "Dean Processing",
        component: DeanProcessingQueueView,
        visible: isDeanProcessingRole(normalizedRole),
      },
      {
        title: "Work Progress",
        component: WorkProgressView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Requests In Progress",
        component: RequestsInProgressView,
        visible: true,
      },
      {
        title: "Bill Generation",
        component: BillGenerationView,
        visible: isEngineerRole(normalizedRole),
      },
      {
        title: "Bill Processing",
        component: BillProcessingView,
        visible: normalizedRole.includes("accounts admin"),
      },
      {
        title: "Vendor Management",
        component: VendorManagementView,
        visible: isVendorManagementRole(normalizedRole),
      },
      {
        title: "Budget Management",
        component: BudgetManagementView,
        visible: normalizedRole.includes("admin iwd"),
      },
      {
        title: "Bill Audit",
        component: BillAuditView,
        visible: normalizedRole.includes("auditor"),
      },
      {
        title: "Bill Settlement",
        component: BillSettlementView,
        visible: normalizedRole.includes("accounts admin"),
      },
      // ===== NEW SLA & INVENTORY TABS (UC-29, UC-30, UC-31) =====
      {
        title: "SLA Dashboard",
        component: SLADashboardView,
        visible: normalizedRole.includes("admin iwd") || normalizedRole.includes("director"),
      },
      {
        title: "Inventory Management",
        component: InventoryManagementView,
        visible: normalizedRole.includes("admin iwd"),
      },
      {
        title: "Feedback & Cases",
        component: FeedbackView,
        visible: true,
      },
    ],
    [engineerUser, normalizedRole],
  );

  const visibleTabs = useMemo(
    () => tabsConfig.filter((tab) => tab.visible),
    [tabsConfig],
  );

  const tabItems = visibleTabs.map((tab) => ({ title: tab.title }));

  useEffect(() => {
    const activeIndex = parseInt(activeTab, 10);
    if (!Number.isNaN(activeIndex) && activeIndex < visibleTabs.length) {
      return;
    }
    setActiveTab("0");
  }, [activeTab, visibleTabs]);

  useEffect(() => {
    const activeIndex = parseInt(activeTab, 10);
    const safeIndex = Number.isNaN(activeIndex) ? 0 : activeIndex;
    const activeTitle = visibleTabs[safeIndex]?.title || "Request Status";
    dispatch(setActiveTab_(activeTitle));
  }, [activeTab, dispatch, visibleTabs]);

  const activeIndex = parseInt(activeTab, 10);
  const ActiveComponent =
    visibleTabs[Number.isNaN(activeIndex) ? 0 : activeIndex]?.component ||
    RequestsStatusView;

  return (
    <InstituteWorksShell
      tabs={tabItems}
      activeTab={activeTab}
      setActiveTab={setActiveTab}
    >
      <ActiveComponent />
    </InstituteWorksShell>
  );
}

export default InstituteWorks;
