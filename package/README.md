# Fireblocks NCW JS SDK

The Official Javascript & Typescript SDK for Fireblocks Non-Custodial Wallet

## Quick Start

### Initialization

```typescript
import {
  FireblocksNCWFactory,
  IEventsHandler,
  IFireblocksNCW,
  IMessagesHandler,
  TEvent,
  InMemorySecureStorageProvider,
} from "@fireblocks/ncw-js-sdk";

// Example Device ID
const deviceId = "f16e05e0-1869-4a6b-9678-17a1c14ed482";

// Initiate secure storage to hold generated data during SDK usage.
const secureStorageProvider = new InMemorySecureStorageProvider();

// Register a message handler to process outgoing message to your API
const messagesHandler: IMessagesHandler = {
  handleOutgoingMessage: (message: string) => {
    // Send the message to your API service
    return {} as any;
  },
};

// Register an events handler to handle on various events that the SDK emitts
const eventsHandler: IEventsHandler = {
  handleEvent: (event: TEvent) => {
    if (
      event.type === "key_descriptor_changed" ||
      event.type === "key_takeover_changed" ||
      event.type === "transaction_signature_changed" ||
      event.type === "join_wallet_descriptor"
    ) {
      // Do something when the event is fired.
      console.log(event);
    }
  },
};

// Initialize Fireblocks NCW SDK
const fireblocksNCW = await FireblocksNCWFactory({
  deviceId,
  messagesHandler,
  eventsHandler,
  secureStorageProvider,
});
```

### Generate MPC Keys

```typescript
import { IKeyDescriptor, TMPCAlgorithm } from "@fireblocks/ncw-js-sdk";

// Generate MPC Keys
const algorithms: Set<TMPCAlgorithm> = new Set(["MPC_CMP_ECDSA_SECP256K1"]);
const keyDescriptor: Set<IKeyDescriptor> = await fireblocksNCW.generateMPCKeys(algorithms);
```

The generate MPC keys process will emit `IKeyTakeoverChangedEvent` events.

### Sign Transaction

```typescript
import { ITransactionSignature } from "@fireblocks/ncw-js-sdk";

// Sign transaction
const result: ITransactionSignature = await fireblocksNCW.signTransaction("SOME_TX_UUID");
console.log(
  `txId: ${result.txId}`,
  `status: ${result.transactionSignatureStatus}`, // "PENDING" | "STARTED" | "COMPLETED" | "TIMEOUT" | "ERROR"
);
```

The sign process will emit `ITransactionSignatureChangedEvent` events.

### Secure Storage

The following example uses a custom secure storage.

```typescript
const secureStorageProvider = new PasswordEncryptedLocalStorage(deviceId, () => {
  const password = prompt("Enter password", "");
  if (password === null) {
    return Promise.reject(new Error("Rejected by user"));
  }
  return Promise.resolve(password || "");
});

// Initialize Fireblocks NCW SDK with your custom secure storage
const fireblocksNCW = await FireblocksNCW.initialize(deviceId, messagesHandler, eventsHandler, secureStorageProvider);
```

An example implementation of secure storage based on a user password.

```typescript
import {
  BrowserLocalStorageProvider,
  ISecureStorageProvider,
  TReleaseSecureStorageCallback,
  decryptAesGCM,
  encryptAesGCM,
} from "@fireblocks/ncw-js-sdk";
import { md } from "node-forge";

export type GetUserPasswordFunc = () => Promise<string>;

/// This secure storage implementations creates an encryption key on-demand based on a user password

export class PasswordEncryptedLocalStorage extends BrowserLocalStorageProvider implements ISecureStorageProvider {
  private encKey: string | null = null;

  constructor(
    private _salt: string,
    private getPassword: GetUserPasswordFunc,
  ) {
    super();
  }

  public async getAccess(): Promise<TReleaseSecureStorageCallback> {
    this.encKey = await this._generateEncryptionKey();
    return async () => {
      await this._release();
    };
  }

  private async _release(): Promise<void> {
    this.encKey = null;
  }

  public async get(key: string): Promise<string | null> {
    if (!this.encKey) {
      throw new Error("Storage locked");
    }

    const encryptedData = await super.get(key);
    if (!encryptedData) {
      return null;
    }

    return decryptAesGCM(encryptedData, this.encKey, this._salt);
  }

  public async set(key: string, data: string): Promise<void> {
    if (!this.encKey) {
      throw new Error("Storage locked");
    }

    const encryptedData = await encryptAesGCM(data, this.encKey, this._salt);
    await super.set(key, encryptedData);
  }

  private async _generateEncryptionKey(): Promise<string> {
    let key = await this.getPassword();
    const md5 = md.md5.create();

    for (let i = 0; i < 1000; ++i) {
      md5.update(key);
      key = md5.digest().toHex();
    }

    return key;
  }
}
```

## Development

1. Clone the repository
2. Install the dependencies with `yarn`
3. Build the library with `yarn build`
4. Run tests with `yarn test`

## Tech

- [Typescript](https://www.npmjs.com/package/typescript)
- [Vite](https://www.npmjs.com/package/vite)
- [Jest](https://www.npmjs.com/package/jest)
- [ESLint](https://www.npmjs.com/package/eslint)
- [Prettier](https://www.npmjs.com/package/prettier)
