# Meetup Planner

A modern, responsive web application for planning and organizing meetups with friends and colleagues.

## Features

- **User Authentication**: Secure login and registration system
- **Meetup Creation**: Create meetups with detailed information
- **Date Polling**: Let participants vote on preferred dates
- **Participant Management**: Join meetups, manage preferences, and track participation
- **Shopping Lists**: Collaborative shopping list management with per-person calculations
- **Cost Splitting**: Track and split costs among participants
- **Item Suggestions**: Participants can suggest items for the shopping list
- **Multi-language Support**: English and German translations
- **Dark/Light Theme**: Toggle between themes
- **Mobile Responsive**: Works great on all devices
- **Real-time Updates**: Live updates for all participants

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS with custom design system
- **Database**: Firebase Firestore
- **Authentication**: Custom authentication with Firebase
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn
- Firebase project

### Installation

1. Clone the repository:
\`\`\`bash
git clone <repository-url>
cd meetup-planner
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
Create a `.env.local` file with your Firebase configuration:
\`\`\`
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_auth_domain
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_storage_bucket
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
\`\`\`

4. Run the development server:
\`\`\`bash
npm run dev
\`\`\`

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

### Firebase Setup

1. Create a new Firebase project
2. Enable Firestore Database
3. Set up the following collections:
   - `users` - for user authentication
   - `meetups` - for meetup data

### Deployment

The app is optimized for deployment on Vercel:

1. Connect your repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy!

## Usage

1. **Register/Login**: Create an account or sign in
2. **Create Meetup**: Set up a new meetup with date, location, and details
3. **Share Code**: Share the 6-character meetup code with participants
4. **Join Meetup**: Participants can join using the meetup code
5. **Manage**: Track participants, costs, and shopping items
6. **Date Polling**: Use multiple date options for flexible scheduling

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.
