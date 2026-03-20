import { useEffect, useMemo, useState } from "react";
import {
  Badge,
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
  forwardRequest,
  getCreatedRequests,
  getDesignations,
  getViewFile,
} from "./api";

function statusBadgeColor(val) {
  if (val === 1) return "green";
  if (val === -1) return "red";
  return "yellow";
}

function CreatedRequestsView() {
  const role = useSelector((state) => state.user.role);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [designationOptions, setDesignationOptions] = useState([]);

  // Forward modal state
  const [forwardOpened, setForwardOpened] = useState(false);
  const [selectedFileId, setSelectedFileId] = useState(null);
  const [designation, setDesignation] = useState("");
  const [remarks, setRemarks] = useState("");
  const [attachment, setAttachment] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  // View tracking modal state
  const [trackingOpened, setTrackingOpened] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const [data, designationsData] = await Promise.all([
        getCreatedRequests(role),
        getDesignations(),
      ]);
      setRequests(data);
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
        message: "Unable to fetch created IWD requests.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!role) return;
    loadRequests();
  }, [role]);

  const forwardReady = useMemo(
    () => Boolean(selectedFileId && designation),
    [selectedFileId, designation],
  );

  const openForwardModal = (fileId) => {
    setSelectedFileId(fileId);
    setDesignation("");
    setRemarks("");
    setAttachment(null);
    setForwardOpened(true);
  };

  const submitForward = async (event) => {
    event.preventDefault();
    if (!forwardReady) return;
    setIsSaving(true);
    try {
      await forwardRequest({
        fileid: selectedFileId,
        designation,
        remarks,
        file: attachment,
      });
      notifications.show({
        color: "green",
        message: "Request forwarded successfully.",
      });
      setForwardOpened(false);
      await loadRequests();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to forward request.",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const openTrackingModal = async (fileId) => {
    setFileData(null);
    setTracks([]);
    setTrackingOpened(true);
    setIsTrackingLoading(true);
    try {
      const data = await getViewFile(fileId);
      setFileData(data.file || null);
      setTracks(data.tracks || []);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch file tracking data.",
      });
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Created Requests</Title>
        <Button variant="light" onClick={loadRequests} loading={isLoading}>
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
              <Table.Th>Director Approval</Table.Th>
              <Table.Th>File ID</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {requests.length > 0 ? (
              requests.map((req) => (
                <Table.Tr key={req.request_id}>
                  <Table.Td>{req.request_id}</Table.Td>
                  <Table.Td>{req.name}</Table.Td>
                  <Table.Td>{req.area}</Table.Td>
                  <Table.Td>{req.requestCreatedBy}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={statusBadgeColor(req.directorApproval)}
                      variant="light"
                    >
                      {req.directorApproval === 1
                        ? "Approved"
                        : req.directorApproval === -1
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{req.file_id || "-"}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" wrap="nowrap">
                      <Button
                        size="xs"
                        variant="light"
                        onClick={() => openForwardModal(req.file_id)}
                        disabled={!req.file_id}
                      >
                        Forward
                      </Button>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => openTrackingModal(req.file_id)}
                        disabled={!req.file_id}
                      >
                        Tracking
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={7}>
                  <Text ta="center" c="dimmed">
                    No requests found for your current role.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>

      {/* Forward Modal */}
      <Modal
        opened={forwardOpened}
        onClose={() => setForwardOpened(false)}
        title="Forward Request"
        centered
      >
        <form onSubmit={submitForward}>
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
              <Button type="submit" loading={isSaving} disabled={!forwardReady}>
                Forward
              </Button>
            </Group>
          </Stack>
        </form>
      </Modal>

      {/* File Tracking Modal */}
      <Modal
        opened={trackingOpened}
        onClose={() => setTrackingOpened(false)}
        title="File Tracking History"
        size="xl"
        centered
      >
        {isTrackingLoading ? (
          <Text ta="center" c="dimmed" py="md">
            Loading…
          </Text>
        ) : (
          <Stack gap="sm">
            {fileData && (
              <Paper withBorder p="sm" radius="md">
                <Text size="sm">
                  <strong>File ID:</strong> {fileData.id}
                </Text>
                <Text size="sm">
                  <strong>Module:</strong> {fileData.src_module}
                </Text>
                <Text size="sm">
                  <strong>Uploader:</strong> {fileData.uploader} (
                  {fileData.uploader_designation})
                </Text>
              </Paper>
            )}
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>#</Table.Th>
                  <Table.Th>From</Table.Th>
                  <Table.Th>To</Table.Th>
                  <Table.Th>Designation</Table.Th>
                  <Table.Th>Remarks</Table.Th>
                  <Table.Th>Date</Table.Th>
                  <Table.Th>Read</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {tracks.length > 0 ? (
                  tracks.map((track, idx) => (
                    <Table.Tr key={track.id}>
                      <Table.Td>{idx + 1}</Table.Td>
                      <Table.Td>{track.current_id}</Table.Td>
                      <Table.Td>{track.receiver_id}</Table.Td>
                      <Table.Td>{track.receiver_designation}</Table.Td>
                      <Table.Td>{track.remarks || "—"}</Table.Td>
                      <Table.Td>{track.forward_date || "—"}</Table.Td>
                      <Table.Td>
                        <Badge
                          color={track.is_read ? "green" : "yellow"}
                          variant="light"
                        >
                          {track.is_read ? "Read" : "Unread"}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))
                ) : (
                  <Table.Tr>
                    <Table.Td colSpan={7}>
                      <Text ta="center" c="dimmed">
                        No tracking records.
                      </Text>
                    </Table.Td>
                  </Table.Tr>
                )}
              </Table.Tbody>
            </Table>
          </Stack>
        )}
      </Modal>
    </Paper>
  );
}

export default CreatedRequestsView;
