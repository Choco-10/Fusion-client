import { useEffect, useMemo, useState } from "react";
import {
  Button,
  FileInput,
  Group,
  Modal,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import {
  getCreatedRequests,
  getDesignations,
  handleDeanProcessRequest,
} from "./api";

function DeanProcessingQueueView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [inboxRows, designationsData] = await Promise.all([
        getCreatedRequests(role),
        getDesignations(),
      ]);
      setRows(inboxRows);
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
        message: "Unable to fetch dean processing queue.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const ready = useMemo(
    () => Boolean(selectedFileId && designation),
    [selectedFileId, designation],
  );

  const openActionModal = (fileId) => {
    setSelectedFileId(fileId);
    setDesignation("");
    setRemarks("");
    setFile(null);
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;
    setIsSaving(true);
    try {
      await handleDeanProcessRequest({
        fileid: selectedFileId,
        designation,
        remarks,
        file,
      });
      notifications.show({
        color: "green",
        message: "Request processed and forwarded by dean.",
      });
      setOpened(false);
      await load();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to process request.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Dean Processing Queue</Title>
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
              <Table.Th>File ID</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((item) => (
                <Table.Tr key={item.file_id}>
                  <Table.Td>{item.request_id}</Table.Td>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{item.area}</Table.Td>
                  <Table.Td>{item.requestCreatedBy}</Table.Td>
                  <Table.Td>{item.file_id}</Table.Td>
                  <Table.Td>
                    <Button
                      size="xs"
                      onClick={() => openActionModal(item.file_id)}
                      disabled={!item.file_id}
                    >
                      Process &amp; Forward
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed">
                    No requests in dean processing queue.
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
        title="Process & Forward to Director"
        centered
      >
        <form onSubmit={submit}>
          <Stack>
            <Select
              label="Forward To"
              placeholder="Select designation and user"
              data={designationOptions}
              value={designation}
              onChange={(value) => setDesignation(value || "")}
              searchable
              required
            />
            <Textarea
              label="Remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.currentTarget.value)}
              minRows={3}
            />
            <FileInput
              label="Attachment"
              value={file}
              onChange={setFile}
              clearable
            />
            <Group justify="flex-end">
              <Button type="submit" loading={isSaving} disabled={!ready}>
                Forward
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}

export default DeanProcessingQueueView;
