module.exports = {
  apps: [
    {
      name: "portal",
      // PM2 cluster mode shares the listening socket across workers via
      // Node's cluster module. That only works when PM2 forks the actual
      // server process directly -- pointing it at `npm start` breaks this,
      // since npm spawns `next start` as a further child process outside
      // PM2's cluster hook, so every "worker" would just be a separate npm
      // wrapper and none of them would share the port. Next's own binary
      // must be the script PM2 forks.
      script: "node_modules/next/dist/bin/next",
      args: "start --port=3000",
      cwd: "/var/www/Mugen-Porta/my-app",
      exec_mode: "cluster",
      // 2 of 4 cores: this box also runs MySQL and nginx. Leaving half the
      // cores free avoids the app's own traffic starving the database and
      // reverse proxy under the same load spike it's trying to serve.
      instances: 2,
      env: {
        NODE_ENV: "production",
      },
    },
  ],
};
