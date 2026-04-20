import { useEffect, useMemo, useState } from "react";
import { notifications } from "@mantine/notifications";
import { useSelector } from "react-redux";
import CreatedRequestsTable from "./components/CreatedRequestsTable";
import TrackingHistoryModal from "./components/TrackingHistoryModal";
import {
  getCreatedRequests,
  getViewFile,
} from "./api";

function CreatedRequestsView() {
  const role = useSelector((state) => state.user.role);
  const [requests, setRequests] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  // View tracking modal state
  const [trackingOpened, setTrackingOpened] = useState(false);
  const [fileData, setFileData] = useState(null);
  const [tracks, setTracks] = useState([]);
  const [isTrackingLoading, setIsTrackingLoading] = useState(false);

  const loadRequests = async () => {
    setIsLoading(true);
    try {
      const data = await getCreatedRequests(role);
      setRequests(data);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch created IWD requests.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!role) return;
    loadRequests();
  }, [role]);

  const openTrackingModal = async (fileId) => {
    setFileData(null);
    setTracks([]);
    setTrackingOpened(true);
    setIsTrackingLoading(true);
    try {
      const data = await getViewFile(fileId);
      setFileData(data.file || null);
      setTracks(data.tracks || []);
    } catch {
      notifications.show({
        color: "red",
        message: "Unable to fetch file tracking data.",
      });
    } finally {
      setIsTrackingLoading(false);
    }
  };

  return (
    <>
      <CreatedRequestsTable
        requests={requests}
        isLoading={isLoading}
        onRefresh={loadRequests}
        onTracking={openTrackingModal}
      />
      <TrackingHistoryModal
        opened={trackingOpened}
        onClose={() => setTrackingOpened(false)}
        isLoading={isTrackingLoading}
        fileData={fileData}
        tracks={tracks}
      />
    </>
  );
}

export default CreatedRequestsView;
