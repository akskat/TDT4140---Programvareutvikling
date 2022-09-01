import React from "react";
import "../Popup.css";
import { Button, Container, Heading, Text } from "@chakra-ui/react";
import { CloseIcon, DeleteIcon, CheckIcon } from "@chakra-ui/icons";

const PopupProfile = (props) => {
  const deleteListing = async () => {
    const data = {
      title: props.content.title,
    };

    const response = await fetch("/api/listings/", {
      method: "DELETE",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    if (response.ok) {
      window.location.reload();
    }
  };

  const markAsSold = async () => {
    const soldToEmail = prompt(
      "Skriv inn e-postadressen til brukeren du solgte denne billetten til"
    );

    if (soldToEmail) {
      const data = {
        title: props.content.title,
        soldToEmail,
      };

      const response = await fetch("/api/listings/mark-as-sold/", {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.alert("Annonsen ble markert som solgt!");
        window.location.reload();
      } else {
        alert("Det oppsto en feil: " + (await response.json()).error);
      }
    }
  };

  return (
    <div
      className="popup-box"
      style={{
        marginTop: 100,
        borderRadius: "5px",
        //width: "30%",
      }}
    >
      <div className="closeIconContainer">
        <div className="closeIcon">
          <CloseIcon color="black" onClick={props.handleClose} />
        </div>
      </div>
      <Heading as="h3" size="lg">
        {props.content.title}
      </Heading>
      <br />
      <Text>{props.content.description}</Text>

      <br />
      <Text>
        <b>Dato: </b>
        {new Date(props.content.date).toLocaleDateString()}
      </Text>
      <Text>
        <b>Pris: </b>
        {props.content.price} kr
      </Text>
      <Text>
        <b>Sted: </b>
        {props.content.location}
      </Text>
      <br />
      {props.content.active ? (
        <Container>
          <Button
            colorScheme="purple"
            as="a"
            style={{
              marginTop: 20,
            }}
            onClick={markAsSold}
          >
            <CheckIcon />
            Marker som solgt
          </Button>
        </Container>
      ) : (
        <Text>Du solgte denne billetten til {props.content.soldToEmail}</Text>
      )}
      <Container>
        <Button
          colorScheme="purple"
          as="a"
          style={{
            marginTop: 20,
          }}
          onClick={deleteListing}
        >
          <DeleteIcon />
          Slett annonse
        </Button>
      </Container>
    </div>
  );
};

export default PopupProfile;
