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

function BudgetListTable({ rows, isLoading, onRefresh, onEdit }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Budget List</Title>
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
              <Table.Th>Budget Issued</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <Table.Tr key={row.id}>
                  <Table.Td>{row.id}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>{row.budgetIssued}</Table.Td>
                  <Table.Td>
                    <Button size="xs" variant="subtle" onClick={() => onEdit(row)}>
                      Edit
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed">
                    No budgets available.
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

BudgetListTable.propTypes = {
  rows: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      budgetIssued: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onEdit: PropTypes.func.isRequired,
};

export default BudgetListTable;
