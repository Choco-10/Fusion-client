import {
  Button,
  FileInput,
  Group,
  Modal,
  Select,
  Stack,
  Textarea,
} from "@mantine/core";
import PropTypes from "prop-types";

const actionOptions = [
  { value: "approve", label: "Approve" },
  { value: "reject", label: "Reject" },
];

function DeanDirectorActionModal({
  opened,
  onClose,
  onSubmit,
  action,
  setAction,
  remarks,
  setRemarks,
  file = null,
  setFile,
  isSaving,
  isReady,
}) {
  return (
    <Modal opened={opened} onClose={onClose} title="Director Decision" centered>
      <form onSubmit={onSubmit}>
        <Stack>
          <Select
            label="Action"
            data={actionOptions}
            value={action}
            onChange={(value) => setAction(value || "approve")}
            required
          />
          <Textarea
            label="Remarks"
            value={remarks}
            onChange={(event) => setRemarks(event.currentTarget.value)}
            minRows={3}
          />
          <FileInput label="Attachment" value={file} onChange={setFile} clearable />
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

DeanDirectorActionModal.propTypes = {
  opened: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  action: PropTypes.string.isRequired,
  setAction: PropTypes.func.isRequired,
  remarks: PropTypes.string.isRequired,
  setRemarks: PropTypes.func.isRequired,
  file: PropTypes.oneOfType([PropTypes.instanceOf(File), PropTypes.oneOf([null])]),
  setFile: PropTypes.func.isRequired,
  isSaving: PropTypes.bool.isRequired,
  isReady: PropTypes.bool.isRequired,
};

export default DeanDirectorActionModal;
