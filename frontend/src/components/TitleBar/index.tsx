import { TFunction } from "i18next"

import { GlobalState } from "../../types/types"

import React from "react"
import { connect } from "react-redux"
import styled from "styled-components"

import { Navbar, Nav } from "react-bootstrap"
import GitHub from "./GitHub"

// Set sizing and fonts for navbar
const TitleStyles = styled(Navbar)`
  background: #012a36;
  padding-bottom: 5rem !important;

  .page-title {
    font-family: "Lobster", cursive;
    font-size: 5rem;
    color: #ccdbdc !important;
  }
`
/**
 * Type declaration for component props
 */
type ConnectedTitleBar = {
  /**
   * Translation function
   */
  t: TFunction
}

const mapStateToProps = (props: GlobalState) => ({
  t: props.t,
})

/**
 * Component for navbar at top of screen, with title and GitHub link
 */
export default connect(mapStateToProps)(({ t }: ConnectedTitleBar) => (
  <TitleStyles>
    <Navbar.Brand className="page-title">{t("pageTitle")}</Navbar.Brand>
    <Navbar.Toggle aria-controls="responsive-navbar-nav" />
    <Navbar.Collapse id="responsive-navbar-nav">
      <Nav className="ml-auto">
        <GitHub />
      </Nav>
    </Navbar.Collapse>
  </TitleStyles>
))
