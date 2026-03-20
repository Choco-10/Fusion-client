import { Badge, Paper, ScrollArea, Table, Text, Title } from "@mantine/core";
import PropTypes from "prop-types";

function statusBadgeColor(status) {
  if (status === 1) return "green";
  if (status === -1) return "red";
  return "yellow";
}

function CreatedRequestsTable({ requests }) {
  const rows = requests.map((request) => (
    <Table.Tr key={request.request_id}>
      <Table.Td>{request.request_id}</Table.Td>
      <Table.Td>{request.name}</Table.Td>
      <Table.Td>{request.area}</Table.Td>
      <Table.Td>{request.requestCreatedBy}</Table.Td>
      <Table.Td>
        <Badge
          color={statusBadgeColor(request.directorApproval)}
          variant="light"
        >
          {request.directorApproval === 1
            ? "Approved"
            : request.directorApproval === -1
              ? "Rejected"
              : "Pending"}
        </Badge>
      </Table.Td>
      <Table.Td>{request.file_id || "-"}</Table.Td>
    </Table.Tr>
  ));

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Title order={4} mb="md">
        Created Requests
      </Title>
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
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed">
                    No requests found for your current role.
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

CreatedRequestsTable.propTypes = {
  requests: PropTypes.arrayOf(
    PropTypes.shape({
      request_id: PropTypes.number,
      name: PropTypes.string,
      area: PropTypes.string,
      requestCreatedBy: PropTypes.string,
      directorApproval: PropTypes.number,
      file_id: PropTypes.number,
    }),
  ).isRequired,
};

export default CreatedRequestsTable;
