import React, { useEffect, useState } from "react";
import Logo from "../images/logo_trans.png";
import { Badge, SimpleGrid } from "@chakra-ui/react";
import { Container, Box, Spinner } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import "../Sales.css";
import PopupUsers from "./PopupUsers";
import { InfoOutlineIcon } from "@chakra-ui/icons";
import NavbarAdmin from "./components/NavbarAdmin";

const ReportedUsers = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [reports, setReports] = useState([]);
  const [popupContent, setPopupContent] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    let isCancelled = false;

    const fetchFromApi = async () => {
      const response = await fetch("/api/reports");
      if (!isCancelled) {
        if (response.ok) {
          const fetchedReports = await response.json();
          setReports(fetchedReports);
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
    <div className="reportedusers">
      <NavbarAdmin />
      <Container centerContent></Container>

      {isLoading ? (
        <Spinner />
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
              <PopupUsers
                show={!!popupContent}
                popupClass={"popup-content"}
                content={popupContent}
                handleClose={() => setPopupContent(null)}
              />
            </Container>
          ) : null}

          <SimpleGrid columns={3} spacing={10}>
            {reports.map((report) => (
              <Container
                key={report._id}
                maxW="xl"
                centerContent
                style={{
                  backgroundColor: "white",
                  color: "black",
                  borderRadius: "25px",
                  cursor: "pointer",
                }}
              >
                <Box
                  maxW="sm"
                  borderWidth="1px"
                  borderRadius="lg"
                  onClick={() => setPopupContent(report)}
                >
                  <Box style={{ padding: "15px 15px 5px 15px" }}>
                    <Box display="flex" alignItems="baseline">
                      <Badge borderRadius="full" px="2" colorScheme="red">
                        Rapportert
                      </Badge>
                    </Box>

                    <Box
                      mt="1"
                      fontWeight="semibold"
                      as="h4"
                      lineHeight="tight"
                      isTruncated
                    >
                      {report.reportedDisplayName}
                    </Box>
                  </Box>
                  <Box
                    mt="1"
                    lineHeight="tight"
                    fontSize="sm"
                    textAlign={"center"}
                  >
                    <b>Rapportert av: </b>
                    {report.displayName}
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

export default ReportedUsers;
