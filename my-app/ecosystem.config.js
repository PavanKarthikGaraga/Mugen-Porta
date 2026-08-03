module.exports = {
  apps: [
    {
      // PM2's cluster mode (Node's `cluster` module sharing one socket
      // across workers) doesn't work with Next.js 16's own server
      // bootstrap -- the second worker fails to bind and crashes on start
      // ("Failed to start server", confirmed by running `next start`
      // directly, which works fine standalone). Two separate fork-mode
      // instances on different ports, load-balanced by nginx, sidesteps
      // that incompatibility entirely and is the standard way to scale
      // Next.js horizontally on one box.
      name: "portal",
      script: "node_modules/next/dist/bin/next",
      args: "start --port=3000",
      cwd: "/var/www/Mugen-Porta/my-app",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
      },
    },
    {
      name: "portal-2",
      script: "node_modules/next/dist/bin/next",
      args: "start --port=3001",
      cwd: "/var/www/Mugen-Porta/my-app",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
