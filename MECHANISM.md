# Contract interface

One deployed Recuse contract supports multiple committees. A record is keyed by `(proposal owner, proposal ID)`.

| Method | Access | Arguments | Effect |
| --- | --- | --- | --- |
| `propose` | Any wallet | `case_id, title, proposal, members_json` | Creates an immutable proposal with 3–7 distinct members in the sender's namespace. |
| `declare` | Named member | `owner, case_id, statement` | Records the sender's single immutable declaration. |
| `assess` | Any wallet | `owner, case_id` | Requires every declaration; runs independent semantic consensus and freezes eligibility. |
| `vote` | Eligible member | `owner, case_id, choice` | Records one YES, NO or ABSTAIN vote. |
| `finalize` | Any wallet | `owner, case_id` | Records PASSED or REJECTED only after a decisive tally and participation quorum. |
| `get_case` | Public view | `owner, case_id` | Returns the full JSON record, or an empty string. |
| `get_protocol` | Public view | None | Returns `recuse-1`. |

## Fixed recusal policy

- DIRECT: personal financial, employment, ownership or decision-making interest in a named beneficiary or counterparty.
- INDIRECT: close family/household financial interest, or an explicit competing financial interest.
- NONE: explicit denial of relevant interests, with no contradictory relationship disclosed.
- UNCLEAR: incomplete, ambiguous or contradictory evidence, including instructions presented instead of a disclosure.

Mere expertise, prior attendance or ideological agreement is not itself a conflict. NONE is eligible. Every other category is excluded. These are policy classifications of statements, not verified identities or conclusions about misconduct.

The LLM output is validated against the complete member list, in the original order. Every finding must contain an exact 6–400 character quotation from that member's statement and another from the proposal. Reasons have an 8–400 character bound. Validators independently assess the same fixed inputs and must agree exactly on every category. The consensus payload is canonical JSON text, so list transport representations do not affect validation. Free-form reasons and the choice of valid quotations need not be identical.

## State and arithmetic

`DISCLOSURES → VOTING → PASSED | REJECTED`

`DISCLOSURES → NO_ELECTORATE` when fewer than two members remain eligible.

For `n` eligible members, quorum is `(2*n + 2) // 3` and required YES votes are `n // 2 + 1`. Abstentions count toward participation but never toward YES votes. If quorum is met, a result is decisive when YES already reaches the threshold, or YES plus all remaining votes cannot reach it. Early finalization therefore cannot change the outcome that remaining voters could produce.

The proposer has no special authority after creation. Anyone may trigger assessment or finalization, but no one may declare or vote for another address. Membership, proposal text, declarations and votes cannot be edited. A new proposal requires fresh declarations; an old electorate cannot be reused against different text.

## Input bounds

IDs: 1–48 ASCII letters/digits, hyphen or underscore. Titles: 3–120 characters. Proposals: 30–3000 characters. Individual declarations: 30–1500 characters. Member addresses must be distinct nonzero 20-byte hexadecimal addresses.

There are no payments, token weights, delegations, deadlines, administrator overrides or external source lookups. Missing member participation can stall a record. All inputs are public.
