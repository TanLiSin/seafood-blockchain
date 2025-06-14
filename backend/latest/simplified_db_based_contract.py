from pyteal import *

def freshness_verification_contract():
    batch_id = Txn.application_args[1]

    dissolved_oxygen = Btoi(Txn.application_args[2])
    temperature = Btoi(Txn.application_args[3])  # encoded as real_temp + 20
    pH_level = Btoi(Txn.application_args[4])
    ammonia = Btoi(Txn.application_args[5])
    metals = Btoi(Txn.application_args[6])
    bacteria = Btoi(Txn.application_args[7])

    score = ScratchVar(TealType.uint64)
    freshness_label = ScratchVar(TealType.bytes)

    compute_score = Seq([
        Assert(Txn.application_args.length() == Int(8)),
        # Input range validation
        Assert(And(
            dissolved_oxygen <= Int(20),
            temperature <= Int(50),  # max 30°C encoded as 50
            pH_level >= Int(5), pH_level <= Int(10),
            ammonia >= Int(0),
            metals >= Int(0),
            bacteria >= Int(0)
        )),

        # Initialize score
        score.store(Int(0)),

        # Dissolved Oxygen scoring
        If(dissolved_oxygen >= Int(8), score.store(score.load() + Int(30))),
        If(And(dissolved_oxygen >= Int(6), dissolved_oxygen < Int(8)), score.store(score.load() + Int(20))),
        If(dissolved_oxygen < Int(6), score.store(score.load() + Int(10))),

        # Temperature scoring (offset: temp = real_temp + 20)
        If(And(temperature >= Int(0), temperature <= Int(14)), score.store(score.load() + Int(10))),    # -20 to -6
        If(And(temperature >= Int(15), temperature <= Int(19)), score.store(score.load() + Int(15))),   # -5 to -1
        If(And(temperature >= Int(20), temperature <= Int(24)), score.store(score.load() + Int(20))),   # 0 to 4
        If(And(temperature >= Int(25), temperature <= Int(30)), score.store(score.load() + Int(10))),   # 5 to 10
        # >10°C → no score

        # pH scoring
        If(And(pH_level >= Int(6), pH_level <= Int(8)), score.store(score.load() + Int(10))),

        # Ammonia scoring
        If(ammonia == Int(0), score.store(score.load() + Int(15))),
        If(And(ammonia > Int(0), ammonia <= Int(1)), score.store(score.load() + Int(10))),
        If(ammonia > Int(1), score.store(score.load() + Int(5))),

        # Metals scoring
        If(metals == Int(0), score.store(score.load() + Int(10))),
        If(metals > Int(0), score.store(score.load() + Int(5))),

        # Bacteria scoring
        If(bacteria == Int(0), score.store(score.load() + Int(15))),
        # >0 → no extra score

        # Freshness Label Logic
        If(score.load() > Int(80),
           freshness_label.store(Bytes("Excellent")),
        If(score.load() > Int(50),
           freshness_label.store(Bytes("Moderate")),
           freshness_label.store(Bytes("Spoiled"))
        )),

        # Store results on-chain
        App.globalPut(Concat(Bytes("freshness_score_"), batch_id), score.load()),
        App.globalPut(Concat(Bytes("freshness_level_"), batch_id), freshness_label.load()),
        Approve()
    ])

    program = Cond(
        [Txn.application_id() == Int(0), Approve()],
        [Txn.on_completion() == OnComplete.NoOp, Cond(
            [Txn.application_args[0] == Bytes("verify_freshness"), compute_score]
        )]
    )

    return program

# ----------- TEAL EXPORT UTILITY -----------

def save_teal_file(contract_function, filename):
    teal_code = compileTeal(contract_function(), mode=Mode.Application, version=6)
    with open(filename, "w") as f:
        f.write(teal_code)
    print(f"✅ TEAL file saved: {filename}")

if __name__ == "__main__":
    save_teal_file(freshness_verification_contract, "freshness_verification.teal")
