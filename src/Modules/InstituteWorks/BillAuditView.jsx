import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import BillAuditTable from "./components/BillAuditTable";
import BillAuditModal from "./components/BillAuditModal";
import {
  getApiErrorMessage,
  getAuditDocuments,
  submitAuditDocument,
} from "./api";

function BillAuditView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [selectedBill, setSelectedBill] = useState(null);
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const auditRows = await getAuditDocuments(role);
      setRows(auditRows);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch audit documents."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const ready = useMemo(
    () => Boolean(selectedFileId),
    [selectedFileId],
  );

  const openAudit = (billRow) => {
    setSelectedFileId(billRow?.file_id || null);
    setSelectedBill(billRow || null);
    setRemarks("");
    setAttachment(null);
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await submitAuditDocument({
        fileid: selectedFileId,
        remarks,
        attachment,
      });
      notifications.show({
        color: "green",
        message: "Bill audited and forwarded.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to audit and forward this bill."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <BillAuditTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAudit={openAudit}
      />
      <BillAuditModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        selectedBill={selectedBill}
        remarks={remarks}
        setRemarks={setRemarks}
        attachment={attachment}
        setAttachment={setAttachment}
        isSaving={isSaving}
        isReady={ready}
      />
    </>
  );
}

export default BillAuditView;
