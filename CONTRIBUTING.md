# Contributing to NightPass

Thank you for your interest in contributing to **NightPass** — the privacy-first event DApp on the Midnight Network!

---

## 🛠️ Development Setup

### Prerequisites
- **Node.js 20+**
- **npm 10+**
- **1AM Wallet** browser extension
- **Docker** (optional, for local devnet)

### Steps

1. **Fork and clone the repository:**
   ```bash
   git clone https://github.com/Soumen1080/NightPass.git
   cd NightPass
   ```

2. **Install dependencies:**
   ```bash
   npm install
   npm run postinstall
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.example .env.local
   # Edit .env.local with your values
   ```

4. **Sync ZK assets:**
   ```bash
   npm run sync:assets
   ```

5. **Start the development server:**
   ```bash
   npm run dev
   ```

---

## 🔀 Branching Strategy

| Branch | Purpose |
|---|---|
| `main` | Production-ready code |
| `feat/<name>` | New features |
| `fix/<name>` | Bug fixes |
| `docs/<name>` | Documentation improvements |
| `chore/<name>` | Build, deps, tooling |

---

## 📝 Commit Message Convention

We follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <short description>

[optional body]
[optional footer]
```

**Types:**
- `feat` — New feature
- `fix` — Bug fix
- `docs` — Documentation
- `chore` — Build / dependency changes
- `test` — Tests
- `refactor` — Code refactoring without feature change
- `perf` — Performance improvement

**Examples:**
```
feat(wallet): add retry logic for connection failures
fix(join): correct RSVP commitment hash computation
docs(readme): add Level 5 submission checklist
```

---

## 🧪 Running Tests

```bash
npm test
```

---

## 📋 Pull Request Guidelines

1. **Branch off `main`** for your changes
2. **Write clear commit messages** using the convention above
3. **Update documentation** if you change behavior
4. **Test your changes** locally before submitting
5. **Link related issues** in your PR description
6. **Keep PRs focused** — one feature or fix per PR

---

## 🔒 Smart Contract Changes

If you modify `contract/src/private-party.compact`:
1. Recompile using the Compact compiler (requires Docker or WSL)
2. Run `npm run sync:assets` to update public ZK assets
3. Document the circuit changes in `CHANGELOG.md`
4. Update the relevant test cases in `__tests__/`

---

## 🐛 Reporting Issues

Please use [GitHub Issues](https://github.com/Soumen1080/NightPass/issues) with the appropriate label:
- `bug` — Something isn't working
- `enhancement` — Feature request
- `documentation` — Docs improvement
- `question` — General question

---

*Built with ❤️ on the Midnight Network*
