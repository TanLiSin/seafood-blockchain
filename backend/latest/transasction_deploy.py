import base64
import algosdk
from algosdk.v2client import algod
from algosdk.transaction import StateSchema, ApplicationCreateTxn
from algosdk import mnemonic, account
from pyteal import *

# === CONFIG ===
ALGOD_ADDRESS = "https://testnet-api.algonode.cloud"
ALGOD_TOKEN = ""
client = algod.AlgodClient(ALGOD_TOKEN, ALGOD_ADDRESS)

MNEMONIC = "capable desert erode dust give trigger gloom clerk grant three wrong brave spread sunny amused clay orient response real myself ritual moment dinosaur absent permit"
PRIVATE_KEY = mnemonic.to_private_key(MNEMONIC)
SENDER_ADDRESS = account.address_from_private_key(PRIVATE_KEY)

# === GENERATE TEAL PROGRAMS USING PYTEAL ===
def approval_program():
    on_creation = Txn.application_id() == Int(0)
    handle_create = Seq([
        Approve()
    ])
    program = Cond(
        [on_creation, Approve()],
        [Txn.application_args[0] == Bytes("create_txn"), handle_create]
    )
    return program

def clear_program():
    return Approve()

compiled_approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=6)
compiled_clear_teal = compileTeal(clear_program(), mode=Mode.Application, version=6)

# === COMPILE TEAL WITH ALGOD ===
compiled_approval = client.compile(compiled_approval_teal)
compiled_clear = client.compile(compiled_clear_teal)

approval_program_bytes = base64.b64decode(compiled_approval["result"])
clear_program_bytes = base64.b64decode(compiled_clear["result"])

# === GET NETWORK PARAMS ===
params = client.suggested_params()

# === DEFINE APP SCHEMA ===
global_schema = StateSchema(num_uints=40, num_byte_slices=16)
local_schema = StateSchema(num_uints=0, num_byte_slices=0)

# === CREATE APP TXN ===
txn = ApplicationCreateTxn(
    sender=SENDER_ADDRESS,
    sp=params,
    on_complete=0,  # NoOp is 0
    approval_program=approval_program_bytes,
    clear_program=clear_program_bytes,
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
