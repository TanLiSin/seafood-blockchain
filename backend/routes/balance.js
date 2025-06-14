import express from 'express';
import algosdk from 'algosdk';

const router = express.Router();

router.get('/api/balance', async (req, res) => {
  const address = req.query.address;
  if (!address) {
    return res.status(400).json({ status: 'error', message: 'Missing address' });
  }

  try {
    const algodClient = new algosdk.Algodv2('', 'https://testnet-api.algonode.cloud', '');
    const accountInfo = await algodClient.accountInformation(address).do();
    res.json({ status: 'success', balance: accountInfo.amount.toString() });
  } catch (err) {
    console.error(err);
    res.status(500).json({ status: 'error', message: 'Algo balance fetch failed' });
  }
});

export default router;
