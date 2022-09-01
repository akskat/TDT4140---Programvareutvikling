import { Heading, Input, Text, Link } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import React, { useState } from "react";
import Logo from "../images/logo_trans.png";
import { FormControl, FormLabel } from "@chakra-ui/react";
import { Link as RouterLink } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [text, setText] = useState(null);
  const [email, setEmail] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const noEmail = email === "";
  const wrongPassword = password === "";

  const navigate = useNavigate();

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      signUp();
    }
  };

  const signUp = async () => {
    if (password !== password2) {
      setText("Passordene er ikke like.");
      setPassword("");
      setPassword2("");

      return;
    }

    const data = {
      email,
      displayName,
      password,
    };

    const response = await fetch("api/authentication/register", {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });
    if (response.ok) {
      // Go to home page when register is successful
      navigate("/sales");
    } else {
      setText((await response.json()).error || "Det oppstod en feil");
      if (
        (response.json().error =
          "E-postadressen er ugyldig" || "E-postadressen er allerede i bruk")
      ) {
        setEmail("");
      }
    }
  };

  return (
    <div className="signup" onKeyDown={handleKeyDown}>
      <img src={Logo} width={200} alt="logo" />
      <Heading as="h1" size="md" color="white">
        Registrer deg
      </Heading>

      <br />

      <Text>
        Har du allerede en brukerkonto?{" "}
        <Link as={RouterLink} to="/login">
          Logg inn her
        </Link>
        .
      </Text>

      <br />

      <div>
        <FormControl isRequired={noEmail} width={200}>
          <FormLabel htmlFor="email" color="white">
            E-post
          </FormLabel>
          <Input
            id="email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
          />
          <br />
        </FormControl>

        <FormControl width={200}>
          <FormLabel htmlFor="email" color="white">
            Visningsnavn
          </FormLabel>
          <Input
            id="displayName"
            type="text"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
          <br />
        </FormControl>

        <FormControl isRequired={wrongPassword} width={200} color="white">
          <FormLabel htmlFor="password">Passord</FormLabel>
          <Input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
        </FormControl>

        <FormControl isRequired={wrongPassword} width={200} color="white">
          <FormLabel
            htmlFor="password2"
            onChange={(e) => setPassword2(e.target.value)}
          >
            Gjenta passord
          </FormLabel>
          <Input
            id="password2"
            type="password"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
          />
          <br /> <br />
          <Button colorScheme="purple" size="lg" onClick={signUp}>
            Registrer
          </Button>
        </FormControl>
      </div>

      <Text>{text}</Text>
    </div>
  );
};

export default Signup;
