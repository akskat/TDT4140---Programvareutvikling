import React, { useEffect, useState } from "react";
import Logo from "../images/logo_trans.png";
import { Badge, Center, SimpleGrid } from "@chakra-ui/react";
import { Container, Box, Button, Spinner } from "@chakra-ui/react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import "../Sales.css";
import Popup from "./Popup";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import Navbar from "./components/Navbar";
import { Select } from "@chakra-ui/react";
import {
  Text,
  Input,
  FormControl,
  FormLabel,
  ButtonGroup,
} from "@chakra-ui/react";

const Sales = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [popupContent, setPopupContent] = useState(null);
  const [location, setLocation] = useState("");
  const [search, setSearch] = useState("");
  const [sortField, setSortField] = useState("");

  const navigate = useNavigate();

  const filterLocation = tickets.filter((tickets) =>
    tickets.title.toLowerCase().includes(search.toLowerCase())
  );

  function checkfiltering() {
    var filtering;
    if (location === "") {
      filtering = filterLocation;
    } else {
      filtering = filterLocation.filter(
        (tickets) => tickets.location === location
      );
    }
    return filtering;
  }

  function sortTickets(tickets, sortField) {
    if (sortField === "Price_Desc") {
      return tickets.sort((a, b) => (a.price < b.price ? 1 : -1));
    } else if (sortField === "Price_Asc") {
      return tickets.sort((a, b) => (a.price < b.price ? 1 : -1)).reverse();
    } else if (sortField === "Date_Of_Event") {
      return tickets.sort((a, b) => (a.date > b.date ? 1 : -1));
    } else {
      return tickets;
    }
  }

  useEffect(() => {
    let isCancelled = false;

    const fetchFromApi = async () => {
      const response = await fetch("/api/listings");
      if (!isCancelled) {
        if (response.ok) {
          const listings = await response.json();
          setTickets(listings);
        } else if (response.status === 401) {
          // Redirect to login page if user is not logged in
          navigate("/login");
        } else {
          alert("Noe gikk galt: " + response.statusText);
        }

        setIsLoading(false);
      }
    };

    fetchFromApi();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  return (
    <div className="sales">
      <Navbar />
      <Container centerContent></Container>

      {isLoading ? (
        <Center>
          <Spinner />
        </Center>
      ) : (
        <div>
          {popupContent ? (
            <div className="overlay" onClick={() => setPopupContent(null)} />
          ) : null}
          {popupContent ? (
            <Container
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "25px",
              }}
            >
              <Popup
                show={!!popupContent}
                popupClass={"popup-content"}
                content={popupContent}
                handleClose={() => setPopupContent(null)}
              />
            </Container>
          ) : null}
          <div class="filter">
            <FormControl class="bt" width={200}>
              <FormLabel htmlFor="location" color="white">
                Sted:
              </FormLabel>

              <Select
                className="location"
                placeholder="Velg by"
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
                <option value="Annen">Annen</option>
              </Select>
            </FormControl>

            <FormControl class="bt" width={200} marginLeft={3}>
              <FormLabel htmlFor="location" color="white">
                Sorter etter:
              </FormLabel>

              <Select
                placeholder="Sorter etter"
                onChange={(e) => {
                  setSortField(e.target.value);
                }}
              >
                <option value="Price_Desc">Pris, synkende</option>
                <option value="Price_Asc">Pris, stigende</option>
                <option value="Date_Of_Event">Arrangementsdato</option>
              </Select>
            </FormControl>

            <FormControl class="bt" width={200} marginLeft={3}>
              <FormLabel htmlFor="location" color="white">
                Arrangement:
              </FormLabel>
              <Input
                //placeholder="..Festival?"
                onChange={(e) => setSearch(e.target.value).toLowerCase()}
              />
            </FormControl>
          </div>{" "}
          <br /> <br />
          <SimpleGrid columns={3} spacing={10}>
            {sortTickets(checkfiltering(), sortField).map((ticket) => (
              <Container
                key={ticket._id}
                maxW="xl"
                centerContent
                style={{
                  backgroundColor: "white",
                  color: "black",
                  borderRadius: "25px",
                  cursor: "pointer",
                  boxShadow: "0px 0px 10px #000",
                }}
                className="card"
                onClick={() => setPopupContent(ticket)}
              >
                <Box
                  maxW="sm"
                  width={"100%"}
                  borderWidth="1px"
                  borderRadius="lg"
                >
                  <Box p="6">
                    <Box display="flex" alignItems="baseline">
                      <Badge borderRadius="full" px="2" colorScheme="teal">
                        Ny
                      </Badge>
                    </Box>
                    <Box
                      mt="1"
                      fontWeight="semibold"
                      as="h4"
                      lineHeight="tight"
                      isTruncated
                    >
                      {ticket.title}
                    </Box>
                    <div>
                      <Box>
                        {new Date(ticket.date).toLocaleDateString()}
                        <Box as="span" color="black" fontSize="sm"></Box>
                        <Box>
                          {ticket.price} kr
                          <Box as="span" color="black" fontSize="sm"></Box>
                        </Box>
                      </Box>
                    </div>
                    <Box>
                      {ticket.location}
                      <Box as="span" color="black" fontSize="sm"></Box>
                    </Box>
                  </Box>
                </Box>
                <div className="infoButton">
                  <InfoOutlineIcon w={5} h={5} color="black" />
                </div>
              </Container>
            ))}
          </SimpleGrid>
        </div>
      )}
    </div>
  );
};

export default Sales;
