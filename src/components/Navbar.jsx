import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./css/Navbar.css";

const Navbar = () => {
  const [open, setOpen] = useState(false);

  return (
    <nav className="navbar" >
      <div className={`nav-links ${open ? "open" : ""}`}style={{display:"flex" , flexDirection:"column" , width:"100%" , height:"100%" , backgroundColor:"white"}}>
        <Link to="/">About</Link>
        <Link to="/corporate">CorporateModel</Link>
        <Link to="/environment">EnvironmentModel</Link>
        <Link to="/familiar">FamiliarModel</Link>
        <Link to="/financial">FinancialModel</Link>
        <Link to="/investor-analyst">InvestorAnalystModel</Link>
        <Link to="/investor-info">InvestorInformationModel</Link>
        <Link to="/other">OtherModel</Link>
        <Link to="/policies">PoliciesModel</Link>
        <Link to="/qip">QipModel</Link>
        <Link to="/sebi-dispute">SebiOnlineDisputeModel</Link>
        <Link to="/stock-exchange">StockExchangeComplianceModel</Link>
        <Link to="/tds">TdsDeclarationModel</Link>
        <Link to="/award-stories">AwardStories</Link>
        <Link to="/award-news">AwardNews</Link>
        <Link to="/blog">Blog</Link>
      </div>
    </nav>
  );
};

export default Navbar;
