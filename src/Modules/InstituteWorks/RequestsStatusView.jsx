import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import RequestsStatusTable from "./components/RequestsStatusTable";
import { getRequestsStatus } from "./api";

function RequestsStatusView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getRequestsStatus(role);
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch request status list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  return <RequestsStatusTable rows={rows} isLoading={isLoading} onRefresh={load} />;
}

export default RequestsStatusView;
