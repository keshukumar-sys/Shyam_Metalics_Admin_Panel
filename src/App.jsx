import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import About from "./pages/About";
import TdsDeclarationModel from "./pages/TdsDeclarationModel";
import StockExchangeComplianceModel from "./pages/StockExchangeComplianceModel";
import SebiOnlineDisputeModel from "./pages/SebiOnlineDisputeModel";
import QipModel from "./pages/QipModel";
import PoliciesModel from "./pages/PoliciesModel";
import OtherModel from "./pages/OtherModel";
import InvestorInformationModel from "./pages/InvestorInformationModel";
import InvestorAnalystModel from "./pages/InvestorAnalystModel";
import FinancialModel from "./pages/FinancialModel";
import FamiliarModel from "./pages/FamiliarModel";
import EnvironmentModel from "./pages/EnvironmentModel";
import CorporateModel from "./pages/CorporateModel";
import AwardStories from "./pages/AwardStories";
import AwardNews from "./pages/AwardNews";
import Blog from "./pages/Blog";
import DisclosuresModel from "./pages/DisclosuresPage";
import AwardPage from "./pages/AwardPage";
// import CreateBlog from "./pages/Blog";

function App() {
  return (

      <Routes>
        {/* Layout wrapper */}
        <Route element={<Layout />}>
          <Route path="/" element={<About />} />
          <Route path="/tds" element={<TdsDeclarationModel />} />
          <Route path="/stock-exchange" element={<StockExchangeComplianceModel />} />
          <Route path="/sebi-dispute" element={<SebiOnlineDisputeModel />} />
          <Route path="/qip" element={<QipModel />} />
          <Route path="/policies" element={<PoliciesModel />} />
          <Route path="/other" element={<OtherModel />} />
          <Route path="/investor-info" element={<InvestorInformationModel />} />
          <Route path="/investor-analyst" element={<InvestorAnalystModel />} />
          <Route path="/financial" element={<FinancialModel />} />
          <Route path="/familiar" element={<FamiliarModel />} />
          <Route path="/environment" element={<EnvironmentModel />} />
          <Route path="/corporate" element={<CorporateModel />} />
          <Route path="/award-stories" element={<AwardStories />} />
          <Route path="/award-news" element={<AwardNews />} />
          <Route path="/blog" element={<Blog />}/>
          <Route path="/disclosure" element={<DisclosuresModel />} />
          <Route path="/award" element={<AwardPage/>} />
          {/* <Route path="/blog" element={<CreateBlog />} /> */}
        </Route>
      </Routes>
  );
}

export default App;
