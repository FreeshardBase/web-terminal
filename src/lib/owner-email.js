// Helpers for the owner's address, shared by the Settings section that edits it
// and the screen that confirms it.

const CONFIRM_EMAIL_PARAM = 'confirm_email';

/**
 * The confirmation token carried by the current document URL, or null.
 *
 * The controller builds the link in the confirmation mail as
 * `https://<shard-domain>/?confirm_email=<token>`, so the token sits in the
 * document query string — not in the hash route that vue-router parses into
 * `$route.query`.
 */
export function readConfirmEmailToken(search) {
    const token = new URLSearchParams(search || '').get(CONFIRM_EMAIL_PARAM);
    return token || null;
}

/**
 * Which of the three address states a user row is in.
 *
 * There is no verified flag: `email` is verified by definition and
 * `pending_email` is an unverified candidate, so the pair alone says everything.
 */
export function ownerEmailState(user) {
    if (user && user.pending_email) return 'pending';
    if (user && user.email) return 'set';
    return 'none';
}

/**
 * Whether the shard stored the address but could not have the mail sent.
 *
 * `PATCH /protected/users/me` answers 502 when the controller could not be
 * reached, and the candidate is in `pending_email` regardless. Rendering that as
 * a failed save would tell the owner the opposite of what happened.
 */
export function isDeliveryFailure(error) {
    return !!(error && error.response && error.response.status === 502);
}

export function errorDetail(error, fallback) {
    const data = error && error.response && error.response.data;
    const detail = data && (data.detail || data.message);
    // FastAPI answers a validation error with a list of per-field problems
    if (Array.isArray(detail)) {
        return detail.map(d => d.msg || String(d)).join('; ') || fallback;
    }
    return detail || (error && error.message) || fallback;
}
