import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import RequestsInProgressTable from "./components/RequestsInProgressTable";
import { getRequestsInProgress } from "./api";

function RequestsInProgressView() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getRequestsInProgress();
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch requests in progress.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <RequestsInProgressTable
      rows={rows}
      isLoading={isLoading}
      onRefresh={load}
    />
  );
}

export default RequestsInProgressView;
