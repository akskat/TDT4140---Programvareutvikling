import React, { useEffect, useState } from "react";
import "../Popup.css";
//import ReactDOM from "react-dom";
import { Button, Heading, Text } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import { CloseIcon } from "@chakra-ui/icons";
import { ChakraProvider, CSSReset } from "@chakra-ui/react";
import Rating from "./components/Rating";

const Popup = (props) => {
  const reportUser = async () => {
    const description = window.prompt("Hvorfor rapporterer du denne brukeren?");

    if (description) {
      const data = {
        reportedUserId: props.content.ownerId,
        description,
      };

      const response = await fetch("/api/reports", {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (response.ok) {
        window.alert(props.content.displayName + " ble rapportert!");
      } else {
        alert("Det oppsto en feil: " + (await response.json()).error);
      }
    }
  };

  const navigate = useNavigate();
  const [ratings, setRatings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchFromApi = async () => {
    const response = await fetch("/api/ratings?email=" + props.content.email);

    if (response.ok) {
      const rates = await response.json();
      setRatings(rates);
    } else {
      alert("Noe gikk galt: " + response.statusText);
    }
    setIsLoading(false);
  };

  useEffect(() => {
    fetchFromApi();
  }, [navigate]);

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
      <Heading as="h4" size="md">
        Selger:
      </Heading>
      <Text>
        {props.content.displayName} ({props.content.email})
        <br />
        {Math.round(ratings.rating * 10) / 10 ?? "-"}/5 stjerner (
        {ratings.numberOfRatings} vurderinger)
      </Text>
      <div></div>
      <div>
        <ChakraProvider>
          <CSSReset />
          <Rating
            size={50}
            w={40}
            h={40}
            icon="star"
            scale={5}
            fillColor="gold"
            strokeColor="grey"
            content={props.content}
            updateRating={fetchFromApi}
          />
        </ChakraProvider>
      </div>
      <br />
      <div className="popupbuttons">
        <Button
          colorScheme="purple"
          as="a"
          href={"mailto:" + props.content.email}
        >
          Kontakt selger
        </Button>
      </div>
      <div className="popupbuttons">
        <Button
          colorScheme="purple"
          as="a"
          style={{
            marginTop: 20,
          }}
          onClick={reportUser}
        >
          Rapporter selger
        </Button>
      </div>
    </div>
  );
};

export default Popup;
