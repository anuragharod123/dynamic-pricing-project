# Autonomous Pricing Agent

An AI-powered dynamic pricing system that monitors competitor prices and automatically adjusts product prices based on market conditions.

The project uses **LangGraph** for agent orchestration, **Tavily + Firecrawl** for competitor price discovery, **OpenRouter LLMs** for structured price extraction, and **AWS DynamoDB** for product and price-history storage.

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
- 🌐 FastAPI backend
- ⚛️ React frontend
- ☁️ Designed for AWS deployment

---

## 🏗️ Architecture

```text
                    ┌─────────────────┐
                    │  React Frontend │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │   FastAPI API   │
                    └────────┬────────┘
                             │
                             ▼
                    ┌─────────────────┐
                    │    LangGraph    │
                    │ Pricing Agent   │
                    └────────┬────────┘
                             │
                ┌────────────┴────────────┐
                ▼                         ▼
       ┌─────────────────┐       ┌─────────────────┐
       │ Competitor Price│       │ Pricing Engine  │
       │    Provider     │       │                 │
       └────────┬────────┘       └────────┬────────┘
                │                         │
        ┌───────┴────────┐                │
        ▼                ▼                ▼
     Tavily          Firecrawl        DynamoDB
        │                │                │
        └───────┬────────┘                │
                ▼                         │
          OpenRouter LLM                  │
                │                         │
                └────────────┬────────────┘
                             ▼
                       Price Update
```

---

## 🔄 Pricing Workflow

```text
Get Products
     ↓
Search Amazon / Flipkart
     ↓
Select Search Result
     ↓
Scrape Product Page
     ↓
Extract Relevant Content
     ↓
LLM extracts structured price
     ↓
Validate Model / Color / Storage
     ↓
Compare Competitor Prices
     ↓
Calculate Target Price
     ↓
Update DynamoDB
     ↓
Store Price History
```

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
- AWS Lambda (planned)
- Amazon API Gateway (planned)

### Frontend
- React
- Vite
- CSS

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
│   │   ├── pages/
│   │   ├── api.js
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── index.html
│
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

---

## ▶️ Running the Backend

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

## ▶️ Running the Frontend

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

This runs the LangGraph pricing workflow for all products.

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

The updated price is stored in DynamoDB and the competitor price is added to the price history.

---

## ☁️ Future Deployment

The application is designed to be deployed on AWS using:

```text
React
  ↓
API Gateway
  ↓
AWS Lambda
  ↓
FastAPI + LangGraph
  ↓
DynamoDB
```

AWS EventBridge can also be used to periodically trigger the pricing agent for automated price monitoring.

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
