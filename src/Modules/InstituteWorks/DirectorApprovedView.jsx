import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { notifications } from "@mantine/notifications";
import { getDirectorApprovedRequests, issueWorkOrder } from "./api";

function toIsoDate(value) {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
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
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch director-approved requests.",
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
      ),
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
        name: form.name,
        alloted_time: form.alloted_time,
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
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to issue work order.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Director Approved Requests</Title>
        <Button variant="light" onClick={load} loading={isLoading}>
          Refresh
        </Button>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>ID</Table.Th>
              <Table.Th>Name</Table.Th>
              <Table.Th>Area</Table.Th>
              <Table.Th>Created By</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {requests.length > 0 ? (
              requests.map((item) => (
                <Table.Tr key={item.id}>
                  <Table.Td>{item.id}</Table.Td>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{item.area}</Table.Td>
                  <Table.Td>{item.requestCreatedBy}</Table.Td>
                  <Table.Td>
                    <Button size="xs" onClick={() => openForRequest(item)}>
                      Issue Work Order
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed">
                    No requests are currently approved by director.
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
        title="Issue Work Order"
        centered
      >
        <form onSubmit={submit}>
          <Stack>
            <TextInput
              label="Request ID"
              value={String(form.request_id || "")}
              readOnly
            />
            <TextInput
              label="Agency / Work Name"
              value={form.name}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  name: event.currentTarget.value,
                }))
              }
              required
            />
            <TextInput
              label="Allotted Time"
              placeholder="e.g. 45 days"
              value={form.alloted_time}
              onChange={(event) =>
                setForm((prev) => ({
                  ...prev,
                  alloted_time: event.currentTarget.value,
                }))
              }
              required
            />
            <DateInput
              label="Start Date"
              value={form.start_date}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, start_date: value }))
              }
              valueFormat="YYYY-MM-DD"
              required
            />
            <DateInput
              label="Expected Completion Date"
              value={form.completion_date}
              onChange={(value) =>
                setForm((prev) => ({ ...prev, completion_date: value }))
              }
              valueFormat="YYYY-MM-DD"
            />
            <Group justify="flex-end">
              <Button
                type="submit"
                loading={isSaving}
                disabled={!readyToSubmit}
              >
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}

export default DirectorApprovedView;
