import { Stack } from "@mantine/core";
import PropTypes from "prop-types";

function SectionStack({ children }) {
  return <Stack>{children}</Stack>;
}

SectionStack.propTypes = {
  children: PropTypes.node.isRequired,
};

export default SectionStack;
