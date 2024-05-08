const dash = require('dash');

// Initialize Dash connection
const clientOpts = {
  network: 'testnet', // or 'mainnet'
  wallet: {
    mnemonic: 'embark cash display invest service shine input fantasy accuse labor double figure',
  }
};
const client = new dash.Client(clientOpts);

async function registerDashName(name) {
  try {
    // Check if name is available
    const nameInfo = await client.platform.names.resolve(name);
    if (!nameInfo) {
      // Generate name registration transaction
      const identity = await client.platform.identities.register(name);
      
      // Wait for identity to be confirmed
      await identity.ready();
      
      console.log(`Name '${name}' registered successfully with identity ID: ${identity.id}`);
    } else {
      console.log(`Name '${name}' is already registered.`);
    }
  } catch (e) {
    console.error('Error registering name:', e);
  } finally {
    await client.disconnect();
  }
}

// Example usage
registerDashName("mydashname");
