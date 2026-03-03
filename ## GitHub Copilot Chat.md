## GitHub Copilot Chat

- Extension: 0.37.8 (prod)
- VS Code: 1.109.5 (072586267e68ece9a47aa43f8c108e0dcbf44622)
- OS: win32 10.0.26100 x64
- GitHub Account: Marr2025

## Network

User Settings:
```json
  "http.systemCertificatesNode": true,
  "github.copilot.advanced.debug.useElectronFetcher": true,
  "github.copilot.advanced.debug.useNodeFetcher": false,
  "github.copilot.advanced.debug.useNodeFetchFetcher": true
```

Connecting to https://api.github.com:
- DNS ipv4 Lookup: 140.82.112.6 (15 ms)
- DNS ipv6 Lookup: Error (89 ms): getaddrinfo ENOTFOUND api.github.com
- Proxy URL: None (1 ms)
- Electron fetch (configured): HTTP 200 (43 ms)
- Node.js https: HTTP 200 (106 ms)
- Node.js fetch: HTTP 200 (39 ms)

Connecting to https://api.githubcopilot.com/_ping:
- DNS ipv4 Lookup: 140.82.113.22 (11 ms)
- DNS ipv6 Lookup: Error (11 ms): getaddrinfo ENOTFOUND api.githubcopilot.com
- Proxy URL: None (23 ms)
- Electron fetch (configured): HTTP 200 (112 ms)
- Node.js https: HTTP 200 (100 ms)
- Node.js fetch: HTTP 200 (140 ms)

Connecting to https://copilot-proxy.githubusercontent.com/_ping:
- DNS ipv4 Lookup: 4.249.131.160 (16 ms)
- DNS ipv6 Lookup: Error (11 ms): getaddrinfo ENOTFOUND copilot-proxy.githubusercontent.com
- Proxy URL: None (12 ms)
- Electron fetch (configured): HTTP 200 (127 ms)
- Node.js https: HTTP 200 (134 ms)
- Node.js fetch: HTTP 200 (144 ms)

Connecting to https://mobile.events.data.microsoft.com: HTTP 404 (2579 ms)
Connecting to https://dc.services.visualstudio.com: HTTP 404 (224 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (151 ms)
Connecting to https://copilot-telemetry.githubusercontent.com/_ping: HTTP 200 (110 ms)
Connecting to https://default.exp-tas.com: HTTP 400 (104 ms)

Number of system certificates: 91

## Documentation

In corporate networks: [Troubleshooting firewall settings for GitHub Copilot](https://docs.github.com/en/copilot/troubleshooting-github-copilot/troubleshooting-firewall-settings-for-github-copilot).