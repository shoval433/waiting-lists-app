import { useEffect, useState } from "react";
import { useEffectOnce } from "usehooks-ts";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import { useTranslation } from "react-i18next";
import {
  Box,
  Button,
  CircularProgress,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@mui/material";
import styles from "./EventWaitingListModal.module.css";
import { ModalOptions } from "../Home";
import WaitingListTable from "../WaitingListTable/WaitingListTable";
import { EventsService } from "../../services/EventsService";
import EventContactModal from "../EventContactModal/EventContactModal";
import closeButton from "../../static/close.png";
import UnregisterModal from "../UnregisterModal/UnregisterModal";
import { WaitingListData } from "../../global/types";
import { t } from "i18next";

type EventWaitingListModalProps = {
  isOpen: boolean;
  handleClose: (modalOption: ModalOptions, reason?: any) => void;
  eventData: {
    eventId: string;
    eventTitle: string;
  };
};

type EventExchangeListModalProps = {
  isOpen: boolean;
  handleClose: () => void;
  exchangesList: any[];
};

const EventExchangeListModal = ({
  isOpen,
  handleClose,
  exchangesList: exchangeList,
}: EventExchangeListModalProps) => {
  const exchangeColumns = [
    { id: "fullName", label: t("waiting-list.full-name") },
    { id: "exchangeName", label: t("waiting-list.exchange-name") },
  ];

  return (
    <Dialog open={isOpen} onClose={handleClose}>
      <DialogTitle>{t("waiting-list.exchange.title")}</DialogTitle>
      <Paper sx={{ width: "100%", overflow: "hidden" }}>
        <TableContainer sx={{ maxHeight: 440 }}>
          <Table stickyHeader aria-label="sticky table">
            <TableHead>
              <TableRow>
                {exchangeColumns.map((column) => (
                  <TableCell key={column.id}>{column.label}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {exchangeList.map((row) => {
                return (
                  <TableRow hover role="checkbox" tabIndex={-1} key={row._id}>
                    {exchangeColumns.map((column) => {
                      return (
                        <TableCell key={column.id}>{row[column.id]}</TableCell>
                      );
                    })}
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>
    </Dialog>
  );
};

export default function EventWaitingListModal({
  isOpen,
  handleClose,
  eventData,
}: EventWaitingListModalProps) {
  const [eventWaitingList, setEventWaitingList] = useState<any[]>([]);
  const [eventExchangesList, setEventExchangesList] = useState<any[]>([]);
  const [contactData, setContactData] = useState<WaitingListData>(
    {} as WaitingListData
  );
  const [isExchangesListDialogOpen, setIsExchangesListDialogOpen] =
    useState(false);
  const [isNestedDialogOpen, setIsNestedDialogOpen] = useState(false);
  const [isUnregisterModalOpen, setIsUnregisterModalOpen] = useState(false);
  const [unregiseterData, setUnregisterData] = useState<WaitingListData>(
    {} as WaitingListData
  );

  useEffect(() => {
    const getEventWaitingListData = async (eventId: string) => {
      const eventsService = new EventsService();
      const eventWaitingListData: [] = await eventsService.getEventWaitingList(
        eventId
      );

      const eventWaitingListToSet = eventWaitingListData
        .filter((node: any) => node.isActive)
        .map((node: any, index) => ({
          ...node,
          queuePosition: index + 1,
        }));
      setEventWaitingList(eventWaitingListToSet);

      const eventExchangesListToSet = eventWaitingListData.filter(
        (node: any) => !node.isActive && node.exchangeName
      );

      setEventExchangesList(eventExchangesListToSet);
    };

    if (isOpen) {
      getEventWaitingListData(eventData.eventId);
    } else {
      setEventWaitingList([]);
    }
  }, [isOpen, eventData.eventId]);

  const { t } = useTranslation();

  const tableRowClickHandler = (data: WaitingListData) => {
    setContactData(data);
    setIsNestedDialogOpen(true);
  };

  const tableDeleteRowClickHandler = (data: WaitingListData) => {
    setUnregisterData(data);
    setIsUnregisterModalOpen(true);
  };

  const handleRowDeletation = async (
    waitingListToDelete: string,
    exchangeName?: string
  ) => {
    try {
      const eventsService = new EventsService();
      await eventsService.deleteEventWaitingListNode(
        waitingListToDelete,
        exchangeName
      );
      handleClose(ModalOptions.EventWaitingList);
    } catch (e) {
      throw e;
    }
  };

  return (
    <div>
      <Dialog open={isOpen} fullScreen>
        <EventExchangeListModal
          isOpen={isExchangesListDialogOpen}
          handleClose={() => setIsExchangesListDialogOpen(false)}
          exchangesList={eventExchangesList}
        />
        <DialogTitle>
          <Box sx={{ display: "flex", flexDirection: "row" }}>
            <div>{eventData?.eventTitle}</div>
            <IconButton
              aria-label="close"
              onClick={() => handleClose(ModalOptions.EventWaitingList)}
              sx={{
                position: "absolute",
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <img
                style={{ padding: 3 }}
                alt={"close"}
                src={closeButton}
                height={30}
              />
            </IconButton>
          </Box>
        </DialogTitle>

        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: eventWaitingList ? "flex-start" : "center",
          }}
        >
          {eventWaitingList ? (
            <Box width={"100%"}>
              <EventContactModal
                isOpen={isNestedDialogOpen}
                onClose={() => setIsNestedDialogOpen(false)}
                fullName={contactData?.fullName}
                phoneNumber={contactData?.phoneNumber}
              />
              <UnregisterModal
                isOpen={isUnregisterModalOpen}
                handleClose={() => setIsUnregisterModalOpen(false)}
                eventData={eventData}
                unregisterData={unregiseterData}
                handleDelete={handleRowDeletation}
              />
              <DialogContentText>
                {t("waiting-list.description")}
              </DialogContentText>
              <Box sx={{ display: "flex", flexDirection: "column" }}>
                <WaitingListTable
                  onRowClick={(data: WaitingListData) =>
                    tableRowClickHandler(data)
                  }
                  onRowDeleteClick={(data: WaitingListData) =>
                    tableDeleteRowClickHandler(data)
                  }
                  waitingList={eventWaitingList}
                />
              </Box>
            </Box>
          ) : (
            <CircularProgress />
          )}
          <Box
            sx={{ display: "flex", alignItems: "center" }}
            style={{ marginTop: 5 }}
            width={"100%"}
            justifyContent={"center"}
          >
            <Button
              variant="contained"
              onClick={() => setIsExchangesListDialogOpen(true)}
              disabled={!eventExchangesList.length}
            >
              {t("waiting-list.show-exchanges")}
            </Button>
          </Box>
        </DialogContent>
      </Dialog>
    </div>
  );
}
