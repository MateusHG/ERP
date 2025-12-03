import { customerModel } from "../customers/customer-model";
import * as customerRepository from "../customers/customers-repository"
import { badRequest, internalServerError, notFound, ok } from "../utils/http-helper";


export const getCustomersService = async (
  filters: { id?: number, nome_fantasia?: string, razao_social?: string, cnpj?: string, email?: string, status?: string}
) => {
  try {
    const customers = await customerRepository.searchAllCustomers(filters);
    return ok(customers);

}   catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar clientes.');
  }
};

export const getCustomerByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest('ID Inválido.')
    }

    const customer = await customerRepository.searchCustomerById(id);
    if (!customer) {
      return notFound('Cliente não encontrado.')
    }

    return ok(customer);

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao buscar cliente pelo ID.')
  }
};

export const createCustomerService = async (customer: Omit<customerModel, 'id' | 'data_cadastro' | 'data_atualizacao'>) => {
  try {
    if ( !customer.razao_social || !customer.nome_fantasia || !customer.cnpj || !customer.cep || !customer.status ) {
    return badRequest('Campos obrigatórios estão ausentes: Razão Social, Nome Fantasia, CNPJ, CEP ou Status.');
  }

    const nomeAlreadyExists = await customerRepository.verifyNomeFantasia(customer.nome_fantasia); 
    if (nomeAlreadyExists) {
      return badRequest("Nome fantasia já existe em outro cadastro.");
    }
  
    //Verifica se já existe a razão social e email.
    const razaoAlreadyExists = await customerRepository.verifyRazao(customer.razao_social);
    if (razaoAlreadyExists) {
      return badRequest('Razão social já existe em outro cadastro.')
    }

    const cnpjAlreadyExists = await customerRepository.verifyCnpj(customer.cnpj);
    if (cnpjAlreadyExists) {
      return badRequest("CNPJ já existe em outro cadastro.");
    }

    const emailAlreadyExists = await customerRepository.verifyEmail(customer.email);
    if (emailAlreadyExists) {
      return badRequest('Email já existe em outro cadastro.')
    }

    const insertedCustomer = await customerRepository.insertCustomer(customer);
    return ok(insertedCustomer);

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao cadastrar cliente.')
  }
};

export const updateCustomerByIdService = async (id:number, data: Partial<customerModel>) => {
  try {
    if (Object.keys(data).length === 0) {
      return badRequest('Nenhum campo enviado para atualização.')
    }

    const customer = await customerRepository.searchCustomerById(id);
    if(!customer) {
      return notFound('Cliente não encontrado.')
    }

    // Se já houve vendas com o cliente que está sendo alterado, bloqueia dados sensíveis
    if (customer.has_sales) {
      const lockedFields = ["razao_social", "cnpj", "inscricao_estadual"];

      for (const field of lockedFields) {
        if (field in data) {
          return badRequest(`O campo '${field}' não pode ser alterado pois o cliente já possui movimentações de venda.`)
        }
      }
    }

    //Verifica se já existe a razão social e email.
    if (data.razao_social) {
    const razaoAlreadyExists = await customerRepository.verifyRazao(data.razao_social, id);
    if (razaoAlreadyExists) {
      return badRequest('Razão social já existe em outro cadastro.');
    }
  }

    if (data.nome_fantasia) {
      const nomeAlreadyExists = await customerRepository.verifyNomeFantasia(data.nome_fantasia);
      if (nomeAlreadyExists && nomeAlreadyExists.id !== id) {
        return badRequest("Já existe um cadastro com este nome fantasia.");
      }
    }

    if (data.email) {
    const emailAlreadyExists = await customerRepository.verifyEmail(data.email, id);
    if (emailAlreadyExists) {
      return badRequest('Email já existe em outro cadastro.')
    }
  }

    const updatedCustomer = await customerRepository.updateCustomer(id, data);

    if (!updatedCustomer) {
      return notFound("Cliente não encontrado");
    }

    return ok( {message: "Cadastro atualizado com sucesso." });

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao atualizar cadastro.');
  }
};

export const deleteCustomerByIdService = async (id: number) => {
  try {
    if (isNaN(id)) {
      return badRequest("ID Inválido.");
    }

    const customer = await customerRepository.searchCustomerById(id);
    if (!customer) {
      return badRequest("Cliente não encontrado.");
    }

    const hasSales = await customerRepository.verifyCustomerSales(id);
    if (hasSales) {
      return badRequest("Este cliente já possui vendas cadastradas no sistema, não é possível excluir.")
    }

    await customerRepository.deleteCustomerById(id);

    return ok({ message: 'Cliente deletado com sucesso.' });

}   catch (err) {
    console.error(err);
    return internalServerError('Erro ao deletar cliente.')
  }
};