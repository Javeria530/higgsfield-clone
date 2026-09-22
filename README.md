# Higgsfield Clone

A Higgsfield-inspired AI creative workspace built on the SmartAds technical foundation.

The active frontend provides a dark creative shell with Explore, Image Studio, Video Studio, Effects & Templates, and My Creations views. Existing Flask generation, upload, authentication, MongoDB, Cloudinary, Gemini, Imagen, and Veo integrations remain available behind the new experience.

## Stack

- React 19 and Vite
- Flask and Python
- MongoDB via PyMongo
- Cloudinary media storage
- Google Gemini, Imagen, and Veo APIs
- Lucide React icons

## Local Setup

1. Install Node.js 20.19+ or Node.js 22.12+.
2. Install frontend dependencies:

   ```bash
   npm install
   ```

3. Copy `.env.example` to `.env` and configure the required values. Never commit `.env` or provider credentials.
4. Install backend dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

5. Start the Flask API:

   ```bash
   cd backend
   python app.py
   ```

6. Start the frontend in a second terminal:

   ```bash
   npm run dev
   ```

The frontend defaults to `http://127.0.0.1:5000` for the API and Vite serves the application locally.

## Validation

```bash
npm run build
npm test -- --run
```

## Agent Capture

The 8x assignment capture setup is preserved in `tools/agent-capture.ps1`, `CAPTURE-TEST.md`, and `.agent-logs/`. Do not remove or add `.agent-logs/` to `.gitignore`; assignment logs are part of the submission.

## Security Notes

- Provider keys belong only in local environment variables or deployment secrets.
- Frontend AI calls use the Flask API; provider keys are not bundled into browser code.
- Rotate any credentials previously exposed by the original SmartAds repository before deployment.
