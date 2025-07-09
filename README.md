# ExpressOS

🚀 CLI tool to create Express services with clean architecture.

## Quick Start

```bash
# Install globally
npm install -g expressos

# Create a new project (both commands work)
expressos my-api
# or use the short alias
eos my-api

# Generate components
expressos usecase auth login
eos service email
eos middleware cors
```

## Features

- ✅ **Clean Architecture** with TypeScript
- ✅ **Zod validation** for inputs/outputs
- ✅ **Hierarchical modules** (`auth/login`, `user/profile`)
- ✅ **Automatic route loading**
- ✅ **Cloud / Docker Functions ready** with `createApp()` function
- ✅ **Service container** with dependency injection

## Documentation

See [INTEGRATION.md](https://github.com/solarpush/expressos.git/INTEGRATION.md) for complete documentation and usage examples.

## Generated Structure

```text
src/
├── index.ts              # createApp() + local server
├── framework/            # Framework utilities
├── modules/              # Business logic modules
│   ├── auth/
│   │   ├── login/       # /api/auth/login
│   │   └── logout/      # /api/auth/logout
│   └── user/
│       └── profile/     # /api/user/profile
├── services/            # Service container
└── middlewares/         # Express middlewares
```

## License

MIT
