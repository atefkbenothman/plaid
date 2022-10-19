import json
import datetime
import os
from dotenv import load_dotenv

import plaid
from plaid.api import plaid_api
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.item_public_token_exchange_request import ItemPublicTokenExchangeRequest
from plaid.model.accounts_get_request import AccountsGetRequest
from plaid.model.transactions_get_request import TransactionsGetRequest

load_dotenv()

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_CLIENT_NAME = os.getenv("PLAID_CLIENT_NAME")
PLAID_CLIENT_LANG = os.getenv("PLAID_CLIENT_LANG")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV")
PLAID_PRODUCTS = os.getenv("PLAID_PRODUCTS").split(",")
PLAID_COUNTRY_CODES = os.getenv("PLAID_COUNTRY_CODES").split(",")
PLAID_VERSION = "2020-09-14"

hosts = {
  "sandbox": plaid.Environment.Sandbox,
  "development": plaid.Environment.Development,
  "production": plaid.Environment.Production,
}


def retrieve_category(category_name: str) -> str:
  """
  custom category lookup.
  """
  cats = {
    "wants": [
      "travel",
      "taxi",
      "food and drink",
      "restaurants",
      "fast food",
      "cofee shop",
    ],
    "needs": [
      "payment",
      "credit card",
      "credit",
      "transfer",
    ]
  }
  for cat in cats:
    for sub_cat in cats[cat]:
      if category_name.lower() == sub_cat:
        return cat
  return "no-cat"


class PlaidClient:
  """
  custom client that will interact with the plaid servers.
  """

  def __init__(self):
    configuration = plaid.Configuration(
      host=hosts[PLAID_ENV],
      api_key={
        "clientId": PLAID_CLIENT_ID,
        "secret": PLAID_SECRET,
        "plaidVersion": PLAID_VERSION,
      }
    )
    api_client = plaid.ApiClient(configuration)
    self.client = plaid_api.PlaidApi(api_client)


  def create_link_token(self) -> dict:
    """
    generate a link token that will be used to create the Link widget.
    """
    products = []
    for product in PLAID_PRODUCTS:
      products.append(Products(product))
    country_codes = list(map(lambda x: CountryCode(x), PLAID_COUNTRY_CODES))
    user = LinkTokenCreateRequestUser(client_user_id=PLAID_CLIENT_ID)
    try:
      request = LinkTokenCreateRequest(
        products=products,
        client_name=PLAID_CLIENT_NAME,
        language=PLAID_CLIENT_LANG,
        country_codes=country_codes,
        user=user
      )
      # create link token
      response = self.client.link_token_create(request)
      data = response.to_dict()
      return data
    except plaid.ApiException as e:
      return e


  def set_access_token(self, public_token: str) -> dict:
    """
    exchange public token for an access_token
    """
    try:
      exchange_request = ItemPublicTokenExchangeRequest(
        public_token=public_token
      )
      exchange_response = self.client.item_public_token_exchange(exchange_request)
      data = exchange_response.to_dict()
      return data
    except plaid.ApiException as e:
      return e


  def get_categories(self) -> dict:
    """
    get information on categories returned by plaid.
    """
    try:
      response = self.client.categories_get({})
      data = response.to_dict()
      return data
    except plaid.ApiException as e:
      return e


  def get_accounts(self, access_token: str) -> dict:
    """
    get all accounts data.
    """
    try:
      request = AccountsGetRequest(access_token=access_token)
      response = self.client.accounts_get(request)
      data = response.to_dict()
      return data
    except plaid.ApiException as e:
      return e


  def get_transactions(self, access_token: str) -> dict:
    """
    get all transactions data.
    """
    start_date = datetime.date(2021, 1, 1)
    end_date = datetime.date(2022, 12, 30)
    try:
      request = TransactionsGetRequest(
        access_token=access_token,
        start_date=start_date,
        end_date=end_date
      )
      response = self.client.transactions_get(request)
      data = response.to_dict()
      # unpack accounts list
      accounts: list = data["accounts"]
      accs = {}
      for acc in accounts:
        acc_id = acc["account_id"]
        accs[acc_id] = acc
      data["accounts"] = accs
      return data
    except plaid.ApiException as e:
      return e


  def get_category_chart_data(self, access_token: str) -> dict:
    """
    categorize all transactions into our categories and calculate the totals.

    labels: [food, gas, wants, misc, rent, car_insurance, student_loans]
    data: [10, 5, 100, 70, 20, 10, 80],
    """
    labels = ["wants", "needs", "savings", "no-cat"]
    totals = {
      "wants": 0,
      "needs": 0,
      "savings": 0,
      "no-cat": 0,
    }
    colors =  [
      "rgba(255, 99, 132, 0.2)",
      "rgba(54, 162, 235, 0.2)",
      "rgba(255, 206, 86, 0.2)",
      "rgba(75, 192, 192, 0.2)",
    ]
    try:
      data = self.get_transactions(access_token)
      accounts = data["accounts"]
      transactions = data["transactions"]
      for transaction in transactions:
        amount = transaction["amount"]
        for category in transaction["category"]:
          cat = retrieve_category(category)
          totals[cat] += abs(amount)
      totals_data = [totals["wants"], totals["needs"], totals["savings"], totals["no-cat"]]
      data = {
        "labels": labels,
        "datasets": [
          {
            "label": "categories",
            "data": totals_data,
            "backgroundColor": colors
          }
        ]
      }
      return data
    except plaid.ApiException as e:
      return e
