# 📦 Open ERP

## 📌 Visão Geral
Um **ERP (Enterprise Resource Planning)** — ou *Planejamento de Recursos Empresariais* — é uma aplicação de gestão que integra múltiplos setores da empresa em um único sistema centralizado.

Este projeto foi desenvolvido com foco em **simular um ERP real**, indo além de CRUDs básicos, aplicando **regras de negócio reais**, validações consistentes e fluxos comuns ao ambiente corporativo.

O objetivo é demonstrar habilidades em **análise de sistemas, arquitetura em camadas, implementação de regras de negócio, segurança de software**, desenvolvimento backend/frontend e integração com banco de dados relacional.



![Tela Principal](docs/images/start-page.gif)

---

## 📑 Sumário
1. [Tecnologias Utilizadas](#tecnologias-utilizadas)
2. [Arquitetura do Sistema](#arquitetura-do-sistema)
3. [Módulos e Regras de Negócio](#módulos-e-regras-de-negócio)
4. [Segurança e Boas Práticas](#segurança-e-boas-práticas)
5. [Demonstração](#demonstração)

---

## 🛠 Tecnologias Utilizadas
**Frontend:** HTML, CSS, TypeScript e Vite.

**Backend:** Node.js, Typescript e Express.

**Banco de Dados:** PostgreSQL.  

**Outras:** JWT para autenticação, bcrypt para hashing de senhas, cookie-parser para utilização de cookies e dotenv para configuração de ambiente.

---

## 🏗 Arquitetura do Sistema
O projeto adota arquitetura em camadas, onde os arquivos são separados por responsabilidade dentro de módulos de negócio.
Cada pasta representa um módulo funcional do ERP (ex.: produtos, fornecedores, compras), e dentro dele os arquivos seguem a divisão por responsabilidade.

## Back-end

Organização modular com arquitetura em camadas.

Fluxo:
Routes → Controllers → Services → Repositories → Models

### Exemplo de estrutura:

```text
backend
└── src
    ├── app.ts                 # Configurações gerais da API
    |
    ├── config                 # Configurações do servidor
    │   ├── db.ts              # Conexão com o banco de dados
    │   ├── server.ts          # Inicialização do servidor
    │   └── .env               # Variáveis de ambiente
    |
    ├── products               # Módulo de produtos
    │   ├── routes.ts
    │   ├── controllers.ts
    │   ├── services.ts
    │   ├── repositories.ts
    │   └── models.ts
    |
    ├── suppliers              # Módulo de fornecedores
    │   ├── routes.ts
    │   ├── controllers.ts
    │   ├── services.ts
    │   ├── repositories.ts
    │   └── models.ts
    |
    └── customers              # Módulo de clientes
        ├── routes.ts
        ├── controllers.ts
        ├── services.ts
        ├── repositories.ts
        └── models.ts
```
## Front-end


Segue o mesmo conceito de **módulos + responsabilidades**, adaptado à camada de interface e interação com o usuário.

### Exemplo de estrutura:

```text
frontend
└── src
    ├── products
    │   ├── products.html              # Página HTML
    │   ├── products-style.css         # Estilos CSS
    │   ├── register-global-events.ts  # Eventos globais
    │   ├── script.ts                  # Script principal
    │   ├── product-events.ts          # Eventos específicos
    │   ├── product-dom.ts             # Manipulação do DOM
    │   ├── new-purchase-modal.ts      # Modal de novo produto
    │   ├── product-edit-modal.ts      # Modal de edição
    │   ├── product-service.ts         # Comunicação com a API
    │   └── product-model.ts           # Modelo de dados
    |
    ├── suppliers
    │   └── ...
    |
    ├── customers
    │   └── ...
    |
    └── utils
        ├── fetch-helper.ts            # Fetch autenticado
        ├── navigation.ts              # Navegação entre módulos
        ├── formatters.ts              # Máscaras e formatações
        ├── messages.ts                # Mensagens de sistema
        └── autocomplete.ts            # Autocomplete
```
---

## 📂 Módulos e Regras de Negócio

Esta seção descreve as **principais regras de negócio implementadas no sistema**, com destaque para aquelas que simulam **cenários reais e críticos de um ERP**, especialmente relacionadas a **controle de estoque e consistência de dados**.

## 🔴 Regras Críticas de Estoque

### Bloqueio de Estoque Negativo
O sistema **não permite que o estoque de um produto fique negativo** em nenhuma operação crítica.

Essa regra é aplicada nos seguintes cenários:
- Finalização de vendas
- Estorno de compras
- Ajustes manuais de estoque

Antes de qualquer operação que reduza o estoque, o sistema valida se a quantidade disponível é suficiente.  

Caso contrário, a operação é **bloqueada** e uma mensagem clara é retornada ao usuário.

**Objetivo da regra:**
- Garantir consistência de dados
- Evitar divergência entre estoque físico e sistema
- Simular comportamento real de ERPs comerciais

---

### Finalização de Venda com Validação de Estoque
No momento da finalização de uma venda, o sistema:

1. Verifica o estoque atual de cada item
2. Valida se a quantidade solicitada está disponível
3. Bloqueia a venda caso algum item fique com estoque negativo
4. Finaliza a venda apenas se todas as validações forem atendidas

Essa validação ocorre **no backend**, garantindo segurança mesmo que o front-end seja burlado.
