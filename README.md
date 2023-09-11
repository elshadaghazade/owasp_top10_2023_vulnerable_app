# OWASP TOP10 2023

Vulnerable app that covers some OWASP TOP10 topics/

## Usage

To install all dependencies:

To create a postgresql server in the docker container (But make sure on your local machine port 5433 is not used by another service)

```bash
docker-compose up -d
```

To install all dependencies:

```bash
npm install
```

To migrate all models to the database:

```bash
npx prisma migrate dev
```


To run the application in development mode:

```bash
npm run dev
```

To run this application in production mode:
```bash
npm run build && npm start
```

To generate codebase documentation, all static files of documentation will be located in the docs folder after the generation process:

```bash
npm run doc:gen
```

## PREREQUISITES
Create two users by signing up using ```/api/user/signup``` endpoint with the following emails:
- user1@gmail.com
- user2@gmail.com

And three administrator accounts with the following emails (these emails will be used to protect ```/api/user/all``` endpoint):
- admin1@gmail.com
- admin2@gmail.com
- admin3@gmail.com

Then add some money to the balance of each user using ```/api/balance/add``` endpoint. But don't forget to login first using ```/api/user/login``` endpoint. After the success login copy the access token from the response and paste to the Authenticate input.

## [API1:2023 Broken Object Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa1-broken-object-level-authorization/)

### Scenario

Using ```/api/balance/{uid}``` user can see it's balance and using ```/api/balance/transfer/{from}/{to}``` endpoint can send some amount of money to another user. But these endpoints are vulnerable, so that user can see the balance of any user or to put any user id and withdraw money from that user's balance without any permission.

### How to reproduce?
Login to the system by email user1@gmail.com. 
- Using the ```/api/balance/{uid}``` endpoint you can see balance of all users by replacing **{uid}** with real user id of any user in the url. 
- Using the ```/api/balance/transfer/{from}/{to}``` endpoint you can transfer money from any user to any user by replacing **{from}** and **{to}** part with any user ids.

## [API2:2023 Broken Authentication](https://owasp.org/API-Security/editions/2023/en/0xa2-broken-authentication/)

### Scenario

undocumented

### How to reproduce?

undocumented


## [API3:2023 Broken Object Property Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa3-broken-object-property-level-authorization/)

### Scenario

undocumented

### How to reproduce?

undocumented


## [API4:2023 Unrestricted Resource Consumption](https://owasp.org/API-Security/editions/2023/en/0xa4-unrestricted-resource-consumption/)

### Scenario

undocumented

### How to reproduce?

undocumented


## [API5:2023 Broken Function Level Authorization](https://owasp.org/API-Security/editions/2023/en/0xa5-broken-function-level-authorization/)

### Scenario

undocumented

### How to reproduce?

undocumented


## [API7:2023 Server Side Request Forgery](https://owasp.org/API-Security/editions/2023/en/0xa7-server-side-request-forgery/)

### Scenario

undocumented

### How to reproduce?

undocumented
