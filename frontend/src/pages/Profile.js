import star1 from "../images/1_stars.png";
import star2 from "../images/2_stars.png";
import star3 from "../images/3_stars.png";
import star4 from "../images/4_stars.png";
import star5 from "../images/5_stars.png";
import React, { useEffect, useState } from "react";
import { Badge, Center, SimpleGrid } from "@chakra-ui/react";
import {
  Container,
  Box,
  Spinner,
  Text,
  Heading,
  Image,
} from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import PopupProfile from "./PopupProfile";
import PopupPurchases from "./Popup";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import Navbar from "./components/Navbar";

const Profile = (props) => {
  const [isLoading, setIsLoading] = useState(true);
  const [tickets, setTickets] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [popupContent, setPopupContent] = useState(null);
  const [purchasePopupContent, setPurchasePopupContent] = useState(null);
  const [ratings, setRatings] = useState([]);
  const [user, setUser] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const fetchListings = async () => {
      const response = await fetch("/api/listings/own");

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

    const fetchPurchases = async () => {
      const response = await fetch("/api/listings/purchased");

      if (!isCancelled) {
        if (response.ok) {
          const purchased = await response.json();
          setPurchases(purchased);
        } else if (response.status === 401) {
          // Redirect to login page if user is not logged in
          navigate("/login");
        } else {
          alert("Noe gikk galt: " + response.statusText);
        }

        setIsLoading(false);
      }
    };

    const fetchUser = async () => {
      const response = await fetch("/api/authentication/check-session");

      if (!isCancelled) {
        if (response.ok) {
          const user = await response.json();
          setUser(user);
        } else if (response.status === 401) {
          // Redirect to login page if user is not logged in
          navigate("/login");
        } else {
          alert("Noe gikk galt: " + response.statusText);
        }
      }
    };

    const fetchRating = async () => {
      const response = await fetch("/api/ratings");

      if (response.ok) {
        const rates = await response.json();
        setRatings(rates);
      } else {
        alert("Noe gikk galt: " + response.statusText);
      }
      setIsLoading(false);
    };

    fetchUser();
    fetchRating();
    fetchListings();
    fetchPurchases();

    return () => {
      isCancelled = true;
    };
  }, [navigate]);

  return (
    <div>
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
              <PopupProfile
                show={!!popupContent}
                popupClass={"popup-content"}
                content={popupContent}
                handleClose={() => setPopupContent(null)}
              />
            </Container>
          ) : null}
          {purchasePopupContent ? (
            <div
              className="overlay"
              onClick={() => setPurchasePopupContent(null)}
            />
          ) : null}
          {purchasePopupContent ? (
            <Container
              style={{
                backgroundColor: "white",
                color: "black",
                borderRadius: "25px",
              }}
            >
              <PopupPurchases
                show={!!purchasePopupContent}
                popupClass={"popup-content"}
                content={purchasePopupContent}
                handleClose={() => setPurchasePopupContent(null)}
              />
            </Container>
          ) : null}
          <Heading>Brukerinfo</Heading>
          <Text>
            <b>Visningsnavn:</b> {user && user.displayName}
          </Text>
          <Text>
            <b>E-post: </b> {user && user.email}
          </Text>
          <br />
          <Heading>Din rangering</Heading>
          {Math.round(ratings.rating) === 1 && (
            <Image htmlWidth={"150px"} src={star1} />
          )}
          {Math.round(ratings.rating) === 2 && (
            <Image htmlWidth={"150px"} src={star2} />
          )}
          {Math.round(ratings.rating) === 3 && (
            <Image htmlWidth={"150px"} src={star3} />
          )}
          {Math.round(ratings.rating) === 4 && (
            <Image htmlWidth={"150px"} src={star4} />
          )}
          {Math.round(ratings.rating) === 5 && (
            <Image htmlWidth={"150px"} src={star5} />
          )}
          {Math.round(ratings.rating * 10) / 10 ?? "-"}/5 stjerner (
          {ratings.numberOfRatings} vurderinger)
          <br />
          <br />
          <Heading>Dine annonser</Heading>
          <br />
          <SimpleGrid columns={3} spacing={10}>
            {tickets.map((ticket) => (
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
                    {!ticket.active && (
                      <Box display="flex" alignItems="baseline">
                        <Badge borderRadius="full" px="2" colorScheme="red">
                          Solgt
                        </Badge>
                      </Box>
                    )}
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
          <br />
          <br />
          {purchases.length > 0 && <Heading>Billetter du har kjøpt</Heading>}
          <br />
          <SimpleGrid columns={3} spacing={10}>
            {purchases.map((ticket) => (
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
                onClick={() => setPurchasePopupContent(ticket)}
              >
                <Box
                  maxW="sm"
                  width={"100%"}
                  borderWidth="1px"
                  borderRadius="lg"
                >
                  <Box p="6">
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

export default Profile;
