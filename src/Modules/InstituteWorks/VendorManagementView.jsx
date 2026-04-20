import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import VendorManagementContent from "./components/VendorManagementContent";
import VendorFormModal from "./components/VendorFormModal";
import { addVendor, getIssuedWork, getVendors, getWork } from "./api";

function VendorManagementView() {
  const role = useSelector((state) => state.user.role);
  const [issuedWorks, setIssuedWorks] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [vendors, setVendors] = useState([]);
  const [workId, setWorkId] = useState(null);
  const [isFetchingVendors, setIsFetchingVendors] = useState(false);
  const [opened, setOpened] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [newVendor, setNewVendor] = useState({
    name: "",
    contact_number: "",
    email_address: "",
  });

  const loadIssuedWorks = async () => {
    setIsLoading(true);
    try {
      const data = await getIssuedWork(role);
      setIssuedWorks(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch issued works.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadIssuedWorks();
  }, [role]);

  const fetchVendors = async (requestId) => {
    setSelectedRequestId(requestId || "");
    setVendors([]);
    setWorkId(null);
    if (!requestId) return;
    setIsFetchingVendors(true);
    try {
      const work = await getWork(requestId);
      setWorkId(work.id);
      const vendorList = await getVendors(work.id);
      setVendors(vendorList);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch vendors for this work order.",
      });
    } finally {
      setIsFetchingVendors(false);
    }
  };

  const openAddVendorModal = () => {
    setNewVendor({ name: "", contact_number: "", email_address: "" });
    setOpened(true);
  };

  const handleAddVendor = async (event) => {
    event.preventDefault();
    if (!workId || !newVendor.name) return;
    setIsSaving(true);
    try {
      await addVendor({ work: workId, ...newVendor });
      notifications.show({
        color: "green",
        message: "Vendor added successfully.",
      });
      setOpened(false);
      await fetchVendors(selectedRequestId);
    } catch {
      notifications.show({
        color: "red",
        message: workId
          ? "Unable to add vendor."
          : "Issue the work order first, then add a vendor.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <VendorManagementContent
        issuedWorks={issuedWorks}
        isLoading={isLoading}
        selectedRequestId={selectedRequestId}
        onSelectRequest={fetchVendors}
        vendors={vendors}
        isFetchingVendors={isFetchingVendors}
        workId={workId}
        onOpenAddVendor={openAddVendorModal}
        onRefresh={loadIssuedWorks}
      />
      <VendorFormModal
        opened={opened}
        onClose={() => setOpened(false)}
        onSubmit={handleAddVendor}
        requestId={selectedRequestId}
        workId={workId}
        newVendor={newVendor}
        setNewVendor={setNewVendor}
        isSaving={isSaving}
      />
    </>
  );
}

export default VendorManagementView;
