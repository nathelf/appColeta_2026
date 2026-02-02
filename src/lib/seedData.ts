import { db } from './db';

export async function seedDatabase() {
  try {
    // Check if already seeded
    const existingUsers = await db.usuarios.count();
    if (existingUsers > 0) {
      console.log('Database already seeded');
      return;
    }

    console.log('Seeding database...');

    // Seed Usuarios
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

    // Seed Scanners
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

    // Seed Mae e Bebe
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

    // Seed Sessoes
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

    const sessaoRecoleta = await db.sessoesColeta.add({
      uuid: crypto.randomUUID(),
      usuarioId: adminId,
      maeId: maeId,
      bebeId: bebeId,
      scannerId: scannerId,
      tipoSessao: 'RECOLETA',
      sessaoOrigemId: sessaoConcluida,
      matchingHabilitado: true,
      dataInicio: new Date(Date.now() - 43200000),
      dataFim: new Date(Date.now() - 43200000 + 1200000),
      status: 'CONCLUIDA',
      syncStatus: 'PENDENTE',
      createdAt: new Date(Date.now() - 43200000)
    });

    // Seed Dedos (para sessao concluida)
    const dedos = [
      { tipo: 'POLEGAR_D', qualidade: 95, framesOk: 48, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'POLEGAR_E', qualidade: 92, framesOk: 46, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'INDICADOR_D', qualidade: 88, framesOk: 44, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'INDICADOR_E', qualidade: 90, framesOk: 45, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'MEDIO_D', qualidade: 85, framesOk: 42, framesTotal: 50, resultado: 'PARCIAL' },
      { tipo: 'MEDIO_E', qualidade: 87, framesOk: 43, framesTotal: 50, resultado: 'SUCESSO' },
      { tipo: 'ANELAR_D', qualidade: 65, framesOk: 32, framesTotal: 50, resultado: 'PARCIAL' },
      { tipo: 'ANELAR_E', qualidade: 78, framesOk: 39, framesTotal: 50, resultado: 'PARCIAL' },
      { tipo: 'MINIMO_D', qualidade: 55, framesOk: 27, framesTotal: 50, resultado: 'FALHA' },
      { tipo: 'MINIMO_E', qualidade: 60, framesOk: 30, framesTotal: 50, resultado: 'FALHA' }
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

    // Seed Form Coleta
    const formId = await db.formsColeta.add({
      uuid: crypto.randomUUID(),
      sessaoColetaId: sessaoConcluida,
      temperatura: 23.5,
      umidade: 55,
      tipoMistura: 'Padrão A',
      questionarioVersao: 'v1.2',
      observacoes: 'Coleta realizada com sucesso',
      justificativaParcial: 'Dedo mínimo com movimentação excessiva',
      coletaRapida: false,
      createdAt: new Date()
    });

    // Seed Login Eventos
    const loginEventos = [
      { email: 'admin@biometria.com', sucesso: true, usuarioId: adminId },
      { email: 'operador@biometria.com', sucesso: true, usuarioId: operadorId },
      { email: 'admin@biometria.com', sucesso: false, motivoFalha: 'Senha incorreta' },
      { email: 'operador@biometria.com', sucesso: true, usuarioId: operadorId },
      { email: 'teste@biometria.com', sucesso: false, motivoFalha: 'Usuário não encontrado' }
    ];

    for (const evento of loginEventos) {
      await db.loginEventos.add({
        uuid: crypto.randomUUID(),
        usuarioId: evento.usuarioId,
        email: evento.email,
        sucesso: evento.sucesso,
        motivoFalha: evento.motivoFalha,
        dispositivo: 'Desktop/Chrome',
        ipAddress: '192.168.1.100',
        createdAt: new Date(Date.now() - Math.random() * 7 * 86400000)
      });
    }

    // Seed Auditoria
    const auditorias = [
      { acao: 'CRIAR', entidade: 'SESSAO_COLETA', entidadeId: sessaoConcluida },
      { acao: 'ATUALIZAR', entidade: 'SESSAO_COLETA', entidadeId: sessaoConcluida },
      { acao: 'CRIAR', entidade: 'USUARIO', entidadeId: operadorId },
      { acao: 'ATUALIZAR', entidade: 'MAE', entidadeId: maeId },
      { acao: 'CRIAR', entidade: 'SESSAO_COLETA', entidadeId: sessaoRecoleta }
    ];

    for (const audit of auditorias) {
      await db.auditorias.add({
        uuid: crypto.randomUUID(),
        usuarioId: adminId,
        acao: audit.acao,
        entidade: audit.entidade,
        entidadeId: audit.entidadeId,
        dadosNovos: JSON.stringify({ exemplo: 'dados' }),
        dispositivo: 'Desktop/Chrome',
        ipAddress: '192.168.1.100',
        createdAt: new Date(Date.now() - Math.random() * 7 * 86400000),
        syncStatus: Math.random() > 0.5 ? 'SINCRONIZADO' : 'PENDENTE'
      });
    }

    // Seed Sync Queue
    await db.syncQueue.add({
      tipo: 'SESSAO',
      payload: JSON.stringify({ sessaoId: sessaoEmAndamento }),
      prioridade: 1,
      tentativas: 0,
      status: 'PENDENTE',
      createdAt: new Date(),
      updatedAt: new Date()
    });

    await db.syncQueue.add({
      tipo: 'FORMULARIO',
      payload: JSON.stringify({ formId: formId }),
      prioridade: 2,
      tentativas: 1,
      ultimoErro: 'Timeout de conexão',
      status: 'ERRO',
      createdAt: new Date(Date.now() - 3600000),
      updatedAt: new Date(Date.now() - 1800000)
    });

    await db.syncQueue.add({
      tipo: 'AUDITORIA',
      payload: JSON.stringify({ auditId: 1 }),
      prioridade: 3,
      tentativas: 2,
      ultimoErro: 'Conflito de versão',
      status: 'CONFLITO',
      createdAt: new Date(Date.now() - 7200000),
      updatedAt: new Date(Date.now() - 3600000)
    });

    console.log('Database seeded successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  }
}
