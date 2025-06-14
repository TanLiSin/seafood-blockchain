import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import CustomerHome from './pages/CustomerHome';
import RegulatoryHome from './pages/RegulatoryHome';
import SupplierHome from './pages/SupplierHome';
import DistributorHome from './pages/DistributorHome';
import CompanyHome from './pages/CompanyHome';
import AdminHome from './pages/AdminHome';
import LoginPage from './pages/LoginPage';
import ProcessRecord from './pages/ProcessRecord';
import ProcessRecordRegulatory from './pages/ProcessRecordRegulatory';
import ProcessRecordDistributor from './pages/ProcessRecordDistributor';
import ProcessRecordCustomer from './pages/ProcessRecordCustomer';
import CatchRecord from './pages/CatchRecord';
import CatchRecordCompany from './pages/CatchRecordCompany';
import CatchRecordRegulatory from './pages/CatchRecordRegulatory';
import CatchRecordCustomer from './pages/CatchRecordCustomer';
import Transaction from './pages/Transaction';
import TransactionCompany from './pages/TransactionCompany';
import SharedLedger from './pages/SharedLedger';
import SharedLedgerCompany from './pages/SharedLedgerCompany';
import SharedLedgerRegulatory from './pages/SharedLedgerRegulatory';
import SharedLedgerDistributor from './pages/SharedLedgerDistributor';
import SharedLedgerCustomer from './pages/SharedLedgerCustomer';
import TrackRecall from './pages/TrackRecall';
import TrackRecallCompany from './pages/TrackRecallCompany';
import TrackRecallDistributor from './pages/TrackRecallDistributor';
import TradeRecord from './pages/TradeRecord';
import TradeRecordRegulatory from './pages/TradeRecordRegulatory';
import DistributedDatabaseRegulatory from './pages/DistributedDatabaseRegulatory';
import DistributedDatabaseDistributor from './pages/DistributedDatabaseDistributor';

function App() {
  return (
    <Router>
      <div className="app-container">
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/customer-home" element={<CustomerHome />} />
          <Route path="/regulatory-home" element={<RegulatoryHome />} />
          <Route path="/supplier-home" element={<SupplierHome />} />
          <Route path="/distributor-home" element={<DistributorHome />} />
          <Route path="/company-home" element={<CompanyHome />} />
          <Route path="/admin-home" element={<AdminHome />} />
          <Route path="/catch-record" element={<CatchRecord />} />
          <Route path="/catch-record-company" element={<CatchRecordCompany />} />
          <Route path="/catch-record-regulatory" element={<CatchRecordRegulatory />} /> 
          <Route path="/catch-record-customer" element={<CatchRecordCustomer />} />                   
          <Route path="/process-record" element={<ProcessRecord />} />
          <Route path="/process-record-regulatory" element={<ProcessRecordRegulatory />} />
          <Route path="/process-record-distributor" element={<ProcessRecordDistributor />} />
          <Route path="/process-record-customer" element={<ProcessRecordCustomer />} />
          <Route path="/transaction" element={<Transaction />} />
          <Route path="/transaction-company" element={<TransactionCompany />} />
          <Route path="/shared-ledger" element={<SharedLedger />} />
          <Route path="/shared-ledger-company" element={<SharedLedgerCompany />} />
          <Route path="/shared-ledger-regulatory" element={<SharedLedgerRegulatory />} />
          <Route path="/shared-ledger-distributor" element={<SharedLedgerDistributor />} />
          <Route path="/shared-ledger-customer" element={<SharedLedgerCustomer />} />
          <Route path="/track-recall" element={<TrackRecall />} />
          <Route path="/track-recall-company" element={<TrackRecallCompany />} />
          <Route path="/track-recall-distributor" element={<TrackRecallDistributor />} />
          <Route path="/trade-record" element={<TradeRecord />} />
          <Route path="/trade-record-regulatory" element={<TradeRecordRegulatory />} />
          <Route path="/distributed-database-regulatory" element={<DistributedDatabaseRegulatory />} />
          <Route path="/distributed-database-distributor" element={<DistributedDatabaseDistributor />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
