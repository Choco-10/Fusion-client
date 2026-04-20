import {
  Button,
  Badge,
  Group,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import PropTypes from "prop-types";

function BillAuditTable({ rows, isLoading, onRefresh, onAudit }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Audit Documents</Title>
        <Button variant="light" onClick={onRefresh} loading={isLoading}>
          Refresh
        </Button>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Request ID</Table.Th>
              <Table.Th>Request Name</Table.Th>
              <Table.Th>Vendor</Table.Th>
              <Table.Th>Total</Table.Th>
              <Table.Th>Items</Table.Th>
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
                  <Table.Td>{item.request_name || "-"}</Table.Td>
                  <Table.Td>{item.vendor_name || "-"}</Table.Td>
                  <Table.Td>{Number(item.bill_total || 0).toFixed(2)}</Table.Td>
                  <Table.Td>{item.bill_item_count ?? 0}</Table.Td>
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
                    <Group gap="xs">
                      <Badge color={item.bill_audited ? "green" : "yellow"} variant="light">
                        {item.bill_audited ? "Audited" : "Pending"}
                      </Badge>
                      <Button size="xs" onClick={() => onAudit(item)}>
                        Review & Send to Accounts
                      </Button>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text ta="center" c="dimmed">
                    No bills pending for audit.
                  </Text>
                </Table.Td>
              </Table.Tr>
            )}
          </Table.Tbody>
        </Table>
      </ScrollArea>
    </Paper>
  );
}

BillAuditTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      request_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      request_name: PropTypes.string,
      vendor_name: PropTypes.string,
      bill_total: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      bill_item_count: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      bill_audited: PropTypes.bool,
      fileUrl: PropTypes.string,
      file_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onAudit: PropTypes.func.isRequired,
};

export default BillAuditTable;
