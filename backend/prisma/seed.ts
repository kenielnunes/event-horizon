import { prisma } from "../src/lib/prisma";


async function main() {
  // Limpa regras antigas para evitar duplicatas no teste
  await prisma.rule.deleteMany({});

  // Regra de Valor Alto
  // "Se o total do pedido for maior que 1000, marque como VIP"
  await prisma.rule.create({
    data: {
      targetType: 'ORDER_CREATED',
      condition: {
        field: 'total',
        operator: 'gt', // Greater Than (Maior que)
        value: 1000
      },
      action: {
        type: 'tag_customer',
        value: 'VIP'
      },
      isActive: true
    }
  });

  // Regra de Fraude (Email suspeito)
  // "Se o email contiver 'tempmail', bloqueie"
  await prisma.rule.create({
    data: {
      targetType: 'USER_SIGNUP',
      condition: {
        field: 'user.email', // Testando propriedade aninhada
        operator: 'contains',
        value: 'tempmail'
      },
      action: {
        type: 'block_user',
        reason: 'suspicious_domain'
      },
      isActive: true
    }
  });

  // Regra de Teste de Falha (Chaos Testing)
  await prisma.rule.create({
    data: {
      targetType: 'CHAOS_TEST',
      condition: {
        field: 'force_error',
        operator: 'eq',
        value: true
      },
      action: {
        type: 'simulate_failure', 
        reason: 'test_resiliency'
      },
      isActive: true
    }
  });


  // Regra de Boas Vindas (Dispara Email)
  await prisma.rule.create({
    data: {
      targetType: 'USER_SIGNUP',
      condition: {
        field: 'user.email',
        operator: 'exists'
      },
      action: {
        type: 'send_email',
        to: 'teste@teste.com', 
        subject: 'Novo Usuário Cadastrado'
      },
      isActive: true
    }
  });

  console.log('🌱 Seed realizado com sucesso: Regras criadas.');
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });