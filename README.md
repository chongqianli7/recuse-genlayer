# Recuse

A committee voting desk where signed interest disclosures determine who may vote on a specific proposal. GenLayer validators independently assess each member's declared relationship. The contract excludes conflicts and uncertainty, freezes the electorate, and enforces participation and approval thresholds.

## Use the desk

1. Open the worked example to compare a direct financial interest, an explicit no-interest declaration and an incomplete disclosure. The example is illustrative and never sends transactions.
2. Select **Live on GenLayer**. Read the published example without connecting a wallet, or enter another Recuse contract address, proposal owner and proposal ID.
3. For a new committee, connect a wallet on Stable Studionet (61999), deploy the bundled contract once, then create a proposal with 3–7 distinct member addresses. Inputs and membership are immutable.
4. Each member connects their own wallet and signs their own interest declaration. No other address can submit it for them. All members must declare before assessment.
5. Any wallet requests assessment. The leader and validators independently classify every declaration against this proposal. A successful agreeing result locks the electorate. Only NONE is eligible; DIRECT, INDIRECT and UNCLEAR are excluded.
6. Eligible members cast one YES, NO or ABSTAIN vote. Participation quorum is ceil(2 × eligible / 3); approval requires floor(eligible / 2) + 1 YES votes. There must be at least two eligible members.
7. Anyone finalizes once quorum is met and remaining votes cannot change the result. Read the chain record and export its declarations, findings, quotes, votes and receipt.

The application verifies the complete deployed source and protocol before writes. Transactions transfer zero value. The contract holds no funds and has no authority over a treasury.

## Why GenLayer is central

Whether an employment, ownership, household or competing business relationship creates an interest in this exact proposal requires semantic interpretation. The decision directly controls the contract's electorate and vote permissions. It is not a recommendation that an administrator can override.

The custom equivalence check validates a complete ordered member matrix and exact source quotations, independently reruns the assessment, and requires identical decision categories for every member. Wording of explanations may differ. Malformed outputs and disagreements do not open voting. Deterministic code calculates eligibility and thresholds only after consensus.

Signed declarations are the authoritative inputs for this bounded workflow. They are assertions by the signing wallets, not independently verified facts. No external source lookup is claimed; URLs inside statements are text, not fetched evidence.

## Transaction recovery

A pending intent is stored before requesting a wallet signature; its hash is saved immediately after submission. New writes remain blocked until it is resolved. **Resume tracking** reads the existing transaction. It does not resend. If a wallet request returned no hash, copy the exact hash from wallet activity before resuming. Explicit signature rejection releases the intent; an unknown submission outcome keeps it locked.

Successful completion requires FINALIZED, MAJORITY_AGREE, successful leader execution, a receipt matching the sender/target/method/arguments, and chain state readback. Reloads and timeouts retain the pending request. Refresh the record after other members act. Exports marked CHAIN_READBACK contain state read from the selected chain; a receipt is included only if loaded in the current session.

## Run locally

Node.js 20.19+ and Python 3.11+:

```sh
npm ci
npm test
python -m unittest discover -s contract-tests -v
npm run build
npm run dev
```

The static output is `dist/`; relative paths support subdirectory hosting. No paid API key or backend is needed. GenLayerJS 1.1.8 and viem 2.57.8 are pinned. `public/source.json` records the contract SHA-256 and fixed network configuration.

`network.html` is a local-development verification utility, excluded from the production build. It creates three temporary zero-value test wallets in the current tab's session storage, sends full-consensus transactions and exports receipts without keys. Use **Run / resume** to continue recorded hashes, not to redeploy. Never use these test wallets for funds or confidential material.

## Trust boundaries

- Distinct wallet addresses do not prove independent people or organizations. A proposer selects the committee; there is no identity or membership oracle.
- Members can omit or misstate relationships. A NONE classification means no relevant conflict was disclosed under this policy; it is not a guarantee of independence or an ethics certification.
- UNCLEAR is conservatively excluded. A screen is not an allegation of wrongdoing. Model errors and disagreement remain possible.
- Declarations, proposals and votes are public. Use public organizational relationships and avoid personal or confidential data.
- Unresponsive members can block completion. There is no deadline, replacement, edit, appeal or administrator override in this bounded release. A corrected proposal requires a new ID and fresh signatures.
- Votes record a committee decision only. They do not transfer money, bind a third party, authorize a treasury or establish legal authority.

## Files

- `contracts/recuse.py` — canonical Intelligent Contract, included with the application.
- `src/chain.js` — wallet, source verification and chain access.
- `src/protocol.js` — tally calculation and receipt outcome guards.
- `src/main.js`, `src/style.css` — responsive committee desk.
- `contract-tests/`, `tests/` — mocked-host contract checks and frontend logic checks.
- `scripts/network-browser.js` — resumable Stable Studionet verification.

MIT licensed.
