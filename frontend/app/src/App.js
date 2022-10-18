import logo from './logo.svg';
import './App.css';

import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";


const AccountList = () => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/accounts")
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data["accounts"]);
      });
  }, []);

  return (
    <div>
      {accounts.map((account, idx) => (
        <div key={idx}>
          <p>Name: {account.name}</p>
          <p>Official Name: {account.official_name}</p>
          <p>Type: {account.subtype}</p>
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
      });
  }, []);

  return (
    <div>
      {transactions.map((transaction, idx) => (
        <div key={idx}>
          <p>{transaction.account_id}</p>
          <p>{transaction.amount}</p>
          <p>{transaction.category}</p>
        </div>
      ))}
    </div>
  )
}


function App() {
  const [linkToken, setLinkToken] = useState(null);
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
    <div className="App">
      <button className="btn btn-primary" onClick={() => open()}>
        Link account
      </button>
      {
        hasAccessToken ?
          (
            <div>
              <p>linked</p>

              <div className="card">
                <div className="card-body">
                  <h5>Accounts</h5>
                  <AccountList />
                </div>
              </div>

              <div className="card">
                <div className="card-body">
                  <h5>Transactions</h5>
                  <TransactionList />
                </div>
              </div>

            </div>
          ) :
          (
            <div>
              <p>not linked</p>
            </div>
          )
      }
    </div>
  );
}

export default App;
