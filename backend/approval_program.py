from pyteal import *

def approval_program():
    return Cond(
        [Txn.application_id() == Int(0), Approve()],  # Allow deployment
        [Txn.on_completion() == OnComplete.DeleteApplication, Approve()],  # Allow deletion
        [Txn.on_completion() == OnComplete.NoOp, Approve()]  # Allow normal transactions
    )

def clear_program():
    return Approve()

if __name__ == "__main__":
    approval_teal = compileTeal(approval_program(), mode=Mode.Application, version=6)
    clear_teal = compileTeal(clear_program(), mode=Mode.Application, version=6)

    with open("approval.teal", "w") as f:
        f.write(approval_teal)

    with open("clear.teal", "w") as f:
        f.write(clear_teal)

    print("Updated approval.teal and clear.teal to allow deletion.")
