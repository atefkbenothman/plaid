**organizing my finances**

<img width="2016" alt="Screen Shot 2022-10-18 at 12 27 13 PM" src="https://user-images.githubusercontent.com/92714853/196527083-5248dedc-f1cc-4aab-b682-1db8c21727ae.png">

---

```
todo:
  development:
    [ ] setup docker containers for each service
    [x] setup pyproject, setup.py, setup.cfg, flake8
    [x] setup tests
    [x] review python automation

  git:
    [x] setup repo

notes:
- to run tests:
    pytest tests/

- to run linter:
    flake8 src/

- to run backend:
    cd backend/src/plaid
    python3 -m uvicorn server:app --reload

- to run frontend:
    cd frontend/app
    npm start

steps:
1. on page load, call /api/create_link_token to generate a link_token
2. once link_token is retrieved, we can link our account
3. click 'link account' button. link account
4. onsuccess, use the public_token we get back and pass that to the token_exhange function
5. exhange the token for an access_token
```
