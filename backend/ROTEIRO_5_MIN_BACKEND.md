# Roteiro rapido do backend - 5 minutos

Objetivo: mostrar o que o backend faz, quais tecnologias usamos e a
responsabilidade de cada parte do codigo.

## 1. Visao geral

Arquivo:

```txt
src/app.ts
```

O que falar:

"Esse arquivo e a entrada do backend. Aqui o Express configura o JSON, o CORS e
liga cada rota ao seu modulo. Por exemplo, `/auth` vai para autenticacao,
`/rides` vai para caronas e `/ratings` vai para avaliacoes."

O que usamos:

```txt
Node.js + Express + TypeScript
```

Responsabilidade:

```txt
Receber as requisicoes do frontend e mandar para o modulo correto.
```

## 2. Banco de dados

Arquivo:

```txt
prisma/schema.prisma
```

O que falar:

"Aqui ficam os modelos do banco. O sistema tem User, Ride, RideRequest e Rating.
Isso representa o usuario, a carona, a solicitacao para participar da carona e a
avaliacao."

O que usamos:

```txt
Prisma + SQLite
```

Responsabilidade:

```txt
Definir as tabelas e os relacionamentos principais do sistema.
```

## 3. Autenticacao e senha

Arquivos:

```txt
src/modules/auth/auth.routes.ts
src/modules/auth/auth.service.ts
src/modules/auth/auth.schema.ts
```

O que falar:

"Esse modulo cuida de cadastro, login, troca de senha e redefinicao de senha. As
rotas definem os caminhos da API, o schema valida os dados e o service executa a
regra de negocio."

Mostrar no `auth.routes.ts`:

```ts
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.patch("/change-password", authMiddleware, changePassword);
```

Fala tecnica simples:

"A senha nao e salva em texto puro. O backend usa bcrypt para gerar um hash. No
login, ele compara a senha digitada com esse hash. Quando o login da certo, ele
gera um token JWT para identificar o usuario."

Sobre redefinicao de senha:

"No esqueci minha senha, o backend gera um token temporario. Depois, no
reset-password, ele valida esse token e salva a nova senha com bcrypt."

O que usamos:

```txt
bcrypt + JWT + Zod
```

Responsabilidade:

```txt
Criar conta, fazer login, proteger senha e permitir trocar/redefinir senha.
```

## 4. Caronas

Arquivos:

```txt
src/modules/rides/rides.routes.ts
src/modules/rides/rides.service.ts
```

O que falar:

"Esse e o modulo principal do sistema. Ele cria, lista, edita e remove caronas.
Tambem tem o historico, que junta as caronas que o usuario ofereceu e as que ele
solicitou."

Mostrar no `rides.routes.ts`:

```ts
ridesRouter.get("/", listRides);
ridesRouter.get("/history/:userId", getRideHistory);
ridesRouter.post("/", createRide);
ridesRouter.put("/:id", updateRide);
ridesRouter.delete("/:id", deleteRide);
```

Responsabilidade:

```txt
Controlar o CRUD de caronas e montar o historico do usuario.
```

## 5. Solicitacao de carona

Arquivos:

```txt
src/modules/ride-request/ride-request.routes.ts
src/modules/ride-request/ride-request.service.ts
```

O que falar:

"Esse modulo representa o passageiro pedindo para entrar em uma carona. A
solicitacao nasce como pendente. Depois o motorista pode aceitar ou recusar. Se
aceitar, o backend diminui uma vaga disponivel."

Responsabilidade:

```txt
Controlar o fluxo passageiro solicita, motorista aceita ou recusa.
```

## 6. Avaliacoes

Arquivos:

```txt
src/modules/ratings/ratings.routes.ts
src/modules/ratings/ratings.service.ts
```

O que falar:

"Esse modulo cuida das avaliacoes depois da carona. Ele salva a nota, impede
autoavaliacao e recalcula a media do usuario avaliado."

Responsabilidade:

```txt
Registrar avaliacoes e atualizar a reputacao do usuario.
```

## Fechamento

Fala final:

"Resumindo, o backend cobre o fluxo principal do GoRide: usuario cria conta,
loga, oferece carona, outro usuario solicita, o motorista aceita ou recusa, isso
aparece no historico e depois pode gerar avaliacao. A estrutura foi separada por
modulos para facilitar manutencao e entendimento."
