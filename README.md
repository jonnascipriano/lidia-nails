# Lídia Nails

Aplicação de painel administrativo para gerenciar serviços, agenda e faturamento. Após entrar, o **Resumo** financeiro é exibido primeiro. As abas **Agendar**, **Agenda Admin**, **Resumo**, **Gastos**, **Histórico** e **Linha do tempo** organizam as demais funções.
Em dispositivos móveis, instale o app pela tela de acesso ou no painel. Ele abre diretamente na rota administrativa, que solicita login se necessário, e mantém a sessão após fechar e reabrir o app.

## Configuração do Firebase

1. No Firebase Console do projeto, habilite **Authentication → E-mail/senha**.
2. Crie a conta da dona em **Authentication → Users → Add user**. Não há cadastro público de contas.
3. Crie o banco em **Firestore Database**.
4. Publique as regras de [`firestore.rules`](./firestore.rules) no Firestore (aba **Rules**). As leituras e gravações de agendamentos, configurações e gastos exigem autenticação.
5. Copie `.env.example` para `.env.local` e preencha as credenciais do app Web em **Project settings → Your apps**.
6. Configure as mesmas variáveis `VITE_FIREBASE_*` no ambiente usado para gerar a versão de produção.

O acesso a `/admin` e `/dashboard` requer autenticação. Os agendamentos e gastos são sincronizados em tempo real com as coleções `agendamentos` e `gastos` do Firestore; as configurações de agenda são sincronizadas pelo documento `configuracoes/agenda`. O painel abre no resumo em `/admin` ou `/admin/resumo`; as abas estão disponíveis em `/admin/agendar`, `/admin/agenda`, `/admin/gastos`, `/admin/historico` e `/admin/linha-do-tempo`. `/dashboard` continua levando ao resumo. Na primeira entrada autenticada em cada navegador, dados antigos de agendamentos e configurações salvos em `localStorage` são importados e removidos após a confirmação da gravação no Firestore.

## Publicação no domínio HostGator

O projeto está configurado para servir o site na raiz do domínio. Para publicar em `horadofoco.online`:

1. Confirme no painel do domínio da HostGator os nameservers `ns888.hostgator.com.br` e `ns889.hostgator.com.br`. A alteração é feita no painel do registrador, não neste repositório, e a propagação pode levar algum tempo.
2. Gere a versão de produção com `npm run build`, usando as variáveis `VITE_FIREBASE_*` configuradas no ambiente de build.
3. No cPanel da hospedagem, abra **Gerenciador de arquivos** e envie o conteúdo da pasta `dist` para `public_html` do domínio. Envie os arquivos e pastas internos de `dist`, incluindo `index.html`, `assets` e `sw.js`.
4. No cPanel, habilite um certificado SSL para o domínio e teste `https://horadofoco.online`.

O script `npm run deploy` publica no GitHub Pages; para a hospedagem HostGator, use o build e o envio da pasta `dist` descritos acima.

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
