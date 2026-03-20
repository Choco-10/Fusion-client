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
import { getWorkUnderProgress, markWorkCompleted } from "./api";

function WorkProgressView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getWorkUnderProgress(role);
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch work-under-progress records.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const completeWork = async (id) => {
    setWorkingId(id);
    try {
      await markWorkCompleted(id);
      notifications.show({
        color: "green",
        message: `Work marked completed for request #${id}.`,
      });
      await load();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to mark work as completed.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Work Under Progress</Title>
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
              <Table.Th>Created By</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
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
                      <Badge
                        color={isCompleted ? "green" : "yellow"}
                        variant="light"
                      >
                        {isCompleted ? "Completed" : "In Progress"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant={isCompleted ? "default" : "filled"}
                        disabled={isCompleted}
                        loading={workingId === item.id}
                        onClick={() => completeWork(item.id)}
                      >
                        {isCompleted ? "Done" : "Mark Completed"}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={6}>
                  <Text ta="center" c="dimmed">
                    No work items found.
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

export default WorkProgressView;
