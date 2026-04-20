import { useEffect, useState } from "react";
import { notifications } from "@mantine/notifications";
import {
  Button,
  Container,
  Grid,
  Group,
  Loader,
  Paper,
  Rating,
  Select,
  Stack,
  Text,
  Textarea,
  Title,
  Center,
  Badge,
  ScrollArea,
  Table,
} from "@mantine/core";
import { getRequestsStatus, submitFeedback, reopenRequest, getFeedbackHistory, getApiErrorMessage } from "./api";

function FeedbackView() {
  const [completedRequests, setCompletedRequests] = useState([]);
  const [feedbackHistory, setFeedbackHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedRequestId, setSelectedRequestId] = useState("");
  const [rating, setRating] = useState(0);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reopen modal state
  const [selectedReopenRequestId, setSelectedReopenRequestId] = useState("");
  const [reopenReason, setReopenReason] = useState("");
  const [isReopening, setIsReopening] = useState(false);

  const load = async () => {
    setIsLoading(true);
    try {
      const [data, feedbackResult] = await Promise.all([
        getRequestsStatus(""),
        getFeedbackHistory(1, 10),
      ]);
      // Filter for completed/settled requests
      const completed = (data || []).filter(
        (req) =>
          req.work_completed === 1 ||
          req.bill_settled === 1 ||
          req.status === "Final Bill Settled" ||
          req.status === "Resolved"
      );
      setCompletedRequests(completed);
      setFeedbackHistory(feedbackResult.items || []);
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Unable to load completed requests."),
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleSubmitFeedback = async () => {
    if (!selectedRequestId || rating === 0) {
      notifications.show({
        color: "yellow",
        message: "Please select a request and provide a rating.",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      await submitFeedback(parseInt(selectedRequestId), rating, comments);
      notifications.show({
        color: "green",
        message: "Feedback submitted successfully!",
      });
      setSelectedRequestId("");
      setRating(0);
      setComments("");
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Failed to submit feedback."),
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReopenRequest = async () => {
    if (!selectedReopenRequestId) {
      notifications.show({
        color: "yellow",
        message: "Please select a request to reopen.",
      });
      return;
    }

    setIsReopening(true);
    try {
      await reopenRequest(parseInt(selectedReopenRequestId), reopenReason);
      notifications.show({
        color: "green",
        message: "Request reopened successfully. It will be re-worked.",
      });
      setSelectedReopenRequestId("");
      setReopenReason("");
      load();
    } catch (error) {
      notifications.show({
        color: "red",
        message: getApiErrorMessage(error, "Failed to reopen request."),
      });
    } finally {
      setIsReopening(false);
    }
  };

  if (isLoading && completedRequests.length === 0) {
    return (
      <Center p="xl" style={{ minHeight: "400px" }}>
        <Loader />
      </Center>
    );
  }

  const requestOptions = completedRequests.map((req) => ({
    value: req.id?.toString() || "",
    label: `Request #${req.id} - ${req.name} (${req.area})`,
  }));

  return (
    <Container size="lg" py="xl">
      <Title order={2} mb="xl">
        Feedback & Case Management
      </Title>

      <Grid>
        {/* Feedback Submission */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="lg">
              Submit Feedback
            </Title>
            <Stack gap="md">
              <div>
                <Text size="sm" fw={500} mb="xs">
                  Select Completed Request
                </Text>
                <Select
                  placeholder="Choose a request..."
                  data={requestOptions}
                  value={selectedRequestId}
                  onChange={(val) => setSelectedRequestId(val || "")}
                  searchable
                />
              </div>

              <div>
                <Text size="sm" fw={500} mb="xs">
                  Rate Your Experience
                </Text>
                <Text size="xs" c="dimmed" mb="xs">
                  Select 1 to 5 stars.
                </Text>
                <Group gap="md">
                  <Rating
                    value={rating}
                    onChange={setRating}
                    size="lg"
                    fractions={1}
                    count={5}
                    color="yellow"
                  />
                  <div>
                    {rating > 0 && (
                      <Badge color={rating >= 4 ? "green" : rating >= 3 ? "yellow" : "red"}>
                        {rating === 5
                          ? "Excellent"
                          : rating === 4
                          ? "Good"
                          : rating === 3
                          ? "Average"
                          : rating === 2
                          ? "Below Average"
                          : "Poor"}
                      </Badge>
                    )}
                  </div>
                </Group>
              </div>

              {selectedRequestId ? (
                <>
                  <Textarea
                    label="Additional Comments"
                    placeholder="Tell us about your experience..."
                    value={comments}
                    onChange={(e) => setComments(e.currentTarget.value)}
                    minRows={3}
                  />

                  <Button
                    onClick={handleSubmitFeedback}
                    loading={isSubmitting}
                    fullWidth
                  >
                    Submit Feedback
                  </Button>

                  {rating <= 2 && (
                    <Paper p="sm" bg="orange.1" radius="sm" withBorder>
                      <Text size="sm" c="orange.9">
                        ⚠️ Low rating noted. You can reopen this case if issues need further work.
                      </Text>
                    </Paper>
                  )}
                </>
              ) : (
                <Text size="sm" c="dimmed">
                  Choose a completed request to enable comments and submission.
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>

        {/* Case Reopening */}
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Paper p="md" radius="md" withBorder>
            <Title order={4} mb="lg">
              Reopen Case
            </Title>
            <Stack gap="md">
              <Text size="sm" c="gray">
                Reopen a completed request if issues are found that require additional work.
              </Text>

              <div>
                <Text size="sm" fw={500} mb="xs">
                  Select Request to Reopen
                </Text>
                <Select
                  placeholder="Choose a request..."
                  data={requestOptions}
                  value={selectedReopenRequestId}
                  onChange={(val) => setSelectedReopenRequestId(val || "")}
                  searchable
                />
              </div>

              {selectedReopenRequestId && (
                <>
                  <Textarea
                    label="Reason for Reopening"
                    placeholder="Describe the issues that need attention..."
                    value={reopenReason}
                    onChange={(e) => setReopenReason(e.currentTarget.value)}
                    minRows={3}
                  />

                  <Paper p="md" bg="red.1" radius="sm" withBorder>
                    <Text size="sm" c="red.9">
                      ⚠️ Reopening will revert the request to work-in-progress state. The engineer will need to re-do the work and resubmit bills.
                    </Text>
                  </Paper>

                  <Button
                    onClick={handleReopenRequest}
                    loading={isReopening}
                    color="red"
                    fullWidth
                  >
                    Reopen Request
                  </Button>
                </>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>

      <Paper p="md" radius="md" withBorder mt="xl">
        <Group justify="space-between" mb="md">
          <Title order={4}>Recent Feedback</Title>
          <Text size="sm" c="dimmed">
            Latest submitted ratings and reopen flags
          </Text>
        </Group>
        <ScrollArea>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Created At</Table.Th>
                <Table.Th>Request</Table.Th>
                <Table.Th>Rating</Table.Th>
                <Table.Th>Reopened</Table.Th>
                <Table.Th>Comments</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {feedbackHistory.length === 0 ? (
                <Table.Tr>
                  <Table.Td colSpan={5} ta="center" py="xl">
                    <Text c="gray">No feedback records found.</Text>
                  </Table.Td>
                </Table.Tr>
              ) : (
                feedbackHistory.map((feedback) => (
                  <Table.Tr key={feedback.id}>
                    <Table.Td>
                      {feedback.created_at ? new Date(feedback.created_at).toLocaleString() : "-"}
                    </Table.Td>
                    <Table.Td>#{feedback.request}</Table.Td>
                    <Table.Td>
                      <Stack gap={4}>
                        <Badge color={feedback.rating >= 4 ? "green" : feedback.rating >= 3 ? "yellow" : "red"} variant="light">
                          {feedback.rating}/5
                        </Badge>
                        <Rating value={Number(feedback.rating || 0)} readOnly size="sm" fractions={1} color="yellow" />
                      </Stack>
                    </Table.Td>
                    <Table.Td>
                      <Badge color={feedback.reopened ? "orange" : "gray"} variant="light">
                        {feedback.reopened ? "Yes" : "No"}
                      </Badge>
                    </Table.Td>
                    <Table.Td>{feedback.comments || "-"}</Table.Td>
                  </Table.Tr>
                ))
              )}
            </Table.Tbody>
          </Table>
        </ScrollArea>
      </Paper>

      {/* Instructions */}
      <Paper p="md" radius="md" withBorder mt="xl" bg="blue.0">
        <Title order={5} mb="sm">
          ℹ️ How to Use
        </Title>
        <Stack gap="xs" size="sm">
          <Text>
            <strong>Feedback:</strong> After your request is completed and billed, please rate your experience and provide comments to help us improve.
          </Text>
          <Text>
            <strong>Reopen:</strong> If you encounter post-repair issues, reopen the case immediately so the team can address it.
          </Text>
          <Text>
            <strong>Rating Guide:</strong> 1=Poor, 2=Below Average, 3=Average, 4=Good, 5=Excellent
          </Text>
        </Stack>
      </Paper>
    </Container>
  );
}

export default FeedbackView;
