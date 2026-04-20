import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import BillSettlementTable from "./components/BillSettlementTable";
import { getApiErrorMessage, getSettleBills, settleBill } from "./api";

function BillSettlementView() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getSettleBills();
      setRows(data);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch bills for settlement."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSettle = async (id) => {
    setWorkingId(id);
    try {
      await settleBill(id);
      notifications.show({
        color: "green",
        message: `Bill settled for request #${id}.`,
      });
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to settle this bill."),
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <BillSettlementTable
      rows={rows}
      isLoading={isLoading}
      workingId={workingId}
      onRefresh={load}
      onSettle={handleSettle}
    />
  );
}

export default BillSettlementView;
