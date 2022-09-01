import React, { useState } from "react";
import "../Popup.css";
import { Button, Heading, Text } from "@chakra-ui/react";
import { CloseIcon } from "@chakra-ui/icons";

const PopupUsers = (props) => {
  const [text, setText] = useState(null);
  const block = true;

  const blockUser = async () => {
    const data = {
      userEmail: props.content.reportedEmail,
      toBlock: block,
    };
    const response = await fetch("/api/admin/block", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      // Go to home page when login is successful
      setText(await response.text());
    } else {
      setText((await response.json()).error || "Det oppstod en feil");
    }
  };

  const dismissReport = async () => {
    const data = {
      reportId: props.content._id,
    };

    const response = await fetch("/api/reports/", {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      // setText(await response.text());
      window.location.reload();
    } else {
      setText((await response.json()).error || "Det oppstod en feil");
    }
  };

  return (
    <div
      className="popup-box"
      style={{
        marginTop: 100,
        borderRadius: "5px",
      }}
    >
      <div className="closeIconContainer">
        <div className="closeIcon">
          <CloseIcon color="black" onClick={props.handleClose} />
        </div>
      </div>
      <Heading as="h4" size="md">
        Rapportert bruker:
      </Heading>
      <Text fontSize="xl">
        {props.content.reportedDisplayName} ({props.content.reportedEmail})
      </Text>
      <Text>
        Denne brukeren har blitt rapportert{" "}
        <b>{props.content.numberOfTimesReported}</b> ganger
      </Text>
      <br></br>
      <Heading as="h4" size="md">
        Rapportert av:
      </Heading>
      <Text fontSize="xl">
        {props.content.displayName} ({props.content.email})
      </Text>
      <br></br>
      <div>
        <Text>
          <b>Beskrivelse: </b>
          {props.content.description}
        </Text>

        <Button
          colorScheme="purple"
          as="a"
          style={{
            marginTop: 20,
          }}
          onClick={blockUser}
        >
          Utesteng bruker
        </Button>
        <br />
        <Button
          colorScheme="purple"
          as="a"
          style={{
            marginTop: 20,
          }}
          onClick={dismissReport}
        >
          Fjern rapportering
        </Button>

        <Text> {text}</Text>
      </div>
    </div>
  );
};

export default PopupUsers;
