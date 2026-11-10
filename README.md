# Lídia Nails

Aplicação de painel administrativo para gerenciar serviços, agenda e faturamento. Após entrar, navegue pelas abas **Agendar**, **Agenda Admin**, **Resumo** e **Gastos**.
Em dispositivos móveis, instale o app pela tela de acesso ou no painel. Ele abre diretamente na rota administrativa, que solicita login se necessário, e mantém a sessão após fechar e reabrir o app.

## Configuração do Firebase

1. No Firebase Console do projeto, habilite **Authentication → E-mail/senha**.
2. Crie a conta da dona em **Authentication → Users → Add user**. Não há cadastro público de contas.
3. Crie o banco em **Firestore Database**.
4. Publique as regras de [`firestore.rules`](./firestore.rules) no Firestore (aba **Rules**). As leituras e gravações de agendamentos, configurações e gastos exigem autenticação.
5. Copie `.env.example` para `.env.local` e preencha as credenciais do app Web em **Project settings → Your apps**.
6. Configure as mesmas variáveis `VITE_FIREBASE_*` no ambiente usado para gerar a versão de produção.

O acesso a `/admin` e `/dashboard` requer autenticação. Os agendamentos e gastos são sincronizados em tempo real com as coleções `agendamentos` e `gastos` do Firestore; as configurações de agenda são sincronizadas pelo documento `configuracoes/agenda`. As abas do painel ficam disponíveis em `/admin`, `/admin/agenda`, `/admin/resumo` e `/admin/gastos`; `/dashboard` continua levando ao resumo. Na primeira entrada autenticada em cada navegador, dados antigos de agendamentos e configurações salvos em `localStorage` são importados e removidos após a confirmação da gravação no Firestore.

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
