# Lídia Nails

Aplicação de catálogo e painel administrativo para gerenciar serviços, agenda e faturamento.

## Configuração do Firebase

1. No Firebase Console do projeto, habilite **Authentication → E-mail/senha**.
2. Crie a conta da dona em **Authentication → Users → Add user**. Não há cadastro público de contas.
3. Crie o banco em **Firestore Database**.
4. Publique as regras de [`firestore.rules`](./firestore.rules) no Firestore (aba **Rules**). As leituras e gravações exigem autenticação.
5. Copie `.env.example` para `.env.local` e preencha as credenciais do app Web em **Project settings → Your apps**.
6. Configure as mesmas variáveis `VITE_FIREBASE_*` no ambiente usado para gerar a versão de produção.

O acesso a `/admin` e `/dashboard` requer autenticação. Os agendamentos são sincronizados em tempo real com a coleção `agendamentos` do Firestore. Na primeira entrada autenticada em cada navegador, os dados antigos de `localStorage` são importados e removidos após a confirmação da importação.

O agendamento online para clientes está temporariamente pausado; a página orienta o contato pelo WhatsApp.

## Desenvolvimento

```sh
npm install
npm run dev
```

Para validar as alterações:

```sh
npm run lint
npm run build
```
