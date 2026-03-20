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
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
  getBillPdfUrl,
  getDesignations,
  getGeneratedBills,
  processBill,
} from "./api";

function BillProcessingView() {
  const [rows, setRows] = useState([]);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [opened, setOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [vendorId, setVendorId] = useState("");

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
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch generated bills.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const ready = useMemo(
    () => Boolean(selectedFileId && designation && attachment),
    [selectedFileId, designation, attachment],
  );

  const openProcess = (fileId) => {
    setSelectedFileId(fileId);
    setDesignation("");
    setRemarks("");
    setAttachment(null);
    setVendorId("");
    setOpened(true);
  };

  const submit = async (event) => {
    event.preventDefault();
    if (!ready) return;

    setIsSaving(true);
    try {
      await processBill({
        fileid: selectedFileId,
        designation,
        remarks,
        attachment,
        vendor_id: vendorId.trim(),
      });
      notifications.show({
        color: "green",
        message: "Bill processed successfully.",
      });
      setOpened(false);
      await load();
    } catch {
      notifications.show({ color: "red", message: "Unable to process bill." });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Generated Bills</Title>
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
              <Table.Th>Bill PDF</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((item) => (
                <Table.Tr key={item.file_id}>
                  <Table.Td>{item.id}</Table.Td>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{item.area}</Table.Td>
                  <Table.Td>
                    <a
                      href={getBillPdfUrl(item.id)}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Download PDF
                    </a>
                  </Table.Td>
                  <Table.Td>
                    <Button size="xs" onClick={() => openProcess(item.file_id)}>
                      Process Bill
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed">
                    No generated bills available.
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
        title="Process Bill"
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
            <TextInput
              label="Vendor ID (Optional)"
              value={vendorId}
              onChange={(event) => setVendorId(event.currentTarget.value)}
              placeholder="e.g. 12"
            />
            <Textarea
              label="Remarks"
              value={remarks}
              onChange={(event) => setRemarks(event.currentTarget.value)}
              minRows={3}
            />
            <FileInput
              label="Bill Attachment"
              value={attachment}
              onChange={setAttachment}
              required
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

export default BillProcessingView;
