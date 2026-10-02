# Autonomous Pricing Agent

An AI-powered dynamic pricing system that monitors competitor prices and automatically adjusts product prices based on market conditions.

The project uses **LangGraph** for agent orchestration, **Tavily + Firecrawl** for competitor price discovery, **OpenRouter LLMs** for structured price extraction, and **AWS DynamoDB** for product and price-history storage.

The application is deployed using a serverless AWS architecture with **API Gateway, Lambda, SQS, ECR, and DynamoDB**.

---

## 🚀 Features

- 🔍 Search competitor prices from Amazon and Flipkart
- 🌐 Scrape competitor product pages using Firecrawl
- 🤖 LLM-based structured price extraction
- ✅ Validate product model, color, and storage variant
- 📊 Compare competitor prices with our current price
- 💰 Automatically increase/decrease product prices
- 🗃️ Store competitor price history in DynamoDB
- 🔄 Process multiple products using LangGraph
- ⚡ Asynchronous agent execution using Amazon SQS
- 🌐 FastAPI backend
- ⚛️ React frontend
- ☁️ Serverless AWS deployment
- 📈 Dashboard for product pricing and competitor price history

---

## 🏗️ Architecture

```text
                         React Frontend
                              │
                              ▼
                        API Gateway
                              │
                              ▼
                    ┌──────────────────┐
                    │   API Lambda     │
                    │     FastAPI      │
                    └────────┬─────────┘
                             │
                       POST /agent/run
                             │
                             ▼
                           SQS
                    dynamic-pricing-queue
                             │
                             ▼
                    ┌──────────────────┐
                    │  Agent Lambda    │
                    │    LangGraph     │
                    └────────┬─────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
       Competitor Price Provider     Pricing Engine
                │                         │
        ┌───────┴────────┐                │
        ▼                ▼                ▼
     Tavily          Firecrawl        DynamoDB
        │                │                │
        └───────┬────────┘                │
                ▼                         │
          OpenRouter LLM                 │
                │                         │
                └────────────┬────────────┘
                             ▼
                       Price Update
                             │
                             ▼
                      Price History
```

---

## 🔄 Pricing Workflow

```text
Get Products
     ↓
Search Amazon / Flipkart using Tavily
     ↓
Take the first search result
     ↓
Scrape product page using Firecrawl
     ↓
Extract relevant product content
     ↓
LLM extracts structured price
     ↓
Validate Model / Color / Storage
     ↓
Compare Competitor Prices
     ↓
Calculate Target Price
     ↓
Update Product Price in DynamoDB
     ↓
Store Competitor Price History
```

---

## ⚡ Asynchronous Agent Execution

The pricing agent can take longer than the API Gateway request timeout, so agent execution is decoupled using Amazon SQS.

```text
User clicks "Run Agent"
          ↓
POST /agent/run
          ↓
API Gateway
          ↓
API Lambda
          ↓
Send message to SQS
          ↓
Return immediately (202)
          ↓
SQS triggers Agent Lambda
          ↓
LangGraph pricing workflow
          ↓
DynamoDB updates
```

The dashboard immediately shows that the agent is running in the background. Product prices can then be refreshed after the agent completes.

---

## 🧠 Pricing Logic

The pricing engine compares the current product price with the average available competitor price.

```text
Current Price < Competitor Average
        ↓
     INCREASE

Current Price > Competitor Average
        ↓
     DECREASE

Current Price = Competitor Average
        ↓
       KEEP

No valid competitor price
        ↓
       KEEP
```

---

## 🛠️ Tech Stack

### Backend
- Python
- FastAPI
- LangChain
- LangGraph
- Pydantic

### AI / LLM
- OpenRouter
- Qwen / NVIDIA models
- Structured JSON extraction

### Competitor Data
- Tavily
- Firecrawl
- Amazon
- Flipkart

### AWS
- Amazon DynamoDB
- AWS Lambda
- Amazon API Gateway
- Amazon SQS
- Amazon ECR
- Docker

### Frontend
- React
- Vite
- JavaScript
- CSS
- Lucide React

---

## 📁 Project Structure

```text
dynamic-pricing-project/
│
├── app/
│   ├── database.py
│   ├── product_service.py
│   ├── competitor_price_service.py
│   ├── models.py
│   └── main.py
│
├── agent/
│   ├── price/
│   │   ├── competitor_price_provider.py
│   │   ├── price_updater.py
│   │   ├── price_validator.py
│   │   └── pricing_engine.py
│   │
│   ├── graph.py
│   ├── nodes.py
│   ├── price_pipeline.py
│   └── state.py
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.jsx
│   │   │   ├── ProductCard.jsx
│   │   │   └── Sidebar.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Products.jsx
│   │   │   └── PriceHistory.jsx
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── index.html
│
├── Dockerfile
├── requirements.txt
├── .env
├── .gitignore
└── README.md
```

---

## ⚙️ Environment Variables

Create a `.env` file in the project root:

```env
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_REGION=ap-south-1

TAVILY_API_KEY=
FIRECRAWL_API_KEY=
OPENROUTER_API_KEY=
GOOGLE_API_KEY=
HUGGINGFACEHUB_API_TOKEN=
```

**Never commit `.env` or API keys to GitHub.**

When running inside AWS Lambda, AWS credentials are provided by the Lambda execution role.

---

## ▶️ Running the Backend Locally

Create and activate a virtual environment:

```bash
python -m venv venv
```

Windows:

```bash
venv\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
uvicorn app.main:app --reload
```

Backend will be available at:

```text
http://127.0.0.1:8000
```

---

## ▶️ Running the Frontend Locally

Navigate to the frontend:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

---

## 🔌 API Endpoints

### Get all products

```http
GET /products
```

### Get product

```http
GET /products/{product_id}
```

### Update product price

```http
PUT /products/update_price/{product_id}
```

Example:

```json
{
  "price": 99900
}
```

### Run Pricing Agent

```http
POST /agent/run
```

The endpoint places a pricing-agent job onto Amazon SQS and returns immediately with HTTP `202`.

### Get Price History

```http
GET /price-history/{product_id}
```

---

## 📊 Example

For a product:

```text
Current Price: ₹99,900

Amazon: ₹1,04,900
Flipkart: ₹1,02,900
```

Average competitor price:

```text
₹1,03,900
```

The pricing engine determines:

```text
Action: INCREASE
Target Price: ₹1,03,900
```

The updated price is stored in DynamoDB and the competitor prices are added to price history.

---

## ☁️ AWS Deployment

The project uses the following AWS components:

```text
React Frontend
      ↓
API Gateway
      ↓
Lambda
      ↓
SQS
      ↓
Lambda
      ↓
LangGraph Pricing Agent
      ↓
DynamoDB
```

The Lambda function is packaged as a Docker image and stored in Amazon ECR.

The SQS queue decouples the API request from the long-running pricing workflow, allowing the API to respond immediately while the agent continues processing in the background.

---

## 🔐 Security Notes

- API keys and AWS credentials are stored in `.env` and excluded using `.gitignore`.
- The API Gateway URL used by the frontend is **not a secret** and can be present in frontend source code.
- The current personal-project deployment does not add authentication to the API endpoints. For a production deployment, API authentication/authorization and additional rate limiting should be added before exposing the write and agent-trigger endpoints publicly.

---

## 🎯 Project Goal

The goal of this project is to build an autonomous pricing system that can:

1. Discover competitor prices
2. Verify the correct product variant
3. Extract structured pricing data
4. Analyze the competitive market
5. Make pricing decisions
6. Automatically update product prices
7. Maintain historical pricing data

---

## 👨‍💻 Author

**Anurag Harod**

Built as a personal project to explore:

- Agentic AI
- LangGraph
- LLM-based data extraction
- Dynamic pricing
- AWS serverless architecture
- AI-driven automation
