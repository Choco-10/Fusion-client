import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import BudgetAddForm from "./components/BudgetAddForm";
import BudgetListTable from "./components/BudgetListTable";
import BudgetEditForm from "./components/BudgetEditForm";
import SectionStack from "./components/SectionStack";
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
    <SectionStack>
      <BudgetAddForm
        newName={newName}
        setNewName={setNewName}
        newBudget={newBudget}
        setNewBudget={setNewBudget}
        onSubmit={submitNewBudget}
        isSaving={isSavingNew}
        canCreate={canCreate}
      />
      <BudgetListTable
        rows={rows}
        isLoading={isLoading}
        onRefresh={load}
        onEdit={startEdit}
      />
      <BudgetEditForm
        editingId={editingId}
        editName={editName}
        setEditName={setEditName}
        editBudgetValue={editBudgetValue}
        setEditBudgetValue={setEditBudgetValue}
        onSave={submitEdit}
        onCancel={() => setEditingId(null)}
        canEdit={canEdit}
      />
    </SectionStack>
  );
}

export default BudgetManagementView;
