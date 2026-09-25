# Frameboard

A focused AI creative workspace for turning rough visual directions into production-ready campaign assets.

The React frontend provides an original Frameboard workspace with Explore, Image Studio, Video Studio, connected Templates, and a MongoDB-backed design library. Flask owns the API and provider integrations; generated media is stored in Cloudinary and design records are persisted in MongoDB.

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
   For the requested MongoDB account, set these values in the root `.env` file:

   ```env
   MONGO_URI=mongodb+srv://<mongodb-user>:<mongodb-password>@<cluster-hostname>/<database>?retryWrites=true&w=majority
   DATABASE_NAME=SmartAds
   ADMIN_EMAIL=nakhalsheikh4@gmail.com
   ADMIN_PASSWORD=<the-password-you-provided>
   ADMIN_NAME=SmartAds Admin
   ```

   Keep the password in `.env` only. It must never be placed in React code, committed files, or a browser request.

   In MongoDB Atlas, open your project, choose **Database > Connect > Drivers**, select **Python**, copy the full connection string, and replace `<db-user>`, `<db-password>`, and `<database>`. Add your current IP under **Network Access** and confirm the database user has read/write access. MongoDB creates `SmartAds` when the first document is inserted; the admin seed command below performs that first write.
4. Install backend dependencies:

   ```bash
   pip install -r backend/requirements.txt
   ```

5. Start the Flask API:

   ```bash
   cd backend
   python app.py
   ```

   In a separate terminal, provision the MongoDB login once:

   ```bash
   cd backend
   python scripts/seed_admin.py
   ```

   The script is idempotent: rerunning it updates the same account password and role instead of creating duplicates.

6. Start the frontend in a second terminal:

   ```bash
   npm run dev
   ```

The frontend defaults to `http://127.0.0.1:5000` for the API and Vite serves the application locally.

## Adding Provider APIs

Provider secrets belong in the root `.env`; the frontend calls Flask and never receives these keys.

- Logo and poster generation: set `GEMINI_API_KEY`, then use `backend/services/design_service.py`. The frontend entry point is `frontend/services/api.js` in `designAPI.generateDesign`.
- Image uploads and generated media: set `CLOUD_NAME`, `CLOUD_API_KEY`, and `CLOUD_API_SECRET`. Upload routes are already exposed by the product/design controllers.
- Video generation: set `GEMINI_API_KEY` and the Cloudinary variables; the frontend call is `videoAdAPI.generateVideo`.
- Frontend API URL: set `VITE_API_URL` only if Flask is not running at `http://127.0.0.1:5000`.

Required values by feature:

- Authentication and saved designs: `MONGO_URI`, `DATABASE_NAME`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.
- Logo/poster generation with the current implementation: `GEMINI_API_KEY` plus all three Cloudinary values.
- OpenAI image generation: `OPENAI_API_KEY` and `OPENAI_IMAGE_MODEL`; this is an alternative provider and must be implemented in `backend/services/design_service.py` if you switch away from Imagen.
- Video generation: `GEMINI_API_KEY` plus Cloudinary values.

Never put provider secrets in `VITE_*` variables. React calls Flask; Flask calls OpenAI, Gemini, Cloudinary, and MongoDB.

When adding a new provider, put the secret lookup and provider request in a backend service/controller, expose a `/api/...` route, and add the corresponding method to `frontend/services/api.js`. Do not call provider APIs directly from React.

## Validation

```bash
npm run build
npm test -- --run
```

## 8x Submission Checklist

- Demonstrate the React workspace at the Vite URL.
- Show one image generation from the Image Studio and the same design appearing in the Saved Designs library after a refresh.
- Keep the Flask terminal and MongoDB/Cloudinary configuration ready to explain the real persistence path.
- Add the URL for a one-minute personal introduction video to the submission form or email. The video link must be shared separately; it is not something the application can generate for you.

## Agent Capture

The 8x assignment capture setup is preserved in `tools/agent-capture.ps1`, `CAPTURE-TEST.md`, and `.agent-logs/`. Do not remove or add `.agent-logs/` to `.gitignore`; assignment logs are part of the submission.

## Security Notes

- Provider keys belong only in local environment variables or deployment secrets.
- Frontend AI calls use the Flask API; provider keys are not bundled into browser code.
- Rotate any credentials previously exposed by the original SmartAds repository before deployment.
