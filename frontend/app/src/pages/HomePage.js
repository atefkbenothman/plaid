import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";


const AccountList = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data["accounts"]);
      })
      .catch((error) => {
        console.log(error);
        const accounts = [
          {
            "account_id": "123",
            "name": "test name",
            "official_name": "test official_name",
            "subtype": "test subtype",
            "balances": {
              "available": 100,
              "current": 110,
            }
          }
        ];
        setAccounts(accounts);
      });
  }, []);

  return (
    <div>
      <p className="fs-3">Accounts</p>
      {accounts.map((account, idx) => (
        <div key={idx}>
          <div className="card m-2">
            <div className="card-body">
              <p className="card-title fs-3 fw-bold">{account.name}</p>
              <p className="card-subtitle mb-3 text-muted">{account.official_name} ({account.subtype})</p>
              <p className="card-text fw-bold fs-6">Balance</p>
              <p className="card-text fs-6">current: ${account.balances.current}</p>
              <p className="card-text">available: ${account.balances.available}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
};


const TransactionList = () => {
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data["transactions"])
      })
      .catch((error) => {
        console.log(error);
        const transactions = [
          {
            "account_id": "123",
            "amount": 123,
            "category": ["test_cat_1", "test_cat_2"],
            "date": "2020-01-01",
            "name": "test_name",
            "merchant_name": "test merchant_name",
            "account_owner": "test account_owner",
          }
        ];
        setTransactions(transactions);
      });
  }, []);

  return (
    <div>
      <p className="fs-3">Transactions</p>
      <div className="card m-2">
        <div className="card-body">
          <table className="table table-bordered table-sm table-striped">
            <thead className="table-dark">
              <tr>
                <th scope="col">account id</th>
                <th scope="col">account owner</th>
                <th scope="col">amount</th>
                <th scope="col">merchant name</th>
                <th scope="col">category</th>
                <th scope="col">date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction, idx) => (
                <tr>
                  <td>{transaction.account_id}</td>
                  <td>{transaction.account_owner}</td>
                  <td>${transaction.amount}</td>
                  <td>{transaction.merchant_name}</td>
                  <td>{transaction.category}</td>
                  <td>{transaction.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}



export function HomePage() {
  const [linkToken, setLinkToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [hasAccessToken, setHasAccessToken] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/create_link_token", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setLinkToken(data["link_token"]);
      })
  }, []);

  const onSuccess = React.useCallback((public_token, metadata) => {
    setAccessToken(public_token);
    fetch("http://localhost:8000/api/set_access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_token }),
    })
      .then(() => {
        setHasAccessToken(true);
      });
  }, []);

  const config = {
    token: linkToken,
    // receivedRedirectUri: window.location.href,
    onSuccess,
  }

  const { open, ready } = usePlaidLink(config);


  return (
    <div className="container">

      <div className="row">
        <div className="col">
          <p className="fs-2">Finance Tracker</p>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <div className="d-flex">
            <p className="fw-bold">link_token:</p>
            <p className="px-2">{linkToken}</p>
          </div>
          <div className="d-flex">
            <p className="fw-bold">access_token:</p>
            <p className="px-2">{accessToken}</p>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col">
          <button className="btn btn-primary btn-sm" onClick={() => open()}>
            Link Account
          </button>
        </div>
        <div className="col">
          <button className="btn btn-danger btn-sm" onClick={() => setHasAccessToken(true)}>
            Debug
          </button>
        </div>
      </div>

      <div className="row mt-5">
        <div className="col">
          {
            hasAccessToken ?
              (
                <div className="d-grid gap-3">
                  <AccountList />
                  <TransactionList />
                </div>
              ) :
              (
                <div>
                </div>
              )
          }
        </div>
      </div>

    </div>
  )
}
