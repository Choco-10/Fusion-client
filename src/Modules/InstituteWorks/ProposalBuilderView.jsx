import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import ProposalRequestsTable from "./components/ProposalRequestsTable";
import ProposalItemsModal from "./components/ProposalItemsModal";
import {
  createProposal,
  getApiErrorMessage,
  getDesignations,
  getRequestsStatus,
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

function hasActiveProposal(row) {
  const activeProposal = row?.active_proposal ?? row?.activeProposal;
  return Boolean(activeProposal);
}

function ProposalBuilderView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [selectedRequestPriority, setSelectedRequestPriority] = useState(false);
  const [designation, setDesignation] = useState("");
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [items, setItems] = useState([newItemRow()]);

  const load = async () => {
    setIsLoading(true);
    try {
      const [statusRows, designationsData] = await Promise.all([
        getRequestsStatus(role),
        getDesignations(),
      ]);
      const pendingEngineerProposal = statusRows.filter(
        (row) => !hasActiveProposal(row),
      );
      setRows(pendingEngineerProposal);

      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      const adminIwdOptions = options.filter((item) =>
        item.value.startsWith("Admin IWD|"),
      );
      setDesignationOptions(adminIwdOptions);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to load proposal builder data."),
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

  const openModal = async (row) => {
    if (hasActiveProposal(row)) {
      notifications.show({
        color: "yellow",
        message: "An active proposal already exists for this request.",
      });
      await load();
      return;
    }

    setSelectedRequestId(row.request_id);
    setSelectedRequestPriority(Boolean(row?.is_priority ?? row?.isPriority));
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

  const addItem = () => {
    setItems((prev) => [...prev, newItemRow()]);
  };

  const removeItem = (index) => {
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await createProposal({
        id: selectedRequestId,
        designation,
        supporting_documents: supportingDocument,
        items,
        isPriority: selectedRequestPriority,
      });
      notifications.show({
        color: "green",
        message: "Proposal created successfully.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to create proposal."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <ProposalRequestsTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onCreate={openModal}
      />
      <ProposalItemsModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        title="Create Proposal"
        submitLabel="Submit Proposal"
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

export default ProposalBuilderView;
