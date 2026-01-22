import { BrowserRouter, Routes, Route } from "react-router-dom";
import Layout from "./Layout";

import About from "./pages/About";
import Login from "./pages/Login";
import CreateUploader from "./pages/CreateUploader";
import ManageUsers from "./pages/ManageUsers";
import ActivityLogs from "./pages/ActivityLogs";
import ProtectedRoute from "./components/ProtectedRoute";

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
import BlogModel from "./pages/BlogModel";
import AwardModel from "./pages/AwardModel";
import EventNews from "./pages/EventNews";
import EventStories from "./pages/EventStories";
import DisclosuresModel from "./pages/DisclosuresModel";
import ContactModel from "./pages/ContactFormInquiries";
import ContactFormInquiries from "./pages/ContactFormInquiries";
import JobsCreation from "./pages/JobCreation";

function App() {
  return (

      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={
          <ProtectedRoute allowed={["admin", "uploader"]}>
            <Layout />
          </ProtectedRoute>
        }>
          <Route path="/create-uploader" element={
            <ProtectedRoute allowed={["admin"]}>
              <CreateUploader />
            </ProtectedRoute>
          } />
          <Route path="/manage-users" element={
            <ProtectedRoute allowed={["admin"]}>
              <ManageUsers />
            </ProtectedRoute>
          } />
          <Route path="/activity-logs" element={
            <ProtectedRoute allowed={["admin"]}>
              <ActivityLogs />
            </ProtectedRoute>
          } />
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
          <Route path="/blog" element={<BlogModel />} />
          <Route path="/award" element={<AwardModel />} />
          <Route path="/event-news" element={<EventNews />} />
          <Route path="/event-stories" element={<EventStories />} />
          <Route path="/disclosures" element={<DisclosuresModel />} />
          <Route path="/inquiries" element={<ContactFormInquiries/>} />
          <Route path="/jobs" element={<JobsCreation/>}/>
        </Route>
      </Routes>
  );
}

export default App;
