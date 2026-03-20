import { useEffect, useState } from "react";
import { Flex } from "@mantine/core";
import { useDispatch } from "react-redux";
import CustomBreadcrumbs from "../../components/Breadcrumbs";
import ModuleTabs from "../../components/moduleTabs";
import { setActiveTab_ } from "../../redux/moduleslice";
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
import RejectedRequestsView from "./RejectedRequestsView";
import VendorManagementView from "./VendorManagementView";
import RequestsInProgressView from "./RequestsInProgressView";

function InstituteWorks() {
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState("0");

  const tabItems = [
    { title: "Create Request" },
    { title: "Created Requests" },
    { title: "Request Status" },
    { title: "Admin Queue" },
    { title: "Proposal Builder" },
    { title: "Director Approved" },
    { title: "Dean Queue" },
    { title: "Dean Processing" },
    { title: "Rejected Requests" },
    { title: "Work Progress" },
    { title: "Requests In Progress" },
    { title: "Bill Generation" },
    { title: "Bill Processing" },
    { title: "Vendor Management" },
    { title: "Budget Management" },
    { title: "Bill Audit" },
    { title: "Bill Settlement" },
  ];
  const tabComponents = [
    CreateRequestView,
    CreatedRequestsView,
    RequestsStatusView,
    AdminApprovalQueueView,
    ProposalBuilderView,
    DirectorApprovedView,
    DeanDirectorQueueView,
    DeanProcessingQueueView,
    RejectedRequestsView,
    WorkProgressView,
    RequestsInProgressView,
    BillGenerationView,
    BillProcessingView,
    VendorManagementView,
    BudgetManagementView,
    BillAuditView,
    BillSettlementView,
  ];

  useEffect(() => {
    dispatch(setActiveTab_(tabItems[0].title));
  }, [dispatch]);

  const ActiveComponent =
    tabComponents[parseInt(activeTab, 10)] || CreateRequestView;

  return (
    <>
      <CustomBreadcrumbs />
      <Flex justify="space-between" align="center" mt="lg">
        <ModuleTabs
          tabs={tabItems}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </Flex>
      <ActiveComponent />
    </>
  );
}

export default InstituteWorks;
