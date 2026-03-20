import { useState } from "react";
import {
  Button,
  FileInput,
  Group,
  Paper,
  Select,
  Stack,
  TextInput,
  Textarea,
  Title,
} from "@mantine/core";
import PropTypes from "prop-types";

function RequestForm({ designationOptions, isSubmitting, onSubmit }) {
  const [name, setName] = useState("");
  const [area, setArea] = useState("");
  const [description, setDescription] = useState("");
  const [designation, setDesignation] = useState("");
  const [file, setFile] = useState(null);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!name || !area || !description || !designation) return;

    await onSubmit({
      name,
      area,
      description,
      designation,
      file,
    });

    setName("");
    setArea("");
    setDescription("");
    setDesignation("");
    setFile(null);
  };

  return (
    <Paper withBorder p="md" radius="md" bg="white">
      <Title order={4} mb="md">
        New IWD Request
      </Title>
      <form onSubmit={handleSubmit}>
        <Stack>
          <TextInput
            label="Request Title"
            placeholder="Electrical repair in workshop"
            value={name}
            onChange={(event) => setName(event.currentTarget.value)}
            required
          />

          <TextInput
            label="Area"
            placeholder="Mechanical Lab Block"
            value={area}
            onChange={(event) => setArea(event.currentTarget.value)}
            required
          />

          <Textarea
            label="Description"
            placeholder="Describe the issue and urgency"
            minRows={4}
            value={description}
            onChange={(event) => setDescription(event.currentTarget.value)}
            required
          />

          <Select
            label="Forward To"
            placeholder="Select a designation"
            data={designationOptions}
            value={designation}
            onChange={(value) => setDesignation(value || "")}
            searchable
            required
          />

          <FileInput
            label="Attachment"
            placeholder="Optional supporting file"
            value={file}
            onChange={setFile}
            clearable
          />

          <Group justify="flex-end">
            <Button type="submit" loading={isSubmitting}>
              Create Request
            </Button>
          </Group>
        </Stack>
      </form>
    </Paper>
  );
}

RequestForm.propTypes = {
  designationOptions: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      value: PropTypes.string.isRequired,
    }),
  ).isRequired,
  isSubmitting: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
};

export default RequestForm;
