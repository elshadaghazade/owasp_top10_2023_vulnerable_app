module.exports = {
  apps: [
    {
      name: "vulnerable_app",
      script: "npm",
      args: "start",
      autorestart: true
    },
  ],
}
