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
  getDeanProcessedRequests,
  getDesignations,
  submitDirectorApproval,
} from "./api";

const actionOptions = [
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
];

function DeanDirectorQueueView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [action, setAction] = useState("approve");
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [file, setFile] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [deanRows, designationsData] = await Promise.all([
        getDeanProcessedRequests(role),
        getDesignations(),
      ]);
      setRows(deanRows);

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
        message: "Unable to fetch dean/director queue.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const ready = useMemo(
    () => Boolean(selectedFileId && action && designation),
    [selectedFileId, action, designation],
  );

  const openActionModal = (fileId) => {
    setSelectedFileId(fileId);
    setAction("approve");
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
      await submitDirectorApproval({
        fileid: selectedFileId,
        action,
        designation,
        remarks,
        file,
      });
      notifications.show({
        color: "green",
        message: "Director action submitted.",
      });
      setOpened(false);
      await load();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to submit director action.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Dean Processed Queue</Title>
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
                    >
                      Approve / Reject
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed">
                    No dean-processed requests available.
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
        title="Director Decision"
        centered
      >
        <form onSubmit={submit}>
          <Stack>
            <Select
              label="Action"
              data={actionOptions}
              value={action}
              onChange={(value) => setAction(value || "approve")}
              required
            />
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
                Submit
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>
    </Paper>
  );
}

export default DeanDirectorQueueView;
