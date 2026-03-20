import axios from "axios";
import {
  addBudgetRoute,
  auditDocumentRoute,
  auditDocumentViewRoute,
  createProposalRoute,
  createRequestRoute,
  createdRequestsRoute,
  deanProcessedRequestsRoute,
  directorApprovedRequestsRoute,
  editBudgetRoute,
  engineerProcessedRequestsRoute,
  fetchDesignationsRoute,
  generateBillPdfRoute,
  generatedBillsViewRoute,
  getItemsRoute,
  getProposalsRoute,
  handleAdminApprovalRoute,
  handleBillGeneratedRequestsRoute,
  handleDirectorApprovalRoute,
  handleProcessBillsRoute,
  issuedWorkRoute,
  issueWorkOrderRoute,
  requestsStatusRoute,
  settleBillRoute,
  settleBillsViewRoute,
  viewBudgetRoute,
  workCompletedRoute,
  workUnderProgressRoute,
  viewFileRoute,
  forwardRequestRoute,
  handleDeanProcessRequestRoute,
  rejectedRequestsRoute,
  handleUpdateRequestsRoute,
  requestsInProgressRoute,
  addVendorRoute,
  getWorkRoute,
  getVendorsRoute,
} from "../../routes/instituteWorksRoutes";

const iwdApi = axios.create();

iwdApi.interceptors.request.use((config) => {
  const token = localStorage.getItem("authToken");
  if (token) {
    config.headers.Authorization = `Token ${token}`;
  }
  return config;
});

export const getDesignations = async () => {
  const { data } = await iwdApi.get(fetchDesignationsRoute);
  return data || {};
};

export const createRequest = async ({
  name,
  area,
  description,
  designation,
  role,
  file,
}) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("area", area);
  formData.append("description", description);
  formData.append("designation", designation);
  formData.append("role", role || "");
  if (file) {
    formData.append("file", file);
  }

  const { data } = await iwdApi.post(createRequestRoute, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const getCreatedRequests = async (role) => {
  const { data } = await iwdApi.get(createdRequestsRoute, {
    params: { role },
  });
  return Array.isArray(data) ? data : [];
};

export const getRequestsStatus = async (role) => {
  const { data } = await iwdApi.get(requestsStatusRoute, {
    params: { role },
  });
  return Array.isArray(data) ? data : [];
};

export const getDirectorApprovedRequests = async () => {
  const { data } = await iwdApi.get(directorApprovedRequestsRoute);
  return Array.isArray(data) ? data : [];
};

export const issueWorkOrder = async ({
  request_id,
  name,
  alloted_time,
  start_date,
  completion_date,
}) => {
  const payload = {
    request_id,
    name,
    alloted_time,
    start_date,
  };

  if (completion_date) {
    payload.completion_date = completion_date;
  }

  const { data } = await iwdApi.post(issueWorkOrderRoute, payload);
  return data;
};

export const getWorkUnderProgress = async (role) => {
  const { data } = await iwdApi.get(workUnderProgressRoute, {
    params: { role },
  });
  return Array.isArray(data) ? data : [];
};

export const markWorkCompleted = async (id) => {
  const { data } = await iwdApi.patch(workCompletedRoute, { id });
  return data;
};

export const getBudgets = async () => {
  const { data } = await iwdApi.get(viewBudgetRoute);
  return data?.obj || [];
};

export const addBudget = async ({ name, budget }) => {
  const { data } = await iwdApi.post(addBudgetRoute, {
    name,
    budget,
  });
  return data;
};

export const editBudget = async ({ id, name, budget }) => {
  const { data } = await iwdApi.post(editBudgetRoute, {
    id,
    name,
    budget,
  });
  return data;
};

export const getDeanProcessedRequests = async (role) => {
  const { data } = await iwdApi.get(deanProcessedRequestsRoute, {
    params: { role },
  });
  return Array.isArray(data) ? data : [];
};

export const submitDirectorApproval = async ({
  fileid,
  action,
  designation,
  remarks,
  file,
}) => {
  const formData = new FormData();
  formData.append("fileid", fileid);
  formData.append("action", action);
  formData.append("designation", designation);
  formData.append("remarks", remarks || "");
  if (file) {
    formData.append("file", file);
  }

  const { data } = await iwdApi.post(handleDirectorApprovalRoute, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const getAuditDocuments = async (role) => {
  const { data } = await iwdApi.get(auditDocumentViewRoute, {
    params: { role },
  });
  return Array.isArray(data) ? data : [];
};

export const submitAuditDocument = async ({
  fileid,
  designation,
  remarks,
  attachment,
}) => {
  const formData = new FormData();
  formData.append("fileid", fileid);
  formData.append("designation", designation);
  formData.append("remarks", remarks || "");
  if (attachment) {
    formData.append("attachment", attachment);
  }

  const { data } = await iwdApi.post(auditDocumentRoute, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const getSettleBills = async () => {
  const { data } = await iwdApi.get(settleBillsViewRoute);
  return Array.isArray(data?.data) ? data.data : [];
};

export const settleBill = async (id) => {
  const { data } = await iwdApi.post(settleBillRoute, { id });
  return data;
};

export const getEngineerProcessedRequests = async () => {
  const { data } = await iwdApi.get(engineerProcessedRequestsRoute);
  return Array.isArray(data) ? data : [];
};

export const submitAdminApproval = async ({
  fileid,
  action,
  designation,
  remarks,
  file,
}) => {
  const formData = new FormData();
  formData.append("fileid", fileid);
  formData.append("action", action);
  formData.append("designation", designation);
  formData.append("remarks", remarks || "");
  if (file) {
    formData.append("file", file);
  }

  const { data } = await iwdApi.post(handleAdminApprovalRoute, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const createProposal = async ({
  id,
  designation,
  supporting_documents,
  items,
}) => {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("designation", designation);
  if (supporting_documents) {
    formData.append("supporting_documents", supporting_documents);
  }

  items.forEach((item, index) => {
    formData.append(`items[${index}][name]`, item.name || "");
    formData.append(`items[${index}][description]`, item.description || "");
    formData.append(`items[${index}][unit]`, item.unit || "");
    formData.append(`items[${index}][quantity]`, item.quantity ?? 0);
    formData.append(
      `items[${index}][price_per_unit]`,
      item.price_per_unit ?? 0,
    );
    if (item.docs) {
      formData.append(`items[${index}][docs]`, item.docs);
    }
  });

  const { data } = await iwdApi.post(createProposalRoute, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const getProposals = async (request_id) => {
  const { data } = await iwdApi.get(getProposalsRoute, {
    params: { request_id },
  });
  return Array.isArray(data) ? data : [];
};

export const getItems = async (proposal_id) => {
  const { data } = await iwdApi.get(getItemsRoute, {
    params: { proposal_id },
  });
  return data || { itemsList: [], proposal: null };
};

export const getIssuedWork = async (role) => {
  const { data } = await iwdApi.get(issuedWorkRoute, {
    params: { role },
  });
  return Array.isArray(data) ? data : [];
};

export const markBillGenerated = async (id) => {
  const { data } = await iwdApi.post(handleBillGeneratedRequestsRoute, { id });
  return data;
};

export const getGeneratedBills = async () => {
  const { data } = await iwdApi.get(generatedBillsViewRoute);
  return Array.isArray(data?.obj) ? data.obj : [];
};

export const processBill = async ({
  fileid,
  designation,
  remarks,
  attachment,
  vendor_id,
}) => {
  const formData = new FormData();
  formData.append("fileid", fileid);
  formData.append("designation", designation);
  formData.append("remarks", remarks || "");
  if (attachment) {
    formData.append("attachment", attachment);
  }
  if (vendor_id) {
    formData.append("vendor_id", vendor_id);
  }

  const { data } = await iwdApi.post(handleProcessBillsRoute, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const getBillPdfUrl = (request_id) =>
  `${generateBillPdfRoute}?request_id=${request_id}`;

export const getViewFile = async (file_id) => {
  const { data } = await iwdApi.get(viewFileRoute, { params: { file_id } });
  return data || { file: null, tracks: [] };
};

export const forwardRequest = async ({
  fileid,
  designation,
  remarks,
  file,
}) => {
  const formData = new FormData();
  formData.append("fileid", fileid);
  formData.append("designation", designation);
  formData.append("remarks", remarks || "");
  if (file) formData.append("file", file);
  const { data } = await iwdApi.post(forwardRequestRoute, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const handleDeanProcessRequest = async ({
  fileid,
  designation,
  remarks,
  file,
}) => {
  const formData = new FormData();
  formData.append("fileid", fileid);
  formData.append("designation", designation);
  formData.append("remarks", remarks || "");
  if (file) formData.append("file", file);
  const { data } = await iwdApi.post(handleDeanProcessRequestRoute, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getRejectedRequests = async (role) => {
  const { data } = await iwdApi.get(rejectedRequestsRoute, {
    params: { role },
  });
  return Array.isArray(data) ? data : [];
};

export const handleUpdateRequest = async ({
  id,
  designation,
  supporting_documents,
  items,
}) => {
  const formData = new FormData();
  formData.append("id", id);
  formData.append("designation", designation);
  if (supporting_documents)
    formData.append("supporting_documents", supporting_documents);
  items.forEach((item, index) => {
    formData.append(`items[${index}][name]`, item.name || "");
    formData.append(`items[${index}][description]`, item.description || "");
    formData.append(`items[${index}][unit]`, item.unit || "");
    formData.append(`items[${index}][quantity]`, item.quantity ?? 0);
    formData.append(
      `items[${index}][price_per_unit]`,
      item.price_per_unit ?? 0,
    );
    if (item.docs) formData.append(`items[${index}][docs]`, item.docs);
  });
  const { data } = await iwdApi.post(handleUpdateRequestsRoute, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data;
};

export const getRequestsInProgress = async () => {
  const { data } = await iwdApi.get(requestsInProgressRoute);
  return Array.isArray(data) ? data : [];
};

export const addVendor = async ({
  work,
  name,
  contact_number,
  email_address,
}) => {
  const { data } = await iwdApi.post(addVendorRoute, {
    work,
    name,
    contact_number,
    email_address,
  });
  return data;
};

export const getWork = async (request_id) => {
  const { data } = await iwdApi.get(getWorkRoute, { params: { request_id } });
  return data;
};

export const getVendors = async (work) => {
  const { data } = await iwdApi.get(getVendorsRoute, { params: { work } });
  return Array.isArray(data) ? data : [];
};
