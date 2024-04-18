const Dash = require('dash');
const router = require('express').Router();

router.get('/createWallet', async (req, res, next) => {
    try {
        const clientOpts = {
            network: 'testnet',
            wallet: {
                mnemonic: null, // this indicates that we want a new wallet to be generated
                // if you want to get a new address for an existing wallet
                // replace 'null' with an existing wallet mnemonic
                offlineMode: true,  // this indicates we don't want to sync the chain
                // it can only be used when the mnemonic is set to 'null'
            },
        };

        const client = new Dash.Client(clientOpts);

        const createWallet = async () => {
            const account = await client.getWalletAccount();

            const mnemonic = client.wallet.exportWallet();
            const address = account.getUnusedAddress();
            return { mnemonic, address: address.address }
        };

        createWallet()
            .catch((e) => console.error('Something went wrong:\n', e))
            .then((data) => {
                return res.status(200).json({ data });
            }).finally(() => client.disconnect());

        // Handle wallet async errors
        client.on('error', (error, context) => {
            console.error(`Client error: ${error.name}`);
            console.error(context);
        });
    } catch (error) {
        return res.status(500).json({ error: "Something went wrong!" });
    }
});

router.post('/registerName', async (req, res, next) => {
    return res.status(200).json({ $id:'dhj' })
    try {
        const {mnemonic, userName} = req.body
        const clientOpts = {
            network: 'testnet',
            wallet: {
              mnemonic,
              unsafeOptions: {
                skipSynchronizationBeforeHeight: 875000, // only sync from mid-2023
              },
            },
          };
          const client = new Dash.Client(clientOpts);
        const registerName = async () => {
            const { platform } = client;

            // Get the identity object
            const identity = await platform.identities.register();

            // Get the identifier of the generated identity
            const identifier = identity.getId();

            const nameRegistration = await platform.names.register(
                `${userName}.dash`,
                { dashUniqueIdentityId: identifier },
                identity,
            );

            return nameRegistration;
        };
        registerName()
            .then((d) => res.status(200).json({ data: d.toJSON() }))
            .catch((e) => {
                return res.status(500).json({error:e, errorCode: e.code})
            })
            .finally(() => client.disconnect());
    } catch (error) {

    }
})

module.exports = router;