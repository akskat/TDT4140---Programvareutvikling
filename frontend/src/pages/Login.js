import { Heading, Link, Input, Text } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import React, { useState } from "react";
import { Link as RouterLink } from "react-router-dom";
import logo2 from "../images/logo_trans.png";

import { FormControl, FormLabel } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";

const Login = () => {
  const [text, setText] = useState(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();
  //let redDots = false;
  const noEmail = email === "";
  const noPassword = password === "";

  const handleKeyDown = (event) => {
    if (event.key === "Enter") {
      signIn();
    }
  };

  const signIn = async () => {
    const data = {
      email,
      password,
    };

    const response = await fetch("/api/authentication/login", {
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
      setText((await response.json()).error || "Det oppstod en feil");
      if ((response.json().error = "Feil passord")) {
        setPassword("");
      } else if (
        (response.json().error =
          "Det finnes ingen bruker med denne e-postadressen. Registrer deg!")
      ) {
        setEmail("");
      }
    }
  };

  return (
    <div className="login" onKeyDown={handleKeyDown}>
      <img src={logo2} width={300} alt="logo" />
      <Heading as="h2" color="white" size="md">
        Logg inn her!
      </Heading>
      <br />

      <Text>
        Har du ikke en brukerkonto?{" "}
        <Link as={RouterLink} to="/signup">
          Registrer deg her
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
            color="white"
            onChange={(e) => setEmail(e.target.value.toLowerCase())}
          />
          <br />
        </FormControl>

        <FormControl isRequired={noPassword} width={200}>
          <FormLabel htmlFor="password" color="white">
            Passord
          </FormLabel>
          <Input
            id="password"
            type="password"
            value={password}
            color="white"
            onChange={(e) => setPassword(e.target.value)}
          />
          <br />
          <br />

          <Button colorScheme="purple" size="lg" onClick={signIn}>
            Logg inn
          </Button>
        </FormControl>
      </div>

      <Text>{text}</Text>
    </div>
  );
};

export default Login;
