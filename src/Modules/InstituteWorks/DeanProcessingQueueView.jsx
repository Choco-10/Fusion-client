import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import DeanProcessingQueueTable from "./components/DeanProcessingQueueTable";
import DeanProcessingActionModal from "./components/DeanProcessingActionModal";
import {
  getApiErrorMessage,
  getDeanPendingRequests,
  getDesignations,
  handleDeanProcessRequest,
} from "./api";

function isDirectorOption(value) {
  const designation = String(value || "").split("|", 1)[0].trim().toLowerCase();
  return designation === "director";
}

function isAdminIwdOption(value) {
  const designation = String(value || "").split("|", 1)[0].trim().toLowerCase();
  return designation === "admin iwd";
}

function readField(item, snakeKey, camelKey) {
  return item?.[snakeKey] ?? item?.[camelKey] ?? null;
}

function isDeanPendingItem(item) {
  const admin = Number(item?.iwdAdminApproval ?? item?.processed_by_admin ?? 0);
  const dean = Number(item?.deanProcessed ?? item?.processed_by_dean ?? 0);
  const director = Number(item?.directorApproval ?? item?.processed_by_director ?? 0);
  const budget = readField(item, "estimated_budget", "estimatedBudget");
  return admin === 1 && dean === 0 && director === 0 && budget != null;
}

function DeanProcessingQueueView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [action, setAction] = useState("approve");
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);
  const [allDesignationOptions, setAllDesignationOptions] = useState([]);

  const load = async () => {
    setIsLoading(true);
    try {
      const [inboxRows, designationsData] = await Promise.all([
        getDeanPendingRequests(role),
        getDesignations(),
      ]);
      setRows(inboxRows.filter(isDeanPendingItem));
      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      setAllDesignationOptions(options);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch dean processing queue."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  useEffect(() => {
    const filtered =
      action === "reject"
        ? allDesignationOptions.filter((item) => isAdminIwdOption(item.value))
        : allDesignationOptions.filter((item) => isDirectorOption(item.value));
    setDesignationOptions(filtered);
    setDesignation("");
  }, [action, allDesignationOptions]);

  const ready = useMemo(
    () => Boolean(selectedFileId && designation),
    [selectedFileId, designation],
  );

  const openActionModal = (fileId) => {
    setSelectedFileId(fileId);
    setAction("approve");
    setDesignation("");
    setRemarks("");
    setFile(null);
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setIsSaving(true);
    try {
      await handleDeanProcessRequest({
        fileid: selectedFileId,
        action,
        designation,
        remarks,
        file,
      });
      notifications.show({
        color: "green",
        message: "Request processed and forwarded by dean.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to process request."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DeanProcessingQueueTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAction={openActionModal}
      />
      <DeanProcessingActionModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        action={action}
        setAction={setAction}
        designationOptions={designationOptions}
        designation={designation}
        setDesignation={setDesignation}
        remarks={remarks}
        setRemarks={setRemarks}
        file={file}
        setFile={setFile}
        isSaving={isSaving}
        isReady={ready}
      />
    </>
  );
}

export default DeanProcessingQueueView;
