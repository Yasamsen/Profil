const AdmZip = require("adm-zip");
const { config, gh } = require("./_github");
module.exports = async (req, res) => {
  if (req.method !== "GET") return res.status(405).end("Method not allowed");
  try {
    const { owner, repo } = config();
    const runId = String(req.query.runId || "");
    if (!/^\d{1,20}$/.test(runId)) return res.status(400).end("runId tidak valid.");
    const runResponse = await gh(`/repos/${owner}/${repo}/actions/runs/${runId}`);
    const run = await runResponse.json();
    if (run.status !== "completed" || run.conclusion !== "success") return res.status(409).end("Build belum selesai atau gagal.");
    if (!(run.path || "").endsWith(process.env.GITHUB_WORKFLOW_FILE || "build-apk.yml")) return res.status(403).end("Workflow tidak diizinkan.");
    const artifactsResponse = await gh(`/repos/${owner}/${repo}/actions/runs/${runId}/artifacts`);
    const artifactsData = await artifactsResponse.json();
    const artifact = (artifactsData.artifacts || []).find(a => a.name === "web2apk-apk" && !a.expired);
    if (!artifact) return res.status(404).end("Artifact APK tidak ditemukan atau sudah kedaluwarsa.");
    const zipResponse = await gh(`/repos/${owner}/${repo}/actions/artifacts/${artifact.id}/zip`, { headers: { "Accept": "application/vnd.github+json" } });
    const buffer = Buffer.from(await zipResponse.arrayBuffer());
    const zip = new AdmZip(buffer);
    const entry = zip.getEntries().find(e => e.entryName.toLowerCase().endsWith(".apk") && !e.isDirectory);
    if (!entry) return res.status(404).end("File APK tidak ditemukan di artifact.");
    const apk = entry.getData();
    const filename = (run.display_title || "web2apk").replace(/[^a-zA-Z0-9._-]+/g,"-").slice(0,60) + ".apk";
    res.setHeader("Content-Type","application/vnd.android.package-archive");
    res.setHeader("Content-Disposition",`attachment; filename="${filename}"`);
    res.setHeader("Content-Length",String(apk.length));
    res.setHeader("Cache-Control","private, no-store");
    return res.status(200).send(apk);
  } catch(e) {
    return res.status(e.statusCode || 500).send("Download gagal: " + (e.message || "kesalahan server"));
  }
};