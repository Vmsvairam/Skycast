# Deploying SkyCast to Google Cloud Run

This guide will help you deploy the SkyCast application to your own Google Cloud Platform (GCP) project.

## Prerequisites

1.  **Google Cloud Project**: Create a project at [console.cloud.google.com](https://console.cloud.google.com).
2.  **Google Cloud SDK**: Install the `gcloud` CLI on your local machine.
3.  **Docker**: Ensure Docker is installed and running.

## Step 1: Enable Required APIs

Run the following command to enable the necessary APIs for Cloud Run and Container Registry:

```bash
gcloud services enable run.googleapis.com containerregistry.googleapis.com cloudbuild.googleapis.com
```

## Step 2: Configure Environment Variables

You will need your **OpenWeather API Key** and **Gemini API Key**.

## Step 3: Build and Deploy

You can deploy directly from your source code using the following command. Replace `[PROJECT_ID]` with your actual GCP Project ID.

```bash
gcloud run deploy skycast \
  --source . \
  --region us-central1 \
  --allow-unauthenticated \
  --set-env-vars="OPENWEATHER_API_KEY=your_openweather_key,GEMINI_API_KEY=your_gemini_key"
```

### Alternative: Build with Docker

If you prefer to build the image locally and push it:

1.  **Build the image**:
    ```bash
    docker build -t gcr.io/[PROJECT_ID]/skycast .
    ```

2.  **Push to Container Registry**:
    ```bash
    docker push gcr.io/[PROJECT_ID]/skycast
    ```

3.  **Deploy to Cloud Run**:
    ```bash
    gcloud run deploy skycast \
      --image gcr.io/[PROJECT_ID]/skycast \
      --platform managed \
      --region us-central1 \
      --allow-unauthenticated \
      --set-env-vars="OPENWEATHER_API_KEY=your_openweather_key,GEMINI_API_KEY=your_gemini_key"
```

## Step 4: Access Your App

Once the deployment is complete, Google will provide a service URL (e.g., `https://skycast-abc123.a.run.app`). You can open this in your browser to see your live application!

## Cost Management

Cloud Run scales to zero when not in use. To ensure you stay within the free tier:
- The first 180,000 vCPU-seconds and 360,000 GiB-seconds are free per month.
- The first 2 million requests are free per month.
