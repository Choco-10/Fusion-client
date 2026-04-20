import { Button, Group, NumberInput, Paper, TextInput, Title } from "@mantine/core";
import PropTypes from "prop-types";

function BudgetEditForm({
  editingId = null,
  editName,
  setEditName,
  editBudgetValue,
  setEditBudgetValue,
  onSave,
  onCancel,
  canEdit,
}) {
  if (!editingId) return null;

  return (
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
        <Button onClick={onSave} disabled={!canEdit}>
          Save
        </Button>
        <Button variant="default" onClick={onCancel}>
          Cancel
        </Button>
      </Group>
    </Paper>
  );
}

BudgetEditForm.propTypes = {
  editingId: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.oneOf([null])]),
  editName: PropTypes.string.isRequired,
  setEditName: PropTypes.func.isRequired,
  editBudgetValue: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setEditBudgetValue: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
  onCancel: PropTypes.func.isRequired,
  canEdit: PropTypes.bool.isRequired,
};

export default BudgetEditForm;
