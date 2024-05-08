const Dash = require('dash');

const client = new Dash.Client({
  seeds: [{
    host: 'seed-1.testnet.networks.dash.org:1443',
  }],
});

async function connect() {
  return await client.getDAPIClient().core.getBestBlockHash();
}

connect()
  .then((d) => console.log('Connected. Best block hash:\n', d))
  .catch((e) => console.error('Something went wrong:\n', e))
  .finally(() => client.disconnect());