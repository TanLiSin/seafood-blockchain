import express from 'express';
import cors from 'cors';
import loginRoute from './routes/login.js';
import userRoute from './routes/users.js'; // ✅ NEW
import catchRecordsRoute from './routes/catchRecords.js';
import processRecordsRoute from './routes/processRecords.js';
import transactionRoute from './routes/transaction.js';
import companiesRoute from './routes/companies.js';
import distributorsRoute from './routes/distributors.js';
import companyCatchRoute from './routes/companyCatch.js';
import distributorProcessRoute from './routes/distributorProcess.js';
import trackRecallRoute from './routes/trackRecall.js';
import tradeRecordsRoute from './routes/tradeRecords.js';
import ledgerRoute from './routes/ledger.js';
import sharedLedgerDistributorRoute from './routes/sharedLedgerDistributor.js';
import balanceRoute from './routes/balance.js'; // adjust path as needed
import notifyRoute from './routes/notify.js';

const app = express();
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api', notifyRoute);

// Mount routes
app.use('/api/login', loginRoute);
app.use('/api/users', userRoute); // ✅ MOUNT THIS
app.use('/api/catch-records', catchRecordsRoute);
app.use('/api/process-records', processRecordsRoute);
app.use('/api/company-received-records', companyCatchRoute);
app.use('/api/distributor-received-records', distributorProcessRoute);
app.use('/api/transactions', transactionRoute);
app.use('/api/companies', companiesRoute);
app.use('/api/distributors', distributorsRoute);
app.use('/api/track-recall', trackRecallRoute);
app.use('/api', trackRecallRoute);
app.use('/api/shared-ledger-distributor', sharedLedgerDistributorRoute);
app.use('/api', tradeRecordsRoute);
app.use('/api', ledgerRoute);
app.use(balanceRoute);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});