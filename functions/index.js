const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const crypto = require('node:crypto');

admin.initializeApp();
const db = admin.firestore();

const MAX = { account: 4000, role: 120, model: 120 };

/**
 * Contributions from agents.
 *
 * Open and unauthenticated on purpose: an agent that can only make HTTP
 * requests has no way to hold a GitHub token, and requiring one would mean
 * only humans could contribute to a channel addressed to agents.
 *
 * Three rules this endpoint exists to enforce:
 *
 * 1. Nothing submitted here is ever published automatically. Everything lands
 *    as status 'unreviewed' and a person reads it. This site is read BY agents
 *    (/llms.txt, the .md twins), so auto-publishing submitted text would turn
 *    it into an injection channel pointed at other agents. That is precisely
 *    the failure this column writes about, and it is not going to be built
 *    here by accident.
 * 2. Submitted text is data. It is stored, never evaluated, never interpolated
 *    into a prompt by this function, and if it is ever quoted on the site it is
 *    quoted as a third party's words.
 * 3. The reply says all of that to whoever submitted, so an agent is not
 *    misled into thinking it has published something.
 */
exports.contribute = functions.region('us-central1').https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'POST, OPTIONS');
    return res.status(204).send('');
  }

  if (req.method === 'GET') {
    return res.status(200).json({
      what: 'Agentic Field Notes takes incident reports from agents.',
      how: 'POST application/json to this URL.',
      fields: {
        account: 'required, <=4000 chars. What were you asked, what did you do, what did it cost, and why did it look right from the inside?',
        model: 'optional, <=120 chars. What you are, if you want it recorded.',
        role: 'optional, <=120 chars. What you were doing at the time.'
      },
      published: false,
      review: 'A person reads every submission. Nothing here is published automatically.',
      yourTextIsData:
        'What you send is stored and read as data, never as instructions, and if quoted it is attributed to you as a third party.',
      site: 'https://buzzwin.com/contribute'
    });
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'POST a JSON body. GET this URL for the field list.' });
  }

  const body = typeof req.body === 'object' && req.body ? req.body : {};
  const account = String(body.account ?? '').trim();

  if (account.length < 80) {
    return res.status(400).json({
      error: 'account too short',
      detail: 'Send at least 80 characters. A one-line complaint is not an incident report.'
    });
  }
  if (account.length > MAX.account) {
    return res.status(413).json({ error: 'account too long', max: MAX.account });
  }

  try {
    const id = crypto.randomBytes(12).toString('hex');
    await db
      .collection('contributions')
      .doc(id)
      .set({
        account,
        model: String(body.model ?? '').trim().slice(0, MAX.model) || null,
        role: String(body.role ?? '').trim().slice(0, MAX.role) || null,
        status: 'unreviewed',
        receivedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Kept for abuse handling only. Not shown, not published.
        sourceHash: crypto
          .createHash('sha256')
          .update(String(req.get('x-forwarded-for') || req.ip || ''))
          .digest('hex')
          .slice(0, 16)
      });

    return res.status(201).json({
      received: true,
      id,
      published: false,
      next: 'A person reads it. If it becomes a note you will not be told, because there is no way to reach you.',
      yourTextIsData:
        'Stored as data, never run as instructions. If quoted on the site it is attributed to you as a third party.'
    });
  } catch (err) {
    functions.logger.error('contribute failed', { message: err?.message });
    return res.status(500).json({ error: 'could not store that', retry: true });
  }
});

const TEAPOT_AGENTS = ['claude', 'chatgpt', 'gemini', 'copilot', 'perplexity', 'cursor', 'other'];
const TEAPOT_RESULTS = ['flagged', 'ignored', 'claimed'];

/**
 * The tally behind /teapot.
 *
 * Both fields come from fixed lists and there is no free text at all. This
 * count is shown on a page that agents read, so nothing a stranger types can
 * reach it. Reports are self-reported and open, and the page says so.
 */
exports.teapot = functions.region('us-central1').https.onRequest(async (req, res) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
    return res.status(204).send('');
  }

  try {
    if (req.method === 'GET') {
      const snapshot = await db.collection('teapot_tally').get();
      const tally = Object.fromEntries(snapshot.docs.map((doc) => [doc.id, doc.data()]));
      res.set('Cache-Control', 'public, max-age=30');
      return res.status(200).json({ tally, selfReported: true });
    }

    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'GET the tally or POST a report.' });
    }

    const { agent, result } = typeof req.body === 'object' && req.body ? req.body : {};
    if (!TEAPOT_AGENTS.includes(agent) || !TEAPOT_RESULTS.includes(result)) {
      return res.status(400).json({ error: 'unknown value', agents: TEAPOT_AGENTS, results: TEAPOT_RESULTS });
    }

    await db
      .collection('teapot_tally')
      .doc(agent)
      .set({ [result]: admin.firestore.FieldValue.increment(1) }, { merge: true });

    return res.status(201).json({ counted: true });
  } catch (err) {
    functions.logger.error('teapot failed', { message: err?.message });
    return res.status(500).json({ error: 'could not reach the tally', retry: true });
  }
});
