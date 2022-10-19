from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from client import PlaidClient

app = FastAPI()

origins = [
  "http://localhost:3000"
]

app.add_middleware(
  CORSMiddleware,
  allow_origins=origins,
  allow_credentials=True,
  allow_methods=["*"],
  allow_headers=["*"],
)

plaid_client = PlaidClient()


@app.post("/api/create_link_token")
def create_link_token():
  """
  call the plaid client to create a link token.
  """
  response = plaid_client.create_link_token()
  return response


@app.post("/api/set_access_token")
def set_access_token(body: dict):
  """
  set the access token retrieved from /api/create_link_token.
  """
  public_token = body["public_token"]
  response = plaid_client.set_access_token(public_token)
  return response


@app.post("/api/accounts")
def get_accounts(body: dict):
  """
  call plaid client to retrieve account data.
  """
  access_token = body["access_token"]
  response = plaid_client.get_accounts(access_token)
  return response


@app.post("/api/transactions")
def get_transactions(body: dict):
  """
  call plaid client to retrieve transactions data.
  """
  access_token = body["access_token"]
  response = plaid_client.get_transactions(access_token)
  return response


@app.post("/api/chart/summary")
def get_summary_chart(body: dict):
  """
  call plaid client to retrieve the datasets needed for the summary
  chart.
  """
  access_token = body["access_token"]
  response = plaid_client.get_category_chart_data(access_token)
  return response
