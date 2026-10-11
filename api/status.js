const { config, gh } = require("./_github");
function send(res, status, body) { res.status(status).setHeader("Content-Type","application/json; charset=utf-8").end(JSON.stringify(body)); }
module.exports = async (req, res) => {
  if (req.method !== "GET") return send(res,405,{error:"Gunakan metode GET."});
  try {
    const { owner, repo } = config();
    const runId = String(req.query.runId || "");
    if (!/^\d{1,20}$/.test(runId)) return send(res,400,{error:"runId tidak valid."});
    const response = await gh(`/repos/${owner}/${repo}/actions/runs/${runId}`);
    const run = await response.json();
    if (run.path && !run.path.endsWith(process.env.GITHUB_WORKFLOW_FILE || "build-apk.yml")) {
      return send(res,403,{error:"Run bukan workflow build yang diizinkan."});
    }
    return send(res,200,{runId:run.id,status:run.status,conclusion:run.conclusion,workflowUrl:run.html_url});
  } catch(e) { return send(res,e.statusCode || 500,{error:e.message || "Tidak bisa membaca status build."}); }
};