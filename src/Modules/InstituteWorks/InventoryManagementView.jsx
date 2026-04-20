import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  Button,
  Container,
  Dialog,
  Grid,
  Group,
  Loader,
  NumberInput,
  Paper,
  ScrollArea,
  Table,
  TextInput,
  Title,
  Badge,
  Modal,
  Stack,
  Text,
  Center,
  Select,
} from "@mantine/core";
import { getInventoryItems, getInventoryTransactions, issueMaterials, receiveMaterials, getApiErrorMessage } from "./api";

function InventoryManagementView() {
  const [items, setItems] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [lowStockFilter, setLowStockFilter] = useState("");

  // Issue Material Modal
  const [issueModalOpen, setIssueModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);
  const [issueQuantity, setIssueQuantity] = useState(1);
  const [issueRemarks, setIssueRemarks] = useState("");
  const [isIssuing, setIsIssuing] = useState(false);

  // Receive Material Modal
  const [receiveModalOpen, setReceiveModalOpen] = useState(false);
  const [receiveQuantity, setReceiveQuantity] = useState(1);
  const [receiveRemarks, setReceiveRemarks] = useState("");
  const [isReceiving, setIsReceiving] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const filters = {};
      if (searchQuery) filters.name = searchQuery;
      if (lowStockFilter) filters.is_low_stock = lowStockFilter === "true";

      const [result, transactionResult] = await Promise.all([
        getInventoryItems(currentPage, 20, filters),
        getInventoryTransactions(1, 10),
      ]);
      setItems(result.items || []);
      setTransactions(transactionResult.items || []);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to load inventory items."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, [currentPage, searchQuery, lowStockFilter]);

  const handleIssueMaterial = async () => {
    if (!selectedItem || issueQuantity <= 0) {
      notifications.show({
        color: "yellow",
        message: "Please select item and quantity.",
      });
      return;
    }

    setIsIssuing(true);
    try {
      await issueMaterials(selectedItem.id, issueQuantity, null, issueRemarks);
      notifications.show({
        color: "green",
        message: `Successfully issued ${issueQuantity} ${selectedItem.unit} of ${selectedItem.name}`,
      });
      setIssueModalOpen(false);
      setSelectedItem(null);
      setIssueQuantity(1);
      setIssueRemarks("");
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Failed to issue material."),
      });
    } finally {
      setIsIssuing(false);
    }
  };

  const handleReceiveMaterial = async () => {
    if (!selectedItem || receiveQuantity <= 0) {
      notifications.show({
        color: "yellow",
        message: "Please select item and quantity.",
      });
      return;
    }

    setIsReceiving(true);
    try {
      await receiveMaterials(selectedItem.id, receiveQuantity, receiveRemarks);
      notifications.show({
        color: "green",
        message: `Successfully received ${receiveQuantity} ${selectedItem.unit} of ${selectedItem.name}`,
      });
      setReceiveModalOpen(false);
      setSelectedItem(null);
      setReceiveQuantity(1);
      setReceiveRemarks("");
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Failed to receive material."),
      });
    } finally {
      setIsReceiving(false);
    }
  };

  if (isLoading && items.length === 0) {
    return (
      <Center p="xl" style={{ minHeight: "400px" }}>
        <Loader />
      </Center>
    );
  }

  return (
    <Container size="lg" py="xl">
      <Group mb="xl" justify="space-between">
        <Title order={2}>Inventory Management</Title>
        <Button onClick={load} loading={isLoading} size="sm" variant="light">
          Refresh
        </Button>
      </Group>

      {/* Filters */}
      <Paper p="md" radius="md" withBorder mb="xl">
        <Group grow>
          <TextInput
            placeholder="Search by item name..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.currentTarget.value);
              setCurrentPage(1);
            }}
            rightSection={searchQuery ? "✕" : null}
          />
          <Select
            placeholder="Filter by stock status"
            data={[
              { label: "All Items", value: "" },
              { label: "In Stock", value: "false" },
              { label: "Low Stock", value: "true" },
            ]}
            value={lowStockFilter}
            onChange={(val) => {
              setLowStockFilter(val || "");
              setCurrentPage(1);
            }}
            clearable
          />
        </Group>
      </Paper>

      {/* Items Table */}
      <Paper radius="md" withBorder>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Item Name</Table.Th>
                <Table.Th>Description</Table.Th>
                <Table.Th>Unit</Table.Th>
                <Table.Th>Available</Table.Th>
                <Table.Th>Reorder Level</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Actions</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} ta="center" py="xl">
                    <Text c="gray">No inventory items found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                items.map((item) => (
                  <Table.Tr
                    key={item.id}
                    style={{
                      backgroundColor: item.is_low_stock ? "#ffe0e0" : undefined,
                    }}
                  >
                    <Table.Td fw={500}>{item.name}</Table.Td>
                    <Table.Td size="sm">{item.description || "-"}</Table.Td>
                    <Table.Td>{item.unit}</Table.Td>
                    <Table.Td fw={500}>{item.quantity_available}</Table.Td>
                    <Table.Td>{item.reorder_level}</Table.Td>
                    <Table.Td>
                      {item.is_low_stock ? (
                        <Badge color="red" variant="filled">
                          LOW STOCK
                        </Badge>
                      ) : item.needs_procurement ? (
                        <Badge color="orange" variant="filled">
                          NO STOCK
                        </Badge>
                      ) : (
                        <Badge color="green" variant="light">
                          OK
                        </Badge>
                      )}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <Button
                          size="xs"
                          variant="light"
                          color="blue"
                          onClick={() => {
                            setSelectedItem(item);
                            setIssueQuantity(1);
                            setIssueRemarks("");
                            setIssueModalOpen(true);
                          }}
                        >
                          Issue
                        </Button>
                        <Button
                          size="xs"
                          variant="light"
                          color="green"
                          onClick={() => {
                            setSelectedItem(item);
                            setReceiveQuantity(1);
                            setReceiveRemarks("");
                            setReceiveModalOpen(true);
                          }}
                        >
                          Receive
                        </Button>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      <Paper radius="md" withBorder mt="xl">
        <Group justify="space-between" p="md">
          <Text fw={700}>Recent Inventory Transactions</Text>
          <Text size="sm" c="dimmed">
            Latest issue and receipt activity
          </Text>
        </Group>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Timestamp</Table.Th>
                <Table.Th>Item</Table.Th>
                <Table.Th>Type</Table.Th>
                <Table.Th>Qty</Table.Th>
                <Table.Th>Request</Table.Th>
                <Table.Th>By</Table.Th>
                <Table.Th>Remarks</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {transactions.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={7} ta="center" py="xl">
                    <Text c="gray">No recent inventory transactions.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                transactions.map((transaction) => {
                  const typeColor =
                    transaction.transaction_type === "issue"
                      ? "red"
                      : transaction.transaction_type === "receipt"
                        ? "green"
                        : "blue";
                  const timestamp = transaction.timestamp
                    ? new Date(transaction.timestamp).toLocaleString()
                    : "-";

                  return (
                    <Table.Tr key={transaction.id}>
                      <Table.Td>{timestamp}</Table.Td>
                      <Table.Td>{transaction.item_name || transaction.item}</Table.Td>
                      <Table.Td>
                        <Badge color={typeColor} variant="light">
                          {transaction.transaction_type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>{transaction.quantity}</Table.Td>
                      <Table.Td>{transaction.request || "-"}</Table.Td>
                      <Table.Td>{transaction.performed_by}</Table.Td>
                      <Table.Td>{transaction.remarks || "-"}</Table.Td>
                    </Table.Tr>
                  );
                })
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Issue Material Modal */}
      <Modal
        opened={issueModalOpen}
        onClose={() => {
          setIssueModalOpen(false);
          setSelectedItem(null);
        }}
        title={`Issue Material: ${selectedItem?.name || ""}`}
      >
        <Stack gap="md">
          {selectedItem && (
            <>
              <div>
                <Text size="sm" c="gray">
                  Available: {selectedItem.quantity_available} {selectedItem.unit}
                </Text>
              </div>
              <NumberInput
                label="Quantity to Issue"
                placeholder="Enter quantity"
                value={issueQuantity}
                onChange={(val) => setIssueQuantity(val || 1)}
                min={1}
                max={selectedItem.quantity_available}
              />
              <TextInput
                label="Remarks"
                placeholder="Optional notes..."
                value={issueRemarks}
                onChange={(e) => setIssueRemarks(e.currentTarget.value)}
              />
              <Group>
                <Button
                  onClick={handleIssueMaterial}
                  loading={isIssuing}
                  color="blue"
                >
                  Issue Material
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setIssueModalOpen(false);
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>

      {/* Receive Material Modal */}
      <Modal
        opened={receiveModalOpen}
        onClose={() => {
          setReceiveModalOpen(false);
          setSelectedItem(null);
        }}
        title={`Receive Material: ${selectedItem?.name || ""}`}
      >
        <Stack gap="md">
          {selectedItem && (
            <>
              <div>
                <Text size="sm" c="gray">
                  Unit: {selectedItem.unit}
                </Text>
              </div>
              <NumberInput
                label="Quantity to Receive"
                placeholder="Enter quantity"
                value={receiveQuantity}
                onChange={(val) => setReceiveQuantity(val || 1)}
                min={1}
              />
              <TextInput
                label="Remarks"
                placeholder="Optional notes..."
                value={receiveRemarks}
                onChange={(e) => setReceiveRemarks(e.currentTarget.value)}
              />
              <Group>
                <Button
                  onClick={handleReceiveMaterial}
                  loading={isReceiving}
                  color="green"
                >
                  Receive Material
                </Button>
                <Button
                  variant="default"
                  onClick={() => {
                    setReceiveModalOpen(false);
                    setSelectedItem(null);
                  }}
                >
                  Cancel
                </Button>
              </Group>
            </>
          )}
        </Stack>
      </Modal>
    </Container>
  );
}

export default InventoryManagementView;
