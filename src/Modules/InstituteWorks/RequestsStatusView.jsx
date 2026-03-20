import { useEffect, useState } from "react";
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
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import { getRequestsStatus } from "./api";

function approvalBadgeColor(value) {
  if (value === 1) return "green";
  if (value === -1) return "red";
  return "yellow";
}

function RequestsStatusView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getRequestsStatus(role);
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch request status list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>IWD Request Status</Title>
        <Button variant="light" onClick={load} loading={isLoading}>
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
              <Table.Th>IWD Admin</Table.Th>
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
                <Table.Td colSpan={8}>
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

export default RequestsStatusView;
