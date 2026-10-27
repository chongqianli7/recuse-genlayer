import test from "node:test";
import assert from "node:assert/strict";
import {
  tally,
  success,
  confirmedFailure,
  addressOK,
  escapeHTML,
} from "../src/protocol.js";
test("two eligible of three: one yes cannot finalize; both yes pass", () => {
  const r = { eligible: ["b", "c"], votes: { b: "YES" } };
  assert.equal(tally(r).ready, false);
  r.votes.c = "YES";
  assert.deepEqual(
    [tally(r).decision, tally(r).quorum, tally(r).required],
    ["PASSED", 2, 2],
  );
});
test("abstentions count for quorum, never yes majority", () => {
  assert.equal(
    tally({
      eligible: ["a", "b", "c"],
      votes: { a: "YES", b: "ABSTAIN", c: "ABSTAIN" },
    }).decision,
    "REJECTED",
  );
});
test("early rejection only when remaining votes cannot reach absolute majority", () => {
  const r = {
    eligible: ["a", "b", "c", "d", "e"],
    votes: { a: "YES", b: "NO", c: "ABSTAIN", d: "NO" },
  };
  assert.equal(tally(r).decision, "REJECTED");
  assert.equal(
    tally({ ...r, votes: { a: "YES", b: "NO", c: "ABSTAIN" } }).ready,
    false,
  );
});
test("one eligible cannot produce a decision", () => {
  assert.equal(tally({ eligible: ["a"], votes: { a: "YES" } }).ready, false);
});
test("all status/result combinations fail closed except finalized majority success", () => {
  for (const status of [5, 6, 7, 8, "FINALIZED", "ACCEPTED"])
    for (const result of [0, 6, 7, "MAJORITY_AGREE", "MAJORITY_DISAGREE"])
      for (const execution_result of ["SUCCESS", "ERROR", undefined])
        assert.equal(
          success({
            status,
            result,
            consensus_data: {
              leader_receipt: [{ mode: "leader", execution_result }],
            },
          }),
          (status === 7 || status === "FINALIZED") &&
            (result === 6 || result === "MAJORITY_AGREE") &&
            execution_result === "SUCCESS",
        );
});
test("addresses and HTML escaping", () => {
  assert.equal(addressOK("0x" + "0".repeat(40)), false);
  assert.equal(addressOK("0x" + "a".repeat(40)), true);
  assert.equal(escapeHTML('<script>"'), "&lt;script&gt;&quot;");
});

test("unknown finalized outcome retains the pending guard", () => {
  assert.equal(confirmedFailure({ status: 7, result: 6 }), false);
  assert.equal(confirmedFailure({ status: 7, result: 7 }), true);
  assert.equal(
    confirmedFailure({
      status: 7,
      result: 6,
      consensus_data: {
        leader_receipt: [{ mode: "leader", execution_result: "ERROR" }],
      },
    }),
    true,
  );
});
