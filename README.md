# FocusFence

A personal focus dashboard to help you block out distractions, track study sessions, and boost productivity. This application is designed to run entirely in the browser with no build step required.

## Features

- **Focus Sessions:** Start a timer to focus on your work. A virtual tree grows as you maintain focus.
- **Distraction Blocking:** The app enters fullscreen and creates a visual "buzz" effect if you navigate away, helping you stay on task.
- **Progress Tracking:** "Plant" a tree for each completed session and see your total count grow.
- **Minimalist Design:** A clean, dark-themed interface to minimize eye strain and help you concentrate.
- **Offline First:** All your progress is stored locally in your browser. No account needed.
- **Lightweight & Fast:** No heavy libraries or build steps, ensuring the app loads quickly.

## How to Run Locally

1.  Clone this repository or download the files.
2.  Open the `index.html` file in a modern web browser that supports ES Modules and Import Maps (like the latest versions of Chrome, Firefox, Edge, or Safari).

That's it! There's no need for a build process or a local server.

## Deployment

This project is configured for easy deployment to static hosting services like GitHub Pages.

### GitHub Pages

1.  **Repository Setup:** Make sure your main HTML file, `index.html`, is in the root directory of your repository.
2.  **Push to GitHub:** Push all the project files to your GitHub repository.
3.  **Enable GitHub Pages:**
    *   In your repository on GitHub, go to the **Settings** tab.
    *   In the left sidebar, click on **Pages**.
    *   Under "Build and deployment", for the "Source", select **Deploy from a branch**.
    *   Select the branch you want to deploy from (usually `main` or `master`) and keep the folder as `/ (root)`.
    *   Click **Save**.
4.  **Access Your Site:** GitHub will provide you with a URL (e.g., `https://<your-username>.github.io/<repository-name>/`). It might take a few minutes for the site to become live.