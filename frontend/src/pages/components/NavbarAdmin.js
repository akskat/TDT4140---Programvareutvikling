import React from "react";
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

const NavbarAdmin = () => {
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

  return (
    <>
      <Nav>
        <Bars />

        <NavMenu>
          <NavLink to="/sales">
            <img src={logo} width={180} alt="logo" />
          </NavLink>
          <NavLink style={{ color: "white" }} to="/admin">
            <b>Utesteng</b>
          </NavLink>
          <NavLink style={{ color: "white" }} to="/reportedusers">
            <b>Rapporterte brukere</b>
          </NavLink>
        </NavMenu>
        <NavBtn style={{ color: "purple" }} to="/sales">
          <NavBtnLink to="/sales">
            <b>Tilbake</b>
          </NavBtnLink>
        </NavBtn>
        <NavBtn style={{ color: "purple" }} onClick={signOut}>
          <NavBtnLink to="/login">
            <b>Logg ut</b>
          </NavBtnLink>
        </NavBtn>
      </Nav>
    </>
  );
};

export default NavbarAdmin;
