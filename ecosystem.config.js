module.exports = {
  apps: [
    {
      name: 'tiny-pm',
      script: 'npm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: 3131,
      },
    },
  ],
};
