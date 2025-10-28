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
    const found = await productRepository.searchProductsById(id)
    
    if (!found)
      return notFound('Produto não encontrado');

    const productId = await productRepository.searchProductsById(id);
    return ok(productId);
    
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar o produto pelo ID.');
  }
};

export const createProductService = async (product: Omit<productModel, 'id' | 'data_cadastro' | 'data_atualizacao'>) => {
  try {
    if (!product.nome || !product.codigo || !product.preco || !product.status) {
      return badRequest('Campos obrigatórios estão ausentes: nome, código, preço ou status.');
    }

    const codigoAlreadyExists = await productRepository.verifyCodigo(product.codigo);
    if (codigoAlreadyExists) {
      return badRequest('Já existe um produto com mesmo código.')
    }

    const nomeAlreadyExists = await productRepository.verifyNome(product.nome);
    if (nomeAlreadyExists) {
      return badRequest('Já existe um produto com mesmo nome.')
    }

    const insertedProduct = await productRepository.insertProduct(product);
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

    // Atribui 0 se undefined ou null (valor padrão)
    data.estoque_minimo = data.estoque_minimo ?? 0;
    data.estoque_maximo = data.estoque_maximo ?? 0;

    //Garante que valores negativos não sejam enviados.
    if (
      (typeof data.estoque_minimo === "number" && data.estoque_minimo < 0) ||
      (typeof data.estoque_maximo === "number" && data.estoque_maximo < 0)
    ) {
      return badRequest("Valores negativos não são permitidos.");
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
  const deleted = await productRepository.deleteProduct(id)
  
  if (!deleted)
    return notFound('Produto não encontrado');
  
  return ok({ message: 'Produto deletado com sucesso.'});
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao deletar o produto.');
  }
};