import { useEffect, useMemo, useState } from "react";
import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Modal,
  NumberInput,
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
import { Trash } from "@phosphor-icons/react";
import { useSelector } from "react-redux";
import {
  getDesignations,
  getRejectedRequests,
  handleUpdateRequest,
} from "./api";

function newItemRow() {
  return {
    name: "",
    description: "",
    unit: "",
    quantity: 1,
    price_per_unit: 0,
    docs: null,
  };
}

function RejectedRequestsView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [supportingDocument, setSupportingDocument] = useState(null);
  const [items, setItems] = useState([newItemRow()]);

  const load = async () => {
    setIsLoading(true);
    try {
      const [rejectedRows, designationsData] = await Promise.all([
        getRejectedRequests(role),
        getDesignations(),
      ]);
      setRows(rejectedRows);
      const options = (designationsData?.holdsDesignations || []).map(
        (item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }),
      );
      setDesignationOptions(options);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch rejected requests.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const totalBudget = useMemo(
    () =>
      items.reduce(
        (acc, item) =>
          acc + Number(item.quantity || 0) * Number(item.price_per_unit || 0),
        0,
      ),
    [items],
  );

  const ready = useMemo(
    () =>
      Boolean(
        selectedRequestId &&
        designation &&
        items.length > 0 &&
        items.every((item) => item.name && item.unit),
      ),
    [selectedRequestId, designation, items],
  );

  const openModal = (requestId) => {
    setSelectedRequestId(requestId);
    setDesignation("");
    setSupportingDocument(null);
    setItems([newItemRow()]);
    setOpened(true);
  };

  const updateItem = (index, field, value) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => setItems((prev) => [...prev, newItemRow()]);
  const removeItem = (index) =>
    setItems((prev) => prev.filter((_, i) => i !== index));

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setIsSaving(true);
    try {
      await handleUpdateRequest({
        id: selectedRequestId,
        designation,
        supporting_documents: supportingDocument,
        items,
      });
      notifications.show({
        color: "green",
        message: "Request resubmitted successfully.",
      });
      setOpened(false);
      await load();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to resubmit request.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Rejected Requests</Title>
        <Button variant="light" onClick={load} loading={isLoading}>
          Refresh
        </Button>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Request ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Area</Table.Th>
              <Table.Th>Created By</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>{row.id}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>{row.area}</Table.Td>
                  <Table.Td>{row.requestCreatedBy}</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      color="orange"
                      onClick={() => openModal(row.id)}
                    >
                      Resubmit
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed">
                    No rejected requests found.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      <Modal
        opened={opened}
        onClose={() => setOpened(false)}
        title="Resubmit with Updated Proposal"
        size="xl"
        centered
      >
        <form onSubmit={submit}>
          <Stack>
            <Select
              label="Forward To"
              data={designationOptions}
              value={designation}
              onChange={(value) => setDesignation(value || "")}
              searchable
              required
            />
            <FileInput
              label="Supporting Document"
              value={supportingDocument}
              onChange={setSupportingDocument}
              clearable
            />

            {items.map((item, index) => (
              <Paper key={`${index + 1}-item`} withBorder p="sm" radius="md">
                <Group grow align="end" wrap="wrap">
                  <TextInput
                    label="Item Name"
                    value={item.name}
                    onChange={(event) =>
                      updateItem(index, "name", event.currentTarget.value)
                    }
                    required
                  />
                  <TextInput
                    label="Unit"
                    value={item.unit}
                    onChange={(event) =>
                      updateItem(index, "unit", event.currentTarget.value)
                    }
                    required
                  />
                  <NumberInput
                    label="Quantity"
                    min={0}
                    value={item.quantity}
                    onChange={(value) => updateItem(index, "quantity", value)}
                    required
                  />
                  <NumberInput
                    label="Price / Unit"
                    min={0}
                    value={item.price_per_unit}
                    onChange={(value) =>
                      updateItem(index, "price_per_unit", value)
                    }
                    required
                  />
                </Group>
                <Group mt="sm" align="end">
                  <TextInput
                    style={{ flex: 1 }}
                    label="Description"
                    value={item.description}
                    onChange={(event) =>
                      updateItem(
                        index,
                        "description",
                        event.currentTarget.value,
                      )
                    }
                  />
                  <FileInput
                    style={{ flex: 1 }}
                    label="Item Document"
                    value={item.docs}
                    onChange={(value) => updateItem(index, "docs", value)}
                    clearable
                  />
                  <ActionIcon
                    variant="light"
                    color="red"
                    onClick={() => removeItem(index)}
                    disabled={items.length === 1}
                  >
                    <Trash size={16} />
                  </ActionIcon>
                </Group>
              </Paper>
            ))}

            <Group justify="space-between">
              <Button variant="default" onClick={addItem}>
                Add Item
              </Button>
              <Text fw={600}>Estimated Total: {totalBudget.toFixed(2)}</Text>
            </Group>

            <Group justify="flex-end">
              <Button type="submit" loading={isSaving} disabled={!ready}>
                Resubmit
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}

export default RejectedRequestsView;
