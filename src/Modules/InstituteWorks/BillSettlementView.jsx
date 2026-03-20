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
import { getSettleBills, settleBill } from "./api";

function BillSettlementView() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [workingId, setWorkingId] = useState(null);

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getSettleBills();
      setRows(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch bills for settlement.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSettle = async (id) => {
    setWorkingId(id);
    try {
      await settleBill(id);
      notifications.show({
        color: "green",
        message: `Bill settled for request #${id}.`,
      });
      await load();
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to settle this bill.",
      });
    } finally {
      setWorkingId(null);
    }
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Settle Bills</Title>
        <Button variant="light" onClick={load} loading={isLoading}>
          Refresh
        </Button>
      </Group>

      <ScrollArea>
        <Table striped highlightOnHover>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Request ID</Table.Th>
              <Table.Th>Bill</Table.Th>
              <Table.Th>Status</Table.Th>
              <Table.Th>Action</Table.Th>
            </Table.Tr>
          </Table.Thead>
          <Table.Tbody>
            {rows.length > 0 ? (
              rows.map((item) => {
                const settled = Boolean(item.billSettled);
                return (
                  <Table.Tr key={item.requestId}>
                    <Table.Td>{item.requestId}</Table.Td>
                    <Table.Td>
                      {item.fileUrl ? (
                        <a href={item.fileUrl} target="_blank" rel="noreferrer">
                          Open Bill
                        </a>
                      ) : (
                        "-"
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Badge
                        color={settled ? "green" : "yellow"}
                        variant="light"
                      >
                        {settled ? "Settled" : "Pending"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        disabled={settled}
                        loading={workingId === item.requestId}
                        onClick={() => handleSettle(item.requestId)}
                      >
                        {settled ? "Done" : "Settle"}
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                );
              })
            ) : (
              <Table.Tr>
                <Table.Td colSpan={4}>
                  <Text ta="center" c="dimmed">
                    No bills available for settlement.
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

export default BillSettlementView;
