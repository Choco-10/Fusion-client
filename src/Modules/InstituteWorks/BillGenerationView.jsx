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
import { getIssuedWork, markBillGenerated } from "./api";

function BillGenerationView() {
  const role = useSelector((state) => state.user.role);
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getIssuedWork(role);
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch issued work list.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [role]);

  const handleGenerate = async (id) => {
    setWorkingId(id);
    try {
      await markBillGenerated(id);
      notifications.show({
        color: "green",
        message: `Bill marked generated for request #${id}.`,
      });
      await load();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to mark bill generated.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Bill Generation Queue</Title>
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
                      <Badge
                        color={completed ? "green" : "yellow"}
                        variant="light"
                      >
                        {completed ? "Completed" : "Pending"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        onClick={() => handleGenerate(item.request_id)}
                        loading={workingId === item.request_id}
                        disabled={!completed}
                      >
                        Mark Bill Generated
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

export default BillGenerationView;
