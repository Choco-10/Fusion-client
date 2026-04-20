import {
  Button,
  Group,
  Paper,
  ScrollArea,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from "@mantine/core";
import PropTypes from "prop-types";

function VendorManagementContent({
  issuedWorks,
  isLoading,
  selectedRequestId,
  onSelectRequest,
  vendors,
  isFetchingVendors,
  workId = null,
  onOpenAddVendor,
  onRefresh,
}) {
  const requestOptions = issuedWorks.map((w) => ({
    value: String(w.request_id),
    label: `#${w.request_id} - ${w.name}`,
  }));

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Group justify="space-between" mb="md">
        <Title order={4}>Vendor Management</Title>
        <Button variant="light" onClick={onRefresh} loading={isLoading}>
          Refresh
        </Button>
      </Group>

      <Stack gap="md">
        <Select
          label="Select Work Order (by Request)"
          placeholder="Choose a request"
          data={requestOptions}
          value={selectedRequestId || null}
          onChange={(value) => onSelectRequest(value || "")}
          searchable
          clearable
        />

        {selectedRequestId && (
          <>
            <Group justify="space-between">
              <Title order={6}>Vendors for Request #{selectedRequestId}</Title>
              <Button size="xs" onClick={onOpenAddVendor} disabled={!workId}>
                Add Vendor
              </Button>
            </Group>

            <ScrollArea>
              <Table striped highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Vendor ID</Table.Th>
                    <Table.Th>Name</Table.Th>
                    <Table.Th>Contact Number</Table.Th>
                    <Table.Th>Email</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {isFetchingVendors ? (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text ta="center" c="dimmed">
                          Loading...
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  ) : vendors.length > 0 ? (
                    vendors.map((vendor) => (
                      <Table.Tr key={vendor.vendor_id}>
                        <Table.Td>{vendor.vendor_id}</Table.Td>
                        <Table.Td>{vendor.name}</Table.Td>
                        <Table.Td>{vendor.contact_number || "-"}</Table.Td>
                        <Table.Td>{vendor.email_address || "-"}</Table.Td>
                      </Table.Tr>
                    ))
                  ) : (
                    <Table.Tr>
                      <Table.Td colSpan={4}>
                        <Text ta="center" c="dimmed">
                          No vendors added yet for this work order.
                        </Text>
                      </Table.Td>
                    </Table.Tr>
                  )}
                </Table.Tbody>
              </Table>
            </ScrollArea>
          </>
        )}
      </Stack>
    </Paper>
  );
}

VendorManagementContent.propTypes = {
  issuedWorks: PropTypes.arrayOf(
    PropTypes.shape({
      request_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
    }),
  ).isRequired,
  isLoading: PropTypes.bool.isRequired,
  selectedRequestId: PropTypes.string.isRequired,
  onSelectRequest: PropTypes.func.isRequired,
  vendors: PropTypes.arrayOf(
    PropTypes.shape({
      vendor_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
      name: PropTypes.string,
      contact_number: PropTypes.string,
      email_address: PropTypes.string,
    }),
  ).isRequired,
  isFetchingVendors: PropTypes.bool.isRequired,
  workId: PropTypes.oneOfType([PropTypes.string, PropTypes.number, PropTypes.oneOf([null])]),
  onOpenAddVendor: PropTypes.func.isRequired,
  onRefresh: PropTypes.func.isRequired,
};

export default VendorManagementContent;
