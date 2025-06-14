import base64
import algosdk
from algosdk.v2client import algod
from algosdk.transaction import StateSchema, ApplicationCreateTxn, OnComplete
from algosdk import mnemonic, account
from pathlib import Path

# === CONFIG ===
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

# === REPLACE WITH YOUR 25-WORD MNEMONIC ===
MNEMONIC = "capable desert erode dust give trigger gloom clerk grant three wrong brave spread sunny amused clay orient response real myself ritual moment dinosaur absent permit"
PRIVATE_KEY = mnemonic.to_private_key(MNEMONIC)
SENDER_ADDRESS = account.address_from_private_key(PRIVATE_KEY)

# === READ TEAL PROGRAMS ===
approval_teal = Path("seafood_batch.teal").read_text()
clear_teal = Path("clear.teal").read_text() if Path("clear.teal").exists() else "int 1"

compiled_approval = client.compile(approval_teal)
compiled_clear = client.compile(clear_teal)

approval_program = base64.b64decode(compiled_approval["result"])
clear_program = base64.b64decode(compiled_clear["result"])

# === GET NETWORK PARAMS ===
params = client.suggested_params()

# === DEFINE APP SCHEMA ===
global_schema = StateSchema(num_uints=0, num_byte_slices=16)
local_schema = StateSchema(num_uints=0, num_byte_slices=0)

# === CREATE APP TXN ===
txn = ApplicationCreateTxn(
    sender=SENDER_ADDRESS,
    sp=params,
    on_complete=OnComplete.NoOpOC,
    approval_program=approval_program,
    clear_program=clear_program,
    global_schema=global_schema,
    local_schema=local_schema,
)

# === SIGN & SEND ===
signed_txn = txn.sign(PRIVATE_KEY)
tx_id = client.send_transaction(signed_txn)
print("⏳ Transaction sent with TX ID:", tx_id)

# === WAIT FOR CONFIRMATION ===
response = algosdk.transaction.wait_for_confirmation(client, tx_id, 4)
app_id = response["application-index"]
print("✅ Deployed successfully with App ID:", app_id)