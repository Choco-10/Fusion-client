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

function approvalBadgeColor(value) {
  if (value === 1) return "green";
  if (value === -1) return "red";
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

function RequestsStatusTable({ rows, isLoading, onRefresh }) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>IWD Request Status</Title>
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
              <Table.Th>Status</Table.Th>
              <Table.Th>Budget</Table.Th>
              <Table.Th>Priority</Table.Th>
              <Table.Th>Next Approver</Table.Th>
              <Table.Th>SLA Deadline</Table.Th>
              <Table.Th>IWD Admin</Table.Th>
              <Table.Th>Dean/HOD</Table.Th>
              <Table.Th>Director</Table.Th>
              <Table.Th>Work Order</Table.Th>
              <Table.Th>Completed</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((item) => (
                <Table.Tr key={item.request_id}>
                  <Table.Td>{item.request_id}</Table.Td>
                  <Table.Td>{item.name}</Table.Td>
                  <Table.Td>{item.area}</Table.Td>
                  <Table.Td>{item.status || "-"}</Table.Td>
                  <Table.Td>
                    {readField(item, "estimated_budget", "estimatedBudget") != null
                      ? `Rs ${currencyFormatter.format(Number(readField(item, "estimated_budget", "estimatedBudget")))}`
                      : "-"}
                  </Table.Td>
                  <Table.Td>
                    <Badge color={readField(item, "is_priority", "isPriority") ? "orange" : "gray"} variant="light">
                      {readField(item, "is_priority", "isPriority") ? "Priority" : "Normal"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{readField(item, "next_approver", "nextApprover") || "-"}</Table.Td>
                  <Table.Td>{formatDeadline(item)}</Table.Td>
                  <Table.Td>
                    <Badge
                      color={approvalBadgeColor(item.processed_by_admin)}
                      variant="light"
                    >
                      {item.processed_by_admin === 1
                        ? "Approved"
                        : item.processed_by_admin === -1
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={approvalBadgeColor(item.processed_by_dean)}
                      variant="light"
                    >
                      {item.processed_by_dean === 1
                        ? "Approved"
                        : item.processed_by_dean === -1
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>
                    <Badge
                      color={approvalBadgeColor(item.processed_by_director)}
                      variant="light"
                    >
                      {item.processed_by_director === 1
                        ? "Approved"
                        : item.processed_by_director === -1
                          ? "Rejected"
                          : "Pending"}
                    </Badge>
                  </Table.Td>
                  <Table.Td>{item.work_order ? "Yes" : "No"}</Table.Td>
                  <Table.Td>{item.work_completed ? "Yes" : "No"}</Table.Td>
                </Table.Tr>
              ))
            ) : (
              <Table.Tr>
                <Table.Td colSpan={13}>
                  <Text ta="center" c="dimmed">
                    No request status data found.
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

RequestsStatusTable.propTypes = {
  rows: PropTypes.arrayOf(PropTypes.object).isRequired,
  isLoading: PropTypes.bool.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default RequestsStatusTable;
