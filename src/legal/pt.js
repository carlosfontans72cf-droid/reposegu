// Termos e Condições e Política de Privacidade (português).
export default (c) => ({
  terminos: {
    titulo: 'Termos e Condições de Uso',
    intro: `Versão ${c.version}. Leia este documento com atenção: ele regula o uso da Plataforma e a relação entre você e ${c.titular}.`,
    secciones: [
      {
        t: '1. Quem oferece o serviço e aceitação',
        p: [
          `A Plataforma é um aplicativo web instalável (PWA) de gestão para pequenos negócios, oferecido por ${c.titular} ("o Titular", "nós").`,
          'Ao criar uma conta, marcar a caixa de aceitação ou usar a Plataforma, você aceita estes Termos e a Política de Privacidade. Se você usa a Plataforma em nome de uma empresa, declara ter poderes para obrigá-la. Se não concordar, não a utilize.',
        ],
      },
      {
        t: '2. Definições',
        p: [
          '"Plataforma": o aplicativo, seu catálogo público, seu código, seus bancos de dados e serviços associados.',
          '"Empresa": o negócio que contrata a Plataforma (por exemplo, uma confeitaria).',
          '"Equipe": as pessoas que a Empresa convida a usar sua conta (proprietário, administradores, funcionários).',
          '"Clientes finais": as pessoas que compram da Empresa e cujos dados esta registra na Plataforma. Não têm conta nem são usuários da Plataforma.',
          '"Conteúdo da Empresa": tudo o que a Empresa ou sua Equipe registram: produtos, preços, fotos, receitas, insumos, estoque, pedidos, clientes, zonas de entrega, textos e arquivos.',
        ],
      },
      {
        t: '3. O que é (e o que não é) a Plataforma',
        p: [
          'A Plataforma é uma ferramenta para organizar o trabalho diário: catálogo, pedidos, entregas, estoque de insumos, receitas e custos, clientes e fretes.',
          'Não é um sistema contábil, de faturamento ou de apuração de impostos; não emite documentos fiscais; não é uma loja virtual nem um gateway de pagamento; não cobra nem intermedeia pagamentos entre a Empresa e seus Clientes finais; não verifica licenças sanitárias nem informações de alérgenos; e não presta assessoria contábil, fiscal, jurídica ou sanitária.',
          'O catálogo público permite que um cliente monte um pedido e o envie por WhatsApp à Empresa. O pedido só existe na Plataforma quando a Equipe o registra.',
        ],
      },
      {
        t: '4. Cadastro, contas e segurança',
        p: [
          'Você deve ter mais de 18 anos e capacidade legal para contratar. Os dados fornecidos devem ser verdadeiros, completos e atualizados.',
          'Para usar a Plataforma é preciso confirmar seu e-mail. Cada conta é pessoal e intransferível: não compartilhe sua senha. Você é responsável pela atividade realizada com sua conta.',
          'Avise-nos imediatamente se suspeitar de acesso não autorizado. O proprietário da Empresa é responsável pelas pessoas que convida, pelos papéis que atribui e por desativar quem deixar a Equipe.',
        ],
      },
      {
        t: '5. Período de teste gratuito',
        p: [
          'Cada Empresa tem um teste gratuito de 30 dias, sem cartão. É um único teste por Empresa: criar empresas repetidas para obter novos testes é uso abusivo e pode gerar suspensão.',
          'Ao término do teste, o acesso é bloqueado até que um pagamento seja registrado. Os dados são mantidos conforme a seção 27.',
        ],
      },
      {
        t: '6. Planos, preços e forma de pagamento',
        p: [
          'Os planos vigentes são: mensal USD 20 e anual USD 120 (preços em dólares americanos, sem impostos). Os preços vigentes são exibidos na Plataforma.',
          'O pagamento é manual: transferência bancária ou Pix para as contas exibidas pela Plataforma na seção de pagamento. Pague somente a essas contas e confira os dados; não nos responsabilizamos por pagamentos feitos a outras contas.',
          'Após pagar, envie o comprovante por WhatsApp ao número informado na Plataforma. Ativamos ou renovamos a conta ao verificar o pagamento, em horário razoável e sem prazo garantido. Tarifas, custos de transferência, variação cambial e impostos decorrentes do pagamento são de responsabilidade da Empresa.',
          'Podemos alterar preços ou planos mediante aviso na Plataforma com pelo menos 30 dias de antecedência. A mudança não afeta o período já pago.',
        ],
      },
      {
        t: '7. Vencimento, período de carência e suspensão',
        p: [
          'Se o plano vencer, abre-se um período de carência de 7 dias em que você pode continuar usando a Plataforma com um aviso. Passado esse prazo sem pagamento, o acesso é bloqueado.',
          'Ao registrar o pagamento, o acesso é restabelecido. Durante o bloqueio, o catálogo público pode deixar de ser atualizado.',
        ],
      },
      {
        t: '8. Cancelamento e reembolsos',
        p: [
          'Você pode cancelar quando quiser avisando pelo canal de suporte. O cancelamento vale ao fim do período já pago.',
          'Os pagamentos realizados não são reembolsáveis, salvo se a lei aplicável exigir ou se aceitarmos por escrito. O teste gratuito existe para você avaliar o serviço antes de pagar.',
          'Se a legislação de defesa do consumidor do seu país lhe garantir direitos irrenunciáveis (por exemplo, direito de arrependimento), estes Termos não os limitam.',
        ],
      },
      {
        t: '9. Conteúdo e dados da Empresa',
        p: [
          'O Conteúdo da Empresa pertence à Empresa. Você nos concede uma licença limitada e não exclusiva para hospedá-lo, processá-lo, reduzi-lo (por exemplo, diminuir fotos), copiá-lo para backup e exibi-lo conforme configurado (por exemplo, no catálogo público), apenas para prestar o serviço.',
          'Não vendemos seus dados nem os de seus Clientes finais, nem os usamos para publicidade de terceiros.',
          'Você declara ter direito de registrar o Conteúdo da Empresa (incluindo fotos, nomes, marcas e textos) e que ele não viola direitos de terceiros nem a lei. Você é o único responsável por esse conteúdo.',
        ],
      },
      {
        t: '10. Dados pessoais de Clientes finais',
        p: [
          'Quanto aos dados de Clientes finais (nome, telefone, endereço, observações), a Empresa é a controladora e o Titular atua como operador: trata-os apenas para prestar o serviço e seguindo as instruções da Empresa.',
          'A Empresa deve cumprir a legislação de proteção de dados aplicável (no Brasil, a Lei 13.709, LGPD; no Uruguai, a Lei 18.331; na Argentina, a Lei 25.326, e normas complementares), ter base legal para registrar esses dados, informar seus Clientes finais e atender pedidos de acesso, retificação ou exclusão. Não deve registrar dados sensíveis (por exemplo, de saúde) sem base legal e necessidade real; se registrar alergias de um cliente, será sob sua responsabilidade.',
          'O tratamento também é regido pela Política de Privacidade. Podemos usar provedores de infraestrutura (seção 5 da Política de Privacidade) e notificaremos incidentes de segurança que afetem seus dados quando cabível.',
        ],
      },
      {
        t: '11. Responsabilidade da Empresa por seu negócio',
        p: [
          'A Empresa é a única vendedora e responsável perante seus Clientes finais. O Titular não é parte das vendas, nem garante, fabrica, armazena, transporta ou entrega produtos.',
          'São de exclusiva responsabilidade da Empresa: a qualidade, higiene, inocuidade, conservação e rotulagem de seus produtos; licenças e registros sanitários e comerciais; informações sobre ingredientes e alérgenos; preços e promoções divulgados; tributos e emissão de notas ou comprovantes fiscais; obrigações trabalhistas e previdenciárias; entregas, atrasos, danos no transporte e reclamações; e a publicidade e propriedade intelectual do que exibir.',
        ],
      },
      {
        t: '12. Alérgenos e segurança alimentar',
        p: [
          'Alergias e intolerâncias podem ser graves. A Plataforma não valida ingredientes nem alérgenos. A Empresa deve informar corretamente seus clientes e não depender de observações livres como único controle.',
          'As observações de um pedido (por exemplo, "sem nozes") são texto livre registrado por pessoas; a Plataforma não garante que sejam lidas, respeitadas ou transmitidas corretamente.',
        ],
      },
      {
        t: '13. Cálculos, custos e estimativas',
        p: [
          'Os custos de receitas, margens, lucros, baixas de estoque, saldos, totais e demais indicadores são estimativas calculadas com os dados que a Empresa registra. Dependem de que esses dados estejam completos e atualizados (preços de compra, rendimento das receitas, perdas, unidades).',
          'Não constituem assessoria contábil, financeira ou fiscal. Verifique os resultados antes de decidir (definir preços, comprar, pagar impostos). Não nos responsabilizamos por decisões baseadas neles.',
        ],
      },
      {
        t: '14. Catálogo público e WhatsApp',
        p: [
          'O catálogo público é acessível a qualquer pessoa com o link e mostra apenas as informações comerciais que a Empresa decide publicar. É responsabilidade da Empresa mantê-lo correto e retirar o que não couber.',
          'O WhatsApp é um serviço de terceiros (Meta) com seus próprios termos e políticas. Ao tocar em um botão de WhatsApp, esse aplicativo abre com uma mensagem montada; não acessamos as conversas nem garantimos a entrega, leitura ou resposta das mensagens. Não somos parte da relação entre a Empresa e seus Clientes finais.',
        ],
      },
      {
        t: '15. Uso aceitável',
        p: [
          'É proibido: usar a Plataforma para atividades ilegais ou fraudulentas; registrar conteúdo ilícito, enganoso, ofensivo, que viole direitos de terceiros ou contenha malware; tentar acessar dados de outras empresas ou violar a segurança; fazer engenharia reversa, copiar ou revender a Plataforma sem autorização; automatizar acessos em massa (scraping) ou sobrecarregar o serviço; se passar por outras pessoas; enviar spam com dados da Plataforma; ou burlar os limites do plano.',
          'Podemos remover conteúdo ou suspender contas que descumpram esta seção, sem prejuízo de outras medidas legais.',
        ],
      },
      {
        t: '16. Limites técnicos e uso razoável',
        p: [
          'A Plataforma funciona sobre serviços em nuvem com cotas. Para preservá-las, as fotos são reduzidas antes do envio e podem existir limites de tamanho e quantidade.',
          'O plano para confeitarias admite até 10 integrantes da Equipe; os Clientes finais não contam. O plano para empresas de segurança não limita a quantidade de pessoas, sujeito a uso razoável de armazenamento e de fotos ou vídeos. Podemos pedir ajuste se o uso afetar o serviço.',
        ],
      },
      {
        t: '17. Disponibilidade e versão em desenvolvimento',
        p: [
          'A Plataforma está em desenvolvimento contínuo. É oferecida "como está" e "conforme disponibilidade", sem garantia de funcionamento ininterrupto ou livre de erros. Pode haver interrupções por manutenção, falhas próprias ou de provedores (por exemplo, Google Firebase), problemas de conectividade ou força maior.',
          'Podemos adicionar, modificar ou retirar funções. Se uma mudança eliminar uma função essencial do plano contratado, você pode cancelar conforme a seção 8.',
        ],
      },
      {
        t: '18. Backups e perda de dados',
        p: [
          'Adotamos medidas razoáveis para conservar as informações, mas não garantimos que não se percam, corrompam ou fiquem inacessíveis. Guarde cópia das informações importantes (por exemplo, sua lista de preços e receitas) e registre suas vendas também por meios próprios.',
          'Algumas funções usam uma cópia local no dispositivo para trabalhar com conexão ruim; os dados sincronizam quando a internet volta. Em caso de conflitos ou alterações simultâneas, pode prevalecer o último salvamento.',
        ],
      },
      {
        t: '19. Propriedade intelectual',
        p: [
          `A Plataforma, seu design, código, textos e marcas pertencem ao Titular (${c.titular}) ou a seus licenciantes. Concedemos uma licença limitada, pessoal, não exclusiva, intransferível e revogável para usá-la enquanto você tiver conta ativa e cumprir estes Termos.`,
          'Se nos enviar sugestões ou ideias, podemos usá-las sem qualquer obrigação para com você.',
        ],
      },
      {
        t: '20. Segurança',
        p: [
          'Usamos medidas razoáveis: autenticação, regras de acesso por empresa e por papel, e criptografia em trânsito. Nenhum sistema é totalmente seguro. Você também deve cuidar de seus dispositivos, senhas e das permissões de sua Equipe.',
          'Os papéis limitam o que cada pessoa pode fazer, mas alguns dados registrados (como custos) são tecnicamente acessíveis a quem pertence à mesma Empresa; o proprietário decide a quem convida.',
        ],
      },
      {
        t: '21. Garantias excluídas',
        p: [
          'Na máxima medida permitida por lei, não damos garantias expressas ou implícitas, incluindo adequação a uma finalidade específica, ausência de erros, resultados de vendas ou rentabilidade.',
        ],
      },
      {
        t: '22. Limitação de responsabilidade',
        p: [
          'Na máxima medida permitida por lei, o Titular não responde por lucros cessantes, perda de vendas, clientes, dados ou oportunidades, dano moral ou danos indiretos ou consequentes decorrentes do uso ou da impossibilidade de uso da Plataforma.',
          'Se alguma responsabilidade for determinada, ficará limitada ao maior valor entre o que a Empresa pagou nos 12 meses anteriores ao fato e USD 20.',
          'Esta limitação não se aplica a dolo, culpa grave nem ao que a lei não permitir limitar.',
        ],
      },
      {
        t: '23. Indenização',
        p: [
          'A Empresa manterá o Titular indene de reclamações, custos e despesas (incluindo honorários razoáveis) de terceiros, inclusive Clientes finais ou autoridades, decorrentes de seu Conteúdo, seus produtos ou serviços, seus descumprimentos legais ou do uso ilícito da Plataforma por sua Equipe.',
        ],
      },
      {
        t: '24. Força maior',
        p: [
          'Não respondemos por descumprimentos ou atrasos causados por fatos fora de nosso controle razoável: desastres, quedas de energia ou internet, falhas de provedores de nuvem, ataques cibernéticos apesar de medidas razoáveis, decisões de autoridades, conflitos, pandemias, entre outros.',
        ],
      },
      {
        t: '25. Suspensão e rescisão pelo Titular',
        p: [
          'Podemos suspender ou cancelar o acesso, com aviso quando possível, por falta de pagamento, descumprimento destes Termos, uso ilícito ou risco à segurança ou a outros usuários. Em casos graves ou urgentes, a suspensão pode ser imediata.',
        ],
      },
      {
        t: '26. Comunicações',
        p: [
          'Podemos nos comunicar pela Plataforma, pelo e-mail cadastrado ou por WhatsApp. Mantenha seus dados de contato atualizados. As comunicações eletrônicas têm plena validade entre as partes.',
        ],
      },
      {
        t: '27. Efeitos da rescisão e conservação de dados',
        p: [
          'Se a conta for bloqueada ou cancelada, conservaremos os dados da Empresa por até 90 dias para facilitar a reativação. Você pode pedir uma cópia dos seus dados nesse prazo. Passado o prazo, podemos eliminá-los ou anonimizá-los, salvo o que devamos conservar por obrigação legal (por exemplo, registros de pagamentos).',
          'Os backups podem persistir por um tempo adicional até sua rotação natural.',
        ],
      },
      {
        t: '28. Alterações destes Termos',
        p: [
          'Podemos atualizar estes Termos. Se a mudança for relevante, avisaremos na Plataforma e poderemos pedir que você aceite a nova versão para continuar usando. Se não concordar, pode cancelar antes de ela entrar em vigor. Usar a Plataforma depois implica aceitar as mudanças, na medida em que a lei permitir.',
        ],
      },
      {
        t: '29. Cessão, divisibilidade e acordo integral',
        p: [
          'A Empresa não pode ceder sua conta nem estes Termos sem nosso consentimento escrito. Podemos cedê-los em caso de reorganização, transferência do negócio ou por razões operacionais, com aviso.',
          'Se alguma cláusula for inválida, as demais continuam vigentes. Não exigir o cumprimento de um direito não implica renúncia. Estes Termos e a Política de Privacidade formam o acordo integral entre as partes sobre a Plataforma.',
          'Havendo diferenças entre as versões em diferentes idiomas, prevalece a versão em espanhol.',
        ],
      },
      {
        t: '30. Lei aplicável e foro',
        p: [
          `Estes Termos são regidos pelas leis de ${c.jurisdiccion}. Antes de iniciar ações judiciais, as partes tentarão resolver o conflito de boa-fé durante 30 dias.`,
          `Salvo norma imperativa em contrário (por exemplo, para consumidores), serão competentes os tribunais de ${c.foro}.`,
        ],
      },
      {
        t: '31. Relação comercial entre as partes',
        p: [
          'A Empresa contrata a Plataforma para fins comerciais ou profissionais próprios. Na máxima medida permitida pela lei, esta relação é entre empresários e não uma relação de consumo. Se uma norma imperativa considerar você consumidor, esses direitos irrenunciáveis continuam valendo.',
          'Entre o Titular e a Empresa (ou sua Equipe) não existe relação trabalhista, de sociedade, de representação, de agência nem de franquia. Cada parte age por sua conta e risco.',
        ],
      },
      {
        t: '32. Serviços e links de terceiros',
        p: [
          'A Plataforma depende de serviços de terceiros (por exemplo, Google Firebase para autenticação, banco de dados, arquivos e hospedagem; WhatsApp da Meta; Google Maps para abrir endereços; bancos e sistemas de pagamento como o Pix). Cada serviço tem seus próprios termos, preços e políticas, que a Empresa deve respeitar.',
          'Não controlamos esses serviços nem respondemos por suas falhas, mudanças, bloqueios de contas, custos, atrasos ou decisões, nem pelo conteúdo de sites vinculados.',
        ],
      },
      {
        t: '33. Pagamentos por engano, diferenças e devoluções',
        p: [
          'Se a Empresa pagar um valor diferente do vigente, o pagamento é creditado pelo período que cobrir ou será solicitada a diferença, a critério do Titular e conforme a taxa de câmbio e os custos efetivamente recebidos.',
          'Pagamentos em duplicidade ou feitos por engano são creditados em períodos futuros ou devolvidos pelo mesmo meio, descontados os custos bancários, salvo acordo escrito diferente. Não geram juros a favor da Empresa.',
          'Quem faz o pagamento é responsável por verificar que corresponde à conta indicada pela Plataforma. Um comprovante não é uma ativação: a conta é atualizada quando o Titular verifica o pagamento.',
        ],
      },
      {
        t: '34. Suporte',
        p: [
          'O suporte é prestado com o melhor esforço, pelo canal de WhatsApp que consta na Plataforma, em horário razoável e sem prazos de resposta garantidos. Não inclui suporte de dispositivos, redes, impressoras ou aplicativos de terceiros, nem o carregamento de dados por conta da Empresa, salvo acordo por escrito.',
        ],
      },
      {
        t: '35. Denúncias e remoção de conteúdo',
        p: [
          'Se você acredita que um conteúdo publicado em um catálogo infringe seus direitos ou a lei, avise-nos pelo canal de suporte com as informações necessárias para identificá-lo e avaliá-lo. Podemos remover ou ocultar conteúdo, ou suspender o catálogo, de forma preventiva e sem aviso prévio enquanto o caso é analisado.',
          'Isso não nos torna revisores dos conteúdos nem assumimos a obrigação de monitorá-los.',
        ],
      },
      {
        t: '36. Outros ramos, módulos e versões de teste',
        p: [
          'A Plataforma pode oferecer módulos para outros ramos (por exemplo, segurança privada, com dados de pessoal, turnos, rondas, incidentes, fotos ou localização). Esses módulos ou funções em teste podem ter condições adicionais, que serão informadas antes do uso, e são oferecidos sem garantia de continuidade.',
          'Cada Empresa é responsável por ter a base legal, o consentimento e as informações necessárias para tratar os dados de seu pessoal, de seus clientes e de terceiros que carregar em qualquer módulo.',
        ],
      },
      {
        t: '37. Aceite eletrônico e registro',
        p: [
          'O aceite destes documentos é feito por meios eletrônicos. Guardamos a versão aceita e a data e hora de cada aceite como comprovação. As partes reconhecem que os registros eletrônicos da Plataforma e as mensagens de WhatsApp ou e-mail são prova válida do que foi acordado e do que ocorreu, na medida permitida pelas normas sobre documento e assinatura eletrônica aplicáveis.',
        ],
      },
      {
        t: '38. Contato',
        p: [
          'Para dúvidas, solicitações sobre seus dados, avisos de cancelamento ou reclamações, escreva pelo WhatsApp de suporte que consta na seção de pagamento da Plataforma.',
        ],
      },
    ],
  },

  privacidad: {
    titulo: 'Política de Privacidade',
    intro: `Versão ${c.version}. Explica quais dados tratamos, para quê, com quem os compartilhamos e quais direitos você tem.`,
    secciones: [
      {
        t: '1. Controlador e alcance',
        p: [
          `O controlador dos dados de conta e de uso é ${c.titular} ("o Titular"). Esta política abrange os dados das pessoas que usam a Plataforma (proprietários, administradores e funcionários das Empresas) e das próprias Empresas.`,
          'Os dados de Clientes finais que uma Empresa registra são de responsabilidade dessa Empresa; o Titular os trata como operador, seguindo suas instruções (ver Termos, seção 10).',
        ],
      },
      {
        t: '2. Quais dados tratamos',
        p: [
          'Conta: nome, e-mail, senha (gerenciada pelo Firebase Authentication; não a vemos em texto claro), idioma, papel e data de aceitação destes documentos.',
          'Empresa: nome, país, moeda, fuso horário, WhatsApp, logo e cor, plano, status, vencimentos e registros de pagamentos (valor, data e meio). Não guardamos números de cartão nem senhas bancárias.',
          'Conteúdo registrado: produtos, preços, fotos, insumos, estoque, receitas, pedidos, zonas de entrega e clientes finais (nome, telefone, endereço e observações).',
          'Técnicos: dados de conexão e dispositivo gerados por nossos provedores (por exemplo, endereço IP, navegador, registros de segurança) e dados armazenados no seu dispositivo (ver seção 11).',
        ],
      },
      {
        t: '3. Para que usamos e com qual base legal',
        p: [
          'Para prestar o serviço contratado (execução do contrato): criar sua conta, exibir e guardar suas informações, enviar e-mails de confirmação e de troca de senha e permitir o catálogo público.',
          'Para cobrar e administrar assinaturas e para suporte (execução do contrato e legítimo interesse).',
          'Para segurança, prevenção de fraude e abuso e melhoria do serviço (legítimo interesse).',
          'Para cumprir obrigações legais, contábeis e tributárias e para defender direitos em uma reclamação.',
          'Não usamos seus dados para publicidade de terceiros nem os vendemos.',
        ],
      },
      {
        t: '4. Quem pode ver os dados',
        p: [
          'A Equipe de cada Empresa, conforme seu papel. Uma Empresa não pode ver os dados de outra.',
          'O Titular, em tarefas de administração, suporte, cobrança e segurança.',
          'O público, apenas o que a Empresa publica em seu catálogo (nome, logo, WhatsApp comercial, produtos, descrições, preços e fotos).',
        ],
      },
      {
        t: '5. Provedores',
        p: [
          'Usamos serviços do Google (Firebase Authentication, Cloud Firestore, Cloud Storage e Firebase Hosting) para autenticar, guardar dados e arquivos e publicar o aplicativo. O Google atua como provedor de infraestrutura e aplica suas próprias medidas de segurança e termos.',
          'Se você tocar em um botão de WhatsApp, o WhatsApp (Meta) abre com uma mensagem montada; esse serviço é regido por suas próprias políticas. Os pagamentos são feitos por transferência ou Pix pelo seu banco; não intervimos nessas plataformas.',
          'Não compartilhamos dados com outros terceiros, salvo obrigação legal, ordem de autoridade competente ou com seu consentimento.',
        ],
      },
      {
        t: '6. Transferências internacionais',
        p: [
          'Os servidores de nossos provedores podem estar fora do Brasil, Uruguai ou Argentina. Ao usar a Plataforma você aceita essa transferência, realizada com provedores que oferecem garantias contratuais e técnicas razoáveis de proteção, no âmbito da legislação aplicável.',
        ],
      },
      {
        t: '7. Por quanto tempo guardamos os dados',
        p: [
          'Enquanto sua conta estiver ativa. Se for bloqueada ou cancelada, por até 90 dias para facilitar a reativação; depois eliminamos ou anonimizamos os dados, salvo os que a lei nos obrigue a guardar (por exemplo, registros de pagamentos) pelo prazo cabível.',
          'Os backups podem persistir por um tempo adicional até sua rotação.',
        ],
      },
      {
        t: '8. Segurança',
        p: [
          'Aplicamos medidas técnicas e organizacionais razoáveis: autenticação com e-mail confirmado, regras de acesso por empresa e por papel, criptografia em trânsito e minimização dos dados públicos. Nenhum sistema é infalível; se ocorrer um incidente que afete seus dados, informaremos conforme a lei.',
        ],
      },
      {
        t: '9. Seus direitos',
        p: [
          'Você pode solicitar confirmação do tratamento, acesso, correção, atualização, anonimização, bloqueio ou eliminação, oposição, portabilidade e informação sobre compartilhamento, e revogar consentimentos dados.',
          'Para exercê-los, escreva pelo WhatsApp de suporte da Plataforma. Responderemos nos prazos legais.',
          'Se entender que seus direitos não foram respeitados, você pode reclamar à autoridade de controle: no Brasil, a Autoridade Nacional de Proteção de Dados (ANPD); no Uruguai, a Unidad Reguladora y de Control de Datos Personales (URCDP); na Argentina, a Agencia de Acceso a la Información Pública (AAIP), órgão de controle da Lei 25.326.',
        ],
      },
      {
        t: '10. Dados de Clientes finais',
        p: [
          'Se você é cliente de uma Empresa e quer exercer seus direitos sobre os dados que ela registrou (nome, telefone, endereço, observações), dirija-se primeiro a essa Empresa. O Titular a auxiliará no que lhe couber como operador.',
        ],
      },
      {
        t: '11. Armazenamento local e cookies',
        p: [
          'Não usamos cookies de publicidade nem de rastreamento de terceiros. A Plataforma guarda no seu dispositivo informações técnicas necessárias: a sessão, seu idioma e uma cópia local dos dados para trabalhar com conexão ruim (armazenamento local e IndexedDB). Se usar um dispositivo compartilhado, encerre a sessão.',
        ],
      },
      {
        t: '12. Menores',
        p: [
          'A Plataforma não é dirigida a menores de 18 anos. As Empresas não devem registrar dados de menores sem base legal e consentimento dos responsáveis quando cabível.',
        ],
      },
      {
        t: '13. Alterações desta política',
        p: [
          'Podemos atualizar esta política. Publicaremos a nova versão na Plataforma, com a data, e avisaremos se a mudança for relevante.',
        ],
      },
      {
        t: '14. Decisões automatizadas e registros',
        p: [
          'Não tomamos decisões com efeitos jurídicos sobre as pessoas baseadas unicamente em tratamento automatizado nem elaboramos perfis para fins publicitários. Os cálculos de custos, estoque e totais da Plataforma são ferramentas de apoio usadas pela Empresa.',
          'Guardamos a versão e a data em que você aceitou os Termos e esta Política, como comprovação do seu consentimento.',
        ],
      },
      {
        t: '15. Contato',
        p: ['Escreva pelo WhatsApp de suporte que consta na seção de pagamento da Plataforma.'],
      },
    ],
  },
});
