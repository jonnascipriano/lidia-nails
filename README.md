# Lídia Nails

Aplicação de catálogo e painel administrativo para gerenciar serviços, agenda e faturamento.
Em dispositivos móveis, o site pode ser instalado como app pela opção **Instalar app**.

## Configuração do Firebase

1. No Firebase Console do projeto, habilite **Authentication → E-mail/senha**.
2. Crie a conta da dona em **Authentication → Users → Add user**. Não há cadastro público de contas.
3. Crie o banco em **Firestore Database**.
4. Publique as regras de [`firestore.rules`](./firestore.rules) no Firestore (aba **Rules**). As leituras e gravações exigem autenticação.
5. Copie `.env.example` para `.env.local` e preencha as credenciais do app Web em **Project settings → Your apps**.
6. Configure as mesmas variáveis `VITE_FIREBASE_*` no ambiente usado para gerar a versão de produção.

O acesso a `/admin` e `/dashboard` requer autenticação. Os agendamentos são sincronizados em tempo real com a coleção `agendamentos` do Firestore; as configurações de agenda são sincronizadas pelo documento `configuracoes/agenda`. Na primeira entrada autenticada em cada navegador, dados antigos de agendamentos e configurações salvos em `localStorage` são importados e removidos após a confirmação da gravação no Firestore.

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
