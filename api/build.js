const { config, gh } = require("./_github");
function send(res, status, body) { res.status(status).setHeader("Content-Type","application/json; charset=utf-8").end(JSON.stringify(body)); }
function validPackage(s) { return typeof s === "string" && s.length <= 150 && /^[a-z][a-z0-9_]*(\.[a-z][a-z0-9_]*){2,}$/.test(s); }
function validUrl(s) { try { const u = new URL(s); return (u.protocol === "https:" || u.protocol === "http:") && !!u.hostname && !u.username && !u.password; } catch { return false; } }
module.exports = async (req, res) => {
  if (req.method !== "POST") return send(res, 405, { error: "Gunakan metode POST." });
  try {
    const { owner, repo, workflow } = config();
    let b = req.body;
    if (typeof b === "string") { try { b = JSON.parse(b); } catch { b = {}; } }
    const url = String(b?.url || "").trim();
    const appName = String(b?.appName || "").trim().slice(0, 40);
    const packageName = String(b?.packageName || "").trim();
    const themeColor = String(b?.themeColor || "#31e0bd");
    const permissions = b?.permissions || {};
    if (!validUrl(url)) return send(res, 400, { error: "URL tidak valid. Gunakan URL http:// atau https://." });
    if (!appName) return send(res, 400, { error: "Nama aplikasi wajib diisi." });
    if (!validPackage(packageName)) return send(res, 400, { error: "Package name tidak valid. Gunakan format com.contoh.aplikasi." });
    if (!/^#[0-9a-fA-F]{6}$/.test(themeColor)) return send(res, 400, { error: "Warna harus berupa kode HEX, misalnya #31e0bd." });
    // workflow_dispatch inputs are deliberately bounded before being sent to GitHub.
    const payload = { ref: process.env.GITHUB_REF || "main", inputs: {
      site_url: url.slice(0, 500),
      app_name: appName,
      package_name: packageName,
      theme_color: themeColor,
      camera: permissions.camera ? "true" : "false",
      location: permissions.location ? "true" : "false",
      files: permissions.files ? "true" : "false"
    }};
    await gh(`/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflow)}/dispatches`, {
      method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload)
    });
    // GitHub dispatch is asynchronous; find the newest run shortly after triggering it.
    await new Promise(resolve => setTimeout(resolve, 1200));
    const listRes = await gh(`/repos/${owner}/${repo}/actions/workflows/${encodeURIComponent(workflow)}/runs?per_page=10`);
    const data = await listRes.json();
    const expectedTitle = `APK - ${appName}`;
    const matching = (data.workflow_runs || []).find(run =>
      run.event === "workflow_dispatch" &&
      run.display_title === expectedTitle &&
      Date.now() - Date.parse(run.created_at) < 3 * 60 * 1000
    );
    if (!matching) return send(res, 202, { accepted: true, message: "Workflow terkirim. GitHub perlu waktu untuk membuat run; buka tab Actions untuk melihatnya.", workflowUrl: `https://github.com/${owner}/${repo}/actions/workflows/${workflow}` });
    return send(res, 200, { runId: matching.id, workflowUrl: matching.html_url });
  } catch (e) {
    return send(res, e.statusCode || 500, { error: e.message || "Kesalahan server." });
  }
};