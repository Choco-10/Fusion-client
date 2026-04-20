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

function ProposalRequestsTable({ rows, isLoading, onRefresh, onCreate }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Proposal Builder</Title>
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
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((row) => (
                <Table.Tr key={row.request_id}>
                  <Table.Td>{row.request_id}</Table.Td>
                  <Table.Td>{row.name}</Table.Td>
                  <Table.Td>{row.area}</Table.Td>
                  <Table.Td>{row.status}</Table.Td>
                  <Table.Td>
                    <Button size="xs" onClick={() => onCreate(row)}>
                      Create Proposal
                    </Button>
                  </Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={5}>
                  <Text ta="center" c="dimmed">
                    No requests are waiting for an engineer proposal.
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

ProposalRequestsTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onCreate: PropTypes.func.isRequired,
};

export default ProposalRequestsTable;
