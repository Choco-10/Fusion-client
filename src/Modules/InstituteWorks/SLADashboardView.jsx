import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import { Container, Grid, Paper, Text, Title, Badge, Table, ScrollArea, Loader, Center, Button, Group } from "@mantine/core";
import { getSLADashboard, getSLAEscalations, getApiErrorMessage } from "./api";

function SLADashboardView() {
  const [dashboardData, setDashboardData] = useState(null);
  const [escalations, setEscalations] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [data, escalationResult] = await Promise.all([
        getSLADashboard(),
        getSLAEscalations(1, 10),
      ]);
      setDashboardData(data);
      setEscalations(escalationResult.items || []);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to fetch SLA dashboard."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Auto-refresh every 5 minutes
    const timer = setInterval(load, 5 * 60 * 1000);
    return () => clearInterval(timer);
  }, []);

  if (isLoading && !dashboardData) {
    return (
      <Center p="xl" style={{ minHeight: "400px" }}>
        <Loader />
      </Center>
    );
  }

  const {
    total_active = 0,
    pending_count = 0,
    due_soon_count = 0,
    overdue_count = 0,
    overdue_requests = [],
    escalation_count = 0,
    priority_count = 0,
  } = dashboardData || {};

  // Determine metric colors
  const getMetricColor = (count, threshold = 5) => {
    if (count === 0) return "blue";
    if (count > threshold) return "red";
    if (count > threshold / 2) return "yellow";
    return "green";
  };

  return (
    <Container size="lg" py="xl">
      <Group mb="xl" justify="space-between">
        <Title order={2}>SLA Monitoring Dashboard</Title>
        <Button onClick={load} loading={isLoading} size="sm" variant="light">
          Refresh
        </Button>
      </Group>

      {/* Key Metrics */}
      <Grid mb="xl">
        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" radius="md" withBorder>
            <Text size="sm" c="gray" mb="xs">
              Total Active
            </Text>
            <Text size="xl" fw={700}>
              {total_active}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" radius="md" withBorder>
            <Text size="sm" c="gray" mb="xs">
              On Track
            </Text>
            <Text size="xl" fw={700} c="green">
              {pending_count}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" radius="md" withBorder style={{ borderLeft: "4px solid #fab005" }}>
            <Text size="sm" c="gray" mb="xs">
              Due Soon
            </Text>
            <Text size="xl" fw={700} c="orange">
              {due_soon_count}
            </Text>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 3 }}>
          <Paper p="md" radius="md" withBorder style={{ borderLeft: "4px solid #fa5252" }}>
            <Text size="sm" c="gray" mb="xs">
              Overdue
            </Text>
            <Text size="xl" fw={700} c="red">
              {overdue_count}
            </Text>
          </Paper>
        </Grid.Col>
      </Grid>

      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Text fw={700} mb="md">
              Escalations & Priority
            </Text>
            <Group grow>
              <div>
                <Text size="sm" c="gray">
                  Active Escalations
                </Text>
                <Badge
                  color={getMetricColor(escalation_count)}
                  size="lg"
                  variant="filled"
                >
                  {escalation_count}
                </Badge>
              </div>
              <div>
                <Text size="sm" c="gray">
                  Priority Requests
                </Text>
                <Badge color={getMetricColor(priority_count)} size="lg" variant="filled">
                  {priority_count}
                </Badge>
              </div>
            </Group>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Text fw={700} mb="md">
              SLA Compliance
            </Text>
            <Group grow>
              <div>
                <Text size="sm" c="gray">
                  Compliance Rate
                </Text>
                <Text size="lg" fw={700}>
                  {total_active > 0
                    ? ((pending_count / total_active) * 100).toFixed(1)
                    : 100}
                  %
                </Text>
              </div>
            </Group>
          </Paper>
        </Grid.Col>
      </Grid>

      {/* Overdue Requests Table */}
      {overdue_requests && overdue_requests.length > 0 ? (
        <Paper p="md" radius="md" withBorder mt="xl">
          <Title order={4} mb="md">
            Overdue Requests
            <Badge color="red" ml="xs" variant="filled">
              {overdue_requests.length}
            </Badge>
          </Title>
          <ScrollArea>
            <Table striped highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Request ID</Table.Th>
                  <Table.Th>Request Name</Table.Th>
                  <Table.Th>Approver Level</Table.Th>
                  <Table.Th>Days Overdue</Table.Th>
                  <Table.Th>Status</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {overdue_requests.map((req, idx) => (
                  <Table.Tr key={idx} style={{ backgroundColor: "#ffe0e0" }}>
                    <Table.Td fw={500}>#{req.request_id}</Table.Td>
                    <Table.Td>{req.request_name}</Table.Td>
                    <Table.Td>{req.approver_level}</Table.Td>
                    <Table.Td>
                      <Badge color="red" variant="filled">
                        {req.days_overdue > 0 ? `+${req.days_overdue}` : "0"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>
                      {req.is_priority ? (
                        <Badge color="orange" variant="filled">
                          PRIORITY
                        </Badge>
                      ) : (
                        <Badge color="gray" variant="light">
                          Normal
                        </Badge>
                      )}
                    </Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </ScrollArea>
        </Paper>
      ) : (
        <Paper p="md" radius="md" withBorder mt="xl">
          <Text c="green" fw={500} ta="center">
            ✓ No overdue requests - All SLAs are being met!
          </Text>
        </Paper>
      )}

      <Paper p="md" radius="md" withBorder mt="xl">
        <Group justify="space-between" mb="md">
          <Title order={4}>Recent SLA Escalations</Title>
          <Text size="sm" c="dimmed">
            Latest overdue and redirected requests
          </Text>
        </Group>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Request</Table.Th>
                <Table.Th>From</Table.Th>
                <Table.Th>To</Table.Th>
                <Table.Th>Reason</Table.Th>
                <Table.Th>Resolved</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {escalations.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center" py="xl">
                    <Text c="gray">No escalation records found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                escalations.map((escalation) => (
                  <Table.Tr key={escalation.id}>
                    <Table.Td>#{escalation.request}</Table.Td>
                    <Table.Td>{escalation.escalated_from}</Table.Td>
                    <Table.Td>{escalation.escalated_to}</Table.Td>
                    <Table.Td>{escalation.reason}</Table.Td>
                    <Table.Td>
                      <Badge color={escalation.resolved ? "green" : "red"} variant="light">
                        {escalation.resolved ? "Resolved" : "Open"}
                      </Badge>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>
    </Container>
  );
}

export default SLADashboardView;
