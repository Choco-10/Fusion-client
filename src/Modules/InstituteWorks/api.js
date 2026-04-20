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
  // NEW SLA & INVENTORY ROUTES
  slaDashboardRoute,
  inventoryItemsRoute,
  inventoryTransactionsRoute,
  issueMaterialsRoute,
  receiveMaterialsRoute,
  feedbackHistoryRoute,
  submitFeedbackRoute,
  reopenRequestRoute,
  slaEscalationsRoute,
} from "../../routes/instituteWorksRoutes";

const iwdApi = axios.create();

const extractFirstErrorMessage = (value, parentKey = "") => {
  if (value == null) return "";
  if (typeof value === "string") {
    return parentKey ? `${parentKey}: ${value}` : value;
  }
  if (Array.isArray(value)) {
    return value.reduce((message, item) => {
      if (message) return message;
      return extractFirstErrorMessage(item, parentKey);
    }, "");
  }
  if (typeof value === "object") {
    return Object.entries(value).reduce((message, [key, nestedValue]) => {
      if (message) return message;
      const nextKey =
        key === "non_field_errors" || key === "detail" ? parentKey : key;
      return extractFirstErrorMessage(nestedValue, nextKey);
    }, "");
  }
  return "";
};

export const getApiErrorMessage = (error, fallback = "Request failed.") => {
  if (!axios.isAxiosError(error)) return fallback;

  const data = error.response?.data;
  const status = error.response?.status;

  if (status === 403 && (!data || typeof data === "string")) {
    return "You are not authorized for this action.";
  }

  if (typeof data === "string") {
    return data;
  }

  if (data && typeof data === "object") {
    if (typeof data.error === "string" && data.error.trim()) return data.error;
    if (typeof data.message === "string" && data.message.trim()) {
      return data.message;
    }

    const extracted = extractFirstErrorMessage(data);
    if (extracted) return extracted;
  }

  return error.message || fallback;
};

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
  isPriority,
  file,
}) => {
  const formData = new FormData();
  formData.append("name", name);
  formData.append("area", area);
  formData.append("description", description);
  formData.append("designation", designation);
  formData.append("role", role || "");
  formData.append("isPriority", isPriority ? "true" : "false");
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
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.obj)) return data.obj;
  return [];
};

export const getDirectorApprovedRequests = async () => {
  const { data } = await iwdApi.get(directorApprovedRequestsRoute);
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.obj)) return data.obj;
  return [];
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
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.obj)) return data.obj;
  return [];
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
  if (designation) {
    formData.append("designation", designation);
  }
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
  if (designation) {
    formData.append("designation", designation);
  }
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

export const getIssuedWork = async (role, filters = {}) => {
  const { data } = await iwdApi.get(issuedWorkRoute, {
    params: { role, ...filters },
  });
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.obj)) return data.obj;
  return [];
};

export const markBillGenerated = async ({ id, vendor_id, bill_items }) => {
  const payload = { id };
  if (vendor_id) payload.vendor_id = vendor_id;
  if (bill_items) payload.bill_items = JSON.stringify(bill_items);

  const { data } = await iwdApi.post(handleBillGeneratedRequestsRoute, payload);
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

export const downloadBillPdf = async (request_id) => {
  const response = await iwdApi.get(generateBillPdfRoute, {
    params: { request_id },
    responseType: "blob",
  });

  const blob = new Blob([response.data], { type: "application/pdf" });
  const objectUrl = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = `Request_${request_id}_bill.pdf`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(objectUrl);
};

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
  action,
  designation,
  remarks,
  file,
}) => {
  const formData = new FormData();
  formData.append("fileid", fileid);
  formData.append("action", action || "approve");
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
  if (Array.isArray(data)) return data;
  if (Array.isArray(data?.obj)) return data.obj;
  return [];
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
// ===== NEW SLA & INVENTORY API FUNCTIONS (UC-29, UC-30, UC-31) =====

export const getSLADashboard = async () => {
  const { data } = await iwdApi.get(slaDashboardRoute);
  return (
    data || {
      total_active: 0,
      pending_count: 0,
      due_soon_count: 0,
      overdue_count: 0,
      overdue_requests: [],
      escalation_count: 0,
      priority_count: 0,
    }
  );
};

export const getInventoryItems = async (
  page = 1,
  page_size = 20,
  filters = {},
) => {
  const params = { page, page_size, ...filters };
  const { data } = await iwdApi.get(inventoryItemsRoute, { params });
  return {
    items: Array.isArray(data?.items) ? data.items : [],
    pagination: data?.pagination || {
      current_page: 1,
      total_pages: 1,
      total_count: 0,
      page_size: 20,
    },
  };
};

export const getInventoryTransactions = async (
  page = 1,
  page_size = 20,
  filters = {},
) => {
  const params = { page, page_size, ...filters };
  const { data } = await iwdApi.get(inventoryTransactionsRoute, { params });
  return {
    items: Array.isArray(data?.obj) ? data.obj : [],
    pagination: data?.pagination || {
      current_page: 1,
      total_pages: 1,
      total_count: 0,
      page_size: 20,
    },
  };
};

export const issueMaterials = async (
  item_id,
  quantity,
  request_id = null,
  remarks = "",
) => {
  const { data } = await iwdApi.post(issueMaterialsRoute, {
    item_id,
    quantity,
    request_id,
    remarks,
  });
  return data;
};

export const receiveMaterials = async (item_id, quantity, remarks = "") => {
  const { data } = await iwdApi.post(receiveMaterialsRoute, {
    item_id,
    quantity,
    remarks,
  });
  return data;
};

export const submitFeedback = async (request_id, rating, comments = "") => {
  const { data } = await iwdApi.post(submitFeedbackRoute, {
    request_id,
    rating,
    comments,
  });
  return data;
};

export const reopenRequest = async (request_id, reason = "") => {
  const { data } = await iwdApi.post(reopenRequestRoute, {
    request_id,
    reason,
  });
  return data;
};

export const getFeedbackHistory = async (
  page = 1,
  page_size = 20,
  filters = {},
) => {
  const params = { page, page_size, ...filters };
  const { data } = await iwdApi.get(feedbackHistoryRoute, { params });
  return {
    items: Array.isArray(data?.obj) ? data.obj : [],
    pagination: data?.pagination || {
      current_page: 1,
      total_pages: 1,
      total_count: 0,
      page_size: 20,
    },
  };
};

export const getSLAEscalations = async (
  page = 1,
  page_size = 20,
  filters = {},
) => {
  const params = { page, page_size, ...filters };
  const { data } = await iwdApi.get(slaEscalationsRoute, { params });
  return {
    items: Array.isArray(data?.obj) ? data.obj : [],
    pagination: data?.pagination || {
      current_page: 1,
      total_pages: 1,
      total_count: 0,
      page_size: 20,
    },
  };
};
