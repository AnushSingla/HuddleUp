# <p align="center"> 🏟️ HuddleUp — The Social Hub for Sports Fans</p>

<!-------------------------------------------------->
<div align="center">

[![Open Source](https://badges.frapsoft.com/os/v1/open-source.svg?v=103)](https://github.com/ellerbrock/open-source-badges)
[![Vercel Status](https://vercelbadge.vercel.app/api/AnushSingla/HuddleUp)](https://vercel.com)
![PRs Welcome](https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat)
![Visitors](https://komarev.com/ghpvc/?username=AnushSingla&style=flat)
![GitHub forks](https://img.shields.io/github/forks/AnushSingla/HuddleUp)
![GitHub Repo stars](https://img.shields.io/github/stars/AnushSingla/HuddleUp)
![GitHub last commit](https://img.shields.io/github/last-commit/AnushSingla/HuddleUp)
![GitHub repo size](https://img.shields.io/github/repo-size/AnushSingla/HuddleUp)
![Github](https://img.shields.io/github/license/AnushSingla/HuddleUp)
![GitHub issues](https://img.shields.io/github/issues/AnushSingla/HuddleUp)
![GitHub closed issues](https://img.shields.io/github/issues-closed-raw/AnushSingla/HuddleUp)
![GitHub pull requests](https://img.shields.io/github/issues-pr/AnushSingla/HuddleUp)
![GitHub closed pull requests](https://img.shields.io/github/issues-pr-closed/AnushSingla/HuddleUp)

</div>

<!-------------------------------------------------->

<h2>Table of Contents🧾</h2>

- [Introduction📌](#introduction)
- [Key Features✨](#key-features)
- [Tech Stack🛠️](#tech-stack)
- [Project Structure📁](#project-structure)
- [Getting Started💥](#getting-started)
- [Contributing Guidelines📑](#contributing-guidelines)
- [Code Of Conduct📑](#code-of-conduct)
- [Contributing is fun🧡](#contributing-is-fun)

<!-------------------------------------------------->

## Introduction📌

HuddleUp is a **full‑stack MERN social media platform** built exclusively for sports enthusiasts.  
It allows fans to **upload videos, engage in discussions, follow creators, and connect with communities** across different sports — all in one modern, fast, and responsive application.

<!-------------------------------------------------->


## Key Features✨

### 🎥 Content & Engagement
- Upload and share sports-related videos (highlights, reactions, analysis)
- Like videos and interact with creators
- Threaded comment system with replies
- Active discussion forums per post

### 👥 Social Networking
- Follow creators and other users
- Send & accept friend requests
- View participant activity in discussions

### 🔍 Discovery
- Search users and content
- Explore trending videos
- Categorization by sport, team, or trend

### 🔐 Authentication & Security
- Secure JWT-based authentication
- Protected routes for authorized users
- Environment-based config for secrets

### 📱 UI / UX
- Fully responsive (mobile → desktop)
- Clean modern UI using Tailwind & ShadCN
- Smooth animations and transitions

## Tech Stack🛠️

<p align="center">
  <img src="https://skillicons.dev/icons?i=html,css,tailwind,js,nodejs,express,mongodb,react,jwt&size=48&theme=dark"/>
</p>

<!-------------------------------------------------->

## Project Structure📁

```bash
HuddleUp/
├── client/    # React frontend
└── server/    # Node.js + Express backend

```

## Getting Started💥

- Fork this Repository https://github.com/AnushSingla/HuddleUp.git.
- Clone the forked repository in your local system.
```
git clone https://github.com/<your-github-username>/HuddleUp.git
```
- View the [Live Project](https://huddle-up-beta.vercel.app) here.
- Raise an issue if you find a bug or add a feature.
- Wait for the issue to be assigned and proceed only after the issue is assigned to you.
- Navigate to the project directory.
```
cd HuddleUp
```
- Create a new branch for your feature.
```
git checkout -b <your_branch_name>
```
- Perfom your desired changes to the code base.
- Track and stage your changes.
```
# Track the changes
git status

# Add changes to Index
git add .
```
- Commit your changes.
```
git commit -m "your_commit_message"
```
- Push your committed changes to the remote repo.
```
git push origin <your_branch_name>
```
- Go to your forked repository on GitHub and click on `Compare & pull request`.
- Add an appropriate title and description to your pull request explaining your changes and efforts done.
- Click on `Create pull request`.
- Congrats! 🥳 You've made your first pull request to this project repo.
- Wait for your pull request to be reviewed and if required suggestions would be provided to improve it.
- Celebrate 🥳 your success after your pull request is merged successfully.



### Backend Setup Instructions

1. Ensure Node.js and npm are installed on your system. You can verify installation by running:
```
node -v
npm -v
```

2. Navigate to the backend directory:
```
cd server
```

3. Install the required dependencies:
```
npm install
```

4. Create a .env file in the backend root directory as given in as a .envexample and add your environment variables . Here's an example structure:
```
MONGO_URL="mongodb+srv://<your_mongo_db_url>.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0"
JWT_SECRET="THIS_IS_A_JWT_SECRET"
```

5. Start the backend server using nodemon:
```
nodemon server.js
```

This will start the server in development mode. By default, it will run on http://localhost:5000.


### Frontend Setup Instructions

1. Ensure npm are installed on your system. You can verify installation by running:
```
npm -v
```

2. Navigate to the frontend directory:
```
cd client
```

3. Install the required dependencies:
```
npm install
```

4. Create a .env file in the frontend root directory and add VITE API URL.
 . Here's an example structure:
```
VITE_API_BASE_URL=http://localhost:5000
```

5. Start the frontend server using:
```
npm run dev
```

<!-------------------------------------------------->

## Contributing Guidelines📑

Read our [Contributing Guidelines](https://github.com/AnushSingla/HuddleUp/blob/main/.github/CONTRIBUTING_GUIDELINES.md) to learn about our development process, how to propose bugfixes and improvements, and how to build to Eventica.

<!-------------------------------------------------->

## Code Of Conduct📑

This project and everyone participating in it is governed by the [Code of Conduct](https://github.com/AnushSingla/HuddleUp/blob/main/.github/CODE_OF_CONDUCT.md). By participating, you are expected to uphold this code.

<!-------------------------------------------------->

## Contributing is fun🧡

[![forthebadge](https://forthebadge.com/images/badges/built-with-love.svg)](https://forthebadge.com)
<h3>Contributions of any kind from anyone are always welcome🌟!!</h3>
<h3>Give it a 🌟 if you ❤ this project. Happy Coding👨‍💻</h3>

## 👨‍💻 Author

Anush Singla  
Email: singlaanush18@gmail.com  
Linkedln: https://www.linkedin.com/in/anush-singla-1b0899311/

## 📜 License

This project is licensed under the MIT License.
