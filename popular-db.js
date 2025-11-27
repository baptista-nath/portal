// Script para adicionar notícias de exemplo ao banco de dados
const db = require('./src/database');

const noticiasExemplo = [
  {
    titulo: 'Inteligência Artificial revoluciona o mercado de trabalho',
    subtitulo: 'Novas tecnologias de IA transformam diversos setores da economia',
    conteudo: `A inteligência artificial está transformando radicalmente o mercado de trabalho global. Segundo especialistas, essa revolução tecnológica traz tanto oportunidades quanto desafios para trabalhadores e empresas.

Empresas de todos os setores estão adotando soluções de IA para automatizar processos, melhorar a eficiência e criar novos produtos e serviços. Desde chatbots de atendimento ao cliente até sistemas complexos de análise de dados, a IA está presente em praticamente todas as áreas.

No entanto, essa transformação também levanta questões importantes sobre o futuro do trabalho. Enquanto algumas funções podem ser automatizadas, novas oportunidades surgem em áreas como desenvolvimento de IA, ciência de dados e manutenção de sistemas inteligentes.

Especialistas recomendam que profissionais invistam em educação continuada e desenvolvam habilidades que complementem as capacidades da IA, como criatividade, pensamento crítico e inteligência emocional.`,
    imagem_url: 'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=800',
    video_url: '',
    autor: 'Maria Silva'
  },
  {
    titulo: 'Energias Renováveis batem recorde de investimentos em 2025',
    subtitulo: 'Setor solar e eólico lideram crescimento mundial',
    conteudo: `O setor de energias renováveis alcançou um marco histórico em 2025, com investimentos globais superando todas as expectativas. A energia solar e eólica foram as principais responsáveis por esse crescimento exponencial.

De acordo com relatórios internacionais, foram investidos mais de 500 bilhões de dólares em projetos de energia renovável ao redor do mundo. Esse valor representa um aumento de 35% em relação ao ano anterior.

O Brasil se destaca nesse cenário, sendo um dos líderes em geração de energia eólica e solar na América Latina. Novos parques eólicos estão sendo construídos no Nordeste, enquanto a energia solar ganha espaço em residências e empresas.

Especialistas apontam que essa tendência deve continuar nos próximos anos, impulsionada por políticas governamentais de incentivo e pela crescente conscientização ambiental da população.`,
    imagem_url: 'https://images.unsplash.com/photo-1509391366360-2e959784a276?w=800',
    video_url: '',
    autor: 'João Santos'
  },
  {
    titulo: 'Nova descoberta científica pode revolucionar tratamento de doenças',
    subtitulo: 'Pesquisadores identificam mecanismo celular crucial',
    conteudo: `Uma equipe internacional de cientistas anunciou uma descoberta revolucionária que pode mudar completamente o tratamento de diversas doenças crônicas e degenerativas.

A pesquisa, publicada em uma das revistas científicas mais prestigiadas do mundo, identificou um mecanismo celular até então desconhecido que desempenha papel fundamental na regeneração de tecidos.

Os pesquisadores descobriram que determinadas células possuem a capacidade de "reprogramar" outras células danificadas, restaurando suas funções normais. Essa descoberta abre portas para tratamentos inovadores de doenças como Alzheimer, Parkinson e lesões na medula espinhal.

Testes clínicos já estão sendo planejados e os resultados preliminares são extremamente promissores. A comunidade científica celebra essa descoberta como um dos maiores avanços da medicina nas últimas décadas.`,
    imagem_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=800',
    video_url: '',
    autor: 'Dra. Ana Paula Costa'
  },
  {
    titulo: 'Tecnologia 6G: O futuro da conectividade está chegando',
    subtitulo: 'Primeiros testes prometem velocidades 100 vezes superiores ao 5G',
    conteudo: `Enquanto o 5G ainda está sendo implementado em muitas regiões do mundo, cientistas e empresas de tecnologia já trabalham no desenvolvimento da próxima geração de redes móveis: o 6G.

Os primeiros testes realizados em laboratórios mostram resultados impressionantes, com velocidades de transmissão de dados que podem ser até 100 vezes superiores às do 5G atual. Isso significa downloads instantâneos de arquivos grandes e streaming de vídeo em qualidade ultra-alta sem qualquer atraso.

Além da velocidade, o 6G promete revolucionar áreas como realidade virtual, Internet das Coisas e computação na nuvem. Hologramas em tempo real, cirurgias remotas de alta precisão e cidades inteligentes completamente conectadas são apenas algumas das aplicações possíveis.

Especialistas estimam que a tecnologia 6G deve começar a ser comercializada a partir de 2030, transformando completamente a forma como nos conectamos e interagimos com o mundo digital.`,
    imagem_url: 'https://images.unsplash.com/photo-1558346490-a72e53ae2d4f?w=800',
    video_url: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
    autor: 'Carlos Eduardo Lima'
  },
  {
    titulo: 'Agricultura sustentável: tecnologias inovadoras aumentam produtividade',
    subtitulo: 'Drones, IoT e IA otimizam produção agrícola',
    conteudo: `A agricultura está passando por uma transformação digital sem precedentes. Tecnologias como drones, sensores IoT (Internet das Coisas) e inteligência artificial estão ajudando agricultores a aumentar a produtividade enquanto reduzem o impacto ambiental.

Drones equipados com câmeras especiais podem monitorar grandes áreas de plantação, identificando problemas como pragas, doenças e necessidade de irrigação com precisão cirúrgica. Isso permite que os agricultores tomem decisões mais informadas e apliquem recursos apenas onde é realmente necessário.

Sensores instalados no solo coletam dados em tempo real sobre umidade, nutrientes e outros fatores cruciais para o crescimento das plantas. Esses dados são analisados por sistemas de IA que recomendam ações específicas para otimizar a produção.

O resultado é uma agricultura mais eficiente, sustentável e lucrativa. Estudos mostram que fazendas que adotam essas tecnologias conseguem aumentar a produtividade em até 30% enquanto reduzem o uso de água e pesticidas.`,
    imagem_url: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?w=800',
    video_url: '',
    autor: 'Ricardo Almeida'
  },
  {
    titulo: 'Exploração espacial: missão à Marte avança para nova fase',
    subtitulo: 'Agências espaciais planejam colônia humana no planeta vermelho',
    conteudo: `As principais agências espaciais do mundo estão colaborando em um projeto ambicioso: estabelecer a primeira colônia humana permanente em Marte. A missão, que vem sendo planejada há anos, acaba de avançar para uma nova fase crucial.

Novos foguetes de última geração estão sendo desenvolvidos especificamente para transportar astronautas e equipamentos até o planeta vermelho. Essas naves espaciais são projetadas para viagens longas, com sistemas de suporte à vida que podem manter tripulações seguras durante os meses de viagem.

Simultaneamente, robôs e rovers estão sendo enviados a Marte para preparar o terreno. Essas máquinas autônomas estão mapeando recursos, testando tecnologias de produção de água e oxigênio, e construindo infraestrutura básica.

O objetivo é enviar a primeira missão tripulada até o final da década de 2030. Se bem-sucedida, essa será a maior conquista da humanidade desde a chegada à Lua, abrindo caminho para a expansão da presença humana no sistema solar.`,
    imagem_url: 'https://images.unsplash.com/photo-1614728894747-a83421e2b9c9?w=800',
    video_url: '',
    autor: 'Dra. Fernanda Rodrigues'
  }
];

async function popularBancoDeDados() {
  try {
    await db.init();
    console.log('🔄 Adicionando notícias de exemplo...\n');

    for (const noticia of noticiasExemplo) {
      const result = await db.createNoticia(noticia);
      console.log(`✅ Notícia criada: "${noticia.titulo}" (ID: ${result.id})`);
    }

    console.log('\n🎉 Todas as notícias de exemplo foram adicionadas com sucesso!');
    console.log('📊 Acesse http://localhost:3001 para ver o portal');
    console.log('⚙️  Acesse http://localhost:3001/admin/noticias para gerenciar as notícias');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao popular banco de dados:', error);
    process.exit(1);
  }
}

popularBancoDeDados();
