import { useEffect, useMemo, useState } from "react";
import {
  Button,
  Group,
  NumberInput,
  Paper,
  ScrollArea,
  Stack,
  Table,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { addBudget, editBudget, getBudgets } from "./api";

function BudgetManagementView() {
  const [rows, setRows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSavingNew, setIsSavingNew] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [newName, setNewName] = useState("");
  const [newBudget, setNewBudget] = useState(0);

  const [editName, setEditName] = useState("");
  const [editBudgetValue, setEditBudgetValue] = useState(0);

  const canCreate = useMemo(
    () => Boolean(newName && Number(newBudget) > 0),
    [newName, newBudget],
  );
  const canEdit = useMemo(
    () => Boolean(editingId && editName && Number(editBudgetValue) >= 0),
    [editingId, editName, editBudgetValue],
  );

  const load = async () => {
    setIsLoading(true);
    try {
      const data = await getBudgets();
      setRows(data);
    } catch {
      notifications.show({ color: "red", message: "Unable to fetch budgets." });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const submitNewBudget = async (event) => {
    event.preventDefault();
    if (!canCreate) return;

    setIsSavingNew(true);
    try {
      await addBudget({ name: newName.trim(), budget: Number(newBudget) });
      notifications.show({
        color: "green",
        message: "Budget added successfully.",
      });
      setNewName("");
      setNewBudget(0);
      await load();
    } catch {
      notifications.show({ color: "red", message: "Unable to add budget." });
    } finally {
      setIsSavingNew(false);
    }
  };

  const startEdit = (row) => {
    setEditingId(row.id);
    setEditName(row.name || "");
    setEditBudgetValue(Number(row.budgetIssued || 0));
  };

  const submitEdit = async () => {
    if (!canEdit) return;
    try {
      await editBudget({
        id: editingId,
        name: editName.trim(),
        budget: Number(editBudgetValue),
      });
      notifications.show({
        color: "green",
        message: "Budget updated successfully.",
      });
      setEditingId(null);
      setEditName("");
      setEditBudgetValue(0);
      await load();
    } catch {
      notifications.show({ color: "red", message: "Unable to update budget." });
    }
  };

  return (
    <Stack>
      <Paper withBorder p="md" radius="md" bg="white">
        <Title order={4} mb="md">
          Add Budget
        </Title>
        <form onSubmit={submitNewBudget}>
          <Group align="end">
            <TextInput
              label="Budget Head"
              value={newName}
              onChange={(event) => setNewName(event.currentTarget.value)}
              placeholder="Maintenance FY 2026"
              required
            />
            <NumberInput
              label="Amount"
              value={newBudget}
              onChange={setNewBudget}
              min={0}
              thousandSeparator=","
              required
            />
            <Button type="submit" loading={isSavingNew} disabled={!canCreate}>
              Add
            </Button>
          </Group>
        </form>
      </Paper>

      <Paper withBorder p="md" radius="md" bg="white">
        <Group justify="space-between" mb="md">
          <Title order={4}>Budget List</Title>
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
                <Table.Th>Budget Issued</Table.Th>
                <Table.Th>Action</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {rows.length > 0 ? (
                rows.map((row) => (
                  <Table.Tr key={row.id}>
                    <Table.Td>{row.id}</Table.Td>
                    <Table.Td>{row.name}</Table.Td>
                    <Table.Td>{row.budgetIssued}</Table.Td>
                    <Table.Td>
                      <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => startEdit(row)}
                      >
                        Edit
                      </Button>
                    </Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed">
                      No budgets available.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {editingId ? (
        <Paper withBorder p="md" radius="md" bg="white">
          <Title order={5} mb="md">
            Edit Budget #{editingId}
          </Title>
          <Group align="end">
            <TextInput
              label="Budget Head"
              value={editName}
              onChange={(event) => setEditName(event.currentTarget.value)}
              required
            />
            <NumberInput
              label="Amount"
              value={editBudgetValue}
              onChange={setEditBudgetValue}
              min={0}
              thousandSeparator=","
              required
            />
            <Button onClick={submitEdit} disabled={!canEdit}>
              Save
            </Button>
            <Button variant="default" onClick={() => setEditingId(null)}>
              Cancel
            </Button>
          </Group>
        </Paper>
      ) : null}
    </Stack>
  );
}

export default BudgetManagementView;
