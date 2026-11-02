/**
 * Security transparency content for /security.
 * Status labels must stay honest relative to prelaunch reality.
 */

export type SecurityStatus =
  | 'planned'
  | 'in_development'
  | 'implemented'
  | 'independently_verified'

export interface ArchitectureStage {
  id: string
  title: string
  detail: string
}

export const ARCHITECTURE_STAGES: ArchitectureStage[] = [
  {
    id: 'device',
    title: 'Customer Device',
    detail: 'Browser or app where files originate and keys stay under customer control.',
  },
  {
    id: 'client-crypto',
    title: 'Client-Side Encryption',
    detail: 'Intended zero-knowledge foundation: encrypt before upload.',
  },
  {
    id: 'https',
    title: 'Encrypted HTTPS Transfer',
    detail: 'Transport protection for already-encrypted objects in transit.',
  },
  {
    id: 'api',
    title: 'Ebon Vaults Application / API',
    detail: 'Auth, quotas, encrypted objects, metadata, and permissions.',
  },
  {
    id: 'storage',
    title: 'Encrypted Storage',
    detail: 'Server stores ciphertext — not plaintext file contents.',
  },
  {
    id: 'zfs',
    title: 'Mirrored ZFS Storage Pool',
    detail: 'Planned redundant on-premises storage for drive-level resilience.',
  },
]

export interface SecurityTopic {
  id: string
  title: string
  status: SecurityStatus
  body: string
  bullets?: string[]
  limitations?: string
}

export const ENCRYPTION_TOPICS: SecurityTopic[] = [
  {
    id: 'client-side',
    title: 'Client-side encryption',
    status: 'planned',
    body: 'Client-side encryption is the intended foundation of Ebon Vaults’ zero-knowledge model. Files should be encrypted on the customer’s device before upload so the server receives encrypted contents rather than plaintext.',
    bullets: [
      'Generate cryptographically secure random file-encryption keys.',
      'Encrypt file contents with authenticated encryption.',
      'Protect encryption keys using customer-controlled secrets or public-key encryption.',
      'Use modern, well-maintained cryptographic libraries.',
      'Authenticate encrypted content to detect unauthorized modification.',
      'Ensure the server does not need customer plaintext keys to store or retrieve encrypted objects.',
    ],
    limitations:
      'The complete encryption protocol has not been finalized or independently audited. Key-recovery design is not finished. Losing encryption keys may mean permanent data loss unless an explicitly supported recovery mechanism is implemented — and any recovery path involves privacy tradeoffs we will document before launch.',
  },
]

export const INFRASTRUCTURE_TOPICS: SecurityTopic[] = [
  {
    id: 'independent',
    title: 'Independently operated hardware',
    status: 'planned',
    body: 'Ebon Vaults is being designed around independently operated physical server infrastructure rather than renting primary storage from a third-party cloud provider. Owning and operating the stack is intended to support clearer accountability for where files live and who can access the systems that hold them.',
    limitations:
      'Production servers have not been purchased or deployed yet. Exact locations and operational details will be published before launch once infrastructure decisions are finalized.',
  },
  {
    id: 'zfs-redundancy',
    title: 'Mirrored ZFS storage',
    status: 'planned',
    body: 'Our planned production design includes a mirrored ZFS storage pool so that failure of an individual drive does not automatically mean loss of stored objects. Redundancy is one layer of resilience — not a guarantee against every failure mode.',
    limitations:
      'Redundancy protects against certain hardware failures but cannot prevent every form of data loss, including disasters affecting an entire storage location.',
  },
  {
    id: 'physical',
    title: 'Physical safeguards',
    status: 'planned',
    body: 'Storage equipment is intended to be kept in a physically secured environment with safeguards designed to reduce the risk of unauthorized access or damage.',
    limitations:
      'Events such as fire, flooding, theft, natural disasters, or other circumstances beyond reasonable control may still affect equipment and stored files.',
  },
]

export const ACCESS_TOPICS: SecurityTopic[] = [
  {
    id: 'auth',
    title: 'Authentication and session controls',
    status: 'planned',
    body: 'We’re designing authentication, session handling, and permission checks so only authorized accounts can list, upload, download, or share vault objects — while the application works with encrypted payloads rather than plaintext file contents.',
  },
  {
    id: 'sharing',
    title: 'Sharing on your terms',
    status: 'planned',
    body: 'Controlled file-sharing is planned so customers decide what leaves the vault and with whom. Sharing mechanics will be documented as they are designed, including how links, permissions, and revocation are intended to work.',
  },
  {
    id: 'legal',
    title: 'Legal requests',
    status: 'planned',
    body: 'We may be legally required to respond to valid court orders or other legally binding requests for information in our possession. A zero-knowledge design aims to limit what plaintext content the provider can produce; metadata and account records may still be subject to lawful process.',
    limitations:
      'No storage provider can truthfully claim immunity from all government or legal requests.',
  },
]

export const RECOVERY_TOPICS: SecurityTopic[] = [
  {
    id: 'backups',
    title: 'Backup and recovery planning',
    status: 'planned',
    body: 'Before launch, we plan to validate backup, restore, and disaster-recovery procedures for the storage platform. The goal is to reduce the impact of hardware failure and operational mistakes without weakening encryption commitments.',
    limitations:
      'Disaster recovery cannot guarantee availability through every scenario. Account recovery processes have not been finalized; we will explain tradeoffs before launch rather than promise unrestricted provider-side password recovery alongside zero-knowledge encryption.',
  },
]

export const PRIVACY_ALIGNMENT: { title: string; body: string }[] = [
  {
    title: 'Your data belongs to you',
    body: 'We don’t claim ownership of personal information, photographs, documents, or other stored content.',
  },
  {
    title: 'Never sold — including for AI training',
    body: 'We will never sell, rent, or license your files or their contents to advertisers, data brokers, or AI companies. Customer files will not be used to train AI models.',
  },
  {
    title: 'Private by design',
    body: 'We don’t inspect files for advertising, build marketing profiles from their contents, or share them for commercial exploitation.',
  },
  {
    title: 'Transparent subscription terms',
    body: 'Capacity, price, and usage limits should be clear before payment, with understandable cancellation and retrieval expectations.',
  },
]
