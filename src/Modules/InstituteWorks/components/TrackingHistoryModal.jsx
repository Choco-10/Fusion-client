import { Badge, Modal, Paper, Stack, Table, Text } from "@mantine/core";
import PropTypes from "prop-types";

function TrackingHistoryModal({ opened, onClose, isLoading, fileData = null, tracks }) {
  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="File Tracking History"
      size="xl"
      centered
    >
      {isLoading ? (
        <Text ta="center" c="dimmed" py="md">
          Loading...
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
                    <Table.Td>{track.remarks || "-"}</Table.Td>
                    <Table.Td>{track.forward_date || "-"}</Table.Td>
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
  );
}

TrackingHistoryModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  isLoading: PropTypes.bool.isRequired,
  fileData: PropTypes.shape({
    id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    src_module: PropTypes.string,
    uploader: PropTypes.string,
    uploader_designation: PropTypes.string,
  }),
  tracks: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      current_id: PropTypes.string,
      receiver_id: PropTypes.string,
      receiver_designation: PropTypes.string,
      remarks: PropTypes.string,
      forward_date: PropTypes.string,
      is_read: PropTypes.bool,
    }),
  ).isRequired,
};

export default TrackingHistoryModal;
