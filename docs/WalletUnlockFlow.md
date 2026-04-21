# Wallet Unlock Flow & Lockout Policy

## 1. Overview

The Wallet Unlock flow in Inji Web is a PIN-based authentication mechanism that enables secure access to the user's wallet by decrypting the wallet key. Since Inji Web does not store the user's password in plain text, the provided PIN is used to derive the decryption key. To protect against unauthorized access and brute-force attacks, the system enforces a lockout policy that transitions the wallet through specific security states defined in `WalletLockStatus`: `TEMPORARILY_LOCKED`, `PERMANENTLY_LOCKED`, `LAST_ATTEMPT_BEFORE_LOCKOUT`, and `LOCK_EXPIRED`.

The lockout policy enforces the following wallet states:

* **TEMPORARILY_LOCKED:** The wallet is locked for a configured duration after exceeding allowed attempts in a cycle.
* **LOCK_EXPIRED:** A previously applied temporary lock has expired, allowing the user to retry PIN entry.
* **LAST_ATTEMPT_BEFORE_LOCKOUT:** Indicates the final remaining retry attempt before the wallet transitions to a permanent lock.
* **PERMANENTLY_LOCKED:** The wallet is permanently disabled after exceeding the maximum number of lock cycles.

## 2. Execution Flow

The flow is triggered whenever a user is prompted for their passcode (e.g., after session expiry or initial login).

1.  **Input:** User enters a 6-digit PIN on the Inji Web Passcode page.
2.  **Authentication & Decryption:** Inji Web calls the Mimoto `/unlock` API. Mimoto attempts to decrypt the `wallet_key` using the provided PIN.
3.  **State Management:**
    * **Success:** Wallet is successfully unlocked. Mimoto resets all failure counters and lock metadata (clearing failed attempts, cycle counts, and active lock statuses). The user is then redirected to the home page.
    * **Failure:** Mimoto increments the `failedAttemptCount`. If the count reaches defined thresholds, the `walletLockStatus` is updated to a restricted state. The user is prompted to re-enter the PIN, subject to the current lock status.
4.  **Locking Tiers:**    
    * **Temporary Lock (`temporarily_locked`):** The wallet is unusable for a configured duration (e.g., 60 mins).
    * **Warning (`last_attempt_before_lockout`):** Triggered when the user is on their final attempt of the final allowed cycle.
    * **Permanent Lock (`permanently_locked`):** After exceeding the maximum allowed lock cycles, the wallet is permanently disabled.


## 3. Architecture

The architecture splits responsibilities to ensure that sensitive cryptographic operations and state management are isolated from the UI.

* **Inji Web:**
    * **UI:** Captures user PIN.
    * **Session Management:** Once unlocked, it stores the received `decryptedWalletKey` into the Http session.
* **Mimoto:**
    * **Wallet Unlock API:** Validates the provided PIN and attempts to unlock the wallet.
    * **Lock Management:** Handles retry attempts, temporary locks, and lock state transitions.
    * **Cryptographic Operations:** Performs secure decryption of the wallet key using a PIN-derived key.
    * **Persistence Layer:** Manages storage and retrieval of wallet data, including encryption and lock metadata.

## 4. Sequence Diagram

A high-level sequence diagram illustrating the wallet unlock flow is as follows:

```mermaid
sequenceDiagram
    actor User
    participant UI as Inji Web
    participant Mimoto as Backend

    User->>UI: clicks "Continue with Google" button

    Note over UI: User is authenticated via OAuth2

    UI->>UI: Redirect to /user/passcode

    User->>UI: Enters PIN
    User->>UI: Clicks "Submit"

    UI->>Mimoto: POST /wallets/{walletId}/unlock

    Note over Mimoto: Validates PIN and unlocks wallet

    Mimoto-->>UI: 200 OK (Wallet unlocked)

    UI->>UI: Store wallet session data
    UI->>UI: Navigate to /user/home
```

To view the detailed sequence diagram for the flow, refer here: [Wallet Unlock Process](https://github.com/inji/mimoto/blob/master/docs/WalletUnlockProcess.md#sequence-diagram)

## 5. Integration

### API Reference

| Action | Endpoint | Documentation                                                                                      |
| :--- | :--- |:---------------------------------------------------------------------------------------------------|
| **Unlock Wallet** | `POST /wallets/{walletId}/unlock` | [Mimoto Stoplight](https://mosip.stoplight.io/docs/mimoto) |


## 6. References

For low-level implementation details of the Mimoto wallet unlock and cryptographic flow, refer to:

* [Mimoto: Wallet Unlock Process](https://github.com/inji/mimoto/blob/master/docs/WalletUnlockProcess.md)
* [Mimoto: User Data Encryption with PIN-Based Key](https://github.com/inji/mimoto/blob/master/docs/UserDataEncryptionWithPinBasedKey.md)

For API documentation, refer to the Mimoto Stoplight:

* [Mimoto API Documentation](https://mosip.stoplight.io/docs/mimoto)