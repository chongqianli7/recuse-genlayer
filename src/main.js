import "./style.css";
import {
  tally,
  addressOK,
  success,
  confirmedFailure,
  escapeHTML as e,
  short,
  json,
} from "./protocol.js";
import * as chain from "./chain.js";
let w = null,
  record = null,
  mode = "example",
  busy = false,
  notice = "Ready. Explore the example or open a live committee.",
  verified = "",
  lastReceipt = null,
  recovery = "";
const KEY = "recuse-pending-v1",
  DRAFT = "recuse-draft-v1";
let pending = JSON.parse(localStorage.getItem(KEY) || "null");
const defaults = {
  address: "",
  owner: "",
  id: "community-hall-01",
  title: "Appoint a workshop operator",
  proposal:
    "Appoint Cedar Workshop Ltd as the paid operator of the community maker hall for one year. The committee will approve the service appointment; no funds are transferred by this vote.",
  members: "",
  statement: "",
};
let draft = { ...defaults, ...JSON.parse(localStorage.getItem(DRAFT) || "{}") };
const M = [
  "0x1111111111111111111111111111111111111111",
  "0x2222222222222222222222222222222222222222",
  "0x3333333333333333333333333333333333333333",
];
const statements = [
  "I am the managing director and a shareholder of Cedar Workshop Ltd, the proposed paid operator. I would benefit financially from this appointment.",
  "I have no financial, employment, ownership, close family or competing business interests related to Cedar Workshop Ltd or this appointment.",
  "I have no financial, employment, ownership, close family or competing business interests related to Cedar Workshop Ltd or this appointment.",
];
function example(scenario = "conflict") {
  const findings = M.map((member, i) => ({
    member,
    kind:
      i === 0
        ? scenario === "clear"
          ? "NONE"
          : scenario === "uncertain"
            ? "UNCLEAR"
            : "DIRECT"
        : "NONE",
    declaration_quote:
      i === 0
        ? scenario === "clear"
          ? statements[1]
          : scenario === "uncertain"
            ? "I may have a connection; I have not provided details."
            : statements[0]
        : statements[i],
    proposal_quote: "Appoint Cedar Workshop Ltd",
    reason:
      i === 0 && scenario !== "clear"
        ? scenario === "uncertain"
          ? "Incomplete relationship details; excluded conservatively."
          : "A paid appointment benefits the declared director and shareholder."
        : "Explicit denial of relevant relationships.",
  }));
  record = {
    protocol: "recuse-1",
    owner: M[0],
    id: "illustrative-example",
    title: "Who should vote on this appointment?",
    proposal: defaults.proposal,
    members: M,
    declarations: Object.fromEntries(
      M.map((m, i) => [m, findings[i].declaration_quote]),
    ),
    findings,
    eligible: findings.filter((f) => f.kind === "NONE").map((f) => f.member),
    votes: {},
    status: "VOTING",
    illustrative: true,
  };
  mode = "example";
  render();
}
function field(id, label, val, area = false, placeholder = "") {
  return `<label>${label}${area ? `<textarea id="${id}" data-field="${id}" placeholder="${placeholder}">${e(val)}</textarea>` : `<input id="${id}" data-field="${id}" value="${e(val)}" placeholder="${placeholder}">`}</label>`;
}
function button(action, label, disabled = false, cls = "") {
  return `<button data-action="${action}" ${disabled || busy ? "disabled" : ""} class="${cls}">${label}</button>`;
}
function render() {
  const t = record ? tally(record) : null;
  const live = mode === "live";
  document.querySelector("#app").innerHTML = `
<aside class="rail"><a class="monogram" href="#" aria-label="Recuse home"><img src="./mark.svg" alt=""></a><span class="rail-word">RECUSAL / RECORDED</span><span class="rail-bottom">R—01</span></aside>
<div class="shell"><header><a class="wordmark" href="#">recuse<span>•</span></a><nav><a href="#desk">Committee desk</a><a href="#method">The method</a><a href="https://github.com/chongqianli7/recuse-genlayer" target="_blank" rel="noreferrer">Source ↗</a></nav><span class="network"><i></i> STUDIO / 61999</span></header>
<main><section class="hero"><div><p class="eyebrow">SMALL COMMITTEES. VISIBLE BOUNDARIES.</p><h1>A fair vote starts<br>with <em>who votes.</em></h1><p class="intro">Declare the connection. Let consensus draw the line.<br>Count only the eligible electorate.</p><a class="primary linkbtn" href="#desk">Open committee desk <span>↗</span></a><div class="micro">No treasury access. No administrator override.</div></div><div class="chamber" aria-label="Three committee seats, one recused"><div class="orbit o1"></div><div class="orbit o2"></div><div class="table-top"><span>THE<br>COMMON<br>INTEREST</span></div><div class="seat s1"><span>A</span><small>RECUSED</small></div><div class="seat s2"><span>B</span><small>ELIGIBLE</small></div><div class="seat s3"><span>C</span><small>ELIGIBLE</small></div><span class="diagram-caption">01 / THE ELECTORATE IS A RESULT</span></div></section>
<div class="principles" id="method"><div><b>01</b><span>Members sign<br><strong>their own disclosures</strong></span></div><div><b>02</b><span>Validators agree on<br><strong>proposal-specific recusals</strong></span></div><div><b>03</b><span>The contract enforces<br><strong>eligibility & voting thresholds</strong></span></div></div>
<section id="desk" class="desk"><div class="section-head"><div><p class="eyebrow">THE COMMITTEE DESK</p><h2>Every seat has a record.</h2></div><div class="segmented">${button("example", "Worked example", false, live ? "" : "selected")}${button("live", "Live on GenLayer", false, live ? "selected" : "")}</div></div>
<div class="mode-banner ${live ? "live" : ""}"><b>${live ? "LIVE / STABLE STUDIONET" : "ILLUSTRATIVE / NO CHAIN TRANSACTIONS"}</b><span>${live ? "All decisions below are read from the selected contract." : "Explore a fictional appointment. These findings are authored examples."}</span></div>
${!live ? `<div class="scenarios"><span>COMPARE A BOUNDARY</span>${button("conflict", "Financial interest", false, "small")}${button("clear", "No declared conflicts", false, "small")}${button("uncertain", "Incomplete disclosure", false, "small")}</div>` : `<div class="connection"><div class="connection-grid">${field("address", "Contract address", draft.address, false, "0x…")}${field("owner", "Proposal owner", draft.owner, false, "0x…")}${field("id", "Proposal ID", draft.id)}</div><div class="actions">${button("connect", w ? "Reconnect " + short(w.owner) : "Connect wallet")}${button("verify", "Verify source")}${button("read", "Read proposal")}${button("published", "Read published example")}${button("deploy", "Deploy contract", !!pending, "subtle")}</div><p class="hint">Verify the exact contract source before writes. Network: 61999. Transactions transfer zero value. For a new committee, deploy once and share the address.</p></div>`}
<div role="status" aria-live="polite" class="notice ${busy ? "working" : ""}">${e(notice)}</div>
${pending ? `<div class="pending"><b>Unresolved transaction — new writes are blocked.</b><p>${e(pending.method)} · ${e(pending.hash || "Wallet request made; hash not yet known.")}</p>${field("recovery", "Transaction hash", pending.hash || recovery)}${button("resume", "Resume tracking")}${pending.hash ? `<a href="${chain.explorer}/tx/${pending.hash}" target="_blank">View transaction ↗</a>` : ""}</div>` : ""}
<div class="workspace"><div class="dossier"><div class="panel-heading"><span>${live ? "CHAIN RECORD" : "WORKED EXAMPLE"}</span><b>${record ? e(record.status) : "NO RECORD LOADED"}</b></div>${
    record
      ? `<h3>${e(record.title)}</h3><p class="proposal">${e(record.proposal)}</p><div class="case-meta">${e(record.id)} · ${short(record.owner)}</div><div class="members">${record.members
          .map((m, i) => {
            const f = record.findings.find((f) => f.member === m);
            return `<article class="member ${f && f.kind !== "NONE" ? "excluded" : ""}"><div class="member-top"><span class="avatar">${String.fromCharCode(65 + i)}</span><div><b>Member ${String.fromCharCode(65 + i)}</b><code>${short(m)}</code></div><span class="badge">${f ? e(f.kind === "NONE" ? "ELIGIBLE" : f.kind) : record.declarations[m] ? "SIGNED" : "AWAITING"}</span></div><details><summary>${f ? "Evidence & relationship" : "Signed disclosure"}</summary><p>${e(record.declarations[m] || "No declaration signed yet.")}</p>${f ? `<blockquote>“${e(f.declaration_quote)}”</blockquote><p><b>Proposal anchor:</b> “${e(f.proposal_quote)}”</p><p>${e(f.reason)}</p>` : ""}</details>${!live && record.eligible.includes(m) ? `<div class="demo-votes">${button("demo-" + i + "-YES", record.votes[m] || "Vote yes", !!record.votes[m] || record.status !== "VOTING", "small")}${button("demo-" + i + "-NO", "Vote no", !!record.votes[m] || record.status !== "VOTING", "small")}${button("demo-" + i + "-ABSTAIN", "Abstain", !!record.votes[m] || record.status !== "VOTING", "small")}</div>` : ""}${record.votes[m] ? `<p class="cast">Recorded vote: ${e(record.votes[m])}</p>` : ""}</article>`;
          })
          .join("")}</div>`
      : `<div class="empty"><span>∅</span><h3>No assumptions.<br>Start with a proposal.</h3><p>Read a published example or create an immutable committee proposal below.</p></div>`
  }</div>
<div class="right-column"><div class="tally-panel"><p class="eyebrow">ELECTORATE / RECALCULATED</p><div class="big-number">${t ? t.n : "—"}<span>/ ${record ? record.members.length : "—"} seats</span></div><p>${record?.findings.length ? "Eligible after consensus recusal" : "Eligibility is locked only after assessment"}</p><div class="tally-grid"><div><b>${t ? t.quorum : "—"}</b><small>Participation quorum</small></div><div><b>${t ? t.required : "—"}</b><small>Yes votes required</small></div><div><b>${t ? t.yes : "—"}</b><small>Yes votes</small></div><div><b>${t ? t.remaining : "—"}</b><small>Eligible votes remaining</small></div></div><div class="ruling">${record?.status === "NO_ELECTORATE" ? "Too few eligible members to open voting." : record && ["PASSED", "REJECTED"].includes(record.status) ? e(record.status) : t?.ready ? "Decisive tally — ready to finalize." : "No final decision recorded."}</div>${button("finalize", "Finalize decisive vote", !record || record.status !== "VOTING" || !t?.ready || (live && !!pending), "primary")}${button("export", "Export evidence JSON", !record, "subtle")}</div>
${live ? `<div class="operate"><h3>Your signed action</h3><p class="hint">${w ? short(w.owner) : "Connect the member wallet."} · statements and votes are public.</p>${field("statement", "Interest declaration", draft.statement, true, "State relevant employment, ownership, family or competing interests. Explicitly disclose when none exist.")}${button("declare", "Sign my declaration", !record || record.status !== "DISCLOSURES" || !w || !record.members.includes(w.owner) || !!record.declarations[w.owner] || !!pending)}${button("assess", "Assess all declarations", !record || record.status !== "DISCLOSURES" || Object.keys(record.declarations).length !== record.members.length || !!pending, "primary")}<div class="actions">${["YES", "NO", "ABSTAIN"].map((v) => button("vote-" + v, v, !record || record.status !== "VOTING" || !w || !record.eligible.includes(w.owner) || !!record.votes[w.owner] || !!pending, "small")).join("")}</div></div>` : `<div class="note-card"><span>THE RULE IS FIXED</span><p>A director benefiting from an appointment sits out. An incomplete disclosure also sits out. Eligible members must meet a two-thirds participation quorum and an absolute majority of eligible seats.</p><small>At least two eligible members are required.</small></div>`}</div></div>
${live ? `<details class="create-box"><summary>Create a new proposal <span>+ IMMUTABLE INPUT</span></summary><div class="creation">${field("title", "Title", draft.title)}${field("proposal", "Exact proposal", draft.proposal, true)}${field("members", "Member wallet addresses (3–7, comma or newline separated)", draft.members, true, "0x…, 0x…, 0x…")}<p class="hint">The proposal and membership cannot be edited. Each address must sign its own declaration. This app records decisions and transfers no funds.</p>${button("propose", "Seal proposal & committee", !!pending, "primary")}</div></details>` : ""}
<details class="limits"><summary>What this record establishes</summary><p>Consensus applies a fixed conflict policy to signed, self-reported statements. It cannot discover undisclosed interests, prove independence of wallet owners, authenticate legal identities or prevent collusion. NONE means no relevant conflict disclosed under this policy. UNCLEAR is excluded, not cleared. This is a committee decision record, not an ethics certification or a payment authorization. Unresponsive members can block disclosure completion or voting. No deadline, replacement or administrator override exists in this release; corrections require a new proposal.</p></details>
</section><footer><span class="wordmark">recuse</span><p>Make the boundary visible.</p><span>BUILT ON GENLAYER · STABLE STUDIONET</span></footer></main></div>`;
  document.querySelectorAll("[data-field]").forEach((el) =>
    el.addEventListener("input", () => {
      if (el.id === "recovery") {
        recovery = el.value;
      } else {
        draft[el.id] = el.value;
        localStorage.setItem(DRAFT, JSON.stringify(draft));
        if (el.id === "address") verified = "";
        if (["address", "owner", "id"].includes(el.id) && mode === "live") {
          record = null;
        }
      }
    }),
  );
  document
    .querySelectorAll("[data-action]")
    .forEach((el) =>
      el.addEventListener("click", () => act(el.dataset.action)),
    );
}
function savePending(p) {
  if (p.hash) pending = p;
  try {
    localStorage.setItem(KEY, JSON.stringify(p));
  } catch (err) {
    throw Error(
      p.hash
        ? "Transaction submitted. Save this hash and resume: " + p.hash
        : "Browser storage unavailable. No wallet request was made.",
    );
  }
  pending = p;
}
async function progress(msg) {
  notice = msg;
  render();
}
async function write(method, args) {
  if (
    method !== "propose" &&
    (!record ||
      record.owner !== draft.owner.toLowerCase() ||
      record.id !== draft.id)
  )
    throw Error("Read the selected proposal again before writing.");
  if (pending) throw Error("Resolve the existing transaction first.");
  await chain.check(w);
  const address = await chain.verify(draft.address);
  verified = address;
  const p = {
    address,
    from: w.owner,
    method,
    args,
    owner: method === "propose" ? w.owner : draft.owner.toLowerCase(),
    id: draft.id,
    hash: "",
    createdAt: new Date().toISOString(),
  };
  savePending(p);
  await progress(
    "Waiting for wallet signature. Do not resubmit if the result is unclear.",
  );
  try {
    const hash = await w.client.writeContract({
      address,
      functionName: method,
      args,
      value: 0n,
      leaderOnly: false,
    });
    savePending({ ...p, hash });
  } catch (err) {
    if (err.code === 4001 || err.cause?.code === 4001) {
      localStorage.removeItem(KEY);
      pending = null;
    }
    throw err;
  }
  await resume();
}
async function resume() {
  mode = "live";
  if (!pending) throw Error("No pending request.");
  if (!pending.hash) {
    const hash = recovery;
    if (!/^0x[\da-f]{64}$/i.test(hash || ""))
      throw Error(
        "Paste the transaction hash from wallet activity. An unknown request remains locked.",
      );
    savePending({ ...pending, hash });
  }
  await progress("Tracking " + short(pending.hash) + " — reads only.");
  const tx = await chain.wait(pending.hash);
  chain.bind(tx, pending);
  lastReceipt = tx;
  if (!success(tx)) {
    if (confirmedFailure(tx)) {
      localStorage.removeItem(KEY);
      pending = null;
      throw Error(
        "Transaction finalized without successful execution and consensus agreement. State was not reported as successful.",
      );
    }
    throw Error("Still pending. Resume tracking; do not resend.");
  }
  if (pending.method === "deploy") {
    const address =
      tx.data?.contract_address || tx.contract_address || tx.to_address;
    await chain.verify(address);
    draft.address = address;
    verified = address;
    localStorage.setItem(DRAFT, JSON.stringify(draft));
  } else {
    record = await chain.read(pending.address, pending.owner, pending.id);
    draft.owner = pending.owner;
    draft.id = pending.id;
    draft.address = pending.address;
    localStorage.setItem(DRAFT, JSON.stringify(draft));
  }
  localStorage.removeItem(KEY);
  pending = null;
  notice =
    "FINALIZED · majority agreement · successful execution · state read back.";
}
async function act(action) {
  if (busy) return;
  try {
    if (action === "example") return example();
    if (["conflict", "clear", "uncertain"].includes(action))
      return example(action);
    if (action === "live") {
      mode = "live";
      record = null;
      notice = "Live mode. Verify a contract and read a proposal.";
      render();
      return;
    }
    if (action.startsWith("demo-")) {
      const [, i, choice] = action.split("-");
      record.votes[M[Number(i)]] = choice;
      notice = "Illustrative vote recorded locally.";
      render();
      return;
    }
    if (action === "export") {
      const blob = new Blob(
        [
          json({
            mode: liveMode(),
            network: 61999,
            contract: mode === "live" ? draft.address : null,
            record,
            receipt: mode === "live" ? lastReceipt : null,
            exportedAt: new Date().toISOString(),
          }),
        ],
        { type: "application/json" },
      );
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "recuse-" + record.id + ".json";
      a.click();
      URL.revokeObjectURL(a.href);
      return;
    }
    if (action === "finalize" && mode === "example") {
      record.status = tally(record).decision;
      notice = "Illustrative decision finalized locally.";
      render();
      return;
    }
    busy = true;
    render();
    if (action === "connect") {
      w = await chain.connect();
      notice = "Wallet connected: " + w.owner;
    } else if (action === "verify") {
      verified = await chain.verify(draft.address);
      notice = "Exact contract source and recuse-1 protocol verified.";
    } else if (action === "read") {
      await chain.verify(draft.address);
      record = await chain.read(draft.address, draft.owner, draft.id);
      notice = "Finalized chain state loaded. Refresh after other members act.";
    } else if (action === "published") {
      const config = await fetch("./deployment.json").then((r) =>
        r.ok ? r.json() : null,
      );
      if (!config?.address)
        throw Error("No finalized public deployment is configured yet.");
      await chain.verify(config.address);
      const r = await chain.read(config.address, config.owner, config.id);
      draft = {
        ...draft,
        address: config.address,
        owner: config.owner,
        id: config.id,
      };
      record = r;
      localStorage.setItem(DRAFT, JSON.stringify(draft));
      notice = "Published example read from finalized chain state.";
    } else if (action === "deploy") {
      if (pending) throw Error("Resolve the existing transaction first.");
      await chain.check(w);
      const p = {
        method: "deploy",
        from: w.owner,
        args: [],
        address: "",
        hash: "",
      };
      savePending(p);
      try {
        savePending({
          ...p,
          hash: await w.client.deployContract({
            code: chain.source,
            args: [],
            leaderOnly: false,
          }),
        });
      } catch (err) {
        if (err.code === 4001 || err.cause?.code === 4001) {
          localStorage.removeItem(KEY);
          pending = null;
        }
        throw err;
      }
      await resume();
    } else if (action === "resume") await resume();
    else if (action === "propose") {
      const members = draft.members
        .split(/[\s,]+/)
        .filter(Boolean)
        .map((x) => x.toLowerCase());
      if (
        members.length < 3 ||
        members.length > 7 ||
        !members.every(addressOK) ||
        new Set(members).size !== members.length
      )
        throw Error("Enter 3–7 distinct valid wallet addresses.");
      await write("propose", [
        draft.id,
        draft.title,
        draft.proposal,
        JSON.stringify(members),
      ]);
    } else if (action === "declare")
      await write("declare", [draft.owner, draft.id, draft.statement]);
    else if (action === "assess")
      await write("assess", [draft.owner, draft.id]);
    else if (action.startsWith("vote-"))
      await write("vote", [draft.owner, draft.id, action.slice(5)]);
    else if (action === "finalize")
      await write("finalize", [draft.owner, draft.id]);
  } catch (err) {
    notice = err.shortMessage || err.message || String(err);
  } finally {
    busy = false;
    render();
  }
}
function liveMode() {
  return mode === "example" ? "ILLUSTRATIVE" : "CHAIN_READBACK";
}
example();
