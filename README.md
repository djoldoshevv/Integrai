# Project README

## Assets

All images and static assets used in the UI must be added to the `attached_assets/` directory and committed to git.
Do **not** add this folder to `.gitignore`.
If you add or update images, always run `git add`, commit, and push.

---

## Asset Management Checklist

- Place all UI images and static assets in `attached_assets/`.
- Make sure `attached_assets/` is tracked by git (not in `.gitignore`).
- When adding images, always commit and push them so the team stays in sync.
- Pull latest changes before starting new work.

---

## Recommended Folder Structure

```
project-root/
├── attached_assets/      # All static images and UI assets
├── client/              # Frontend source code
├── server/              # Backend source code
├── public/              # Public files (favicon, robots.txt, etc.)
├── README.md            # Project documentation
└── ...
```

- Use `attached_assets/` for all images referenced in code.
- Use `public/` for files that must be available at the root URL (e.g., `/favicon.ico`).

---

## Onboarding Note

When cloning the repo, always run `git pull` to ensure you have all assets.
If you see missing image errors, check that you have the latest `attached_assets/` content.

---

## If You Add New Images

1. Add the file to `attached_assets/`.
2. Run:
   ```bash
   git add attached_assets/
   git commit -m "Add new images"
   git push
   ```
3. Notify your team to pull the latest changes.

---

## Questions?

If you have any issues with assets or static files, check this README or ask in the team chat.
