import { Button, Group, NumberInput, Paper, TextInput, Title } from "@mantine/core";
import PropTypes from "prop-types";

function BudgetAddForm({
  newName,
  setNewName,
  newBudget,
  setNewBudget,
  onSubmit,
  isSaving,
  canCreate,
}) {
  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Title order={4} mb="md">
        Add Budget
      </Title>
      <form onSubmit={onSubmit}>
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
          <Button type="submit" loading={isSaving} disabled={!canCreate}>
            Add
          </Button>
        </Group>
      </form>
    </Paper>
  );
}

BudgetAddForm.propTypes = {
  newName: PropTypes.string.isRequired,
  setNewName: PropTypes.func.isRequired,
  newBudget: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  setNewBudget: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  canCreate: PropTypes.bool.isRequired,
};

export default BudgetAddForm;
