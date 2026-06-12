import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PAGE = 500;

async function fetchAll(entity, query = {}) {
  const all = [];
  let skip = 0;
  while (true) {
    const page = await entity.filter(query, '-created_date', PAGE, skip);
    all.push(...page);
    if (page.length < PAGE) break;
    skip += PAGE;
  }
  return all;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') return Response.json({ error: 'Forbidden' }, { status: 403 });

    const { rows, reactivateUnsubscribed = false, listId } = await req.json();
    if (!Array.isArray(rows) || rows.length === 0) return Response.json({ error: 'No rows to import.' }, { status: 400 });
    if (rows.length > 5000) return Response.json({ error: 'Import limited to 5000 rows per batch.' }, { status: 400 });

    const [existingContacts, suppressions] = await Promise.all([
      fetchAll(base44.asServiceRole.entities.EmailContact),
      fetchAll(base44.asServiceRole.entities.EmailSuppression),
    ]);
    const byEmail = new Map(existingContacts.map((c) => [c.email, c]));
    const suppressedSet = new Set(suppressions.map((s) => s.email));

    const summary = { added: 0, updated: 0, skipped: 0, invalid: 0, suppressed: 0, duplicates: 0 };
    const errors = [];
    const seen = new Set();
    const toCreate = [];
    const affectedIds = [];

    for (const raw of rows) {
      const email = (raw.email || '').trim().toLowerCase();
      if (!EMAIL_RE.test(email)) {
        summary.invalid++;
        if (errors.length < 50) errors.push(`Invalid email: "${raw.email || ''}"`);
        continue;
      }
      if (seen.has(email)) { summary.duplicates++; continue; }
      seen.add(email);

      const fields = {
        firstName: (raw.firstName || '').trim(),
        lastName: (raw.lastName || '').trim(),
        company: (raw.company || '').trim(),
        phone: (raw.phone || '').trim(),
        source: (raw.source || 'import').trim(),
        tags: Array.isArray(raw.tags) ? raw.tags : [],
        customFields: raw.customFields || {},
      };
      fields.fullName = [fields.firstName, fields.lastName].filter(Boolean).join(' ');

      const existing = byEmail.get(email);
      if (existing) {
        if (existing.status === 'suppressed' || suppressedSet.has(email)) {
          summary.suppressed++;
          continue;
        }
        if (existing.status === 'unsubscribed' && !reactivateUnsubscribed) {
          summary.skipped++;
          continue;
        }
        const data = { ...fields, tags: [...new Set([...(existing.tags || []), ...fields.tags])] };
        if (existing.status === 'unsubscribed' && reactivateUnsubscribed) {
          data.status = 'subscribed';
          data.consentStatus = 'opted_in';
          data.consentTimestamp = new Date().toISOString();
        }
        await base44.asServiceRole.entities.EmailContact.update(existing.id, data);
        affectedIds.push(existing.id);
        summary.updated++;
      } else if (suppressedSet.has(email)) {
        // Suppressed addresses stay suppressed — create record so it's visible, but never sendable
        toCreate.push({ email, ...fields, status: 'suppressed', consentStatus: raw.consentStatus || 'imported', unsubscribeToken: crypto.randomUUID() });
        summary.suppressed++;
      } else {
        toCreate.push({
          email, ...fields,
          status: 'subscribed',
          consentStatus: raw.consentStatus || 'imported',
          consentSource: raw.consentSource || 'csv_import',
          consentTimestamp: new Date().toISOString(),
          unsubscribeToken: crypto.randomUUID(),
        });
        summary.added++;
      }
    }

    let created = [];
    if (toCreate.length > 0) {
      created = await base44.asServiceRole.entities.EmailContact.bulkCreate(toCreate);
      affectedIds.push(...(created || []).map((c) => c.id).filter(Boolean));
    }

    // Optionally add imported/updated contacts to a list
    if (listId && affectedIds.length > 0) {
      const memberships = await fetchAll(base44.asServiceRole.entities.EmailListMembership, { listId });
      const memberSet = new Set(memberships.map((m) => m.contactId));
      const allById = new Map([...existingContacts, ...(created || [])].map((c) => [c.id, c]));
      const newMemberships = affectedIds
        .filter((id) => !memberSet.has(id))
        .map((id) => ({ listId, contactId: id, contactEmail: allById.get(id)?.email || '' }));
      if (newMemberships.length > 0) {
        await base44.asServiceRole.entities.EmailListMembership.bulkCreate(newMemberships);
        const list = await base44.asServiceRole.entities.EmailList.get(listId);
        await base44.asServiceRole.entities.EmailList.update(listId, {
          contactCount: (list.contactCount || 0) + newMemberships.length,
          activeContactCount: (list.activeContactCount || 0) + newMemberships.length,
        });
      }
    }

    await base44.asServiceRole.entities.EmailAutomationLog.create({
      eventType: 'contacts_imported', status: 'success',
      message: `CSV import by ${user.email}: ${summary.added} added, ${summary.updated} updated, ${summary.skipped} skipped, ${summary.invalid} invalid, ${summary.suppressed} suppressed, ${summary.duplicates} duplicates`,
      metadata: summary,
    });

    return Response.json({ success: true, summary, errors });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});