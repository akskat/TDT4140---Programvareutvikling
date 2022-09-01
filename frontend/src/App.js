import Home from "./pages/Home";
import Signup from "./pages/Signup";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";
import Ad from "./pages/Ad";
import Admin from "./pages/Admin";
import ReportedUsers from "./pages/ReportedUsers";
import Profile from "./pages/Profile";
import * as React from "react";
import Sales from "./pages/Sales";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import "./App.css";
import { ChakraProvider, extendTheme } from "@chakra-ui/react";

//import Navbar from "./pages/components/Navbar";

const theme = extendTheme({
  config: {
    useSystemColorMode: false,
    initialColorMode: "dark",
  },
  styles: {
    global: {
      "html, body": {
        color: "gray.100",
        lineHeight: "tall",
      },
      "a.chakra-link": {
        color: "purple.300",
      },
    },
  },
});

const App = () => {
  return (
    <div className="App" id="container">
      <div>
        <ChakraProvider theme={theme}>
          <Router>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/login" element={<Login />} />
              <Route path="/profile" element={<Profile />} />
              <Route path="/admin" element={<Admin />} />
              <Route path="/reportedusers" element={<ReportedUsers />} />
              <Route path="/sales" element={<Sales />} />
              <Route path="/ad" element={<Ad />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </Router>
        </ChakraProvider>
      </div>
    </div>
  );
};

export default App;
