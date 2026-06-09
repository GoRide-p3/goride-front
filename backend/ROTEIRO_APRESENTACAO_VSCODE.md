# Roteiro de apresentacao pelo VS Code

Tempo estimado: 10 minutos

Objetivo: apresentar o backend mostrando o codigo, sem entrar em detalhes muito
complexos. A ideia e explicar o fluxo geral: request chega, passa pela rota,
controller valida, service aplica regra de negocio e Prisma salva/busca no
banco.

## 1. Abertura rapida

Arquivo para abrir:

```txt
README.md
```

O que falar:

"Esse backend e a API do GoRide. Ele foi feito em Node.js com TypeScript e hoje
tem as principais funcionalidades do sistema: autenticacao, usuarios, caronas,
solicitacoes, historico e avaliacoes."

Mostrar rapidamente no README:

```txt
POST /auth/register
POST /auth/login
POST /auth/forgot-password
POST /auth/reset-password
PATCH /auth/change-password
GET  /rides
POST /rides
POST /rides/:rideId/requests
GET  /rides/history/:userId
POST /ratings
```

Explicacao simples:

"Essas rotas sao os pontos de entrada do frontend. Quando o front precisa logar,
criar uma carona ou avaliar alguem, ele chama uma dessas URLs."

## 2. Fluxo geral do backend

Arquivo para abrir:

```txt
src/app.ts
```

O que mostrar:

```ts
app.use("/auth", authRouter);
app.use("/user", userRouter);
app.use("/rides", ridesRouter);
app.use("/ratings", ratingsRouter);
app.use("/", rideRequestsRouter);
```

Explicacao:

"Esse arquivo e como se fosse a porta principal da API. Aqui o Express recebe as
requisicoes e encaminha cada caminho para o modulo certo."

Fluxograma para explicar:

```txt
Frontend
   |
   v
Express app.ts
   |
   v
Router do modulo
   |
   v
Controller
   |
   v
Schema Zod
   |
   v
Service
   |
   v
Prisma
   |
   v
SQLite
```

Forma de falar:

"O fluxo se repete em quase tudo. A request chega pelo app, vai para uma rota,
entra no controller, e o controller valida os dados. Depois ele chama o service,
que tem a regra de negocio. Por fim, o Prisma conversa com o banco."

## 2.1 Explicacao tecnica simples

Use esse bloco quando quiser mostrar um pouco mais de dominio tecnico, sem
aprofundar demais:

"O backend foi organizado em camadas para separar responsabilidades. As rotas
definem os caminhos da API, como `POST /auth/login` ou `GET /rides`. O
controller recebe a requisicao HTTP e valida os dados com Zod. Se os dados
estiverem corretos, ele chama o service. O service e onde ficam as regras de
negocio, por exemplo verificar se existe vaga na carona ou se a senha atual esta
correta. Depois disso, o Prisma faz a comunicacao com o banco SQLite."

Se quiser explicar por partes:

```txt
Route      -> define a URL e o metodo HTTP
Controller -> recebe a requisicao e valida entrada
Schema     -> regras de validacao com Zod
Service    -> regras de negocio do sistema
Prisma     -> acesso ao banco de dados
SQLite     -> banco usado localmente no projeto
```

Fala curta sobre seguranca:

"Na parte de autenticacao, a senha nao e salva diretamente no banco. Ela passa
pelo bcrypt e vira um hash. No login, o backend compara a senha digitada com
esse hash. Quando o login da certo, a API gera um token JWT, que o frontend usa
para identificar o usuario nas proximas requisicoes."

Fala curta sobre validacao:

"Eu tambem uso validacao antes de salvar dados. Isso evita, por exemplo, criar
carona com preco negativo, senha muito curta ou avaliacao fora do intervalo de 1
a 5."

Fala curta sobre resposta da API:

"A API responde em JSON. Quando da certo, ela retorna os dados que o frontend
precisa. Quando da erro, ela retorna uma mensagem e um status HTTP, como 400
para dados invalidos ou 404 quando algo nao foi encontrado."

## 3. Banco de dados e modelos

Arquivo para abrir:

```txt
prisma/schema.prisma
```

O que mostrar:

```prisma
model User
model Ride
model RideRequest
model Rating
```

Explicacao:

"Aqui ficam os modelos do banco. O User representa o usuario, Ride representa a
carona, RideRequest representa uma solicitacao de carona e Rating representa uma
avaliacao."

Responsabilidade de cada modelo:

```txt
User         -> dados do usuario e credenciais
Ride         -> dados da carona oferecida
RideRequest  -> pedido de passageiro para entrar em uma carona
Rating       -> avaliacao entre usuarios depois de uma carona
```

Forma de explicar:

"O banco foi pensado em cima do fluxo do app. Primeiro existe o usuario. O
usuario pode criar uma carona. Outro usuario pode solicitar essa carona. Depois,
eles podem se avaliar."

## 4. Autenticacao

Arquivos para abrir:

```txt
src/modules/auth/auth.routes.ts
src/modules/auth/auth.controller.ts
src/modules/auth/auth.service.ts
src/modules/auth/auth.schema.ts
```

Comece pelo arquivo:

```txt
src/modules/auth/auth.routes.ts
```

Mostrar:

```ts
authRouter.post("/register", register);
authRouter.post("/login", login);
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
```

Explicacao:

"Aqui estao as rotas de autenticacao. Cadastro, login e redefinicao de senha."

Depois abrir:

```txt
src/modules/auth/auth.schema.ts
```

Explicacao:

"Antes de salvar ou consultar qualquer coisa, os dados passam pelo Zod. Ele
confere, por exemplo, se o email e valido, se a senha tem tamanho minimo e se o
CPF tem 11 digitos."

Depois abrir:

```txt
src/modules/auth/auth.service.ts
```

Mostrar:

```ts
const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
```

Explicacao:

"A senha nao vai pura para o banco. Ela passa pelo bcrypt, que transforma a senha
em um hash."

Mostrar tambem:

```ts
return jwt.sign({ sub: userId }, JWT_SECRET, { expiresIn: "7d" });
```

Explicacao:

"No login, se a senha estiver correta, o backend gera um token JWT. Esse token e
usado para provar que o usuario esta logado."

Fluxo de login:

```txt
POST /auth/login
   |
   v
valida email e senha
   |
   v
busca usuario no banco
   |
   v
compara senha com bcrypt
   |
   v
gera JWT
   |
   v
retorna usuario + token
```

### 4.1 Redefinicao e troca de senha

Arquivos para abrir:

```txt
src/modules/auth/auth.routes.ts
src/modules/auth/auth.controller.ts
src/modules/auth/auth.schema.ts
src/modules/auth/auth.service.ts
src/modules/auth/auth.middleware.ts
```

Arquivo principal para explicar:

```txt
src/modules/auth/auth.service.ts
```

O que falar:

"A redefinicao de senha tambem fica dentro do modulo de autenticacao, porque ela
lida diretamente com a conta do usuario e com a senha salva no banco."

Comece mostrando as rotas:

```ts
authRouter.post("/forgot-password", forgotPassword);
authRouter.post("/reset-password", resetPassword);
authRouter.patch("/change-password", authMiddleware, changePassword);
```

Explicacao simples:

"O `forgot-password` recebe o email e gera um token de redefinicao. O
`reset-password` recebe esse token e a nova senha. Ja o `change-password` e para
usuario logado, por isso passa pelo middleware de autenticacao."

Depois mostrar no schema:

```ts
export const forgotPasswordSchema = z.object({
  email: z.string().email(),
});

export const resetPasswordSchema = z.object({
  token: z.string().min(1),
  password: z.string().min(6),
});

export const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual e obrigatoria"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
});
```

O que falar:

"Aqui eu valido o que cada fluxo precisa. Para pedir redefinicao basta um email
valido. Para redefinir, precisa do token e da senha nova. Para trocar senha
logado, eu peço a senha atual e a nova senha."

No service, mostrar:

```ts
function generatePasswordResetToken(userId: string) {
  return jwt.sign(
    { sub: userId, purpose: "password-reset" },
    JWT_SECRET,
    { expiresIn: "15m" },
  );
}
```

O que falar:

"Esse token e temporario. Eu coloco uma finalidade nele, `password-reset`, para
nao misturar com o token normal de login."

Mostrar tambem:

```ts
const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

await prisma.user.update({
  where: { id: payload.sub },
  data: { passwordHash },
});
```

O que falar:

"Quando a senha nova chega, eu nao salvo a senha em texto puro. Gero um novo
hash com bcrypt e atualizo o usuario no banco."

Para troca de senha logada, mostrar:

```ts
const passwordMatch = await bcrypt.compare(
  data.currentPassword,
  user.passwordHash,
);
```

O que falar:

"Nesse fluxo eu comparo a senha atual antes de trocar. Isso evita que alguem
logue numa conta aberta e troque a senha sem saber a senha antiga."

Fluxo para explicar:

```txt
Esqueci minha senha
   |
   v
POST /auth/forgot-password
   |
   v
gera token temporario
   |
   v
POST /auth/reset-password
   |
   v
valida token
   |
   v
gera hash da nova senha
   |
   v
atualiza usuario no banco
```

Fluxo de troca logada:

```txt
Usuario logado
   |
   v
PATCH /auth/change-password
   |
   v
authMiddleware valida token JWT
   |
   v
compara senha atual
   |
   v
salva hash da nova senha
```

## 5. Caronas: parte principal

Arquivos para abrir:

```txt
src/modules/rides/rides.routes.ts
src/modules/rides/rides.controller.ts
src/modules/rides/ride.schema.ts
src/modules/rides/rides.service.ts
```

Comece por:

```txt
src/modules/rides/rides.routes.ts
```

Mostrar:

```ts
ridesRouter.get("/", listRides);
ridesRouter.get("/history/:userId", getRideHistory);
ridesRouter.get("/:id", getRideById);
ridesRouter.post("/", createRide);
ridesRouter.put("/:id", updateRide);
ridesRouter.delete("/:id", deleteRide);
```

Explicacao:

"Esse e o CRUD de caronas. Aqui temos listar, buscar por id, criar, editar,
deletar e tambem consultar historico."

Depois abrir:

```txt
src/modules/rides/ride.schema.ts
```

Mostrar regras:

```ts
totalSeats: z.coerce.number().int().min(1).max(4)
price: z.coerce.number().min(0)
```

Explicacao:

"Aqui tem validacoes simples. Por exemplo, a carona precisa ter entre 1 e 4
vagas, preco nao pode ser negativo e horario precisa estar no formato certo."

Depois abrir:

```txt
src/modules/rides/rides.service.ts
```

Mostrar:

```ts
const availableSeats = data.availableSeats ?? data.totalSeats;
```

Explicacao:

"Quando a carona e criada, se nao for informado quantas vagas estao livres, o
backend considera que todas as vagas estao disponiveis."

Mostrar:

```ts
confirmedPassengers: ride.totalSeats - ride.availableSeats
```

Explicacao:

"Esse campo e calculado para facilitar o frontend. Em vez do front fazer essa
conta, a API ja manda a quantidade de passageiros confirmados."

Fluxo de criar carona:

```txt
POST /rides
   |
   v
Controller recebe body
   |
   v
Zod valida origem, destino, data, horario, preco e vagas
   |
   v
Service confere se o motorista existe
   |
   v
Prisma cria a carona
   |
   v
API retorna carona com dados do motorista
```

## 6. Solicitacao de carona

Arquivos para abrir:

```txt
src/modules/ride-request/ride-request.routes.ts
src/modules/ride-request/ride-request.service.ts
```

Mostrar rotas:

```ts
rideRequestsRouter.post("/rides/:rideId/requests", createRideRequest);
rideRequestsRouter.get("/rides/:rideId/requests", listRideRequests);
rideRequestsRouter.patch("/requests/:requestId", updateRideRequest);
rideRequestsRouter.get("/passengers/:passengerId/requests", listPassengerRequests);
```

Explicacao:

"Esse modulo representa o momento em que um passageiro solicita uma carona e o
motorista aceita ou recusa."

Abrir service e mostrar regras:

```ts
if (!ride) throw new AppError("Carona nao encontrada", 404);
if (ride.status !== "active") throw new AppError("Carona nao esta ativa", 400);
if (ride.availableSeats === 0) throw new AppError("Sem vagas disponiveis", 400);
```

Explicacao:

"Antes de criar uma solicitacao, o backend confere se a carona existe, se esta
ativa e se ainda tem vaga."

Mostrar:

```ts
data: { availableSeats: { decrement: 1 } }
```

Explicacao:

"Quando o motorista aceita a solicitacao, a API diminui uma vaga disponivel."

Fluxo:

```txt
Passageiro solicita carona
   |
   v
API valida se a carona existe e tem vaga
   |
   v
Solicitacao fica pending
   |
   v
Motorista aceita ou recusa
   |
   v
Se aceitar, diminui uma vaga
```

## 7. Historico de caronas

Arquivo para abrir:

```txt
src/modules/rides/rides.service.ts
```

Procurar funcao:

```ts
getRideHistory
```

Explicacao:

"O historico junta dois lados do usuario: as caronas que ele ofereceu e as
caronas que ele solicitou como passageiro."

Mostrar ideia:

```txt
offered   -> caronas em que o usuario foi motorista
requested -> caronas em que o usuario foi passageiro
```

Fala sugerida:

"Para a apresentacao, esse endpoint e bom porque mostra que o backend nao esta
so cadastrando dados. Ele tambem organiza informacao para uma tela real do app."

Fluxo:

```txt
GET /rides/history/:userId
   |
   v
busca caronas oferecidas pelo usuario
   |
   v
busca solicitacoes feitas pelo usuario
   |
   v
retorna offered + requested
```

## 8. Avaliacoes

Arquivos para abrir:

```txt
src/modules/ratings/ratings.routes.ts
src/modules/ratings/rating.schema.ts
src/modules/ratings/ratings.service.ts
```

Mostrar rotas:

```ts
ratingsRouter.post("/", createRating);
ratingsRouter.get("/users/:userId", listUserRatings);
ratingsRouter.get("/rides/:rideId", listRideRatings);
```

Explicacao:

"Esse modulo cuida das avaliacoes. Um usuario avalia outro usuario dentro de
uma carona."

Abrir schema:

```ts
rating: z.coerce.number().int().min(1).max(5)
```

Explicacao:

"A nota precisa ser um numero inteiro entre 1 e 5."

Abrir service e mostrar:

```ts
if (data.fromUserId === data.toUserId) {
  throw new AppError("Usuario nao pode avaliar a si mesmo", 400);
}
```

Explicacao:

"Tem uma regra basica para impedir que alguem avalie a si mesmo."

Mostrar:

```ts
await updateUserRating(data.toUserId);
```

Explicacao:

"Depois que a avaliacao e criada, o backend recalcula a media do usuario
avaliado."

Fluxo:

```txt
POST /ratings
   |
   v
valida nota, usuarios e carona
   |
   v
verifica se ja existe avaliacao igual
   |
   v
cria avaliacao
   |
   v
recalcula media do usuario avaliado
```

## 9. Tratamento de erros

Arquivos para abrir:

```txt
src/lib/app-error.ts
src/app.ts
```

Explicacao:

"O AppError e usado para erros esperados, como carona nao encontrada ou dados
invalidos. No app.ts existe um tratamento final para devolver uma resposta em
JSON."

Mostrar:

```ts
response.status(error.statusCode).json({ message: error.message });
```

Fala sugerida:

"Isso evita que o backend quebre de qualquer jeito. Em vez disso, ele devolve
uma mensagem clara para o frontend."

## 10. Fechamento: o que temos de melhor

O que falar:

"O melhor do backend hoje e que ele ja representa o fluxo principal do GoRide:
usuario cria conta, faz login, oferece carona, outro usuario solicita, a carona
entra no historico e depois pode receber avaliacao."

Resumo em fluxo:

```txt
Cadastro/Login
   |
   v
Criar carona
   |
   v
Passageiro solicita
   |
   v
Motorista aceita
   |
   v
Historico
   |
   v
Avaliacao
```

Pontos fortes para destacar:

- Codigo organizado por modulos
- Validacao com Zod
- Senha protegida com bcrypt
- JWT para autenticacao
- Prisma com modelos relacionados
- Regras de negocio nas solicitacoes
- Avaliacoes recalculando media do usuario

## 11. Pontos de melhoria, se perguntarem

Fale de forma tranquila:

"Como essa versao foi pensada para apresentacao e evolucao rapida, ainda existem
melhorias importantes."

Pontos:

- Proteger mais rotas com JWT.
- Usar o usuario do token em vez de receber alguns IDs pelo body.
- Evitar retornar dados sensiveis em algumas respostas.
- Usar transacao ao aceitar solicitacoes.
- Enviar reset de senha por email em uma versao real.

Forma de fechar:

"Mesmo com esses proximos passos, a base ja esta pronta para demonstrar o fluxo
principal do produto."
