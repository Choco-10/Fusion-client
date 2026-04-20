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

function BillGenerationTable({ rows, isLoading, workingId = null, onRefresh, onGenerate }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <div>
          <Title order={4}>Bill Generation Queue</Title>
          <Text size="sm" c="dimmed">
            Enter the actual bill items used on site, then generate the bill for Accounts.
          </Text>
        </div>
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
              <Table.Th>Work Completed</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((item) => {
                const completed = Boolean(item.work_completed);
                return (
                  <Table.Tr key={item.request_id}>
                    <Table.Td>{item.request_id}</Table.Td>
                    <Table.Td>{item.name}</Table.Td>
                    <Table.Td>{item.area}</Table.Td>
                    <Table.Td>
                      <Badge color={completed ? "green" : "yellow"} variant="light">
                        {completed ? "Completed" : "Pending"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        onClick={() => onGenerate(item.request_id)}
                        loading={workingId === item.request_id}
                        disabled={!completed}
                      >
                        Add Bill Details
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed">
                    No issued work records found.
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

BillGenerationTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool.isRequired,
  workingId: PropTypes.oneOfType([PropTypes.number, PropTypes.string, PropTypes.oneOf([null])]),
  onRefresh: PropTypes.func.isRequired,
  onGenerate: PropTypes.func.isRequired,
};

export default BillGenerationTable;
