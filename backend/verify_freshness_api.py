from fastapi import FastAPI
from pydantic import BaseModel
from algosdk import mnemonic, account
from algosdk.v2client import algod
from algosdk.transaction import ApplicationNoOpTxn
from fastapi.middleware.cors import CORSMiddleware
import psycopg2
import algosdk
import base64
import traceback

# Initialize FastAPI
app = FastAPI()

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Algorand settings
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)
APP_ID = 741100136  # Replace with your actual App ID

# Connect to Postgres
db = psycopg2.connect(
    dbname="Database",
    user="postgres",
    password="kikixoxo",
    host="localhost",
    port="5433"
)
db.autocommit = True

# Pydantic model for request
class FreshnessData(BaseModel):
    mnemonic: str
    product_id: str
    dissolved_oxygen: int
    temperature: int
    pH_level: int
    ammonia: int
    metals: int
    bacteria: int

@app.post("/api/verify-freshness")
async def verify_freshness(data: FreshnessData):
    try:
        # Convert mnemonic to private key and address
        private_key = mnemonic.to_private_key(data.mnemonic)
        from_address = account.address_from_private_key(private_key)

        # 🔐 Check ALGO balance before proceeding
        account_info = client.account_info(from_address)
        balance = account_info.get('amount', 0)
        if balance < 100000:  # 0.1 ALGO in microAlgos
            return {
                "status": "error",
                "error": "Insufficient ALGO balance to perform transaction.",
                "wallet_balance": balance
            }

        # Prepare app arguments
        app_args = [
            b"verify_freshness",
            data.product_id.encode(),
            data.dissolved_oxygen.to_bytes(8, 'big'),
            (data.temperature + 20 if data.temperature < 0 else data.temperature).to_bytes(8, 'big'),
            data.pH_level.to_bytes(8, 'big'),
            data.ammonia.to_bytes(8, 'big'),
            data.metals.to_bytes(8, 'big'),
            data.bacteria.to_bytes(8, 'big')
        ]

        # Suggest params and create transaction
        params = client.suggested_params()
        txn = ApplicationNoOpTxn(
            sender=from_address,
            sp=params,
            index=APP_ID,
            app_args=app_args
        )

        # Sign and send
        signed_txn = txn.sign(private_key)
        tx_id = client.send_transaction(signed_txn)
        print("⏳ Sent TX ID:", tx_id)

        # Wait for confirmation
        algosdk.transaction.wait_for_confirmation(client, tx_id, 4)

        # Read global state
        app_info = client.application_info(APP_ID)
        global_state = app_info['params']['global-state']
        print("🔍 Global State after TX:", global_state)

        def get_value(key):
            for entry in global_state:
                decoded_key = base64.b64decode(entry['key']).decode()
                if decoded_key == key:
                    value = entry['value']
                    if 'bytes' in value and value['bytes']:
                        return base64.b64decode(value['bytes']).decode()
                    elif 'uint' in value:
                        return value['uint']
            return None

        # Extract freshness score and label
        freshness_score = get_value(f"freshness_score_{data.product_id}")
        freshness_label = get_value(f"freshness_level_{data.product_id}")

        # Save to Postgres
        with db.cursor() as cur:
            cur.execute("""
                INSERT INTO freshness_records (
                    product_id, dissolved_oxygen, temperature, pH_level,
                    ammonia, metals, bacteria, tx_id
                ) VALUES (%s, %s, %s, %s, %s, %s, %s, %s)
            """, (
                data.product_id,
                data.dissolved_oxygen,
                data.temperature,
                data.pH_level,
                data.ammonia,
                data.metals,
                data.bacteria,
                tx_id
            ))
            db.commit()

        # Return full response
        return {
            "status": "success",
            "tx_id": tx_id,
            "freshness_score": freshness_score,
            "freshness_label": freshness_label,
            "global_state": global_state,
            "db": "saved"
        }

    except Exception as e:
        # Print full traceback in the logs
        print("❌ Blockchain verification failed traceback:")
        print(traceback.format_exc())
        return {
            "status": "error",
            "error": str(e),
            "traceback": traceback.format_exc()
        }
