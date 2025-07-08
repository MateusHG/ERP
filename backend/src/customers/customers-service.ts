import { customerModel } from "../customers/customer-model";
import * as customerRepository from "../customers/customers-repository"
import { badRequest, internalServerError, notFound, ok } from "../utils/http-helper";


export const getCustomersService = async () => {
  try {
    const customers = await customerRepository.searchAllCustomers();
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
    if ( !customer.razao_social || !customer.email || !customer.status ) {
    return badRequest('Campos obrigatórios estão ausentes: razão social, email, CPF/CNPJ ou status.');
  }

    const hasCpf = !!customer.cpf;
    const hasCnpj = !!customer.cnpj;

    //Validação para permitir apenas CPF ou CNPJ, nunca ambos
    if ((hasCpf && hasCnpj) || (!hasCpf && !hasCnpj)) {
      return badRequest('Informe apenas CPF ou apenas CNPJ.');
    }

    //Validações para não duplicar CPF ou CNPJ.
    if (hasCnpj) {
    const cnpjAlreadyExists = await customerRepository.verifyCnpj(customer.cnpj);
    if (cnpjAlreadyExists) {
      return badRequest('CNPJ já existe em outro cadastro.')
    }
  }

    if (hasCpf) {
    const cpfAlreadyExists = await customerRepository.verifyCpf(customer.cpf);
    if (cpfAlreadyExists) {
      return badRequest('CPF já existe em outro cadastro.')
    }
  }  
    //Verifica se já existe a razão social e email.
    const razaoAlreadyExists = await customerRepository.verifyRazao(customer.razao_social);
    if (razaoAlreadyExists) {
      return badRequest('Razão social já existe em outro cadastro.')
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

    const existingCustomer = await customerRepository.searchCustomerById(id);
    if(!existingCustomer) {
      return notFound('Cliente não encontrado.')
    }

    const hasCpf = data.cpf !== undefined;
    const hasCnpj = data.cnpj !== undefined;

    if (hasCpf && data.cpf && existingCustomer.cnpj) {
    data.cnpj = undefined; // sobrescreve o CNPJ no update
  } 

    if (hasCnpj && data.cnpj && existingCustomer.cpf) {
    data.cpf = undefined; // sobrescreve o CPF no update
  }

    //Apenas se FOR ENVIADO CPF/CNPJ, aplica a regra para escolher apenas um dos dois.
    if ((hasCpf || hasCnpj) && (hasCpf && hasCnpj || !hasCpf && !hasCnpj)) {
      return badRequest('Informe apenas CPF ou apenas CNPJ.');
    }

    //Valida duplicidade se for enviado ** CPF **
    if (hasCpf && data.cpf) {
      const cpfAlreadyExists = await customerRepository.verifyCpf(data.cpf);
      if (cpfAlreadyExists) {
        return badRequest('CPF já existe em outro cadastro.')
    }
  }
    //Valida duplicidade se for enviado ** CNPJ **
    if (hasCnpj && data.cnpj) {
      const cnpjAlreadyExists = await customerRepository.verifyCnpj(data.cnpj);
      if (cnpjAlreadyExists) {
        return badRequest('CNPJ já existe em outro cadastro.');
      }
  }

    //Verifica se já existe a razão social e email.
    if (data.razao_social) {
    const razaoAlreadyExists = await customerRepository.verifyRazao(data.razao_social);
    if (razaoAlreadyExists) {
      return badRequest('Razão social já existe em outro cadastro.');
    }
  }

    if (data.email) {
    const emailAlreadyExists = await customerRepository.verifyEmail(data.email);
    if (emailAlreadyExists) {
      return badRequest('Email já existe em outro cadastro.')
    }
  }

    const updatedCustomer = await customerRepository.updateCustomer(id, data);
    //Se tudo der certo retorna ok com os dados do cliente.
    return ok(updatedCustomer);

  } catch (err) {
    console.error(err);
    return internalServerError('Erro ao atualizar cadastro.');
  }
};

export const deleteCustomerByIdService = async (id: number) => {
  try {
  const deleted = await customerRepository.deleteCustomerById(id);

  if (!deleted) {
    return notFound('ID Não encontrado.')
  }
    return ok({ mensagem: 'Cliente deletado com sucesso.' });

}   catch (err) {
    console.error(err);
    return internalServerError('Erro ao deletar cliente.')
  }
};