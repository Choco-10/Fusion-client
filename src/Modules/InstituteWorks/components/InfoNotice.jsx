import { Text } from "@mantine/core";
import PropTypes from "prop-types";

function InfoNotice({ message }) {
  return (
    <Text c="dimmed" mt="md">
      {message}
    </Text>
  );
}

InfoNotice.propTypes = {
  message: PropTypes.string.isRequired,
};

export default InfoNotice;
