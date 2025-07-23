import { supplierModel } from "../suppliers/supplier-model";
import * as supplierRepository from "../suppliers/suppliers-repository"
import { badRequest, internalServerError, notFound, ok } from "../utils/http-helper";

export const getSuppliersService = async (
  filters: {id?: number, nome_fantasia?: string, razao_social?: string, cnpj?: string, email?: string, status?: string}
) => {
  try {
    const suppliers = await supplierRepository.searchAllSuppliers(filters);
    return ok(suppliers);
  
  } catch (err) {
    console.error(err);
    return internalServerError("Erro ao buscar fornecedores.");
  }
};

export const getSupplierByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest('ID Inválido.');
    }

    const supplier = await supplierRepository.searchSupplierById(id);
    if (!supplier) {
      return notFound('Fornecedor não encontrado.');
    }

    return ok(supplier);
    
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar fornecedor.');
  }
};

export const createSupplierService = async (supplier: Omit<supplierModel, 'id' | 'data_cadastro' | 'data_atualizacao'>) => {
  try {
    if (!supplier.razao_social || !supplier.nome_fantasia || !supplier.cnpj || !supplier.email || !supplier.status) {
      return badRequest('Campos obrigatórios estão ausentes: razão social, nome fantasia, cnpj, email ou status');
    }

    const nomeAlreadyExists = await supplierRepository.verifyNomeFantasia(supplier.nome_fantasia);
    if (nomeAlreadyExists) {
      return badRequest('Nome fantasia já existe em outro cadastro.');
    }

    const razaoAlreadyExists = await supplierRepository.verifyRazao(supplier.razao_social);
    if (razaoAlreadyExists) {
      return badRequest('Razão social já existe em outro cadastro.');
    }

    const cnpjAlreadyExists = await supplierRepository.verifyCnpj(supplier.cnpj);
    if (cnpjAlreadyExists) {
      return badRequest('CNPJ já existe em outro cadastro.');
    }

    const emailAlreadyExists = await supplierRepository.verifyEmail(supplier.email);
    if (emailAlreadyExists) {
      return badRequest('Email já existe em outro cadastro.')
    }

    const insertedSupplier = await supplierRepository.insertSupplier(supplier);
    return ok(insertedSupplier);
  
  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao cadastrar o fornecedor.');
  }
};

export const updateSupplierByIdService = async (id: number, data: Partial<supplierModel>) => {
  try {
    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.');
    }

    if (data.nome_fantasia) {
      const nomeAlreadyExists = await supplierRepository.verifyNomeFantasia(data.nome_fantasia);
      if (nomeAlreadyExists && nomeAlreadyExists.id !== id) {
        return badRequest('Já existe um cadastro com o mesmo nome fantasia.')
      }
    }

    if (data.razao_social) {
      const razaoAlreadyExists = await supplierRepository.verifyRazao(data.razao_social);
      if (razaoAlreadyExists && razaoAlreadyExists.id !== id) {
        return badRequest('Já existe um cadastro com esta razão social.');
      }
    }

    if (data.cnpj) {
      const cnpjAlreadyExists = await supplierRepository.verifyCnpj(data.cnpj);
      if (cnpjAlreadyExists && cnpjAlreadyExists.id !== id) {
        return badRequest('Já existe um cadastro com este CNPJ.');
      }
    }

    if (data.email) {
      const emailAlreadyExists = await supplierRepository.verifyEmail(data.email);
      if (emailAlreadyExists && emailAlreadyExists.id !== id) {
        return badRequest('Já existe um cadastro com este e-mail.');
      }
    }

    const updatedSupplier = await supplierRepository.updateSupplier(id, data);

    if(!updatedSupplier) {
      return notFound('Fornecedor não encontrado.')
    }
    
    return ok( { message: "Cadastro atualizado com sucesso." });

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao atualizar o cadastro.');
  }
};

export const deleteSupplierByIdService = async (id: number) => {
  try {
  const deleted = await supplierRepository.deleteSupplierById(id);

  if (!deleted) {
    return notFound('ID Não encontrado.')
}
  return ok({ message: 'Fornecedor deletado com sucesso.'});

}  catch (err) {
   console.error(err);
   return internalServerError('Erro ao deletar fornecedor.');
  }
};