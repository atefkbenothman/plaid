import json
import plaid
import os
from dotenv import load_dotenv

from plaid.api import plaid_api
from plaid.model.products import Products
from plaid.model.country_code import CountryCode
from plaid.model.link_token_create_request import LinkTokenCreateRequest
from plaid.model.link_token_create_request_user import LinkTokenCreateRequestUser
from plaid.model.link_token_get_request import LinkTokenGetRequest

load_dotenv()

PLAID_CLIENT_ID = os.getenv("PLAID_CLIENT_ID")
PLAID_SECRET = os.getenv("PLAID_SECRET")
PLAID_ENV = os.getenv("PLAID_ENV")
PLAID_PRODUCTS = os.getenv("PLAID_PRODUCTS")
PLAID_COUNTRY_CODES = os.getenv("PLAID_COUNTRY_CODES")


def create_link_token(client: plaid_api.PlaidApi, products: list) -> dict:
  try:
    request = LinkTokenCreateRequest(
      products=[Products("auth"), Products("transactions")],
      client_name="Plaid Client Name",
      country_codes=[CountryCode("US")],
      language="en",
      user=LinkTokenCreateRequestUser(
        client_user_id="123456"
      )
    )
    response = client.link_token_create(request)
    data = response.to_dict()
    print(json.dumps(data, indent=2, default=str))
    link_token = data["link_token"]
    request = LinkTokenGetRequest(
      link_token=link_token
    )
    response = client.link_token_get(request)
    data = response.to_dict()
    print(json.dumps(data, indent=2, default=str))
  except plaid.ApiException as e:
    print(json.dumps(json.loads(e.body), indent=2, default=str))
  return


def main() -> None:
  host = {
    "sandbox": plaid.Environment.Sandbox,
    "development": plaid.Environment.Development,
    "production": plaid.Environment.Production
  }
  configuration = plaid.Configuration(
    host=host[PLAID_ENV],
    api_key={
      "clientId": PLAID_CLIENT_ID,
      "secret": PLAID_SECRET,
      "plaidVersion": "2020-09-14"
    }
  )
  api_client = plaid.ApiClient(configuration)
  client = plaid_api.PlaidApi(api_client)
  products = []
  for product in PLAID_PRODUCTS:
    products.append(Products(product))
  create_link_token(
    client=client,
    products=products
  )
  return


if __name__ == "__main__":
  main()

