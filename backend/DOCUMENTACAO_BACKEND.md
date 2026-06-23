# Documentacao do Backend GoRide

Este documento resume como o backend esta organizado e quais rotas existem hoje.
A ideia e servir como guia para rodar, testar e continuar o desenvolvimento sem
precisar adivinhar o fluxo pelo codigo.

## Visao geral

O backend usa:

- Node.js com TypeScript
- Express para rotas HTTP
- Prisma como ORM
- SQLite como banco local
- Zod para validar entrada
- bcrypt para hash de senha
- jsonwebtoken para gerar e validar JWT

Funcionalidades atuais:

- Cadastro e login
- Redefinicao de senha com token temporario
- Consulta e edicao de perfil
- CRUD de caronas
- Historico de caronas por usuario
- Criacao, listagem e resposta de solicitacoes de carona
- Avaliacoes de usuarios por carona

Ainda nao existem chat, notificacoes ou tela administrativa.

## Como executar

Entre na pasta do backend:

```powershell
cd backend
```

Instale as dependencias:

```powershell
npm install
```

Crie as tabelas a partir das migrations:

```powershell
npm run prisma:migrate
```

Gere o Prisma Client:

```powershell
npm run prisma:generate
```

Suba a API:

```powershell
npm run dev
```

Teste a API:

```powershell
curl.exe http://localhost:3000/health
```

Resposta esperada:

```json
{
  "status": "ok",
  "service": "goride-backend"
}
```

## Banco e migrations

O banco local usa SQLite. O schema fica em:

```txt
prisma/schema.prisma
```

As migrations atuais ficam em:

```txt
prisma/migrations/
```

Modelos principais:

- `User`
- `Ride`
- `RideRequest`
- `Rating`

O backend nao possui seed. Para testar o sistema, crie usuarios, caronas,
solicitacoes e avaliacoes pelas rotas da API ou pelo frontend.

## Variaveis de ambiente

Exemplo:

```env
DATABASE_URL="file:./dev.db"
PORT=3000
CORS_ORIGIN="http://localhost:5173"
JWT_SECRET="troque-essa-chave-em-producao"
```

Campos:

- `DATABASE_URL`: caminho do banco SQLite.
- `PORT`: porta da API.
- `CORS_ORIGIN`: origem permitida para o frontend.
- `JWT_SECRET`: chave usada para assinar os tokens JWT.

O codigo tem fallback para `dev-secret`, mas o ideal e sempre definir
`JWT_SECRET` no `.env`.

## Estrutura de pastas

```txt
backend/
  src/
    app.ts
    server.ts
    lib/
      app-error.ts
      prisma.ts
    modules/
      auth/
      user/
      rides/
      ride-request/
    types/
      express.d.ts
  prisma/
    schema.prisma
    migrations/
  package.json
```

Responsabilidades:

- `src/server.ts`: carrega variaveis de ambiente e inicia o servidor.
- `src/app.ts`: configura Express, CORS, JSON, rotas e tratamento de erro.
- `src/lib/prisma.ts`: cria a instancia do Prisma Client.
- `src/lib/app-error.ts`: erro customizado para respostas HTTP esperadas.
- `src/types/express.d.ts`: adiciona `userId` ao tipo `Request`.
- `src/modules/*`: separa rotas, controllers, services e schemas por recurso.

## Autenticacao

### POST /auth/register

Cria uma conta.

Body:

```json
{
  "name": "Nome do Usuario",
  "email": "usuario@email.com",
  "cpf": "12345678900",
  "phone": "(82) 99999-9999",
  "gender": "Feminino",
  "birthDate": "1998-03-15",
  "password": "123456"
}
```

Regras:

- `email` precisa ser valido.
- `cpf` precisa ter 11 digitos sem pontuacao.
- `password` precisa ter pelo menos 6 caracteres.
- Email e CPF nao podem se repetir.

Resposta:

```json
{
  "user": {
    "id": "uuid",
    "name": "Nome do Usuario",
    "email": "usuario@email.com",
    "gender": "Feminino",
    "phone": "(82) 99999-9999",
    "birthDate": "1998-03-15",
    "bio": null,
    "pix": null,
    "avatar": null,
    "privateMode": false,
    "emailVerified": false,
    "rating": 0,
    "totalRatings": 0,
    "createdAt": "2026-06-03T00:00:00.000Z"
  },
  "token": "jwt"
}
```

### POST /auth/login

Faz login por email e senha.

Body:

```json
{
  "email": "usuario@email.com",
  "password": "123456"
}
```

Resposta:

```json
{
  "user": {},
  "token": "jwt"
}
```

Use o token nas rotas protegidas:

```txt
Authorization: Bearer <token>
```

### POST /auth/forgot-password

Inicia o fluxo de redefinicao de senha.

Body:

```json
{
  "email": "ana@email.com"
}
```

Resposta:

```json
{
  "message": "Se o email existir, um link de redefinicao sera enviado."
}
```

O token e enviado apenas por e-mail, expira em 15 minutos e pode ser usado uma
unica vez. A resposta e a mesma para e-mails existentes e inexistentes.

### POST /auth/reset-password

Altera a senha usando o token gerado no passo anterior.

Body:

```json
{
  "token": "token-recebido-por-email",
  "password": "nova-senha"
}
```

Resposta:

```json
{
  "message": "Senha atualizada com sucesso."
}
```

## Usuarios

### GET /user/:id

Busca um usuario pelo id.

Atencao: no estado atual, o service retorna o usuario direto do Prisma. Isso
pode expor campos que nao deveriam ir para o frontend, como `passwordHash`,
`cpf` e dados privados. O ideal e formatar a resposta antes de enviar.

### PUT /user/:id

Atualiza perfil. Usa `authMiddleware`, entao precisa do header:

```txt
Authorization: Bearer <token>
```

Body aceito:

```json
{
  "name": "Nome do Usuario",
  "phone": "(82) 99999-9999",
  "bio": "Minha bio",
  "pix": "chave pix",
  "avatar": "https://exemplo.com/avatar.png",
  "privateMode": false,
  "birthDate": "1998-03-15",
  "gender": "Feminino",
  "email": "usuario@email.com"
}
```

Atencao: hoje a rota valida o token, mas ainda nao compara `request.userId` com
o `:id` da URL. Isso precisa ser corrigido para impedir edicao de outro perfil.

## Caronas

### GET /rides

Lista caronas.

Filtros aceitos:

```txt
origin
destination
date
timeStart
timeEnd
maxPrice
sameGenderOnly
driverId
status
```

Exemplo:

```txt
GET /rides?origin=Jatiuca&date=2026-05-20&maxPrice=10
```

### GET /rides/:id

Busca uma carona por id.

### GET /rides/history

Retorna o historico de caronas do usuario autenticado.

Exemplo:

```txt
GET /rides/history
```

Resposta:

```json
{
  "offered": [],
  "requested": []
}
```

`offered` traz caronas oferecidas pelo usuario. `requested` traz solicitacoes
feitas pelo usuario como passageiro. Entram no historico caronas com status
diferente de `active` ou com data anterior ao dia atual.

### POST /rides

Cria uma carona.

Body:

```json
{
  "origin": "Jatiuca",
  "destination": "UFAL - Campus A.C. Simoes",
  "date": "2026-05-20",
  "departureTimeStart": "07:30",
  "departureTimeEnd": "08:00",
  "price": 6.5,
  "totalSeats": 3,
  "sameGenderOnly": false
}
```

Campos opcionais:

- `availableSeats`
- `routeId`
- `routeName`

Regras:

- `totalSeats` deve estar entre 1 e 4.
- `availableSeats` nao pode ser maior que `totalSeats`.
- `departureTimeEnd` nao pode ser menor que `departureTimeStart`.
- O motorista e identificado pelo token de autenticacao.

### PUT /rides/:id

Edita uma carona. Todos os campos sao opcionais.

Exemplo:

```json
{
  "price": 8,
  "availableSeats": 2
}
```

### DELETE /rides/:id

Remove uma carona.

Somente o motorista autenticado pode editar ou remover a propria carona.

## Solicitacoes de carona

### POST /rides/:rideId/requests

Cria uma solicitacao para participar de uma carona.

O passageiro e identificado pelo token de autenticacao; a rota nao recebe body.

Regras atuais:

- A carona precisa existir.
- A carona precisa estar com status `active`.
- A carona precisa ter vaga disponivel.
- O motorista nao pode solicitar a propria carona.
- O mesmo passageiro nao pode solicitar a mesma carona duas vezes.

### GET /rides/:rideId/requests

Lista solicitacoes de uma carona.

### PATCH /requests/:requestId

Aceita ou recusa uma solicitacao.

Body:

```json
{
  "driverId": "uuid-do-motorista",
  "status": "accepted"
}
```

`status` pode ser:

```txt
accepted
rejected
```

Quando aceita, a API decrementa `availableSeats` da carona.

Aceite da solicitacao e reserva da vaga acontecem na mesma transacao.

### GET /passengers/me/requests

Lista solicitacoes feitas pelo passageiro autenticado.

## Avaliacoes

### POST /ratings

Cria uma avaliacao de um usuario para outro usuario em uma carona.

Body:

```json
{
  "toUserId": "uuid-de-quem-recebe",
  "rideId": "uuid-da-carona",
  "rating": 5,
  "comment": "Foi pontual e comunicativo."
}
```

Regras:

- A nota precisa estar entre 1 e 5.
- O usuario nao pode avaliar a si mesmo.
- O avaliador e identificado pelo token de autenticacao.
- Motorista e passageiro precisam ter participado da carona.
- A carona precisa ter terminado e nao pode estar cancelada.
- O mesmo usuario nao pode avaliar a mesma pessoa duas vezes na mesma carona.

Criacao da avaliacao e atualizacao de `rating` e `totalRatings` acontecem na
mesma transacao.

### GET /ratings/users/:userId

Lista avaliacoes recebidas por um usuario.

### GET /ratings/rides/:rideId

Lista avaliacoes feitas em uma carona.

## Tratamento de erros

Erros esperados usam `AppError`:

```json
{
  "message": "Carona nao encontrada"
}
```

Erros de validacao retornam:

```json
{
  "message": "Dados invalidos",
  "issues": []
}
```

Rotas inexistentes retornam:

```json
{
  "message": "Rota nao encontrada"
}
```

## Pontos que precisam de melhoria

Prioridade alta:

- Proteger rotas de carona com JWT.
- Usar `request.userId` no lugar de `driverId` e `passengerId` enviados pelo cliente.
- Impedir que um usuario edite perfil de outro usuario.
- Remover `passwordHash`, `cpf` e dados privados das respostas de usuario.
- Usar transacao ao aceitar solicitacao de carona.
- Enviar redefinicao de senha por email em vez de retornar o token no JSON.

Prioridade media:

- Padronizar nomes de rotas, por exemplo `/users` em vez de `/user`.
- Padronizar mensagens com acentos corrigidos.
- Criar testes automatizados para auth, rides e requests.
- Separar melhor respostas publicas e privadas de usuario.

## Checklist rapido

Para entender o backend, leia nesta ordem:

1. `src/app.ts`
2. `prisma/schema.prisma`
3. `src/modules/auth`
4. `src/modules/user`
5. `src/modules/rides`
6. `src/modules/ride-request`
7. `src/modules/ratings`
