import { Flex } from "@mantine/core";
import PropTypes from "prop-types";
import CustomBreadcrumbs from "../../../components/Breadcrumbs";
import ModuleTabs from "../../../components/moduleTabs";

function InstituteWorksShell({ tabs, activeTab, setActiveTab, children }) {
  return (
    <>
      <CustomBreadcrumbs />
      <Flex justify="space-between" align="center" mt="lg">
        <ModuleTabs
          tabs={tabs}
          activeTab={activeTab}
          setActiveTab={setActiveTab}
        />
      </Flex>
      {children}
    </>
  );
}

InstituteWorksShell.propTypes = {
  tabs: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
    }),
  ).isRequired,
  activeTab: PropTypes.string.isRequired,
  setActiveTab: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
};

export default InstituteWorksShell;
