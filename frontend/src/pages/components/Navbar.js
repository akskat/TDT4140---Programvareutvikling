import React, { useEffect, useState } from "react";
import {
  Nav,
  NavLink,
  Bars,
  NavMenu,
  NavBtn,
  NavBtnLink,
} from "./NavbarElements";
import logo from "../../images/logo_trans.png";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const navigate = useNavigate();

  const [admin, setAdmin] = useState(false);

  useEffect(() => {
    const fetchFromApi = async () => {
      const response = await fetch("/api/authentication/check-session");

      if (response.ok) {
        const { isAdmin } = await response.json();
        setAdmin(isAdmin);
      } else if (response.status === 401) {
        // Redirect to login page if user is not logged in
        navigate("/login");
      } else {
        alert("Noe gikk galt: " + response.statusText);
      }
    };

    fetchFromApi();
  }, [navigate]);

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

  return (
    <>
      <Nav>
        <Bars />

        <NavMenu>
          <NavLink to="/sales">
            <img src={logo} width={180} alt="logo" />
          </NavLink>
          <NavLink style={{ color: "white" }} to="/sales">
            <b>Salgsannonser</b>
          </NavLink>
          <NavLink style={{ color: "white" }} to="/profile">
            <b>Profil</b>
          </NavLink>
        </NavMenu>
        <NavBtn style={{ color: "purple" }} to="/ad">
          <NavBtnLink to="/ad">
            <b>Legg til ny billett</b>
          </NavBtnLink>
        </NavBtn>

        {admin && (
          <NavBtn style={{ color: "purple" }} to="/admin">
            <NavBtnLink to="/admin">
              <b>Administrer brukere</b>
            </NavBtnLink>
          </NavBtn>
        )}

        <NavBtn style={{ color: "purple" }} onClick={signOut}>
          <NavBtnLink to="/login">
            <b>Logg ut</b>
          </NavBtnLink>
        </NavBtn>
      </Nav>
    </>
  );
};

export default Navbar;
