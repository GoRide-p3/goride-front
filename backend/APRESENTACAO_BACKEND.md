# Apresentacao Backend GoRide

Tempo estimado: 10 minutos

## Slide 1 - Backend GoRide

**Tema:** API para gerenciar usuarios, caronas, solicitacoes, historico e avaliacoes.

Pontos para falar:

- O backend foi feito em Node.js com TypeScript.
- A API centraliza as regras principais do GoRide.
- A ideia e tirar responsabilidade do frontend e persistir os dados no banco.

Fala sugerida:

"Essa apresentacao mostra o backend do GoRide. O foco foi construir uma API simples, mas ja com as partes principais do sistema: autenticacao, caronas, solicitacoes, historico e avaliacoes."

## Slide 2 - Stack usada

**Tecnologias principais:**

- Node.js
- TypeScript
- Express
- Prisma
- SQLite
- Zod
- bcrypt
- JWT

Pontos para falar:

- Express organiza as rotas HTTP.
- Prisma faz a comunicacao com o banco.
- Zod valida os dados recebidos.
- bcrypt protege as senhas.
- JWT permite autenticar usuarios.

Fala sugerida:

"A stack foi escolhida para ser simples de explicar e boa para evoluir. O Express cuida das rotas, o Prisma facilita o banco, o Zod evita dados invalidos chegando na regra de negocio, e o JWT permite controlar usuarios logados."

## Slide 3 - Organizacao do projeto

**Estrutura por modulos:**

```txt
src/
  modules/
    auth/
    user/
    rides/
    ride-request/
    ratings/
  lib/
  types/
```

Pontos para falar:

- Cada recurso tem seu proprio modulo.
- Dentro dos modulos existem rotas, controllers, services e schemas.
- Isso facilita manutencao e apresentacao do codigo.

Fala sugerida:

"Um ponto forte do backend e a separacao por modulos. Auth fica separado de usuario, caronas, solicitacoes e avaliacoes. Isso evita misturar regra de negocio e deixa claro onde cada coisa acontece."

## Slide 4 - Autenticacao e usuarios

**O que temos:**

- Cadastro de usuario
- Login
- Senha com hash
- Token JWT
- Edicao de perfil
- Redefinicao de senha

Rotas principais:

```txt
POST /auth/register
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
GET  /user/:id
PUT  /user/:id
```

Pontos para falar:

- Senha nunca e salva pura no banco.
- Login retorna token.
- Redefinicao de senha usa token temporario.
- Na versao atual, o token de reset volta no JSON.

Fala sugerida:

"Na autenticacao, o principal e que a senha passa por hash com bcrypt antes de ir para o banco. No login, a API valida a senha e retorna um JWT. Tambem temos um fluxo simples de redefinicao de senha, pensado para apresentacao: ele gera um token temporario e permite trocar a senha."

## Slide 5 - Caronas: o nucleo do sistema

**CRUD de caronas:**

```txt
GET    /rides
GET    /rides/:id
POST   /rides
PUT    /rides/:id
DELETE /rides/:id
```

Campos importantes:

- motorista
- origem e destino
- data
- horario
- preco
- vagas totais
- vagas disponiveis
- status

Pontos para falar:

- Esse e o centro do GoRide.
- A listagem aceita filtros.
- A resposta ja traz dados do motorista.

Fala sugerida:

"O CRUD de caronas e o coracao da API. Nele cadastramos origem, destino, data, horario, preco e vagas. A listagem tambem aceita filtros, como origem, destino, data e preco maximo, o que ja prepara o backend para a tela de buscar caronas."

## Slide 6 - Solicitacoes de carona

**Fluxo principal:**

```txt
POST  /rides/:rideId/requests
GET   /rides/:rideId/requests
PATCH /requests/:requestId
GET   /passengers/:passengerId/requests
```

Regras implementadas:

- carona precisa existir
- carona precisa estar ativa
- precisa ter vaga disponivel
- motorista nao pode solicitar a propria carona
- passageiro nao pode solicitar a mesma carona duas vezes
- motorista aceita ou recusa solicitacao

Pontos para falar:

- Esse fluxo aproxima o backend do uso real do app.
- Quando a solicitacao e aceita, uma vaga e decrementada.

Fala sugerida:

"A solicitacao de carona e onde o sistema deixa de ser apenas cadastro e passa a ter fluxo real. O passageiro solicita uma carona, o motorista lista as solicitacoes e pode aceitar ou recusar. Ao aceitar, a API reduz a quantidade de vagas disponiveis."

## Slide 7 - Historico e avaliacoes

**Historico:**

```txt
GET /rides/history/:userId
```

Retorna:

- caronas oferecidas pelo usuario
- caronas solicitadas como passageiro
- caronas finalizadas ou antigas

**Avaliacoes:**

```txt
POST /ratings
GET  /ratings/users/:userId
GET  /ratings/rides/:rideId
```

Regras:

- nota entre 1 e 5
- usuario nao avalia a si mesmo
- uma avaliacao por pessoa em cada carona
- media do usuario e recalculada

Fala sugerida:

"As features mais recentes fecham melhor a experiencia: historico e avaliacoes. O historico permite ver caronas passadas, tanto como motorista quanto como passageiro. Ja as avaliacoes ajudam a criar confianca entre usuarios, porque a nota media e recalculada sempre que uma nova avaliacao e feita."

## Slide 8 - Banco de dados e Prisma

**Modelos principais:**

- User
- Ride
- RideRequest
- Rating

Pontos fortes:

- Relacoes entre tabelas
- Indices para buscas
- Migrations versionadas
- Prisma Client tipado

Fala sugerida:

"No banco, usamos quatro modelos principais. User representa os usuarios, Ride representa as caronas, RideRequest representa as solicitacoes e Rating representa as avaliacoes. O Prisma ajuda bastante porque cria um client tipado e deixa o acesso ao banco mais seguro e organizado."

## Slide 9 - O que temos de melhor

**File do backend:**

- Backend modular
- Autenticacao com JWT
- Senha com hash
- CRUD completo de caronas
- Solicitacoes com regras de negocio
- Historico por usuario
- Avaliacoes com media recalculada
- Documentacao atualizada
- Migrations versionadas

Fala sugerida:

"O melhor do backend e que ele ja cobre o caminho principal do produto. Um usuario pode se cadastrar, logar, oferecer carona, solicitar carona, ter historico e receber avaliacoes. Mesmo simples, ja temos uma base coerente para demonstrar o funcionamento real do GoRide."

## Slide 10 - Proximos passos

**Melhorias importantes:**

- Proteger mais rotas com JWT
- Usar `request.userId` em vez de IDs enviados pelo body
- Evitar expor dados sensiveis do usuario
- Usar transacao ao aceitar solicitacoes
- Enviar reset de senha por email
- Criar testes automatizados

Fala sugerida:

"Como proximos passos, o principal e melhorar seguranca e robustez. Algumas rotas ainda recebem IDs pelo body para facilitar a apresentacao, mas o ideal e usar sempre o usuario autenticado pelo token. Tambem seria importante mandar o reset de senha por email e criar testes automatizados."

## Encerramento

Fala final:

"Em resumo, o backend ja entrega o fluxo principal do GoRide. Ele nao esta complexo demais, o que ajuda na apresentacao, mas tambem nao e apenas um CRUD solto. Temos autenticacao, caronas, solicitacoes, historico e avaliacoes trabalhando juntos em uma API organizada por modulos."
