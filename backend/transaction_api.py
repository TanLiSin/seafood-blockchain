from fastapi import FastAPI
from pydantic import BaseModel
from algosdk import mnemonic, account
from algosdk.v2client import algod
from algosdk.transaction import ApplicationNoOpTxn
from fastapi.middleware.cors import CORSMiddleware
from datetime import datetime, timezone
import psycopg2
import algosdk
import requests
import sys

print("✅ Python version:", sys.version)

created_at = datetime.now(timezone.utc)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
APP_ID = 740032257  # Replace with your actual App ID

db = psycopg2.connect(
    dbname="Database",
    user="postgres",
    password="kikixoxo",
    host="localhost",
    port="5433"
)
db.autocommit = True

class TransactionData(BaseModel):
    mnemonic: str
    user_id: str
    product_id: str
    freshness: str
    amount: int
    expiry_date: str
    end_user: str
    end_user_wallet: str

@app.post("/api/create-transaction")
async def create_transaction(data: TransactionData):
    try:
        private_key = mnemonic.to_private_key(data.mnemonic)
        from_address = account.address_from_private_key(private_key)

        # 🔐 Check balance before proceeding
        account_info = client.account_info(from_address)
        balance = account_info.get('amount', 0)
        if balance < 100000:  # 0.1 ALGO
            return {
                "status": "error",
                "error": "Insufficient ALGO balance to perform transaction.",
                "wallet_balance": balance
            }

        app_args = [
            b"create_txn",
            data.product_id.encode(),
            data.amount.to_bytes(8, "big"),
            data.end_user.encode()
        ]

        params = client.suggested_params()
        txn = ApplicationNoOpTxn(
            sender=from_address,
            sp=params,
            index=APP_ID,
            app_args=app_args,
            accounts=[data.end_user_wallet]
        )

        signed_txn = txn.sign(private_key)
        tx_id = client.send_transaction(signed_txn)
        algosdk.transaction.wait_for_confirmation(client, tx_id, 4)

        with db.cursor() as cur:
            cur.execute("""
                INSERT INTO transactions (
                    user_id, product_id, freshness, amount, expiry_date,
                    end_user, end_user_wallet, transaction_id, created_at
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                data.user_id,
                data.product_id,
                data.freshness,
                data.amount,
                data.expiry_date,
                data.end_user,
                data.end_user_wallet,
                tx_id,
                created_at
            ))
            db.commit()

        try:
            notify_res = requests.post("https://backend-node-b313.onrender.com/api/notify-transaction", json={"transaction_id": tx_id})
            print("📢 Notification trigger response:", notify_res.status_code, notify_res.json())
        except Exception as notify_err:
            print("❌ Failed to notify end user:", notify_err)


        return {
            "status": "success",
            "tx_id": tx_id
        }

    except Exception as e:
        print("❌ Error creating transaction:", e)
        return {
            "status": "error",
            "error": str(e)
        }
