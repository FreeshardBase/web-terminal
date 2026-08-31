# Web Terminal

Browser-based UI for controlling a Freeshard. Users manage apps, pair devices, configure settings, and monitor their shard through this SPA.

## Tech Stack

- **Framework**: Vue 2.6, Vue Router 3, Vuex 3
- **UI**: Bootstrap-Vue 2 + Bootstrap 4
- **HTTP**: Axios (global `this.$http`)
- **Build**: Vue CLI 4, Babel, ESLint
- **Language**: JavaScript (no TypeScript)

## Commands

```bash
npm run serve     # Dev server with hot-reload
npm run build     # Production build
npm run lint      # ESLint
```

## Project Structure

```
src/
  main.js              Entry point: Vue + BootstrapVue + global filters + Axios setup
  App.vue              Root component: auth check, WebSocket connection, initial data loading
  store.js             Vuex store (single file): state, mutations, actions, getters
  router/index.js      8 routes, all children of App.vue
  event-bus.js         Simple Vue instance for decoupled event emission
  mixins.js            toastMixin for notifications
  views/               Route-level page components
    Home.vue             App grid (main dashboard after pairing)
    Welcome.vue          Public profile view (no auth needed)
    Pair.vue             Device pairing form (enter code)
    Terminals.vue        Manage paired devices, generate QR pairing codes
    Apps.vue             App store: browse, install, update, custom app upload
    Settings.vue         Shard config, backups, disk usage, resize, about
    ConfirmEmail.vue     Confirms the owner's email address from a mailed link
    Public.vue           Edit own profile (name, description, avatar)
    Peers.vue            Peer management (currently hidden)
    Restart.vue          Redirect target after shard restart
  components/          13 reusable UI components
    Navbar.vue           Sticky nav with feedback modal, version update notification, disk warnings
    AppIcon.vue          App launcher tile with status indicator
    AppStoreEntry.vue    App card in store listing
    TerminalCard.vue     Device card with edit/delete
    EditableAvatar.vue   Avatar upload/delete
    EditableText.vue     Inline editable text field
    OwnerSection.vue     Owner card in Settings: name and email of the owner's user row
    ShardIdBadge.vue     Shard ID display badge
    ...
```

## Key Patterns

### API Communication
All API calls go to the shard_core backend. Two base paths:
- `/core/public/*` — no auth (meta, health, pairing)
- `/core/protected/*` — requires paired terminal (apps, settings, backup, etc.)

Dev proxy: `vue.config.js` proxies requests to a remote shard or `localhost:8080`.

### Authentication Flow
1. App loads → calls `/core/public/meta/whoami`
2. If anonymous → redirect to `/welcome` or `/pair`
3. User enters pairing code → shard issues JWT cookie
4. Subsequent requests authenticated via cookie

`App.vue` checks for an email confirmation token *before* that anonymous
redirect, so `/confirm-email` is reachable without a session — see below.

### The Owner's Email Address
The owner's address lives on their user row in shard_core (`users.email`), and
`OwnerSection.vue` in Settings is the only place that shows or edits it. There
is no verified flag: `email` is verified by definition and `pending_email` is an
unverified candidate, so the pair alone gives the three states the card renders.
Never read the address from the controller's `profile` or from `identity`; both
have held stale copies of it.

- `PATCH /core/protected/users/me` with an address answers **502 when the
  candidate was stored but the confirmation mail could not be sent**. That is
  not a failed save, and rendering it as one makes owners retype an address the
  shard already has. Resend is the retry.
- `GET /core/protected/settings` returns `email_enabled`. When it is false the
  shard cannot send mail at all (self-hosted, no controller), the address is
  taken directly with no pending step, and no resend control may be offered.
- The confirmation mail links to `https://<shard-domain>/?confirm_email=<token>`.
  That query string is on the document, **not** in the hash route, so
  `$route.query` does not see it — read `window.location.search` through
  `readConfirmEmailToken` in `src/lib/owner-email.js`.
- `ConfirmEmail.vue` posts to `/core/public/users/confirm-email` only on a click.
  There is deliberately no GET route on shard_core: mail scanners and link
  prefetchers follow links and would burn the single-use token. The endpoint
  answers 204 whether or not the token matched — it must not reveal whether an
  address was pending — so the screen cannot claim more than that the request
  went through.

### WebSocket
`App.vue` maintains a persistent WebSocket to `/core/protected/ws/updates`:
- Auto-reconnects every 1000ms
- Messages dispatched to Vuex via `handle_websocket_message` action
- Also emitted on `EventBus` by `message_type`
- Key events: `apps_update`, `terminals_update`, `backup_update`, `disk_usage_update`, `app_install_error`

### State Management (Vuex)
Single-file store with:
- **State**: `meta` (shard identity, device info, anonymous flag), `apps`, `terminals`, `tours`, `disk_usage`, `profile`, `version`, `websocket`
- **Key getters**: `short_shard_id` (first 6 chars), `shard_href`, `tour_seen(name)`
- **Actions** fetch from API: `query_meta_data`, `refresh_apps`, `refresh_terminals`, `query_disk_usage`, etc.

### Component Patterns
- Props for data, `$emit` for child→parent communication
- Computed properties for derived state
- Local `editMode` boolean pattern for inline editing (see TerminalCard)
- `toastMixin` for toast notifications on success/error

### App Store
App metadata fetched from external Azure blob storage. Supports branch switching (main/dev) for testing unreleased apps.

## Development

The dev server proxies `/core` requests. Configure the target in `vue.config.js`:
- Default: `https://9d9twt.freeshard.cloud` (a real shard)
- Local development: `http://localhost:8080` (requires shard_core running locally)

## Commits

[Scoped Commits](https://scopedcommits.com/): `<scope>: <description>`. The scope is the area of the tree the change touches, never a change type — write `settings: align subscription card with the controller contract`, not `fix(settings): ...`. Body and trailers are optional; a change's reasoning belongs in the body, not in a code comment.

Scopes for this repo: `apps` `home` `pair` `peers` `public` `restart` `settings` `terminals` `welcome` `ui` `router` `lib` `ci` `deps` `meta`

`meta` covers repo-level files (agents.md, README, justfile). For a change spanning several scopes, use a broader one, list two comma-separated, or use `treewide`. Merges, reverts and generated commits (`set version to <v>`) keep their own format. Don't generate a changelog from the commit log — release notes come from merged PRs.
