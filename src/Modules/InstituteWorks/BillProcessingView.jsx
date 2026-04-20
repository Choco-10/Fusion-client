import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import BillProcessingTable from "./components/BillProcessingTable";
import {
  getApiErrorMessage,
  getDesignations,
  getGeneratedBills,
  downloadBillPdf,
} from "./api";

function BillProcessingView() {
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [billRows, designationsData] = await Promise.all([
        getGeneratedBills(),
        getDesignations(),
      ]);
      setRows(billRows);

      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      setDesignationOptions(options);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch generated bills."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <BillProcessingTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        getBillPdfUrl={downloadBillPdf}
      />
    </>
  );
}

export default BillProcessingView;
