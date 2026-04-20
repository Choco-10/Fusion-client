import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import DirectorApprovedTable from "./components/DirectorApprovedTable";
import IssueWorkOrderModal from "./components/IssueWorkOrderModal";
import {
  getApiErrorMessage,
  getDirectorApprovedRequests,
  issueWorkOrder,
} from "./api";

function toIsoDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const year = d.getFullYear();
  const month = `${d.getMonth() + 1}`.padStart(2, "0");
  const day = `${d.getDate()}`.padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function isCompletionDateValid(startDate, completionDate) {
  if (!startDate || !completionDate) return true;
  const start = new Date(startDate);
  const end = new Date(completionDate);
  start.setHours(0, 0, 0, 0);
  end.setHours(0, 0, 0, 0);
  return end >= start;
}

const initialForm = {
  request_id: "",
  name: "",
  alloted_time: "",
  start_date: null,
  completion_date: null,
};

function DirectorApprovedView() {
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [form, setForm] = useState(initialForm);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getDirectorApprovedRequests();
      setRequests(data);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch director-approved requests."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const readyToSubmit = useMemo(
    () =>
      Boolean(
        form.request_id && form.name && form.alloted_time && form.start_date,
      ) && isCompletionDateValid(form.start_date, form.completion_date),
    [form],
  );

  const openForRequest = (row) => {
    setForm({
      request_id: row.id,
      name: row.name || "",
      alloted_time: "",
      start_date: null,
      completion_date: null,
    });
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!readyToSubmit) return;

    setIsSaving(true);
    try {
      await issueWorkOrder({
        request_id: form.request_id,
        name: (form.name || "").trim(),
        alloted_time: (form.alloted_time || "").trim(),
        start_date: toIsoDate(form.start_date),
        completion_date: toIsoDate(form.completion_date),
      });
      notifications.show({
        color: "green",
        message: "Work order issued successfully.",
      });
      setOpened(false);
      setForm(initialForm);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to issue work order."),
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <DirectorApprovedTable
        requests={requests}
        isLoading={isLoading}
        onRefresh={load}
        onIssue={openForRequest}
      />
      <IssueWorkOrderModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submit}
        form={form}
        setForm={setForm}
        isSaving={isSaving}
        isReady={readyToSubmit}
      />
    </>
  );
}

export default DirectorApprovedView;
