import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import DeanDirectorQueueTable from "./components/DeanDirectorQueueTable";
import DeanDirectorActionModal from "./components/DeanDirectorActionModal";
import {
  getApiErrorMessage,
  getDeanProcessedRequests,
  submitDirectorApproval,
} from "./api";

function DeanDirectorQueueView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [action, setAction] = useState("approve");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const deanRows = await getDeanProcessedRequests(role);
      setRows(deanRows);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch dean/director queue."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const ready = useMemo(
    () => Boolean(selectedFileId && action),
    [selectedFileId, action],
  );

  const openActionModal = (fileId) => {
    setSelectedFileId(fileId);
    setAction("approve");
    setRemarks("");
    setFile(null);
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await submitDirectorApproval({
        fileid: selectedFileId,
        action,
        remarks,
        file,
      });
      notifications.show({
        color: "green",
        message: "Director action submitted.",
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to submit director action."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DeanDirectorQueueTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onAction={openActionModal}
      />
      <DeanDirectorActionModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        action={action}
        setAction={setAction}
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

export default DeanDirectorQueueView;
