import {
  Button,
  Divider,
  Group,
  Modal,
  Stack,
  Text,
  TextInput,
} from "@mantine/core";
import PropTypes from "prop-types";

function BillGenerationModal({
  opened,
  onClose,
  onSubmit,
  requestId,
  vendorId,
  setVendorId,
  billItems,
  updateBillItem,
  addBillItem,
  removeBillItem,
  billTotal,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Add Actual Bill Details" centered size="lg">
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput label="Request ID" value={String(requestId || "")} readOnly />
          <TextInput
            label="Vendor ID (Optional)"
            value={vendorId}
            onChange={(event) => setVendorId(event.currentTarget.value)}
            placeholder="e.g. 12"
          />
          <Divider label="Actual Bill Items" labelPosition="center" />
          <Text size="sm" c="dimmed">
            Enter the items actually used for this work order. These are saved with the bill and
            used for the final PDF.
          </Text>
          <Stack gap="sm">
            {billItems.map((item, index) => (
              <Stack
                key={`${index}-${item.name || "item"}`}
                gap="xs"
                p="xs"
                style={{ border: "1px solid var(--mantine-color-gray-3)", borderRadius: 8 }}
              >
                <Group align="flex-end" grow>
                  <TextInput
                    label={`Item ${index + 1}`}
                    placeholder="Item name"
                    value={item.name}
                    onChange={(event) => updateBillItem(index, "name", event.currentTarget.value)}
                    required
                  />
                  <TextInput
                    label="Description"
                    placeholder="Actual bill description"
                    value={item.description}
                    onChange={(event) => updateBillItem(index, "description", event.currentTarget.value)}
                  />
                </Group>
                <Group align="flex-end" grow>
                  <TextInput
                    label="Quantity"
                    type="number"
                    min="1"
                    value={item.quantity}
                    onChange={(event) => updateBillItem(index, "quantity", event.currentTarget.value)}
                    required
                  />
                  <TextInput
                    label="Rate"
                    type="number"
                    min="0"
                    step="0.01"
                    value={item.price}
                    onChange={(event) => updateBillItem(index, "price", event.currentTarget.value)}
                    required
                  />
                  <Button
                    type="button"
                    variant="light"
                    color="red"
                    onClick={() => removeBillItem(index)}
                    disabled={billItems.length === 1}
                  >
                    Remove
                  </Button>
                </Group>
              </Stack>
            ))}
          </Stack>
          <Group justify="space-between">
            <Button type="button" variant="light" onClick={addBillItem}>
              Add Item
            </Button>
            <Text fw={600}>Bill Total: {billTotal.toFixed(2)}</Text>
          </Group>
          <Group justify="flex-end">
            <Button type="submit">Generate Bill</Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

BillGenerationModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  requestId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  vendorId: PropTypes.string.isRequired,
  setVendorId: PropTypes.func.isRequired,
  billItems: PropTypes.arrayOf(PropTypes.object).isRequired,
  updateBillItem: PropTypes.func.isRequired,
  addBillItem: PropTypes.func.isRequired,
  removeBillItem: PropTypes.func.isRequired,
  billTotal: PropTypes.number.isRequired,
};

export default BillGenerationModal;