import {
  ActionIcon,
  Button,
  FileInput,
  Group,
  Modal,
  NumberInput,
  Paper,
  Select,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import { Trash } from "@phosphor-icons/react";
import PropTypes from "prop-types";

function ProposalItemsModal({
  opened,
  onClose,
  onSubmit,
  title,
  submitLabel,
  designationOptions,
  designation,
  setDesignation,
  supportingDocument = null,
  setSupportingDocument,
  items,
  updateItem,
  addItem,
  removeItem,
  totalBudget,
  isSaving,
  isReady,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title={title} size="xl" centered>
      <form onSubmit={onSubmit}>
        <Stack>
          <Select
            label="Forward To"
            data={designationOptions}
            value={designation}
            onChange={(value) => setDesignation(value || "")}
            searchable
            required
          />

          <FileInput
            label="Supporting Document"
            value={supportingDocument}
            onChange={setSupportingDocument}
            clearable
          />

          {items.map((item, index) => (
            <Paper key={`${index + 1}-item`} withBorder p="sm" radius="md">
              <Group grow align="end" wrap="wrap">
                <TextInput
                  label="Item Name"
                  value={item.name}
                  onChange={(event) => updateItem(index, "name", event.currentTarget.value)}
                  required
                />
                <TextInput
                  label="Unit"
                  value={item.unit}
                  onChange={(event) => updateItem(index, "unit", event.currentTarget.value)}
                  required
                />
                <NumberInput
                  label="Quantity"
                  min={0}
                  value={item.quantity}
                  onChange={(value) => updateItem(index, "quantity", value)}
                  required
                />
                <NumberInput
                  label="Price / Unit"
                  min={0}
                  value={item.price_per_unit}
                  onChange={(value) => updateItem(index, "price_per_unit", value)}
                  required
                />
              </Group>

              <Group mt="sm" align="end">
                <TextInput
                  style={{ flex: 1 }}
                  label="Description"
                  value={item.description}
                  onChange={(event) =>
                    updateItem(index, "description", event.currentTarget.value)
                  }
                />
                <FileInput
                  style={{ flex: 1 }}
                  label="Item Document"
                  value={item.docs}
                  onChange={(value) => updateItem(index, "docs", value)}
                  clearable
                />
                <ActionIcon
                  variant="light"
                  color="red"
                  onClick={() => removeItem(index)}
                  disabled={items.length === 1}
                >
                  <Trash size={16} />
                </ActionIcon>
              </Group>
            </Paper>
          ))}

          <Group justify="space-between">
            <Button variant="default" onClick={addItem}>
              Add Item
            </Button>
            <Text fw={600}>Estimated Total: {totalBudget.toFixed(2)}</Text>
          </Group>

          <Group justify="flex-end">
            <Button type="submit" loading={isSaving} disabled={!isReady}>
              {submitLabel}
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

ProposalItemsModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  submitLabel: PropTypes.string.isRequired,
  designationOptions: PropTypes.arrayOf(PropTypes.object).isRequired,
  designation: PropTypes.string.isRequired,
  setDesignation: PropTypes.func.isRequired,
  supportingDocument: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.oneOf([null])]),
  setSupportingDocument: PropTypes.func.isRequired,
  items: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateItem: PropTypes.func.isRequired,
  addItem: PropTypes.func.isRequired,
  removeItem: PropTypes.func.isRequired,
  totalBudget: PropTypes.number.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default ProposalItemsModal;
