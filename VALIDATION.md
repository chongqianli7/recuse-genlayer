# Validation

## Current Stable Studionet record

`evidence/studionet.json` records the current contract source digest, ten transaction hashes, narrowed receipts and the final state. Every transaction used full consensus on chain 61999 with zero transfer value. The proposer and two other member addresses are separate test wallets controlled by one test operator. The appointment and company are synthetic.

| Operation | Observed result |
| --- | --- |
| Deploy | FINALIZED, MAJORITY_AGREE, SUCCESS; deployed source matched the canonical file. |
| Create proposal | Immutable text and three member addresses stored. |
| Three member declarations | Each signed from its own member address and stored successfully. |
| Consensus assessment | FINALIZED, MAJORITY_AGREE, SUCCESS; classifications DIRECT, NONE, NONE; two eligible members. |
| Recused member votes YES | Rejected with RECUSED_OR_NOT_MEMBER; no vote stored for that address. |
| Eligible B and C vote YES | Both finalized successfully. |
| Finalize | FINALIZED, MAJORITY_AGREE, SUCCESS; readback PASSED, two YES votes, quorum 2 and required YES 2. |

The classifier result was read back before voting and the complete record was read back after finalization. Permission tests establish separation between addresses, not separation between human owners.

## Local checks

- Seven frontend logic tests cover the voting threshold, abstentions, decisive results, insufficient electorate, finalized outcome classification, unknown-receipt guards, addresses and escaping.
- Twelve mocked-host contract tests cover ownership namespaces, member-only immutable declarations, incomplete assessment, forged evidence, independent validator disagreement, conservative exclusion, recused vote rejection, repeat vote/locked declaration rejection, transport representation compatibility and bounds.
- A property check enumerates vote combinations for committees of 2–7 eligible seats and proves that every ready decision stays the same for every possible completion of the remaining votes.
- Production build completes. Mocked-host tests exercise real contract logic with simulated GenLayer host/model behavior; they are distinct from the real-network evidence above.

## Earlier schema failure

`evidence/initial-matrix-failure.json` retains an earlier contract run at a different address. Its assessment failed with INVALID_MATRIX and never opened voting. The current source uses an explicit findings object and canonical JSON consensus payload, accepts validated sequence transport forms, and has a successful independent deployment and assessment. The earlier address is not configured in the application.

## Verification boundaries

The published application can independently verify deployed source bytes and read finalized state. Browser-wallet extension signing and mobile wallet deep links have not been tested; the real-network workflow used SDK-signed temporary test accounts. The contract does not discover hidden relationships, authenticate people or prevent collusion. The successful fixture is not an accuracy benchmark for every declaration or adversarial prompt.
