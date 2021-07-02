export default (data: any = {}) => {
  let res = {
    installations: [{
      artifactId: "@divsrc-agency-banner",
      baseUrl: "https://d14nsmztq73kfj.cloudfront.net/artifacts",
      hashJWT: "asdhiuashdiu",
      installationId: "b5299a01-05ae-4204-817e-eec68cc36334",
      version: "1.1.11",
      zone: "@divsrc-agency-banner"
    }],
    zones: [{
      id: "8cd2e078-86e6-4568-875e-2cf1c1fa0e5c",
      project_id: "ece45603-eff8-4eee-8cdc-3a792cefcf50",
      zone: "@divsrc-agency-banner"
    }]
  }

  if (data.installations) {
    res.installations = [...res.installations, ...data.installations]
  }
  return res
}