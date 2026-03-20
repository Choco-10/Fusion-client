import { useEffect, useMemo, useState } from "react";
import { Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import axios from "axios";
import RequestForm from "./components/RequestForm";
import { createRequest, getDesignations } from "./api";

function CreateRequestView() {
  const role = useSelector((state) => state.user.role);
  const [designationOptions, setDesignationOptions] = useState([]);
  const [isLoadingDesignations, setIsLoadingDesignations] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [canCreateRequest, setCanCreateRequest] = useState(false);
  const [accessMessage, setAccessMessage] = useState("");

  useEffect(() => {
    const loadDesignations = async () => {
      setIsLoadingDesignations(true);
      try {
        const response = await getDesignations();
        const designationData = response?.holdsDesignations || [];
        const options = designationData.map((item) => ({
          value: `${item.designation?.name || ""}|${item.username || ""}`,
          label: `${item.designation?.name || "Unknown"} (${item.username || "-"})`,
        }));
        setDesignationOptions(options);
        setCanCreateRequest(Boolean(response?.canCreateRequest));

        if (response?.canCreateRequest) {
          setAccessMessage("");
        } else {
          const currentUserDesignations =
            response?.currentUserDesignations || [];
          setAccessMessage(
            currentUserDesignations.length > 0
              ? `Your current designations (${currentUserDesignations.join(", ")}) are not allowed to create IWD requests.`
              : "You do not hold any designation that can create IWD requests.",
          );
        }
      } catch {
        notifications.show({
          color: "red",
          message: "Unable to fetch designation options.",
        });
      } finally {
        setIsLoadingDesignations(false);
      }
    };

    loadDesignations();
  }, []);

  const emptyNotice = useMemo(
    () =>
      isLoadingDesignations
        ? "Loading designations..."
        : "No designation options available.",
    [isLoadingDesignations],
  );

  const handleCreateRequest = async (payload) => {
    setIsSubmitting(true);
    try {
      await createRequest({ ...payload, role });
      notifications.show({
        color: "green",
        message: "IWD request created successfully.",
      });
    } catch (error) {
      const message = axios.isAxiosError(error)
        ? error.response?.data?.error || "Failed to create request."
        : "Failed to create request.";
      notifications.show({
        color: "red",
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isLoadingDesignations && !canCreateRequest) {
    return (
      <Text c="dimmed" mt="md">
        {accessMessage || "You are not allowed to create IWD requests."}
      </Text>
    );
  }

  if (designationOptions.length === 0) {
    return (
      <Text c="dimmed" mt="md">
        {emptyNotice}
      </Text>
    );
  }

  return (
    <RequestForm
      designationOptions={designationOptions}
      isSubmitting={isSubmitting}
      onSubmit={handleCreateRequest}
    />
  );
}

export default CreateRequestView;
