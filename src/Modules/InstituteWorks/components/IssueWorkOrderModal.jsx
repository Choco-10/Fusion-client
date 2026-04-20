import { Button, Group, Modal, Stack, TextInput } from "@mantine/core";
import { DateInput } from "@mantine/dates";
import PropTypes from "prop-types";

function startOfToday() {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return now;
}

function IssueWorkOrderModal({ opened, onClose, onSubmit, form, setForm, isSaving, isReady }) {
  const minStartDate = startOfToday();

  return (
    <Modal opened={opened} onClose={onClose} title="Issue Work Order" centered>
      <form onSubmit={onSubmit}>
        <Stack>
          <TextInput label="Request ID" value={String(form.request_id || "")} readOnly />
          <TextInput
            label="Agency / Work Name"
            value={form.name}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                name: event.currentTarget.value,
              }))
            }
            required
          />
          <TextInput
            label="Allotted Time"
            placeholder="e.g. 45 days"
            value={form.alloted_time}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                alloted_time: event.currentTarget.value,
              }))
            }
            required
          />
          <DateInput
            label="Start Date"
            value={form.start_date}
            onChange={(value) => setForm((prev) => ({ ...prev, start_date: value }))}
            valueFormat="YYYY-MM-DD"
            minDate={minStartDate}
            required
          />
          <DateInput
            label="Expected Completion Date"
            value={form.completion_date}
            onChange={(value) =>
              setForm((prev) => {
                if (value && prev.start_date) {
                  const start = new Date(prev.start_date);
                  const end = new Date(value);
                  start.setHours(0, 0, 0, 0);
                  end.setHours(0, 0, 0, 0);
                  if (end < start) {
                    return prev;
                  }
                }
                return { ...prev, completion_date: value };
              })
            }
            valueFormat="YYYY-MM-DD"
            minDate={form.start_date || minStartDate}
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

IssueWorkOrderModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  form: PropTypes.shape({
    request_id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    name: PropTypes.string,
    alloted_time: PropTypes.string,
    start_date: PropTypes.instanceOf(Date),
    completion_date: PropTypes.instanceOf(Date),
  }).isRequired,
  setForm: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default IssueWorkOrderModal;
