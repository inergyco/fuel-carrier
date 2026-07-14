# CI/CD deploy (GitHub Actions → VPS)

Automated by [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml): migrate → build → rsync → restart.

## One-time VPS prep

### 1. Deploy SSH key (CI only)

On your laptop:

```bash
ssh-keygen -t ed25519 -C "github-actions-fuel-carrier" -f ~/.ssh/fuel-carrier-deploy -N ""
cat ~/.ssh/fuel-carrier-deploy.pub
```

On the VPS as `deploy`:

```bash
mkdir -p ~/.ssh
chmod 700 ~/.ssh
echo 'PASTE_PUBLIC_KEY_HERE' >> ~/.ssh/authorized_keys
chmod 600 ~/.ssh/authorized_keys
```

Paste the **private** key (`~/.ssh/fuel-carrier-deploy`) into the GitHub secret `VPS_SSH_PRIVATE_KEY`.

### 2. Passwordless systemd restart

On the VPS:

```bash
echo 'deploy ALL=(root) NOPASSWD: /bin/systemctl restart fuel-carrier-api, /bin/systemctl status fuel-carrier-api, /bin/systemctl is-active fuel-carrier-api' | sudo tee /etc/sudoers.d/fuel-carrier-deploy
sudo chmod 440 /etc/sudoers.d/fuel-carrier-deploy
sudo visudo -cf /etc/sudoers.d/fuel-carrier-deploy
```

### 3. Confirm remote paths

- App root: `/var/www/fuel-carrier/`
- API env (not overwritten by CI): `/var/www/fuel-carrier/api/.env`
- Service: `fuel-carrier-api.service`

## GitHub Actions secrets

Repo → **Settings → Secrets and variables → Actions**:

| Secret | Example |
|--------|---------|
| `VPS_HOST` | `37.32.9.189` |
| `VPS_USER` | `deploy` |
| `VPS_SSH_PRIVATE_KEY` | Full private key PEM / OpenSSH format |
| `MIGRATION_DATABASE_URL` | `postgresql://postgres:URL_ENCODED_PASSWORD@localhost:5433/fuel_carrier` |

`MIGRATION_DATABASE_URL` must use host `localhost` and port `5433` — the workflow tunnels that port to Postgres on the VPS.

Encode passwords with:

```bash
node -e 'require("readline").createInterface({input:process.stdin}).question("Password: ",p=>console.log(encodeURIComponent(p)))'
```

## Manual pack (local)

```bash
bash scripts/pack-deploy.sh
rsync -avz --delete --exclude '.env' deploy/ deploy@YOUR_HOST:/var/www/fuel-carrier/
ssh deploy@YOUR_HOST 'sudo systemctl restart fuel-carrier-api'
```

## Triggers

- Push to `main`
- Actions → Deploy → **Run workflow**
