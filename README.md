# Micro Digital Dourados: proposta local

Landing page para apresentação ao proprietário. O site oficial e o domínio não foram alterados. Não há publicação, carrinho, pagamento ou coleta de dados. O catálogo contém quatro modelos fictícios, com preços, estoque e especificações demonstrativos claramente identificados.

## Abrir

Abra `index.html` no navegador. Os arquivos são estáticos e não exigem instalação de pacotes.

Para uma prévia por servidor local, abra um terminal nesta pasta e execute:

```powershell
python -m http.server 4174 --bind 127.0.0.1
```

Depois abra http://127.0.0.1:4174. Se já estiver funcionando, use a prévia existente. O servidor só atende neste computador.

`docs/apresentacao.html` apresenta a direção visual e os pontos de aprovação. `preview/apresentacao.png` é a prancha visual pronta para compartilhar. O ZIP inclui o protótipo e a apresentação; as referências de geração ficam separadas na pasta `design`.

## Alterar

- `index.html`: textos, categorias, serviços, contatos e seções da página principal.
- `blog.html`: quatro publicações em cartões, resumos e links para os textos originais.
- `lp-notebooks.html`: apresentação dos reparos de notebooks, com uma imagem por categoria e chamadas ao WhatsApp.
- `config.js`: WhatsApp, horário, dias e confirmação dos dias.
- `styles.css`: paleta, tipografia, espaçamento, versões móvel/desktop e tema escuro.
- `app.js`: mensagens de WhatsApp, navegação direta, catálogo e controles da faixa de serviços.
- `motion.js`: animações GSAP da entrada e das seções; respeita movimento reduzido.
- `interactions.js`: luz sutil nos cartões do catálogo e reflexo nos botões, inspirados no ReactBits. Ativos apenas com ponteiro preciso e movimento permitido; sem novas dependências.
- `assets/`: imagens WebP, ilustrações conceituais do catálogo e fontes locais com suas licenças.
- `docs/DESIGN.md`: direção visual, decisões e skills aplicadas.
- `docs/FONTES.md`: fontes consultadas e conteúdo pendente.

Para confirmar dias de atendimento, preencha `days` em `config.js` e altere `daysConfirmed` para `true`. Atualize também o texto de fallback correspondente em `index.html`. O horário publicado é 08h às 18h; nenhum dia da semana foi presumido.

Cada link contém `data-wa` (tipo de mensagem) e, quando aplicável, `data-item` (assunto). Alterar o nome de uma categoria pede também atualizar `data-item`. O clique abre WhatsApp com a mensagem preenchida; nenhuma mensagem é enviada automaticamente.

## Conteúdo

Página principal com Início, Serviços, Produtos, Quem Somos, chamada para Blog e Contato. O Blog abre `blog.html`; os reparos de notebooks ficam em `lp-notebooks.html`. A página do Blog apresenta quatro publicações de 2023, com resumos adaptados e acesso aos originais. Currículos usam o e-mail publicado pela empresa.

A navbar mostra a logo à esquerda, os sete destinos no centro e o WhatsApp à direita. Blog e LP-Notebooks abrem páginas próprias; os demais links levam às seções. Em celulares, os links aparecem em duas linhas, sem menu oculto. O item atual recebe sublinhado e o foco do teclado permanece visível.

A seção de serviços começa com uma faixa contínua de 21 áreas de atuação e ícones SVG locais. Há pausa por botão e ao passar o mouse. A animação para fora da tela ou com a página em segundo plano. Com movimento reduzido, a faixa vira uma lista estática. Três chamadas destacam reparo de placas, limpeza e formatação e recuperação de dados, com mensagens específicas de WhatsApp.

Os campos Buscar produto, Categoria e Ordenar por recebem destaque de foco. As opções dos seletores continuam nativas do navegador. Ao alterar os resultados, os cartões entram com opacidade e deslocamento breves; ao ordenar, deslizam para as novas posições. As animações usam a API nativa do navegador, duram cerca de 300 ms e são canceladas antes da próxima alteração, sem atrasar a busca. A contagem de resultados mantém o anúncio para leitores de tela. Movimento reduzido aplica as mudanças imediatamente. Não há nova dependência.

A hero usa uma entrada de palavras com desfoque breve, adaptada do Blur Reveal do Spell para o GSAP já instalado. O desfoque termina após a entrada e não reaparece ao rolar. Movimento reduzido mantém o texto visível sem efeito. No desktop, o título da hero foi ampliado em cerca de 20 px; os títulos das seções, em 30 px, e os parágrafos de abertura, em 5 px. A escala diminui em telas estreitas para evitar cortes.

As caixas de serviços e os resumos do Blog expandem suavemente com GSAP. Com movimento reduzido, conservam a abertura nativa imediata. A logo da área “Vamos conversar?” usa `assets/logo-contact-transparent.png`, com fundo alfa transparente.

## Identidade e imagens

Vermelho e prata preservam a identidade da marca. A composição usa azul-grafite mais escuro (#101620 e #0c121b), cartões #18202d e bordas discretas. O Homstech orientou a organização e o ritmo; a Micro Digital usa vermelho nos destaques e fundos mais profundos que os da referência. Os fundos de serviços, produtos, história e contato recebem gradientes vermelhos estáticos. A paleta escura é consistente entre as páginas e não depende do tema do sistema. Títulos Outfit e textos Manrope substituem a tipografia anterior. A skill brandkit orientou uma restauração digital da logo, mantendo nome, lettering, losango e disco. `assets/logo-original.png` preserva o arquivo recebido do site.

As imagens de equipamentos são ilustrações conceituais, sem marcas ou modelos reais. Não representam instalações, funcionários ou estoque da empresa. As quatro imagens do catálogo são ilustrações individuais, carregadas sob demanda e otimizadas em WebP. Sua aprovação faz parte da revisão do proprietário. Sete referências por seção foram geradas antes do código; podem conter textos de estudo, que não são a fonte final de dados.

## Validação realizada

- Destinos do menu, ida ao Blog e à página LP-Notebooks e volta às seções testados em celular e desktop.
- Quatro imagens de reparo, quatro mensagens de WhatsApp contextualizadas e ausência de rolagem horizontal na LP-Notebooks.
- 31 links de WhatsApp testados: número, mensagem, assunto, abertura em outra aba. Todos os destinos externos foram interceptados no teste, sem contato ou envio real.
- 12 categorias de produtos, cada uma com assunto próprio.
- Navbar com sete destinos visíveis, foco por teclado e navegação entre páginas e seções em cinco larguras.
- Última revisão: 320, 390, 768, 1366 e 1920 px, sem rolagem horizontal. Capturas em `preview/*-update-*.png` e `preview/redesign-final-*.png`. A revisão anterior em cinza neutro está em `preview/graphite-*.png`.
- Abertura e fechamento dos serviços e resumos do Blog com mouse e teclado, inclusive com movimento reduzido.
- GSAP e ScrollTrigger locais, ativos com movimento normal e desativados com movimento reduzido.
- Quatro ilustrações do catálogo carregadas sob demanda, sem corte dos equipamentos.
- Nenhum erro JavaScript ou resposta de recurso com erro nos testes atuais.

O teste atual está em `docs/check-update.cjs`, executado com `node docs/check-update.cjs` no ambiente de desenvolvimento. Ele abre os arquivos locais no Chrome; a variável `MICRO_PREVIEW_URL` permite usar um servidor local. A revisão inclui a pausa do marquee, sua adaptação a movimento reduzido, a limpeza do desfoque e a visibilidade do footer em telas altas. As evidências anteriores permanecem em `preview/` como histórico das versões. A apresentação em PDF é um registro da versão anterior e deve ser atualizada antes de uma nova entrega ao proprietário. Os scripts de validação usam Playwright apenas no ambiente de desenvolvimento.

Os efeitos de luz são conferidos por `docs/check-pointer-effects.cjs`: botões nas três páginas, movimento do ponteiro, foco de teclado, filtro de catálogo, remoção e reinstalação das camadas ao mudar a preferência de movimento e ausência de rolagem horizontal em 320, 390, 768 e 1920 px. Capturas em `preview/catalog-pointer-effects-*.png`.

## Revisão com o proprietário

1. Confirmar dias, eventuais intervalos e horários especiais.
2. Revisar categorias e escopo dos reparos, incluindo equipamentos Topdata citados no site.
3. Aprovar textos, tratamento da logo e fotografias ilustrativas; substituir por fotografias reais se desejar.
4. Revisar os resumos e orientações das publicações de 2023, especialmente o texto sobre baterias.
5. Substituir os quatro modelos demonstrativos por produtos, preços, estoque e especificações confirmados antes de qualquer publicação.

Uma eventual publicação futura depende de nova instrução. O protótipo contém `noindex, nofollow` para não ser tratado como site oficial.
