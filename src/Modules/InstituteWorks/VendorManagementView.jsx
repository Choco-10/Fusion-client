import { useEffect, useState } from "react";
import {
  Button,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
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
      notifications.show({ color: "red", message: "Unable to add vendor." });
    } finally {
      setIsSaving(false);
    }
  };

  const requestOptions = issuedWorks.map((w) => ({
    value: String(w.request_id),
    label: `#${w.request_id} — ${w.name}`,
  }));

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Vendor Management</Title>
        <Button variant="light" onClick={loadIssuedWorks} loading={isLoading}>
          Refresh
        </Button>
      </Group>

      <Stack gap="md">
        <Select
          label="Select Work Order (by Request)"
          placeholder="Choose a request"
          data={requestOptions}
          value={selectedRequestId || null}
          onChange={(value) => fetchVendors(value || "")}
          searchable
          clearable
        />

        {selectedRequestId && (
          <>
            <Group justify="space-between">
              <Title order={6}>Vendors for Request #{selectedRequestId}</Title>
              <Button size="xs" onClick={openAddVendorModal} disabled={!workId}>
                Add Vendor
              </Button>
            </Group>

            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Vendor ID</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Contact Number</Table.Th>
                    <Table.Th>Email</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isFetchingVendors ? (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text ta="center" c="dimmed">
                          Loading…
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <Table.Tr key={vendor.vendor_id}>
                        <Table.Td>{vendor.vendor_id}</Table.Td>
                        <Table.Td>{vendor.name}</Table.Td>
                        <Table.Td>{vendor.contact_number || "—"}</Table.Td>
                        <Table.Td>{vendor.email_address || "—"}</Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text ta="center" c="dimmed">
                          No vendors added yet for this work order.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </>
        )}
      </Stack>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Add Vendor"
        centered
      >
        <form onSubmit={handleAddVendor}>
          <Stack>
            <TextInput
              label="Vendor Name"
              value={newVendor.name}
              onChange={(e) =>
                setNewVendor((v) => ({ ...v, name: e.currentTarget.value }))
              }
              required
            />
            <TextInput
              label="Contact Number"
              value={newVendor.contact_number}
              onChange={(e) =>
                setNewVendor((v) => ({
                  ...v,
                  contact_number: e.currentTarget.value,
                }))
              }
            />
            <TextInput
              label="Email Address"
              type="email"
              value={newVendor.email_address}
              onChange={(e) =>
                setNewVendor((v) => ({
                  ...v,
                  email_address: e.currentTarget.value,
                }))
              }
            />
            <Group justify="flex-end">
              <Button
                type="submit"
                loading={isSaving}
                disabled={!newVendor.name}
              >
                Add
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}

export default VendorManagementView;
