import { db } from './db';

export async function seedDatabase() {
  try {
    // Verifica se já foi populado
    const existingUsers = await db.usuarios.count();

    if (existingUsers > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');

    /* =====================================================
       👤 USUÁRIOS
    ===================================================== */

    const adminId = await db.usuarios.add({
      uuid: crypto.randomUUID(),
      nome: 'Administrador Sistema',
      email: 'admin@biometria.com',
      perfil: 'ADMINISTRADOR',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const operadorId = await db.usuarios.add({
      uuid: crypto.randomUUID(),
      nome: 'Operador Coleta',
      email: 'operador@biometria.com',
      perfil: 'OPERADOR',
      ativo: true,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    /* =====================================================
       🖨️ SCANNERS
    ===================================================== */

    const scannerId = await db.scanners.add({
      uuid: crypto.randomUUID(),
      nome: 'Scanner Principal',
      modelo: 'BioCapture X100',
      numeroSerie: 'BC-001-2024',
      ativo: true,
      ultimoUso: new Date()
    });

    await db.scanners.add({
      uuid: crypto.randomUUID(),
      nome: 'Scanner Secundário',
      modelo: 'BioCapture X100',
      numeroSerie: 'BC-002-2024',
      ativo: false
    });

    /* =====================================================
       👩 MÃE + 👶 BEBÊ
    ===================================================== */

    const maeId = await db.maes.add({
      uuid: crypto.randomUUID(),
      nome: 'Maria Silva Santos',
      cpf: '123.456.789-00',
      dataNascimento: new Date('1995-03-15'),
      telefone: '(11) 98765-4321',
      endereco: 'Rua das Flores, 123 - São Paulo/SP',
      createdAt: new Date()
    });

    const bebeId = await db.bebes.add({
      uuid: crypto.randomUUID(),
      maeId: maeId,
      nome: 'João Silva Santos',
      dataNascimento: new Date('2024-01-10'),
      sexo: 'M',
      createdAt: new Date()
    });

    /* =====================================================
       📋 SESSÕES
    ===================================================== */

    const sessaoEmAndamento = await db.sessoesColeta.add({
      uuid: crypto.randomUUID(),
      usuarioId: operadorId,
      maeId: maeId,
      bebeId: bebeId,
      scannerId: scannerId,
      tipoSessao: 'PRIMEIRA_COLETA',
      matchingHabilitado: false,
      dataInicio: new Date(),
      status: 'EM_ANDAMENTO',
      syncStatus: 'PENDENTE',
      createdAt: new Date()
    });

    const sessaoConcluida = await db.sessoesColeta.add({
      uuid: crypto.randomUUID(),
      usuarioId: operadorId,
      maeId: maeId,
      bebeId: bebeId,
      scannerId: scannerId,
      tipoSessao: 'PRIMEIRA_COLETA',
      matchingHabilitado: true,
      dataInicio: new Date(Date.now() - 86400000),
      dataFim: new Date(Date.now() - 86400000 + 1800000),
      status: 'CONCLUIDA',
      syncStatus: 'SINCRONIZADO',
      createdAt: new Date(Date.now() - 86400000)
    });

    /* =====================================================
       🧬 DEDOS
    ===================================================== */

    const dedos = [
      { tipo: 'POLEGAR_D', qualidade: 95, framesOk: 48, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'POLEGAR_E', qualidade: 92, framesOk: 46, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'INDICADOR_D', qualidade: 88, framesOk: 44, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'INDICADOR_E', qualidade: 90, framesOk: 45, framesTotal: 50, resultado: 'SUCESSO' }
    ];

    for (const dedo of dedos) {
      await db.dedosColeta.add({
        uuid: crypto.randomUUID(),
        sessaoColetaId: sessaoConcluida,
        tipoDedo: dedo.tipo as any,
        qualidade: dedo.qualidade,
        framesOk: dedo.framesOk,
        framesTotal: dedo.framesTotal,
        resultado: dedo.resultado as any,
        createdAt: new Date()
      });
    }

    /* =====================================================
       📝 FORMULÁRIO
    ===================================================== */

    await db.formsColeta.add({
      uuid: crypto.randomUUID(),
      sessaoColetaId: sessaoConcluida,
      temperatura: 23.5,
      umidade: 55,
      tipoMistura: 'Padrão A',
      questionarioVersao: 'v1.2',
      observacoes: 'Coleta realizada com sucesso',
      coletaRapida: false,
      createdAt: new Date()
    });

    /* =====================================================
       🔐 LOGIN EVENTOS
    ===================================================== */

    await db.loginEventos.add({
      uuid: crypto.randomUUID(),
      usuarioId: adminId,
      email: 'admin@biometria.com',
      sucesso: true,
      createdAt: new Date()
    });

    /* =====================================================
       🧾 AUDITORIA
    ===================================================== */

    await db.auditorias.add({
      uuid: crypto.randomUUID(),
      usuarioId: adminId,
      acao: 'CRIAR',
      entidade: 'SESSAO_COLETA',
      entidadeId: sessaoEmAndamento,
      createdAt: new Date(),
      syncStatus: 'SINCRONIZADO'
    });

    /* =====================================================
       ❌ NÃO CRIAR FILA AUTOMÁTICA
       A fila deve ser gerada apenas por ações reais
    ===================================================== */

    console.log('Database seeded successfully!');

  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
