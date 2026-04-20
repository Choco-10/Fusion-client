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

function DirectorApprovedTable({ requests, isLoading, onRefresh, onIssue }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Director Approved Requests</Title>
        <Button variant="light" onClick={onRefresh} loading={isLoading}>
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
              <Table.Th>Budget</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Next Approver</Table.Th>
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
                    {readField(item, "estimated_budget", "estimatedBudget") != null
                      ? `Rs ${currencyFormatter.format(Number(readField(item, "estimated_budget", "estimatedBudget")))}`
                      : "-"}
                  </Table.Td>
                  <Table.Td>{readField(item, "is_priority", "isPriority") ? "Priority" : "Normal"}</Table.Td>
                  <Table.Td>{readField(item, "next_approver", "nextApprover") || "-"}</Table.Td>
                  <Table.Td>
                    <Button size="xs" onClick={() => onIssue(item)}>
                      Issue Work Order
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text ta="center" c="dimmed">
                    No requests are currently approved by director.
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

DirectorApprovedTable.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      area: PropTypes.string,
      requestCreatedBy: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onIssue: PropTypes.func.isRequired,
};

export default DirectorApprovedTable;
