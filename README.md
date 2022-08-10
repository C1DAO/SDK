# @vmeta3/sdk

The `@vmeta3/sdk` package provides a set of tools for interacting with Vmeta3.

## Installation

```
npm install @vmeta3/sdk
```

## Docs

You can find auto-generated API documentation over at sdk.vmeta3.io.

## Using the SDK

### CrossChainMessenger

The `CrossChainMessenger` class simplifies the process of moving assets and data between Ethereum and Vmeta3.
You can use this class to, for example, initiate a withdrawal of ERC20 tokens from Vmeta3 back to Ethereum, accurately track when the withdrawal is ready to be finalized on Ethereum, and execute the finalization transaction after the challenge period has elapsed.
The `CrossChainMessenger` can handle deposits and withdrawals of ETH and any ERC20-compatible token.
Detailed API descriptions can be found at sdk.vmeta3.io.
The `CrossChainMessenger` automatically connects to all relevant contracts so complex configuration is not necessary.

### L2Provider and related utilities

The Vmeta3 SDK includes various utilities for handling Vmeta3's transaction fee model.
For instance, `estimateTotalGasCost` will estimate the total cost (in wei) to send at transaction on Vmeta3 including both the L2 execution cost and the L1 data cost.
You can also use the `asL2Provider` function to wrap an ethers Provider object into an `L2Provider` which will have all of these helper functions attached.

### Other utilities

The SDK contains other useful helper functions and constants.
For a complete list, refer to the auto-generated SDK documentation
