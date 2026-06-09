# GoRide Backend

Backend em Node.js para o GoRide. A API hoje cobre cadastro/login, perfil de
usuario, CRUD de caronas, solicitacoes de carona, historico e avaliacoes.

## Como rodar

```bash
cd backend
npm install
npm run prisma:migrate
npm run prisma:generate
npm run dev
```

A API roda por padrao em:

```txt
http://localhost:3000
```

Para conferir se subiu:

```bash
curl http://localhost:3000/health
```

## Variaveis de ambiente

Use `.env.example` como base:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="troque-essa-chave-em-producao"
```

## Rotas principais

```txt
GET    /health

POST   /auth/register
POST   /auth/login
POST   /auth/forgot-password
POST   /auth/reset-password

GET    /user/:id
PUT    /user/:id

GET    /rides
GET    /rides/:id
GET    /rides/history/:userId
POST   /rides
PUT    /rides/:id
DELETE /rides/:id

POST   /rides/:rideId/requests
GET    /rides/:rideId/requests
PATCH  /requests/:requestId
GET    /passengers/:passengerId/requests

POST   /ratings
GET    /ratings/users/:userId
GET    /ratings/rides/:rideId
```

## Documentacao completa

Leia [DOCUMENTACAO_BACKEND.md](DOCUMENTACAO_BACKEND.md) para ver os modelos,
contratos de request/response, regras atuais e pontos que ainda precisam ser
melhorados.

## Dados de teste

O backend nao possui seed. Para testar, crie usuarios e caronas pelas rotas da
API ou pelo frontend.
