const functions = require('firebase-functions/v1');
const admin = require('firebase-admin');
const crypto = require('node:crypto');

admin.initializeApp();
const db = admin.firestore();

const SITE = 'https://www.buzzwin.com';

// Deliberately permissive but not useless: catches typos and obvious junk
// without pretending to validate deliverability, which only sending can do.
const LOOKS_LIKE_EMAIL = /^[^\s@]+@[^\s@.]+\.[^\s@]{2,}$/;

const normalise = (email) => String(email || '').trim().toLowerCase();

// The address is the identity, but it isn't the document id: hashing keeps
// the key out of the id space (no charset surprises) and means a listing of
// ids leaks nothing.
const idFor = (email) => crypto.createHash('sha256').update(email).digest('hex').slice(0, 32);

const redirect = (res, path) => res.redirect(303, `${SITE}${path}`);

exports.subscribe = functions
  .region('us-central1')
  .https.onRequest(async (req, res) => {
    if (req.method !== 'POST') {
      return redirect(res, '/');
    }

    // Honeypot. A real person never sees this field, so anything in it is a
    // bot. Answer as though it worked rather than revealing the check.
    if (String(req.body?.website || '').trim() !== '') {
      return redirect(res, '/subscribed');
    }

    const email = normalise(req.body?.email);

    if (!LOOKS_LIKE_EMAIL.test(email) || email.length > 254) {
      return redirect(res, '/subscribe-failed');
    }

    try {
      const ref = db.collection('subscribers').doc(idFor(email));
      const existing = await ref.get();

      if (existing.exists) {
        // Already on the list. Record the re-submission, keep the original
        // consent timestamp: that timestamp is the evidence of consent and
        // must not be overwritten.
        await ref.update({ lastSubmittedAt: admin.firestore.FieldValue.serverTimestamp() });
        return redirect(res, '/subscribed');
      }

      await ref.set({
        email,
        status: 'subscribed',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        lastSubmittedAt: admin.firestore.FieldValue.serverTimestamp(),
        // Whatever sender this list is eventually exported to will ask how and
        // where consent was given. Captured now because it cannot be
        // reconstructed later.
        consent: {
          method: 'web-form',
          page: String(req.get('referer') || '').slice(0, 300) || null
        },
        // Set if this subscriber ever becomes a Firebase Auth user. Linking is
        // an invitation they accept, never something done on their behalf.
        userId: null
      });

      return redirect(res, '/subscribed');
    } catch (err) {
      functions.logger.error('subscribe failed', { message: err?.message });
      return redirect(res, '/subscribe-failed');
    }
  });
