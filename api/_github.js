function config() {
  const owner = process.env.GITHUB_OWNER;
  const repo = process.env.GITHUB_REPO;
  const token = process.env.GITHUB_TOKEN;
  const workflow = process.env.GITHUB_WORKFLOW_FILE || "build-apk.yml";
  if (!owner || !repo || !token) {
    const err = new Error("Konfigurasi belum lengkap. Set GITHUB_OWNER, GITHUB_REPO, dan GITHUB_TOKEN di Vercel Environment Variables.");
    err.statusCode = 500;
    throw err;
  }
  return { owner, repo, token, workflow };
}
async function gh(path, options = {}) {
  const { token } = config();
  const response = await fetch("https://api.github.com" + path, {
    ...options,
    headers: {
      "Accept": "application/vnd.github+json",
      "Authorization": `Bearer ${token}`,
      "X-GitHub-Api-Version": "2022-11-28",
      ...(options.headers || {})
    }
  });
  if (!response.ok) {
    const body = await response.text();
    const err = new Error(`GitHub API (${response.status}): ${body.slice(0, 500)}`);
    err.statusCode = response.status;
    throw err;
  }
  return response;
}
module.exports = { config, gh };