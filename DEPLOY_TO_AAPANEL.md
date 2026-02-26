# Deploying Nizami Law Firm Website to aaPanel

This guide will walk you through the steps to deploy your React application to an aaPanel server.

## Prerequisites

1.  **aaPanel Installed**: You should have access to your aaPanel dashboard.
2.  **Node.js**: You need Node.js installed on your local machine to build the project.

---

## Step 1: Build the Project Locally

First, you need to generate the production files. Open your terminal in the project folder and run:

```bash
npm run build
```

This command will create a new folder named `dist` in your project directory. This folder contains all the files you need to upload to the server.

## Step 2: Create a Website in aaPanel

1.  Log in to your **aaPanel** dashboard.
2.  Go to **Website** in the left sidebar.
3.  Click the **Add Site** button.
4.  **Domain**: Enter your domain name (e.g., `nzamy.com`).
5.  **Database**: You don't need a database for this frontend site, so you can leave it as "No Database" or create one if you plan to add a backend later.
6.  **PHP Version**: You can select "Static" if available, or any PHP version (it won't be used for React, but it's fine to have).
7.  Click **Submit**.

## Step 3: Upload Files

1.  In the **Website** list, click on the root directory path of your new site (e.g., `/www/wwwroot/nzamy.com`). This will open the **File Manager**.
2.  Delete the default `index.html` and `404.html` files created by aaPanel.
3.  Click **Upload**.
4.  Select all the files **inside** your local `dist` folder (not the `dist` folder itself, but its contents: `assets`, `index.html`, `vite.svg`, etc.).
5.  Upload them.

**Verify**: You should see `index.html` and an `assets` folder directly in `/www/wwwroot/your-domain.com`.

## Step 4: Configure Nginx for React Router (Important!)

Since this is a Single Page Application (SPA) using React Router, you need to configure Nginx to redirect all requests to `index.html`. Otherwise, refreshing a page like `/team/rami-baqader` will result in a 404 error.

1.  Go back to **Website** list.
2.  Click on your website name (or the "Conf" button) to open settings.
3.  Go to the **URL rewrite** tab (sometimes called **Rewrites**).
4.  Paste the following configuration:

```nginx
location / {
  try_files $uri $uri/ /index.html;
}
```

5.  Click **Save**.

## Step 5: Setup SSL (HTTPS)

1.  In the website settings popup, go to the **SSL** tab.
2.  Select **Let's Encrypt**.
3.  Select your domain name.
4.  Click **Apply**.
5.  Once successful, toggle the **Force HTTPS** switch to on.

## Step 6: Verify

Open your website in a browser.
1.  Check that the homepage loads.
2.  Navigate to a team member's page.
3.  **Refresh the page** while on a team member's profile. If it reloads correctly without a 404 error, your Nginx configuration is correct.

---

**Troubleshooting**

*   **404 on Refresh**: Double-check Step 4. The rewrite rule is essential.
*   **Favicon Not Showing**: If the favicon doesn't appear, try clearing your browser cache or opening the site in an Incognito/Private window. It can take some time for browsers to update cached icons.
