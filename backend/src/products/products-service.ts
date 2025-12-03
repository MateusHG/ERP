import { badRequest, internalServerError, notFound, ok } from "../utils/http-helper";
import * as productRepository from "../products/products-repository";
import { productModel } from "../products/product-model";

export const getProductsService = async (filters: { id?: number, codigo?: string, nome?: string, categoria?: string, status?: string }) => {
  try {
    const products = await productRepository.searchAllProducts(filters);
    return ok(products);

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar produtos.');
  }
}; 

export const getProductsByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest("ID Inválido");
    }

    const product = await productRepository.searchProductsById(id);
    if (!product)
      return notFound('Produto não encontrado');

    return ok(product);
    
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar o produto pelo ID.');
  }
};

export const createProductService = async (product: Omit<productModel, 'id' | 'data_cadastro' | 'data_atualizacao'>) => {
  try {
    if (!product.nome || !product.codigo || !product.status) {
      return badRequest('Campos obrigatórios estão ausentes: nome, código ou status.');
    }

    const codigoAlreadyExists = await productRepository.verifyCodigo(product.codigo);
    if (codigoAlreadyExists) {
      return badRequest('Já existe um produto com mesmo código.')
    }

    const nomeAlreadyExists = await productRepository.verifyNome(product.nome);
    if (nomeAlreadyExists) {
      return badRequest('Já existe um produto com mesmo nome.')
    }

    await productRepository.insertProduct(product);
    return ok( { message: 'Produto cadastrado com sucesso.'} );

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao cadastrar o produto.');
  } 
};

export const updateProductByIdService = async (id: number, data: Partial<productModel>) => {
  try {
    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.');
    }

    const currentProduct = await productRepository.searchProductsById(id);
    if (!currentProduct) {
      return notFound("Produto não encontrado");
    }

    const hasMovements = currentProduct.has_movements === true;
    if (hasMovements && data.codigo !== undefined && data.codigo !== currentProduct.codigo) {
      return badRequest("Não é permitido alterar o código de um produto que já possui movimentações.");
    }

    // Atribui 0 se undefined ou null (valor padrão)
    data.estoque_minimo = data.estoque_minimo ?? currentProduct.estoque_minimo ?? 0;
    data.estoque_maximo = data.estoque_maximo ?? currentProduct.estoque_maximo ?? 0;

    // Bloquear negativos
    if (data.estoque_minimo < 0 || data.estoque_maximo < 0) {
      return badRequest("Valores negativos não são permitidos.");
    } 

    if (data.estoque_minimo > data.estoque_maximo) {
      return badRequest("O estoque mínimo não pode ser maior que o estoque máximo.");
    }

    if (data.codigo) {
    const codigoAlreadyExists = await productRepository.verifyCodigo(data.codigo);
    if (codigoAlreadyExists && codigoAlreadyExists.id !== id) {
      return badRequest('Já existe um produto com mesmo código.');
    }
  }

    if(data.nome) {
      const nomeAlreadyExists = await productRepository.verifyNome(data.nome);
      if (nomeAlreadyExists && nomeAlreadyExists.id !== id) {
        return badRequest('Já existe um produto com o mesmo nome.')
      }
    }

    const updatedProduct = await productRepository.updateProduct(id, data);
    if (!updatedProduct) {
      return notFound('Produto não encontrado');
    };

    return ok({ message: "Produto atualizado com sucesso." });

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao atualizar o produto.');
  }
};

export const deleteProductsByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest("ID Inválido.");
    }

    const product = await productRepository.searchProductsById(id);
    if (!product) {
      return badRequest("Produto não encontrado.");
    }

    const hasMovements = await productRepository.verifyProductMovements(id);
    if (hasMovements) {
      return badRequest("Este produto já possui movimentações cadastradas no sistema, não é possível excluir.")
    }

    await productRepository.deleteProduct(id);
  
    return ok({ message: 'Produto deletado com sucesso.'});

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao deletar o produto.');
  }
};