# API Products 📟

Objetivo:

- Criar uma API para cadastro de produtos comerciais, a API fará as operações básicas de CRUD (Cadastrar, Ler, Alterar e Deletar).

Regras de negócio: 📉

- Ao cadastrar um novo produto, o ID(ou primary key) do mesmo deverá ser controlado pelo banco de dados.
- Deve ser obrigatório para todos os produtos ter nome, código e preço.
- Não pode ser permitido produtos com o mesmo código, nome ou ID.
- O campo ESTOQUE, deve ser sempre um número inteiro positivo.

## Tecnologias Utilizadas 👨‍💻

- Node.js
- Typescript
- Framework Express
- PostgreSQL

## Endpoints ✒

### 📝 Listar Produtos 
- **GET** /api/produtos
- **GET** /api/produtos/id

Exemplo de resposta:

```javascript
[
  {
    "id": 5,
    "codigo": "BON-ABA-RET",
    "nome": "Boné Aba Reta",
    "descricao": "Boné moderno com ajuste regulável.",
    "preco": "75.50",
    "estoque": 250,
    "categoria": "Acessórios",
    "status": "ativo",
    "estoque_minimo": 80,
    "estoque_maximo": 300,
    "data_cadastro": "2025-05-20T14:54:07.000Z",
    "data_atualizacao": "2025-05-20T12:21:18.617Z",
  }
]
```

### ➕ Criar Produtos 

- **POST** (Não deve conter ID no JSON, o mesmo é controlado pelo Postgres(PK)).
- /api/produtos

```javascript
{  
    "codigo": "CAM-BAS",
    "nome": "Camiseta Básica",
    "descricao": "Descrição do produto Camiseta Básica.",
    "preco": "199.90",
    "estoque": 75,
    "categoria": "Calçados",
    "status": "ativo",
    "estoque_minimo": 50,
    "estoque_maximo": 199,
}
```

### 🖱 Alterar produtos 

- **PATCH** * (Atualização das informações) *
- /api/produtos/id

```javascript
{
  "preco": "199.90",
  "estoque": 75,
  "categoria": "Calçados",
  "status": "ativo",
}
    
```
- Retorna um JSON com todas as informações do produto atualizado.

```javascript
{
  
    "id": 1,
    "codigo": "CAM-BAS",
    "nome": "Camiseta Básica",
    "descricao": "Descrição do produto Camiseta Básica.",
    "preco": "199.90",
    "estoque": 75,
    "categoria": "Calçados",
    "status": "ativo",
    "estoque_minimo": 50,
    "estoque_maximo": 199,
    "data_cadastro": "2025-05-20T14:54:07.000Z",
    "data_atualizacao": "2025-05-20T12:17:42.095Z",
}
```

Caso as informações enviadas não estejam completas:

```javascript
{
  "Campos obrigatórios estão ausentes: nome, preço ou código."
}
```

### ⛔ Deletar Produtos 

- **DELETE**
- /api/produtos/id

```javascript
{
  "Produto deletado com sucesso."
}
```

Ou:

```javascript
{
  "Produto não encontrado."
}
```