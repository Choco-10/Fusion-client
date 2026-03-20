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
import { getRequestsInProgress } from "./api";

function RequestsInProgressView() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getRequestsInProgress();
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch requests in progress.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Requests In Progress</Title>
        <Button variant="light" onClick={load} loading={isLoading}>
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
                      <Badge color="blue" variant="light">
                        Issued
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={isCompleted ? "green" : "yellow"}
                        variant="light"
                      >
                        {isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
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

export default RequestsInProgressView;
