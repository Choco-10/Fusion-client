import {
  Badge,
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

function RequestsInProgressTable({ rows, isLoading, onRefresh }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Requests In Progress</Title>
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
              <Table.Th>Work Order</Table.Th>
              <Table.Th>Work Status</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((item) => {
                const isCompleted = Boolean(item.workCompleted);
                return (
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
                    <Table.Td>
                      <Badge color="blue" variant="light">
                        Issued
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={isCompleted ? "green" : "yellow"} variant="light">
                        {isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={8}>
                  <Text ta="center" c="dimmed">
                    No requests in progress.
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

RequestsInProgressTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default RequestsInProgressTable;
