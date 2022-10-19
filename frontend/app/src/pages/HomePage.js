import React, { useEffect, useState } from "react";
import { usePlaidLink } from "react-plaid-link";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";
import { Doughnut } from "react-chartjs-2";

ChartJS.register(ArcElement, Tooltip, Legend);


const AccountList = (props) => {
  const [accounts, setAccounts] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/accounts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: props.token }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data["accounts"]);
      })
      .catch((error) => {
        console.log(error);
        const accounts = [
          {
            "account_id": "123",
            "name": "Name1",
            "official_name": "officlaname1",
            "subtype": "subtype1",
            "balances": {
              "available": 100,
              "current": 110,
            },
          },
          {
            "account_id": "789",
            "name": "Name2",
            "official_name": "OfficialName2",
            "subtype": "Subtype2",
            "balances": {
              "available": 200,
              "current": 220,
            },
          }
        ];
        setAccounts(accounts);
      });
  }, [props.token]);

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


const SummaryChart = (props) => {
  const [hasData, setHasData] = useState(false);
  const [data, setData] = useState({});

  useEffect(() => {
    fetch("http://localhost:8000/api/chart/summary", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: props.token }),
    })
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setHasData(true);
      })
      .catch((error) => {
        console.log(error);
      })
  }, [props.token]);

  return (
    <div>
      <p className="fs-3">Summary</p>
      {
        hasData ? (
          <div>
            <Doughnut data={data} />
          </div>
        ) : (
          <div>
          </div>
        )
      }
    </div>
  )
}


const TransactionList = (props) => {
  const [accounts, setAccounts] = useState({});
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    fetch("http://localhost:8000/api/transactions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ access_token: props.token }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAccounts(data["accounts"]);
        setTransactions(data["transactions"]);
      })
      .catch((error) => {
        console.log(error);
        const accounts = {
          "123": {
            "account_id": "123",
            "name": "name1",
            "official_name": "officlaname1",
            "subtype": "subtype1",
            "balances": {
              "available": 100,
              "current": 110,
            },
          },
          "456": {
            "account_id": "789",
            "name": "Name2",
            "official_name": "OfficialName2",
            "subtype": "Subtype2",
            "balances": {
              "available": 200,
              "current": 220,
            },
          }
        };
        setAccounts(accounts);
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
  }, [props.token]);

  return (
    <div>
      <p className="fs-3" c>Transactions</p>
      <div className="m-2">
        <table className="table table-bordered table-sm table-striped">
          <thead className="table-dark">
            <tr>
              <th scope="col">account</th>
              {/* <th scope="col">account owner</th> */}
              <th scope="col">amount</th>
              <th scope="col">merchant</th>
              <th scope="col">category</th>
              <th scope="col">date</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction, idx) => (
              <tr>
                <td>{accounts[transaction.account_id].name}</td>
                {/* <td>{transaction.account_owner}</td> */}
                <td>${transaction.amount}</td>
                <td>{transaction.merchant_name}</td>
                <td>{transaction.category.join()}</td>
                <td>{transaction.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <SummaryChart token={props.token} />
    </div>
  )
}



export function HomePage() {
  const [linkToken, setLinkToken] = useState(null);
  const [publicToken, setPublicToken] = useState(null);
  const [accessToken, setAccessToken] = useState(null);
  const [hasAccessToken, setHasAccessToken] = useState(false);

  useEffect(() => {
    fetch("http://localhost:8000/api/create_link_token", {
      method: "POST",
    })
      .then((res) => res.json())
      .then((data) => {
        setLinkToken(data["link_token"]);
      });
  }, []);

  const onSuccess = React.useCallback((public_token, metadata) => {
    setPublicToken(public_token);
    fetch("http://localhost:8000/api/set_access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ public_token }),
    })
      .then((res) => res.json())
      .then((data) => {
        setAccessToken(data["access_token"]);
        setHasAccessToken(true);
      })
  }, []);

  const config = {
    token: linkToken,
    // receivedRedirectUri: window.location.href,
    onSuccess,
  }

  const { open } = usePlaidLink(config);

  const linkAccount = () => {
    open();
  }

  const debug = () => {
    setHasAccessToken(true);
  }

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
            <p className="fw-bold">public_token:</p>
            <p className="px-2">{publicToken}</p>
          </div>
          <div className="d-flex">
            <p className="fw-bold">access_token:</p>
            <p className="px-2">{accessToken}</p>
          </div>
        </div>
      </div>

      <div className="row p-0">
        <div className="col-md-2">
          <button className="btn btn-primary btn-sm text-nowrap" onClick={linkAccount}>
            Link Account
          </button>
        </div>
        <div className="col">
          <button className="btn btn-danger btn-sm" onClick={debug}>
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
                  <AccountList token={accessToken} />
                  <TransactionList token={accessToken} />
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
