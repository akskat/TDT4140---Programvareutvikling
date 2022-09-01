import { Link, Spinner, Text, Button, Center } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { Link as RouterLink, useNavigate } from "react-router-dom";
import logo from "../images/logo_trans.png";

const Home = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [displayName, setDisplayName] = useState(null);

  const navigate = useNavigate();

  const signOut = async () => {
    const response = await fetch("/api/authentication/logout", {
      method: "GET",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
    });
    if (response.ok) {
      // Go to login when logout is successful
      navigate("/login");
    }
  };
  useEffect(() => {
    let isCancelled = false;

    const fetchFromApi = async () => {
      const response = await fetch("/api/authentication/check-session");

      if (!isCancelled) {
        if (response.ok) {
          const { displayName } = await response.json();

          if (!isCancelled) {
            setDisplayName(displayName);
            // Redirect to sales page if user is logged in
            navigate("/sales");
          }
        } else {
          if (!isCancelled) {
            // Redirect to login page if user is not logged in
            navigate("/login");
          }
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
    <div>
      <img src={logo} alt="Logo" width={600} />
      {isLoading ? (
        <Spinner />
      ) : displayName ? (
        <>
          <Center>
            <Text>Du er logget inn som {displayName}.</Text>
          </Center>
          <Center>
            <Button colorScheme="purple" size="lg" onClick={signOut}>
              Logg ut
            </Button>
          </Center>
        </>
      ) : (
        <Text>
          <Link as={RouterLink} to="/login" color="white">
            Du er ikke logget inn.{" "}
          </Link>
          <Link as={RouterLink} to="/signup" color="white">
            Registrer deg
          </Link>
          .
        </Text>
      )}
    </div>
  );
};

export default Home;
