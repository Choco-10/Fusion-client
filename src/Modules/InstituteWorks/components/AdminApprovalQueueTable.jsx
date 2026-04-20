import {
  Button,
  Group,
  Paper,
  ScrollArea,
  Table,
  Text,
  Title,
} from "@mantine/core";
import PropTypes from "prop-types";

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function readField(item, snakeKey, camelKey) {
  return item?.[snakeKey] ?? item?.[camelKey] ?? null;
}

function AdminApprovalQueueTable({ rows, isLoading, onRefresh, onAction }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Engineer Processed Queue</Title>
        <Button variant="light" onClick={onRefresh} loading={isLoading}>
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
              <Table.Th>Budget</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Next Approver</Table.Th>
              <Table.Th>File ID</Table.Th>
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
                  <Table.Td>{item.requestCreatedBy}</Table.Td>
                  <Table.Td>
                    {readField(item, "estimated_budget", "estimatedBudget") != null
                      ? `Rs ${currencyFormatter.format(Number(readField(item, "estimated_budget", "estimatedBudget")))}`
                      : "-"}
                  </Table.Td>
                  <Table.Td>{readField(item, "is_priority", "isPriority") ? "Priority" : "Normal"}</Table.Td>
                  <Table.Td>{readField(item, "next_approver", "nextApprover") || "-"}</Table.Td>
                  <Table.Td>{item.file_id}</Table.Td>
                  <Table.Td>
                    <Button size="xs" onClick={() => onAction(item.file_id)}>
                      Approve / Reject
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={9}>
                  <Text ta="center" c="dimmed">
                    No requests are ready for admin approval yet.
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

AdminApprovalQueueTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      area: PropTypes.string,
      requestCreatedBy: PropTypes.string,
      file_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onAction: PropTypes.func.isRequired,
};

export default AdminApprovalQueueTable;
