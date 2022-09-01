import { Input, Text } from "@chakra-ui/react";
import { FormControl, FormLabel } from "@chakra-ui/react";

import React, { useEffect, useState } from "react";
import Logo from "../images/logo_trans.png";
import { Badge, Link, SimpleGrid } from "@chakra-ui/react";
import { Container, Box, Button, Spinner } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "../Sales.css";
import PopupUsers from "./PopupUsers";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import NavbarAdmin from "./components/NavbarAdmin";

const Admin = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [popupContent, setPopupContent] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const fetchFromApi = async () => {
      const response = await fetch("/api/authentication/check-session");
      if (response.ok) {
        const { userID, displayName, isAdmin } = await response.json();
        if (isAdmin) {
        } else {
          alert("Du er ikke en admin " + displayName);
          navigate("/sales");
        }
      } else if (response.status === 401) {
        // Redirect to login page if user is not logged in
        navigate("/login");
      } else {
        alert("Noe gikk galt: " + response.statusText);
      }
    };

    fetchFromApi();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  const [email, setEmail] = useState("");
  const [unBlockEmail, setUnBlockEmail] = useState("");
  const noEmail = email === "";
  const [text, setText] = useState(null);
  const block = true;
  const unBlock = false;
  const blockUser = async () => {
    const data = {
      userEmail: email,
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
      setEmail("");
    }
  };
  const unBlockUser = async () => {
    const data = {
      userEmail: unBlockEmail,
      toBlock: unBlock,
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
      setUnBlockEmail("");
    }
  };
  return (
    <div className="admin">
      <NavbarAdmin />
      <SimpleGrid columns={2} spacing={10}>
        <Container centerContent>
          <div>
            <FormControl isRequired={noEmail} width={200}>
              <FormLabel htmlFor="email" color="white">
                E-post
              </FormLabel>
              <Input
                id="email"
                type="text"
                value={email}
                color="white"
                onChange={(e) => setEmail(e.target.value)}
              />

              <br />
              <br />

              <Button colorScheme="purple" size="lg" onClick={blockUser}>
                Utesteng bruker
              </Button>
            </FormControl>
          </div>
        </Container>
        <Container centerContent>
          <div>
            <FormControl isRequired={noEmail} width={200}>
              <FormLabel htmlFor="unBlockEmail" color="white">
                E-post
              </FormLabel>
              <Input
                id="unBlockEmail"
                type="unBlockText"
                value={unBlockEmail}
                color="white"
                onChange={(e) => setUnBlockEmail(e.target.value)}
              />

              <br />
              <br />

              <Button colorScheme="purple" size="lg" onClick={unBlockUser}>
                Opphev utstenging av bruker
              </Button>
            </FormControl>
          </div>
        </Container>
      </SimpleGrid>
      <br></br>
      <br></br>
      <Container maxW="container.sm">{text}</Container>
    </div>
  );
};

export default Admin;
