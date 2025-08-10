# 📦 Open ERP

> Um sistema ERP desenvolvido para [breve descrição do objetivo, ex.: "gestão integrada de compras, vendas e estoque"].

![Tela Principal](./docs/images/tela-principal.png)

---

## 📑 Sumário
1. [Visão Geral](#visão-geral)
2. [Tecnologias Utilizadas](#tecnologias-utilizadas)
3. [Arquitetura do Sistema](#arquitetura-do-sistema)
4. [Módulos e Funcionalidades](#módulos-e-funcionalidades)
5. [Banco de Dados](#banco-de-dados)
6. [API Endpoints](#api-endpoints)
7. [Instalação e Configuração](#instalação-e-configuração)
8. [Fluxos de Uso](#fluxos-de-uso)
9. [Segurança e Boas Práticas](#segurança-e-boas-práticas)
10. [Demonstração](#demonstração)
11. [Próximos Passos](#próximos-passos)
12. [Licença](#licença)

---

## 📌 Visão Geral
Um **ERP, (Enterprise Resource Planning) ou em português "Planejamento de Recursos Empresariais"** é uma aplicação de gestão empresarial que integra múltiplos setores em um único sistema.  
Esse projeto foi desenvolvido com o objetivo de demonstrar habilidades em arquitetura e segurança de software, desenvolvimento backend/frontend e integração com banco de dados relacional.

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

App --> Routes --> Controllers --> Services --> Repositories --> Models

## Back-end

Organização modular + camadas.

## Exemplo:

backend                   
└── src                     
    ├── app.ts                # Configurações gerais da API   
    |
    ├── config                # Configurações do servidor     
    │   ├── db.ts             # Conecta com o banco de dados
    │   ├── server.ts         # Inicializa o servidor
    │   └── .env              # Configurações de ambiente(porta da API, credenciais do banco de dados)
    |
    ├── products              # Módulo      
    │   ├── routes.ts         # Define endpoints(rotas) do módulo
    │   ├── controllers.ts    # Recebem requisições e direcionam para os serviços
    │   ├── services.ts       # Lógica de negócio do módulo
    │   ├── repositories.ts   # Comunicação com o banco de dados
    │   └── models.ts         # Estruturas de dados e tipos do módulo
    |        
    ├── suppliers             
    │   ├── routes       
    │   ├── controllers  
    │   ├── services     
    │   ├── repositories 
    │   └── models       
    |   
    └── customers
        ├── routes
        ├── controllers
        ├── services
        ├── repositories
        └── models

## Front-end

Segue o mesmo conceito de módulos + responsabilidades, mas adaptado à camada de interface e interação com o usuário.

# Exemplo:

frontend
└── src
    ├── products
    |   ├── products.html              # Página HTML
    |   ├── products-style.css         # Estilos CSS
    │   ├── register-global-events.ts  # Eventos globais do módulo
    │   ├── script.ts                  # Script principal
    │   ├── product-events.ts          # Eventos específicos
    │   ├── product-dom.ts             # Manipulação do DOM
    │   ├── new-purchase-modal.ts      # Modal de novo produto
    │   ├── product-edit-modal.ts      # Modal para edição de produto
    │   ├── product-service.ts         # Chamadas á API do back-end
    │   └── product-model.ts            # Modelo de dados do módulo
    ├── suppliers
    │   └── ...
    ├── customers
    │   └── ...
    |
    └── utils                          # Utilidades centralizadas para toda a aplicação
        ├── fetch-helper.ts            # Função para realizar apenas fetchs autorizados com credentials
        ├── navigation.ts              # Navegação entre os módulos do sistema
        ├── formatters.ts              # Formatações e Máscaras(Moeda, Data, CNPJ etc)
        ├── messages.ts                # Criação de mensagens em tela(Confirmações, informações e bloqueios)
        └── autocomplete.ts            # Funções de autocomplete para campos de busca

---

## 📂 Módulos e Funcionalidades

### Dashboard
- Filtro de data inicial e final.
- Card de Vendas (Vendas Finalizadas + Total R$ e quantidade de vendas pendentes).
- Card de Compras (Compras Finalizadas + Total R$ e quantidade de compras pendentes).
- Card de Estoque: (Quantidade de itens abaixo do mínimo, dentro da média, e acima do máximo).
- Cards de Clientes e Fornecedores (Clientes Ativos, Inativos, e novos cadastrados no mês).

### Produtos Comerciais
- Cadastro/alteração e remoção de produtos.
- Regras de negócio para não permitir produtos com mesmo nome e código.
- Filtros dinâmicos de busca por ID, Nome, Categoria e Status(Ativo/Inativo).
- Registradores automáticos de data de cadastro e de data da última atualização do produto.

### Fornecedores
- Cadastro/alteração e remoção de fornecedores.
- Regras de negócio para não permitir fornecedores com mesmo nome fantasia, razão social, CNPJ e e-mail.
- Filtros dinâmicos de busca por ID, Nome Fantasia, Razão Social, CNPJ, E-mail e Status.
- Máscaras automáticas para campos CNPJ, telefone, celular e CEP.
- Registradores automáticos de data de cadastro e de data da última atualização do fornecedor.

### Clientes
- Cadastro/alteração e remoção de clientes.
- Regras de negócio para não permitir clientes com mesmo nome fantasia, razão social, CNPJ e e-mail.
- Filtros dinâmicos de busca por ID, Nome Fantasia, Razão Social, CNPJ, E-mail e Status.
- Máscaras automáticas para campos CNPJ, telefone, celular e CEP.
- Registradores automáticos de data de cadastro e de data da última atualização do cliente.

---

## 🗄 Banco de Dados
Diagrama Entidade-Relacionamento (ER):

![Diagrama ER](./docs/images/diagrama-er.png)

**Principais Tabelas:**
- `produtos` – Cadastro de produtos e controle de estoque.

- `fornecedores` – Cadastro de fornecedores.
- `clientes` - Cadastro de clientes.

- `compras` – Cabeçalho das compras.
- `itens_compra` – Itens vinculados à cada compra.

- `vendas` - Cabeçalho das vendas.
- `itens_venda` - Itens vinculados à cada venda.

- `users` - Tabela de usuários do sistema.
- `refresh-tokens` - Tabela de expiração de tokens de autenticação.

---

## 🌐 API Endpoints

### Compras
| Método | Rota                  | Descrição |
|--------|-----------------------|-----------|
| GET    | /api/compras          | Lista compras |
| GET    | /api/compras/:id      | Detalhes de uma compra |
| POST   | /api/compras          | Cria uma nova compra |
| PUT    | /api/compras/:id      | Atualiza uma compra |
| DELETE | /api/compras/:id      | Remove uma compra |

Exemplo de Request:
```json
POST /api/compras
{
  "fornecedorId": 1,
  "data": "2025-08-09",
  "itens": [
    { "produtoId": 2, "quantidade": 10, "valorUnitario": 50.00 }
  ]
}
```

🔐 Segurança e Boas Práticas
Autenticação: JWT com refresh token

Autorização: Controle por nível de usuário

Proteção: Middleware contra SQL Injection e XSS

Logs: Registro de erros e acessos

🚀 Próximos Passos
Adicionar módulo de RH

Implementar relatórios gráficos

Criar integração com API de emissão de notas fiscais


📄 Licença

MIT License

Copyright (c) [2025] [Mattew Hoppen]

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.