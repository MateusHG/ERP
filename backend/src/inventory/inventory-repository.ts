import { InventoryMovementModel } from "./inventory-model";
import db  from "../config/db";

export async function registerMovement(mov: InventoryMovementModel) {
  const client = await db.connect();
  try {
    await client.query("BEGIN");

    const quantidade = Math.floor(Number(mov.quantidade));

    // Bloqueia o registro para evitar concorrência
    const saldoRes = await client.query(
      `SELECT quantidade FROM estoque_saldo WHERE produto_id = $1 FOR UPDATE`,
      [mov.produto_id]
    );

    const saldoAtual = saldoRes.rows[0]?.quantidade || 0;
    const fator = mov.tipo === "saida" ? -1 : 1;
    const novoSaldo = saldoAtual + quantidade * fator;

    if (novoSaldo < 0) {
      throw new Error(`Saldo insuficiente para registrar a saída. Saldo atual: ${saldoAtual}, Quantidade movimentada: ${quantidade}`);
    }


    // Insert no log de movimentações
    const result = await client.query(
      `INSERT INTO movimentacoes_estoque
       (produto_id, tipo, quantidade, origem, referencia_id, usuario_id)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [
        mov.produto_id,
        mov.tipo,
        quantidade,
        mov.origem,
        mov.referencia_id,
        mov.usuario_id,
      ]
    );

    // Atualizar saldo na tabela estoque_saldo
    await client.query(
      `INSERT INTO estoque_saldo (produto_id, quantidade)
       VALUES ($1, $2)
       ON CONFLICT (produto_id)
       DO UPDATE SET quantidade = $2`,
      [mov.produto_id, novoSaldo] 
    );

    await client.query("COMMIT");
    return result.rows[0];

  } catch (error: any) {
    await client.query("ROLLBACK");
    throw error;
  } finally {
    client.release();
  }
};

export async function getBalance(produto_id: number) {
  const result = await db.query(
    `SELECT * FROM estoque_saldo WHERE produto_id = $1`,
    [produto_id]
  );
  return result.rows[0] || 0;
};

export async function listMovements(produto_id: number) {
  const result = await db.query(
    `SELECT * FROM movimentacoes_estoque WHERE produto_id = $1 ORDER BY created_at DESC`,
    [produto_id]
  );
  return result.rows;
}