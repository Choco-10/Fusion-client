import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import AdminApprovalQueueTable from "./components/AdminApprovalQueueTable";
import AdminApprovalActionModal from "./components/AdminApprovalActionModal";
import {
  getApiErrorMessage,
  getDesignations,
  getEngineerProcessedRequests,
  submitAdminApproval,
} from "./api";

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

function isDeanHodOption(value) {
  const designation = String(value || "").split("|", 1)[0].trim().toLowerCase();
  return DEAN_HOD_ROLES.some((role) => designation.includes(role));
}

function hasProposal(row) {
  return row?.estimated_budget != null || row?.estimatedBudget != null;
}

function AdminApprovalQueueView() {
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

  const load = async () => {
    setIsLoading(true);
    try {
      const [queueRows, designationsData] = await Promise.all([
        getEngineerProcessedRequests(),
        getDesignations(),
      ]);
      setRows(queueRows.filter(hasProposal));

      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      setDesignationOptions(options.filter((item) => isDeanHodOption(item.value)));
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch admin queue."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ready = useMemo(
    () => Boolean(selectedFileId && action && designation),
    [selectedFileId, action, designation],
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
      await submitAdminApproval({
        fileid: selectedFileId,
        action,
        designation,
        remarks,
        file,
      });
      notifications.show({
        color: "green",
        message: "Admin action submitted.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to submit admin action."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <AdminApprovalQueueTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAction={openActionModal}
      />
      <AdminApprovalActionModal
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

export default AdminApprovalQueueView;
