
At Lembaranz, security is not just an add-on feature, but the core foundation. We apply the principles of **Zero-Knowledge** and **Cryptographic Integrity** inspired by blockchain technology.

## 1. Digital Seal (Data Integrity)

Every note you save is given a "Digital Seal" (SHA-256 Hash). It functions like a unique digital fingerprint for each content.

### How It Works

```mermaid
sequenceDiagram
    participant User as User
    participant App as App (Local)
    participant Storage as Storage

    User->>App: Writes "Secret" Note
    Note right of App: Calculate SHA-256 Hash<br/>(Digital Fingerprint)
    App->>App: Add "_hash" Seal
    App->>Storage: Save Data + Seal
    
    Note over User, Storage: ... Sometime later ...
    
    User->>App: Opens Note
    Storage->>App: Load Data
    App->>App: Recalculate Hash from Content
    alt Hash Matches
        App->>User: Display Note (Secure)
    else Hash Different
        App->>User: WARNING! Data Modified
    end
```

If even a single character changes without going through the application (e.g., manipulated by malware), the "Digital Seal" will be broken, and the application will detect the change.

## 2. Zero-Knowledge Encryption

We use the **Argon2id** algorithm (winner of the Password Hashing Competition) to transform your password into a very strong encryption key.

- **Keys in Memory Only**: Your password is never saved to disk or sent to a server.
- **Isolation**: Even we (the developers) cannot read your notes because we do not have the key.

```mermaid
flowchart LR
    Pass[Password] -->|Argon2id| Key[Encryption Key]
    Data[Original Note] -->|AES-GCM| Enc[Scrambled Data]
    Key --> Enc
    Enc --> Disk[Physical Storage]
    
    style Pass fill:#f9f,stroke:#333,stroke-width:2px
    style Key fill:#bbf,stroke:#333,stroke-width:2px
    style Enc fill:#bfb,stroke:#333,stroke-width:2px
```

## Code Transparency

This entire security logic is open-source and can be audited in the following files:
- `src/aksara/kunci.ts` (Encryption)
- `src/aksara/Integritas.ts` (Data Validation)
