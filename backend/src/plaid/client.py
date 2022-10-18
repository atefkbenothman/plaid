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
from plaid.model.link_token_get_request import LinkTokenGetRequest

load_dotenv()

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV")
PLAID_PRODUCTS = os.getenv("PLAID_PRODUCTS")
PLAID_COUNTRY_CODES = os.getenv("PLAID_COUNTRY_CODES")
PLAID_VERSION = "2020-09-14"

hosts = {
  "sandbox": plaid.Environment.Sandbox,
  "development": plaid.Environment.Development,
  "production": plaid.Environment.Production,
}


class PlaidManager:

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
    self.access_token = None


  def get_access_token(self) -> str:
    if self.access_token is not None:
      return self.access_token
    raise Exception("not a valid access token")


  def create_link_token(self):
    """
    create a link token based on the project.
    """
    products = [Products("auth"), Products("transactions")]
    client_name = "Plaid Test Quickstart"
    language = "en"
    country_codes = [CountryCode("US")]
    user = LinkTokenCreateRequestUser(
      client_user_id=PLAID_CLIENT_ID
    )
    try:
      request = LinkTokenCreateRequest(
        products=products,
        client_name=client_name,
        language=language,
        country_codes=country_codes,
        user=user
      )
      # create link token
      response = self.client.link_token_create(request)
      data = response.to_dict()
      return data
    except plaid.ApiException as e:
      return e


  def set_access_token(self, link_token: str):
    """
    set the access token.
    """
    try:
      exchange_request = ItemPublicTokenExchangeRequest(
        public_token=link_token
      )
      exchange_response = self.client.item_public_token_exchange(exchange_request)
      access_token = exchange_response["access_token"]
      item_id = exchange_response["item_id"]
      self.access_token = access_token
      return exchange_response.to_dict()
    except plaid.ApiException as e:
      return e


  def get_accounts(self):
    """
    get accounts connected to the institution.
    """
    try:
      request = AccountsGetRequest(
        access_token=self.get_access_token()
      )
      accounts_response = self.client.accounts_get(request)
      return accounts_response.to_dict()
    except plaid.ApiException as e:
      return e


  def get_transactions(self):
    """
    get transactions from an account.
    """
    start_date = datetime.date(2021, 1, 1)
    end_date = datetime.date(2022, 12, 30)
    try:
      request = TransactionsGetRequest(
        access_token=self.get_access_token(),
        start_date=start_date,
        end_date=end_date
      )
      response = self.client.transactions_get(request)
      return response.to_dict()
    except plaid.ApiException as e:
      return e
