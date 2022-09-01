import React, { useState } from "react";
import Logo from "../images/logo_trans.png";
import {
  Text,
  Input,
  FormControl,
  FormLabel,
  ButtonGroup,
} from "@chakra-ui/react";
import { Button, Textarea } from "@chakra-ui/react";
import {
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
} from "@chakra-ui/react";
import { ChevronDownIcon } from "@chakra-ui/icons";
import { useNavigate } from "react-router-dom";
import { Select } from "@chakra-ui/react";
import "../Ad.css";

const Ad = () => {
  const [title, setTitle] = useState("");
  const [price, setPrice] = useState("");
  const [date, setDate] = useState("");
  const [location, setLocation] = useState("");
  const [description, setDescription] = useState("");
  const [errorMessage, setErrorMessage] = useState(null);
  const navigate = useNavigate();

  const back = async () => {
    navigate("/sales");
  };
  const noTitle = title === "";
  const noPrice = price === "";
  const noDate = date === "";
  const noLocation = location === "";
  const noDescription = description === "";

  const sendAd = async () => {
    const data = {
      title: title,
      date: date,
      price: price,
      description: description,
      location: location,
    };

    const response = await fetch("/api/listings", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      // Go to home page when login is successful
      navigate("/sales");
    } else {
      setErrorMessage((await response.json()).error);
      if (response.json().error === "Ugyldig tittel") {
        setTitle("");
      } else if (
        response.json().error ===
        "Ugyldig dato. Kan ikke velge tidligere datoer. Må velge dagens dato eller senere."
      ) {
        setDate("");
      } else if (response.json().error === "Ugyldig pris") {
        setPrice("");
      } else if (response.json().error === "Ugyldig beskrivelse") {
        setDescription("");
      } else if (response.json().error === "Ugyldig sted") {
        setLocation("");
      }
    }
  };

  return (
    <div className="sales">
      <img src={Logo} width={200} alt="logo" />
      <div>
        <FormControl isRequired={noTitle} width={200}>
          <FormLabel htmlFor="title" color="white">
            Arrangement
          </FormLabel>
          <Input
            id="title"
            type="text"
            value={title}
            color="white"
            onChange={(e) => setTitle(e.target.value)}
          />
          <br />
        </FormControl>

        <FormControl isRequired={noDate} width={200}>
          <FormLabel htmlFor="date" color="white">
            Dato
          </FormLabel>
          <Input
            id="date"
            type="date"
            value={date}
            color="white"
            onChange={(e) => setDate(e.target.value)}
          />
          <br />
        </FormControl>

        <FormControl isRequired={noLocation} width={200}>
          <FormLabel htmlFor="location" color="white">
            Sted
          </FormLabel>

          <Select
            placeholder="Velg nærmeste by"
            onChange={(e) => setLocation(e.target.value)}
          >
            <option value="Oslo">Oslo</option>
            <option value="Bergen">Bergen</option>
            <option value="Stavanger">Stavanger</option>
            <option value="Trondheim">Trondheim</option>
            <option value="Fredrikstad">Fredrikstad</option>
            <option value="Kristiansand">Kristiansand</option>
            <option value="Ålesund">Ålesund</option>
            <option value="Tønsberg">Tønsberg</option>
            <option value="Tromsø">Tromsø</option>
            <option value="Bodø">Bodø</option>
            <option value="Alta">Alta</option>
            <option value="Annet">Annet</option>
          </Select>
          <br />
        </FormControl>

        <FormControl isRequired={noPrice} width={200}>
          <FormLabel htmlFor="price" color="white">
            Pris
          </FormLabel>
          <Input
            id="price"
            type="number"
            value={price}
            color="white"
            onChange={(e) => setPrice(Number(e.target.value))}
          />
          <br />
        </FormControl>

        <FormControl isRequired={noDescription} width={200}>
          <FormLabel htmlFor="description" color="white">
            Beskrivelse
          </FormLabel>
          <>
            <Textarea
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Skriv inn beskrivelse"
              size="sm"
            />
          </>
          <br />
          <br />

          <ButtonGroup>
            <Button colorScheme="purple" size="lg" onClick={sendAd}>
              Publiser annonse
            </Button>
            <br />
            <Button colorScheme="purple" size="lg" onClick={back}>
              Avbryt
            </Button>
          </ButtonGroup>
        </FormControl>
        <Text>{errorMessage}</Text>
      </div>
    </div>
  );
};

export default Ad;
