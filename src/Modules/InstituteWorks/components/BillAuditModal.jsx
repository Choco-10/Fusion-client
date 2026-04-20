import {
  Button,
  FileInput,
  Group,
  Modal,
  Stack,
  Text,
  Textarea,
  Table,
  Divider,
} from "@mantine/core";
import PropTypes from "prop-types";

function BillAuditModal({
  opened,
  onClose,
  onSubmit,
  selectedBill,
  remarks,
  setRemarks,
  attachment = null,
  setAttachment,
  isSaving,
  isReady,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Audit Bill" centered>
      <form onSubmit={onSubmit}>
        <Stack>
          <Text size="sm" c="dimmed">
            Request #{selectedBill?.request_id || "-"} | {selectedBill?.request_name || "-"}
          </Text>
          <Text size="sm" c="dimmed">
            Vendor: {selectedBill?.vendor_name || "-"} | Total: {Number(selectedBill?.bill_total || 0).toFixed(2)} | Items: {selectedBill?.bill_item_count ?? 0}
          </Text>
          <Text size="sm" c="dimmed">
            This review forwards the bill to Accounts Admin automatically.
          </Text>
          <Divider label="Bill Items" labelPosition="center" />
          <Table striped highlightOnHover withTableBorder withColumnBorders>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Rate</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {(selectedBill?.bill_items || []).length > 0 ? (
                selectedBill.bill_items.map((item, index) => (
                  <Table.Tr key={`${item.name || "item"}-${index}`}>
                    <Table.Td>{item.name || "-"}</Table.Td>
                    <Table.Td>{item.description || "-"}</Table.Td>
                    <Table.Td>{item.quantity ?? 0}</Table.Td>
                    <Table.Td>{Number(item.price || 0).toFixed(2)}</Table.Td>
                  </Table.Tr>
                ))
              ) : (
                <Table.Tr>
                  <Table.Td colSpan={4}>
                    <Text ta="center" c="dimmed">
                      No bill items found.
                    </Text>
                  </Table.Td>
                </Table.Tr>
              )}
            </Table.Tbody>
          </Table>
          <Textarea
            label="Remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.currentTarget.value)}
            minRows={3}
          />
          <FileInput
            label="Attachment"
            value={attachment}
            onChange={setAttachment}
            clearable
          />
          <Group justify="flex-end">
            <Button type="submit" loading={isSaving} disabled={!isReady}>
              Submit
            </Button>
          </Group>
        </Stack>
      </form>
    </Modal>
  );
}

BillAuditModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  selectedBill: PropTypes.oneOfType([PropTypes.object, PropTypes.oneOf([null])]),
  remarks: PropTypes.string.isRequired,
  setRemarks: PropTypes.func.isRequired,
  attachment: PropTypes.oneOfType([
    PropTypes.instanceOf(File),
    PropTypes.oneOf([null]),
  ]),
  setAttachment: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default BillAuditModal;
