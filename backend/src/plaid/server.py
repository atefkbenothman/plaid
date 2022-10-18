from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from client import PlaidManager

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

plaid_manager = PlaidManager()

@app.post("/api/create_link_token")
def create_link_token():
  """
  create a link token.
  """
  resp = plaid_manager.create_link_token()
  return resp


@app.post("/api/set_access_token")
def set_access_token(token: dict):
  """
  set the access token retrieved from /api/create_link_token.
  """
  public_token = token["public_token"]
  resp = plaid_manager.set_access_token(public_token)
  return resp


@app.get("/api/accounts")
def get_accounts():
  """
  get accounts.
  """
  resp = plaid_manager.get_accounts()
  return resp


@app.get("/api/transactions")
def get_transactions():
  """
  get transactions.
  """
  resp = plaid_manager.get_transactions()
  return resp
