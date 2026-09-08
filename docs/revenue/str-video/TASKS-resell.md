# Version B: creator kit tasks

> Implements [SPEC-resell.md](./SPEC-resell.md). Compartmentalized, sequenced tasks. **Version B is
> gated on Version A proof (SPEC-resell §7): tasks B1-B5 build the asset skeleton and may proceed
> now. Tasks B6-B8 (publish, price, market with earnings language) are BLOCKED until A has ≥3 real
> documented paid deliveries and a substantiated economics readout.** No earnings claim may appear in
> any asset before that gate clears.

**Total tasks:** 8 · **Critical path:** B1 → B2 → B3 → B4 → B5 → **[A-proof gate]** → B6 → B7 → B8
**Parallelizable:** B2, B3, B4 can run concurrently once B1 sets the outline.

---

### Task B1: Curriculum outline + compliance frame

**Type:** content, planning · **Depends on:** Version-A SPEC (for accuracy) · **Complexity:** moderate

Produce the module map (source → sample → outreach → close → deliver → retainer), the "definition of
done" per module, and the compliance frame that governs every asset: no earnings claims, compliant
outreach only, 18+/guardian rule, honest positioning (marketing content, not Airbnb-conversion).

**Done when:** an outline exists with a compliance checklist that later tasks must pass. The outline
teaches only the compliant pipeline (no scraping/spam).

---

### Task B2: Playbook / course content

**Type:** content · **Depends on:** B1 · **Complexity:** complex

Write the self-serve playbook from the Version A SOP for a beginner solo creator.
Include checklists, screenshots, and step gates. Exclude any "$X/month" language.

**Done when:** every module passes the B1 compliance checklist. A reviewer must check for earnings claims and prohibited tactics.

---

### Task B3: Prompt + template pack

**Type:** content, code · **Depends on:** B1 · **Complexity:** moderate

Assemble the prompt pack, tool-setup guides (exact tool + settings, versioned/dated), outreach templates with CAN-SPAM review fields, Stripe + intake templates, QC checklist, and the
buyer usage guide. All original or properly licensed.

**Done when:** the pack is complete, each template carries its compliance fields, and tool guides are
dated with a stated update cadence.

---

### Task B4: Delivery platform + policy configuration

**Type:** infrastructure · **Depends on:** B1 · **Complexity:** moderate

Configure the creator-commerce host (Whop/Gumroad/Skool): product tiers, **refund policy**, clear/
conspicuous **income disclaimer**, **18+ checkout gate**, and a **guardian pathway** for under-18s.
No live pricing/publish yet.

**Done when:** the draft storefront contains all policies and the age/guardian gate. Publishing remains off.

---

### Task B5: Optional sample generator (deferred)

**Type:** code · **Depends on:** Version-A Task A4 (`VideoProvider`), B1 · **Complexity:** complex

Build a hosted wrapper for one labeled demo clip from uploaded photos. Require documented rights and consent for this use.
Reuse the Version A `VideoProvider`. Limit requests and apply the disclosure label.

**Done when:** a user can self-serve one labeled sample from their own uploaded photos. The service enforces abuse limits and requires asset permission. (Deferrable without blocking B6-B8.)

---

### Task B6: Proof integration: **GATED on Version A**

**Type:** content · **Depends on:** B2, B4, and Version-A ≥3 documented paid deliveries + economics readout · **Complexity:** moderate

Add case studies only with permission and source records. Review typical-results evidence separately.
Do not treat three deliveries or a disclaimer as proof of typical earnings.

**Done when:** each proposed results statement has suitable evidence, required permission, and clear limits.
A reviewer checks the claim and applicable testimonial requirements before publication.

---

### Task B7: Go-to-market content: **GATED on B6**

**Type:** content · **Depends on:** B6 · **Complexity:** moderate

Prepare TikTok, YouTube, and Instagram launch copy and sample-generator pages, with evidence for each product or results claim. Any outward posting still passes the operator-approval gate.

**Done when:** a reviewer checks the launch draft against the compliance requirements. Every post still requires human approval.

---

### Task B8: Launch checklist + go decision: **GATED**

**Type:** ops · **Depends on:** B4, B6, B7 · **Complexity:** simple

Assemble the final launch checklist (policies live, gate active, proof integrated, disclaimers
present, refund flow tested) and a one-page go-decision for the operator. Flip publishing/pricing
live only on explicit human approval.

**Done when:** the checklist is green except the human go decision. Publishing remains off until the
operator approves. Product stays `built_unverified` until first real sale.
