# Taras Chat App - Fullstack Internship Challenge 2026

A real-time, responsive chat application built with the modern T3-style stack (Next.js, Convex, Clerk). This project satisfies all 14 functional requirements of the Tars Fullstack Engineer Internship Coding Challenge.

## 🚀 Live Demo
- **Vercel App:** [Link to your Vercel URL]
- **Loom Explanation:** [Link to your Loom Video]

## ✨ Features Implemented
### Core (1-10)
- **Auth:** Clerk integration with Convex user-profile syncing.
- **Real-time:** 1-on-1 Direct Messaging with Convex subscriptions.
- **UI/UX:** Responsive design, Smart Auto-scroll, and Empty States.
- **Presence:** Global Online/Offline indicators and real-time Typing Indicators.
- **Feedback:** Unread message counts and dynamic timestamps.

### Advanced (11-14)
- **Soft Delete:** Users can delete messages while keeping the record for audit.
- **Reactions:** Interactive emoji reactions with real-time counts.
- **Performance:** Skeleton loaders and graceful error handling with retry logic.
- **Groups:** Support for creating and managing group conversations.

## 🛠️ Tech Stack
- **Framework:** Next.js 15 (App Router)
- **Backend/DB:** Convex (Real-time database & Serverless functions)
- **Auth:** Clerk (Authentication & User Management)
- **Styling:** Tailwind CSS + Lucide Icons

## ⚙️ Local Setup
1. Clone the repo: `git clone <your-repo-url>`
2. Install dependencies: `npm install`
3. Set up `.env.local`:
   ```env
   NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_key
   CLERK_SECRET_KEY=your_key
   NEXT_PUBLIC_CONVEX_URL=your_url