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

## Scenario:
1. User will be created by signup endpoint