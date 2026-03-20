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
import { getAuditDocuments, getDesignations, submitAuditDocument } from "./api";

function BillAuditView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const [auditRows, designationsData] = await Promise.all([
        getAuditDocuments(role),
        getDesignations(),
      ]);
      setRows(auditRows);

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
        message: "Unable to fetch audit documents.",
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

  const openAudit = (fileId) => {
    setSelectedFileId(fileId);
    setDesignation("");
    setRemarks("");
    setAttachment(null);
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await submitAuditDocument({
        fileid: selectedFileId,
        designation,
        remarks,
        attachment,
      });
      notifications.show({
        color: "green",
        message: "Bill audited and forwarded.",
      });
      setOpened(false);
      await load();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to audit and forward this bill.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Audit Documents</Title>
        <Button variant="light" onClick={load} loading={isLoading}>
          Refresh
        </Button>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Request ID</Table.Th>
              <Table.Th>Bill File</Table.Th>
              <Table.Th>File ID</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((item) => (
                <Table.Tr key={item.file_id}>
                  <Table.Td>{item.request_id}</Table.Td>
                  <Table.Td>
                    {item.fileUrl ? (
                      <a href={item.fileUrl} target="_blank" rel="noreferrer">
                        Open Bill
                      </a>
                    ) : (
                      "-"
                    )}
                  </Table.Td>
                  <Table.Td>{item.file_id}</Table.Td>
                  <Table.Td>
                    <Button size="xs" onClick={() => openAudit(item.file_id)}>
                      Audit & Forward
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed">
                    No bills pending for audit.
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
        title="Audit Bill"
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
              value={attachment}
              onChange={setAttachment}
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

export default BillAuditView;
