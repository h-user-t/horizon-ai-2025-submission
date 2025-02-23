Horizon-AI
A web application that uses Next.js, Firestore, LiveKit, AWS S3, Whisper, and GPT-4 to provide AI-assisted therapy session recordings, transcriptions, and summaries.

Getting Started
Clone the repository

Change directory into the project folder
cd horizon-ai

Install dependencies
npm install

Set up environment variables

Create a file called .env.local in the root of horizon-ai.

Add your keys and environment-specific settings. For example:

NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_KEY_HERE
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_DOMAIN_HERE
LIVEKIT_API_KEY=YOUR_LIVEKIT_KEY
LIVEKIT_API_SECRET=YOUR_LIVEKIT_SECRET
OPENAI_API_KEY=YOUR_OPENAI_KEY

...etc
Run the development server
npm run dev

Open the application
In your browser, go to http://localhost:3000 to access the Horizon-AI application.

Contributing
Fork this repository
Create a new branch for your feature or bug fix.
Commit your changes to the new branch.
Submit a pull request to the main branch.
License
This project is licensed under the MIT License. Feel free to use and modify it as needed.

