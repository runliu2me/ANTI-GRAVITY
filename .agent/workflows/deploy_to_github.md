---
description: How to sync code to GitHub and deploy to GitHub Pages
---

# GitHub Sync & Deployment Guide

This guide explains how to push your `ANTI-GRAVITY` workspace to GitHub and deploy your projects (like the Scientific Calculator) to the web.

## Prerequisites
1.  **GitHub Account**: You need a [GitHub account](https://github.com/).
2.  **Git Installed**: Git must be installed on your computer.

## Step 1: Create a Repository on GitHub
1.  Log in to GitHub.
2.  Click the **+** icon in the top-right and select **New repository**.
3.  **Repository name**: `ANTI-GRAVITY` (or whatever you prefer).
4.  **Visibility**: Public (required for free GitHub Pages) or Private.
5.  **Initialize**: Do **NOT** check "Add a README", "Add .gitignore", or "Choose a license". We already have these locally.
6.  Click **Create repository**.

## Step 2: Push Local Code to GitHub
Open your terminal in the `ANTI-GRAVITY` folder and run these commands (I can run the first 3 for you):

```powershell
# 1. Initialize Git (if not done)
git init

# 2. Add all files
git add .

# 3. Commit changes
git commit -m "Initial commit: Scientific Calculator and Workspace Setup"

# 4. Link to GitHub (YOU MUST RUN THIS with your URL)
# Replace 'YOUR_USERNAME' with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/ANTI-GRAVITY.git

# 5. Push to GitHub
git branch -M main
git push -u origin main
```

## Step 3: Deploy to GitHub Pages
1.  Go to your repository on GitHub.
2.  Click **Settings** (top tab).
3.  Click **Pages** (left sidebar).
4.  Under **Build and deployment** > **Source**, select **Deploy from a branch**.
5.  Under **Branch**, select `main` and `/ (root)`.
6.  Click **Save**.

## Step 4: Access Your Projects
After a minute, your site will be live at:
`https://YOUR_USERNAME.github.io/ANTI-GRAVITY/`

To access the calculator specifically:
`https://YOUR_USERNAME.github.io/ANTI-GRAVITY/scientific-calculator/`

## Updating Your Code
Whenever you make changes:
```powershell
git add .
git commit -m "Description of changes"
git push
```
GitHub Pages will automatically update.
