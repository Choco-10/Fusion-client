import { Button, Group, Modal, Stack, Text, TextInput } from "@mantine/core";
import PropTypes from "prop-types";

function VendorFormModal({
  opened,
  onClose,
  onSubmit,
  requestId,
  workId,
  newVendor,
  setNewVendor,
  isSaving,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Add Vendor" centered>
      <form onSubmit={onSubmit}>
        <Stack>
          <Text size="sm" c="dimmed">
            Request #{requestId || "-"} | Work Order #{workId || "-"}
          </Text>
          <TextInput
            label="Vendor Name"
            value={newVendor.name}
            onChange={(e) =>
              setNewVendor((v) => ({ ...v, name: e.currentTarget.value }))
            }
            required
          />
          <TextInput
            label="Contact Number"
            value={newVendor.contact_number}
            onChange={(e) =>
              setNewVendor((v) => ({ ...v, contact_number: e.currentTarget.value }))
            }
          />
          <TextInput
            label="Email Address"
            type="email"
            value={newVendor.email_address}
            onChange={(e) =>
              setNewVendor((v) => ({ ...v, email_address: e.currentTarget.value }))
            }
          />
          <Group justify="flex-end">
            <Button type="submit" loading={isSaving} disabled={!newVendor.name || !workId}>
              Add
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

VendorFormModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  requestId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  workId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  newVendor: PropTypes.shape({
    name: PropTypes.string,
    contact_number: PropTypes.string,
    email_address: PropTypes.string,
  }).isRequired,
  setNewVendor: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
};

export default VendorFormModal;
