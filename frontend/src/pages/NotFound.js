import { Heading, Link, Text } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";

const NotFound = () => {
  return (
    <div>
      <Heading as="h2" size="md">
        404
      </Heading>

      <Text>
        Denne siden ble ikke funnet.{" "}
        <Link as={RouterLink} to="/" color="teal.500">
          Gå til forsiden
        </Link>
        .
      </Text>
    </div>
  );
};

export default NotFound;
