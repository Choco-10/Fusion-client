import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import WorkProgressTable from "./components/WorkProgressTable";
import { getApiErrorMessage, getWorkUnderProgress, markWorkCompleted } from "./api";

function WorkProgressView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getWorkUnderProgress(role);
      setRows(data);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch work-under-progress records."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const completeWork = async (id) => {
    setWorkingId(id);
    try {
      await markWorkCompleted(id);
      notifications.show({
        color: "green",
        message: `Work marked completed for request #${id}.`,
      });
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to mark work as completed."),
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <WorkProgressTable
      rows={rows}
      isLoading={isLoading}
      workingId={workingId}
      onRefresh={load}
      onComplete={completeWork}
    />
  );
}

export default WorkProgressView;
