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
    Public.vue           Edit own profile (name, email, avatar)
    Peers.vue            Peer management (currently hidden)
    Restart.vue          Redirect target after shard restart
  lib/                 Framework-free pure functions, unit-tested from tests/unit/
    errors.js            errorMessage(): displayable string from an axios error
    pricing.js           Shard price computation
  components/          13 reusable UI components
    Navbar.vue           Sticky nav with feedback modal, version update notification, disk warnings
    AppIcon.vue          App launcher tile with status indicator
    AppStoreEntry.vue    App card in store listing
    TerminalCard.vue     Device card with edit/delete
    EditableAvatar.vue   Avatar upload/delete
    EditableText.vue     Inline editable text field
    ShardIdBadge.vue     Shard ID display badge
    ...
```

## Key Patterns

### API Communication
All API calls go to the shard_core backend. Two base paths:
- `/core/public/*` — no auth (meta, health, pairing)
- `/core/protected/*` — requires paired terminal (apps, settings, backup, etc.)

Dev proxy: `vue.config.js` proxies requests to a remote shard or `localhost:8080`.

Backend errors carry the reason in the response body's `detail` field. Render caught errors
through the `errorMessage` filter (`{{ err | errorMessage }}`) rather than binding the error
object directly — binding it directly renders `AxiosError: Received HTTP status 401`.

### Authentication Flow
1. App loads → calls `/core/public/meta/whoami`
2. If anonymous → redirect to `/welcome` or `/pair`
3. User enters pairing code → shard issues JWT cookie
4. Subsequent requests authenticated via cookie

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
