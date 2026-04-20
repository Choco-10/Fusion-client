import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import RejectedRequestsTable from "./components/RejectedRequestsTable";
import ProposalItemsModal from "./components/ProposalItemsModal";
import {
  getApiErrorMessage,
  getDesignations,
  getRejectedRequests,
  handleUpdateRequest,
} from "./api";

function newItemRow() {
  return {
    name: "",
    description: "",
    unit: "",
    quantity: 1,
    price_per_unit: 0,
    docs: null,
  };
}

function RejectedRequestsView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [items, setItems] = useState([newItemRow()]);

  const load = async () => {
    setIsLoading(true);
    try {
      const [rejectedRows, designationsData] = await Promise.all([
        getRejectedRequests(role),
        getDesignations(),
      ]);
      setRows(rejectedRows);
      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      setDesignationOptions(options);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch rejected requests."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const totalBudget = useMemo(
    () =>
      items.reduce(
        (acc, item) =>
          acc + Number(item.quantity || 0) * Number(item.price_per_unit || 0),
        0,
      ),
    [items],
  );

  const ready = useMemo(
    () =>
      Boolean(
        selectedRequestId &&
        designation &&
        items.length > 0 &&
        items.every((item) => item.name && item.unit),
      ),
    [selectedRequestId, designation, items],
  );

  const openModal = (requestId) => {
    setSelectedRequestId(requestId);
    setDesignation("");
    setSupportingDocument(null);
    setItems([newItemRow()]);
    setOpened(true);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, newItemRow()]);
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setIsSaving(true);
    try {
      await handleUpdateRequest({
        id: selectedRequestId,
        designation,
        supporting_documents: supportingDocument,
        items,
      });
      notifications.show({
        color: "green",
        message: "Request resubmitted successfully.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to resubmit request."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <RejectedRequestsTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onResubmit={openModal}
      />
      <ProposalItemsModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        title="Resubmit with Updated Proposal"
        submitLabel="Resubmit"
        designationOptions={designationOptions}
        designation={designation}
        setDesignation={setDesignation}
        supportingDocument={supportingDocument}
        setSupportingDocument={setSupportingDocument}
        items={items}
        updateItem={updateItem}
        addItem={addItem}
        removeItem={removeItem}
        totalBudget={totalBudget}
        isSaving={isSaving}
        isReady={ready}
      />
    </>
  );
}

export default RejectedRequestsView;
