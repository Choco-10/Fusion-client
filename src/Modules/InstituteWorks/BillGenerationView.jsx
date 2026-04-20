import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import BillGenerationTable from "./components/BillGenerationTable";
import BillGenerationModal from "./components/BillGenerationModal";
import { getApiErrorMessage, getIssuedWork, markBillGenerated } from "./api";

function BillGenerationView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);
  const [opened, setOpened] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [vendorId, setVendorId] = useState("");
  const [billItems, setBillItems] = useState([
    { name: "", description: "", quantity: "", price: "" },
  ]);

  const isBillItemValid = (item) =>
    Boolean(item.name.trim()) && Number(item.quantity) > 0 && Number(item.price) >= 0;

  const billTotal = useMemo(
    () =>
      billItems.reduce((sum, item) => {
        const quantity = Number(item.quantity) || 0;
        const price = Number(item.price) || 0;
        return sum + quantity * price;
      }, 0),
    [billItems],
  );

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getIssuedWork(role, {
        work_completed: 1,
        bill_generated: 0,
      });
      setRows(data);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch issued work list."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const openGenerate = (id) => {
    setSelectedRequestId(id);
    setVendorId("");
    setBillItems([{ name: "", description: "", quantity: "", price: "" }]);
    setOpened(true);
  };

  const updateBillItem = (index, field, value) => {
    setBillItems((current) =>
      current.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item,
      ),
    );
  };

  const addBillItem = () => {
    setBillItems((current) => [
      ...current,
      { name: "", description: "", quantity: "", price: "" },
    ]);
  };

  const removeBillItem = (index) => {
    setBillItems((current) => current.filter((_, itemIndex) => itemIndex !== index));
  };

  const submitGenerate = async (event) => {
    event.preventDefault();
    if (!selectedRequestId || !billItems.some(isBillItemValid)) return;

    const normalizedBillItems = billItems
      .filter(isBillItemValid)
      .map((item) => ({
        name: item.name.trim(),
        description: item.description.trim(),
        quantity: Number(item.quantity),
        price: Number(item.price),
      }));

    setWorkingId(selectedRequestId);
    try {
      await markBillGenerated({
        id: selectedRequestId,
        vendor_id: vendorId.trim(),
        bill_items: normalizedBillItems,
      });
      notifications.show({
        color: "green",
        message: `Request #${selectedRequestId} moved to Generated Bills.`,
      });
      setOpened(false);
      await load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to mark bill generated."),
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <>
      <BillGenerationTable
        rows={rows}
        isLoading={isLoading}
        workingId={workingId}
        onRefresh={load}
        onGenerate={openGenerate}
      />
      <BillGenerationModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={submitGenerate}
        requestId={selectedRequestId}
        vendorId={vendorId}
        setVendorId={setVendorId}
        billItems={billItems}
        updateBillItem={updateBillItem}
        addBillItem={addBillItem}
        removeBillItem={removeBillItem}
        billTotal={billTotal}
      />
    </>
  );
}

export default BillGenerationView;
