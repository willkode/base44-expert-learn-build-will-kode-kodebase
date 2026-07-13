import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import JSZip from 'npm:jszip@3.10.1';

const CONNECTOR_ID = '6a550f001ae3ab15be249828';
const MAX_FILES = 2500;
const MAX_TEXT_BYTES = 6000000;
const TEXT_EXT = /\.(js|jsx|ts|tsx|json|jsonc|md|html|css|yml|yaml|toml|env|txt)$/i;
const STAGES = ['Connecting to repository','Reading application structure','Cataloging entities','Cataloging backend functions','Detecting authentication dependencies','Detecting integrations','Detecting automations','Detecting realtime features','Reviewing storage usage','Reviewing payment functionality','Checking security risks','Generating migration complexity score','Preparing report preview'];
const secretPatterns = [
  { type: 'Generic API key', re: /(?:api[_-]?key|secret|token|password)\s*[:=]\s*["'`]([^"'`\s]{12,})/gi },
  { type: 'Private key', re: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g },
  { type: 'AWS access key', re: /AKIA[0-9A-Z]{16}/g },
  { type: 'GitHub token', re: /gh[pousr]_[A-Za-z0-9_]{20,}/g },
];
const integrationMap = { Stripe:/stripe/i, Square:/square/i, Resend:/resend/i, SendGrid:/sendgrid/i, Postmark:/postmark/i, Twilio:/twilio/i, OpenAI:/openai/i, Anthropic:/anthropic|claude/i, Google:/googleapis|google_/i, Slack:/slack/i, GitHub:/github/i, Cloudflare:/cloudflare/i, 'Amazon S3':/\bs3\b|aws-sdk/i, Supabase:/supabase/i, Firebase:/firebase/i };

const stripJsonc = (s) => s.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
const unique = (a) => [...new Set(a.filter(Boolean))];

async function loadGithub(base44, project) {
  const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection(CONNECTOR_ID);
  const headers = { Authorization: `Bearer ${accessToken}`, Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' };
  const ref = await fetch(`https://api.github.com/repos/${encodeURIComponent(project.github_owner)}/${encodeURIComponent(project.github_repository)}/git/ref/heads/${encodeURIComponent(project.github_branch)}`, { headers });
  if (!ref.ok) throw new Error(ref.status === 404 ? 'Repository or branch is missing or no longer authorized.' : 'GitHub connection failed.');
  const refData = await ref.json();
  const sha = refData.object.sha;
  const treeRes = await fetch(`https://api.github.com/repos/${encodeURIComponent(project.github_owner)}/${encodeURIComponent(project.github_repository)}/git/trees/${sha}?recursive=1`, { headers });
  if (!treeRes.ok) throw new Error('Could not read repository structure.');
  const treeData = await treeRes.json();
  if (treeData.truncated) throw new Error('Repository tree is too large for automatic assessment and requires manual review.');
  const candidates = (treeData.tree || []).filter((f) => f.type === 'blob' && TEXT_EXT.test(f.path) && !/(node_modules|dist|build|\.git|coverage)\//.test(f.path)).slice(0, MAX_FILES);
  let used = 0;
  const files = [];
  for (let i = 0; i < candidates.length; i += 12) {
    const batch = candidates.slice(i, i + 12);
    const loaded = await Promise.all(batch.map(async (f) => {
      if (used >= MAX_TEXT_BYTES || (f.size || 0) > 500000) return null;
      const r = await fetch(f.url, { headers });
      if (!r.ok) return null;
      const data = await r.json();
      const content = data.encoding === 'base64' ? atob((data.content || '').replace(/\n/g, '')) : data.content || '';
      used += content.length;
      return { path: f.path, content: content.slice(0, 500000), size: f.size || content.length };
    }));
    files.push(...loaded.filter(Boolean));
  }
  return { files, sha };
}

async function loadZip(base44, project) {
  const signed = await base44.asServiceRole.integrations.Core.CreateFileSignedUrl({ file_uri: project.zip_file_uri, expires_in: 300 });
  const response = await fetch(signed.signed_url);
  if (!response.ok) throw new Error('Could not read the uploaded ZIP file.');
  const zip = await JSZip.loadAsync(await response.arrayBuffer());
  const entries = Object.values(zip.files).filter((f) => !f.dir && TEXT_EXT.test(f.name) && !/(node_modules|dist|build|\.git|coverage)\//.test(f.name)).slice(0, MAX_FILES);
  let used = 0;
  const files = [];
  for (const entry of entries) {
    if (used >= MAX_TEXT_BYTES) break;
    const content = await entry.async('string');
    used += content.length;
    files.push({ path: entry.name, content: content.slice(0, 500000), size: content.length });
  }
  return { files, sha: `zip-${Date.now()}` };
}

function inspect(files) {
  const all = files.map((f) => `\n/* FILE:${f.path} */\n${f.content}`).join('\n');
  const byPath = new Map(files.map((f) => [f.path, f.content]));
  const entityFiles = files.filter((f) => /^base44\/entities\/.*\.jsonc?$/i.test(f.path));
  const entities = entityFiles.map((f) => {
    try {
      const schema = JSON.parse(stripJsonc(f.content));
      const props = schema.properties || {};
      const referenced = unique([...all.matchAll(new RegExp(`(?:entities\\.${schema.name}|${schema.name})[^\\n]{0,120}\\.([A-Za-z_][A-Za-z0-9_]*)`, 'g'))].map((m) => m[1]));
      return { name: schema.name || f.path.split('/').pop().replace(/\.jsonc?$/i,''), file: f.path, fields: Object.keys(props), required: schema.required || [], enums: Object.entries(props).filter(([,v]) => v.enum).map(([k,v]) => ({ field:k, values:v.enum })), relationships: Object.keys(props).filter((k) => /(_id|Id)$/.test(k)), ownership_fields: Object.keys(props).filter((k) => /^(user|owner|created_by)(_id|Id)?$|user_id|owner_id/i.test(k)), status_fields: Object.keys(props).filter((k) => /status/i.test(k)), built_in_fields: ['id','created_date','updated_date','created_by_id'], undeclared_references: referenced.filter((x) => !props[x] && !['id','created_date','updated_date','created_by_id'].includes(x)), difficulty: Object.keys(props).length > 25 || schema.rls ? 'Moderate' : 'Low' };
    } catch { return { name: f.path, file: f.path, parse_error: true, difficulty: 'High' }; }
  });
  const fnFiles = files.filter((f) => /^base44\/functions\/[^/]+\/entry\.(ts|js)$/i.test(f.path));
  const functions = fnFiles.map((f) => ({ name: f.path.split('/')[2], file: f.path, type: /webhook|signature|x-.*signature/i.test(f.content) ? 'webhook' : /cron|scheduled|automation/i.test(f.content) ? 'scheduled_or_automation' : /role\s*!==?\s*['"]admin|Forbidden/i.test(f.content) ? 'administrative' : 'user_invoked', integrations: unique(Object.entries(integrationMap).filter(([,r]) => r.test(f.content)).map(([n]) => n)), entities: unique([...f.content.matchAll(/entities\.([A-Za-z0-9_]+)/g)].map((m) => m[1])), service_role: /asServiceRole/.test(f.content), env_vars: unique([...f.content.matchAll(/Deno\.env\.get\(["']([^"']+)/g)].map((m) => m[1])), difficulty: f.content.length > 10000 || /webhook|asServiceRole|integrations/i.test(f.content) ? 'High' : f.content.length > 3500 ? 'Moderate' : 'Low' }));
  const auth = unique([/loginViaEmailPassword|auth\.login|email.*password/is.test(all) && 'Email/password', /verifyOtp|resendOtp/i.test(all) && 'OTP verification', /resetPassword/i.test(all) && 'Password reset', /loginWithProvider\(["']google/i.test(all) && 'Google OAuth', /loginWithProvider\(["']microsoft/i.test(all) && 'Microsoft OAuth', /loginWithProvider\(["']facebook/i.test(all) && 'Facebook OAuth', /loginWithProvider\(["']apple/i.test(all) && 'Apple OAuth', /ProtectedRoute/.test(all) && 'Protected routes', /AdminRoute|role\s*===?\s*["']admin/.test(all) && 'Admin role protection', /inviteUser/.test(all) && 'Invitation workflow']);
  const integrations = Object.entries(integrationMap).filter(([,r]) => r.test(all)).map(([name]) => name);
  const features = unique([/\.subscribe\(/.test(all) && 'Realtime', /agents\.|createConversation/.test(all) && 'AI agents', /InvokeLLM|GenerateImage|openai|anthropic/i.test(all) && 'AI/LLM', /UploadPrivateFile|CreateFileSignedUrl/.test(all) && 'Private files', /UploadFile/.test(all) && 'File storage', /payment|checkout|stripe|square/i.test(all) && 'Payments', /subscription/i.test(all) && 'Subscriptions', /chat|message/i.test(all) && 'Chat/messaging', /analytics|gtag/i.test(all) && 'Analytics', /react-native|capacitor|mobile/i.test(all) && 'Mobile-specific']);
  const automations = functions.filter((f) => f.type === 'scheduled_or_automation').length + [...all.matchAll(/create_automation|automation_type/g)].length;
  const findings = [];
  for (const f of files) {
    for (const p of secretPatterns) {
      p.re.lastIndex = 0;
      let m;
      while ((m = p.re.exec(f.content)) && findings.length < 100) findings.push({ category: 'Secrets', severity: p.type === 'Private key' ? 'Critical' : 'High', title: `${p.type} may be hardcoded`, description: 'A sensitive credential pattern was detected. The value is redacted.', file_path: f.path, line_reference: String(f.content.slice(0,m.index).split('\n').length), detected_pattern: p.type, redacted_value: '[REDACTED]', recommendation: 'Move the credential to secure environment variables and rotate it if it was committed.', migration_phase: 'Before migration', estimated_difficulty: 'Moderate', requires_manual_review: true });
    }
    if (/asServiceRole/.test(f.content) && !/auth\.me\(|isAuthenticated/.test(f.content)) findings.push({ category:'Authorization', severity:'Critical', title:'Service-role access may lack authentication', description:'Elevated data access was found without an obvious authentication check.', file_path:f.path, recommendation:'Authenticate the caller and verify authorization before service-role access.', migration_phase:'Before migration', estimated_difficulty:'High', requires_manual_review:true });
    if (/metadata\.(?:userId|user_id)|body\.(?:userId|user_id)/.test(f.content) && /asServiceRole/.test(f.content)) findings.push({ category:'Authorization', severity:'High', title:'Frontend-provided user identifier may be trusted', description:'Elevated logic appears to use a request-provided user identifier.', file_path:f.path, recommendation:'Derive identity from the authenticated session and verify ownership.', migration_phase:'Before migration', estimated_difficulty:'Moderate', requires_manual_review:true });
    if (/webhook/i.test(f.path) && !/signature|hmac|constructEvent/i.test(f.content)) findings.push({ category:'Webhooks', severity:'High', title:'Webhook signature verification not detected', description:'A webhook handler was found without recognizable signature validation.', file_path:f.path, recommendation:'Verify provider signatures against the raw request body before processing.', migration_phase:'Before migration', estimated_difficulty:'Moderate', requires_manual_review:true });
  }
  const configFiles = ['package.json','vite.config.js','src/api/base44Client.js','src/api/base44Client.ts'].filter((p) => byPath.has(p));
  const envVars = unique([...all.matchAll(/(?:Deno\.env\.get\(["']|import\.meta\.env\.)([A-Z0-9_]+)/g)].map((m) => m[1]));
  const roles = unique([...all.matchAll(/role\s*(?:===?|!==?|:)\s*["']([^"']+)/g)].map((m) => m[1]));
  const oauthProviders = auth.filter((a) => /OAuth/.test(a));
  return { entities, functions, auth, integrations, features, automations, findings, configFiles, envVars, roles, oauthProviders, hardcodedBase44Urls: unique([...all.matchAll(/https?:\/\/[^\s"']*base44[^\s"']*/gi)].map((m) => '[REDACTED BASE44 URL]')) };
}

Deno.serve(async (req) => {
  let base44, project, scan;
  try {
    base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });
    const { project_id } = await req.json();
    const ownedProjects = await base44.asServiceRole.entities.MigrationProject.filter({ user_id: user.id }, '-updated_date', 500);
    project = ownedProjects.find((p) => p.id === project_id);
    if (!project || !project.authorization_confirmed) return Response.json({ error: 'Authorized project not found.' }, { status: 404 });
    if (project.scan_status === 'scanning') return Response.json({ error: 'A scan is already running.' }, { status: 409 });
    scan = await base44.asServiceRole.entities.RepositoryScan.create({ project_id, user_id: user.id, status:'scanning', branch:project.github_branch || 'ZIP', started_at:new Date().toISOString(), scanner_version:'1.0.0' });
    const setStage = async (index) => base44.asServiceRole.entities.MigrationProject.update(project_id, { scan_status:'scanning', scan_stage:STAGES[index], scan_progress:Math.round(index / STAGES.length * 100), scan_error:'' });
    await setStage(0);
    const loaded = project.repository_source === 'github' ? await loadGithub(base44, project) : await loadZip(base44, project);
    if (!loaded.files.length) throw new Error('No supported source files were found in this repository.');
    await setStage(1);
    const inventory = inspect(loaded.files);
    for (let i = 2; i < 12; i++) await setStage(i);
    const critical = inventory.findings.filter((f) => f.severity === 'Critical').length;
    const high = inventory.findings.filter((f) => f.severity === 'High').length;
    const points = inventory.entities.length * 2 + inventory.functions.length * 3 + inventory.integrations.length * 4 + inventory.automations * 3 + inventory.features.length * 2 + critical * 8 + high * 4;
    const complexity = points >= 100 ? 'Enterprise' : points >= 55 ? 'High' : points >= 22 ? 'Moderate' : 'Low';
    const readiness = Math.max(20, Math.min(95, 92 - critical * 12 - high * 5 - Math.floor(points / 12)));
    const estimate = Math.max(200000, 200000 + Math.max(0, inventory.entities.length - 5) * 7500 + inventory.functions.length * 12500 + inventory.integrations.length * 15000 + inventory.automations * 10000 + (inventory.features.includes('Realtime') ? 25000 : 0) + (inventory.features.includes('Payments') ? 30000 : 0));
    await setStage(12);
    await base44.asServiceRole.entities.RepositoryScan.update(scan.id, { status:'completed', commit_sha:loaded.sha, completed_at:new Date().toISOString(), files_reviewed:loaded.files.length, entities_detected:inventory.entities.length, functions_detected:inventory.functions.length, integrations_detected:inventory.integrations.length, auth_methods_detected:inventory.auth, automations_detected:inventory.automations, realtime_detected:inventory.features.includes('Realtime'), payment_features_detected:inventory.features.includes('Payments'), security_findings_count:inventory.findings.length, critical_findings_count:critical, high_findings_count:high, raw_inventory:inventory, scan_summary:{ points, complexity, readiness, estimate } });
    if (inventory.findings.length) await base44.asServiceRole.entities.ScanFinding.bulkCreate(inventory.findings.map((f) => ({ ...f, project_id, scan_id:scan.id })));
    const important = inventory.findings.slice(0,5).map((f) => ({ severity:f.severity, title:f.title, recommendation:f.recommendation }));
    if (important.length < 3) important.push({ severity:'Informational', title:'Compatibility-layer migration is feasible', recommendation:'Preserve frontend SDK interfaces while replacing backend services in phases.' });
    const preview = { application_name:project.application_name, repository:project.repository_source === 'github' ? `${project.github_owner}/${project.github_repository}` : 'Authorized ZIP upload', branch:project.github_branch || 'ZIP snapshot', files_reviewed:loaded.files.length, entities_detected:inventory.entities.length, functions_detected:inventory.functions.length, integrations_detected:inventory.integrations.length, auth_methods:inventory.auth, realtime:inventory.features.includes('Realtime'), payments:inventory.features.includes('Payments'), automations:inventory.automations, complexity, readiness_score:readiness, important_findings:important.slice(0,5), target_architecture:inventory.features.includes('Realtime') || inventory.features.includes('Payments') ? 'Supabase or a custom Node.js/PostgreSQL backend with managed authentication, storage, realtime, background jobs, monitoring, and provider-specific payment webhooks.' : 'Supabase-backed architecture with managed PostgreSQL, authentication, storage, and server functions.', starting_estimate:estimate };
    const prior = await base44.asServiceRole.entities.MigrationReport.filter({ project_id, user_id:user.id }, '-report_version', 1);
    const report = await base44.asServiceRole.entities.MigrationReport.create({ project_id, scan_id:scan.id, user_id:user.id, status:'preview_ready', preview_summary:preview, readiness_score:readiness, complexity_level:complexity, recommended_stack:preview.target_architecture, estimated_timeline:complexity === 'Enterprise' ? '12–20 weeks' : complexity === 'High' ? '8–14 weeks' : complexity === 'Moderate' ? '6–10 weeks' : '4–7 weeks', access_unlocked:false, report_version:(prior[0]?.report_version || 0)+1, generated_at:new Date().toISOString() });
    await base44.asServiceRole.entities.MigrationProject.update(project_id, { scan_status:'completed', scan_progress:100, scan_stage:'Preview ready', readiness_score:readiness, complexity_level:complexity, manual_review_required:complexity === 'Enterprise' || critical > 0, lead_status:'Report Ready' });
    await base44.asServiceRole.entities.MigrationAuditLog.create({ user_id:user.id, project_id, action:'scan_completed', entity_type:'RepositoryScan', entity_id:scan.id, metadata:{ report_id:report.id, complexity, readiness } });
    await base44.functions.invoke('migrationNotify', { project_id, event:'scan_completed' });
    return Response.json({ success:true, report_id:report.id, preview });
  } catch (error) {
    if (base44 && scan) await base44.asServiceRole.entities.RepositoryScan.update(scan.id, { status:'failed', completed_at:new Date().toISOString(), error_message:error.message });
    if (base44 && project) {
      await base44.asServiceRole.entities.MigrationProject.update(project.id, { scan_status:'failed', scan_error:error.message, scan_stage:'Scan failed' });
      try { await base44.functions.invoke('migrationNotify', { project_id:project.id, event:'scan_failed' }); } catch (_) { /* preserve original scan error */ }
    }
    return Response.json({ error:error.message }, { status:500 });
  }
});