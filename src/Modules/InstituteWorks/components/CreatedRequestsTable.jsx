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

function statusBadgeColor(status) {
  if (status === 1) return "green";
  if (status === -1) return "red";
  return "yellow";
}

const currencyFormatter = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
});

function readField(item, snakeKey, camelKey) {
  return item?.[snakeKey] ?? item?.[camelKey] ?? null;
}

function formatDeadline(item) {
  const approver = (readField(item, "next_approver", "nextApprover") || "").toLowerCase();
  const deadline =
    approver.includes("director")
      ? readField(item, "director_approval_deadline", "directorApprovalDeadline")
      : approver.includes("hod")
        ? readField(item, "hod_approval_deadline", "hodApprovalDeadline")
        : readField(item, "iwd_admin_approval_deadline", "iwdAdminApprovalDeadline");

  if (!deadline) return "-";
  const date = new Date(deadline);
  return Number.isNaN(date.getTime()) ? String(deadline) : date.toLocaleString();
}

function CreatedRequestsTable({
  requests,
  isLoading,
  onRefresh,
  onTracking,
}) {
  const rows = requests.map((request) => {
    const hasProposal = readField(request, "estimated_budget", "estimatedBudget") != null;

    return (
      <Table.Tr key={request.request_id}>
        <Table.Td>{request.request_id}</Table.Td>
        <Table.Td>{request.name}</Table.Td>
        <Table.Td>{request.area}</Table.Td>
        <Table.Td>{request.requestCreatedBy}</Table.Td>
        <Table.Td>
          {hasProposal
            ? `Rs ${currencyFormatter.format(Number(readField(request, "estimated_budget", "estimatedBudget")))}`
            : "-"}
        </Table.Td>
        <Table.Td>{readField(request, "is_priority", "isPriority") ? "Priority" : "Normal"}</Table.Td>
        <Table.Td>{readField(request, "next_approver", "nextApprover") || "-"}</Table.Td>
        <Table.Td>{formatDeadline(request)}</Table.Td>
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
        <Table.Td>
          <Group gap="xs" wrap="nowrap">
            <Button
              size="xs"
              variant="subtle"
              onClick={() => onTracking(request.file_id)}
              disabled={!request.file_id}
            >
              Tracking
            </Button>
          </Group>
        </Table.Td>
      </Table.Tr>
    );
  });

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Created Requests</Title>
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
                <Table.Th>SLA Deadline</Table.Th>
              <Table.Th>Director Approval</Table.Th>
              <Table.Th>File ID</Table.Th>
              <Table.Th>Actions</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows
            ) : (
              <Table.Tr>
                <Table.Td colSpan={11}>
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
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
  onTracking: PropTypes.func.isRequired,
};

export default CreatedRequestsTable;
