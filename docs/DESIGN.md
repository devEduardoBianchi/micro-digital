# Micro Digital: proximidade precisa

## Contrato da proposta
Protótipo local para apresentar os produtos e a assistência técnica da Micro Digital Dourados. Página principal e blog separado, sem venda, preços, formulários, rastreadores ou publicação. A ação principal é iniciar uma conversa com contexto no WhatsApp.

Não foi encontrado projeto existente desta empresa. Os projetos loja-tech e nexo-desk são independentes. A implementação usa HTML, CSS e JavaScript nativos, sem build. GSAP Core e ScrollTrigger 3.15 foram adicionados localmente a pedido do usuário, sem outra dependência. A avaliação da skill shadcn concluiu que instalar React, Tailwind e primitives não se justifica. O menu recria a ideia do Branched Menu, não o código nem a página do ReactBits.

## Filosofia visual: proximidade precisa
Superfícies claras e campos abertos tornam a tecnologia acessível. A composição é cuidadosamente construída para oferecer caminhos de leitura previsíveis, com variação suficiente para distinguir produtos, reparos e história.

O vermelho vem da marca existente. Cinza-prata, grafite e branco suave ampliam seu contraste. O losango da logo reaparece uma única vez na história, com atenção minuciosa à escala e ao equilíbrio, como lembrança discreta da identidade.

A tipografia Outfit tem curvas acolhedoras e títulos compactos. Manrope sustenta a leitura. A execução prioriza ritmo e alinhamento: textos reais, espaços deliberados e controles confortáveis, sem ornamentação que concorra com o atendimento.

Fotografias ilustrativas mostram equipamentos e manutenção. Não representam funcionários, instalações ou estoque reais. O cuidado artesanal está na seleção dos enquadramentos e na economia dos elementos, não na quantidade de efeitos.

O movimento comunica estado. O eixo do menu e suas ramificações tornam a navegação visível; a opção ativa desenha um caminho. Não há animações contínuas. A precisão final exige revisão visual, teclado, telas estreitas e conteúdo verificável.

Na revisão, os serviços e os reparos de notebook receberam linhas finas e luz difusa. A forma atrás de “1995” foi ajustada para um losango quadrado, referência discreta à marca. A hero usa gradiente horizontal contínuo na lateral esquerda; sua borda inferior mantém a composição anterior. Os painéis de serviços expandem com GSAP quando há movimento permitido e usam o comportamento nativo com movimento reduzido.

A marca na área de contato foi refeita em PNG com transparência alfa. O cartão claro foi removido. Os resumos do Blog usam a mesma expansão dos serviços.

## Leitura das referências geradas
- Início: título em duas linhas, vermelho pontual, composição aberta sobre fotografia à direita, botões abaixo. O telefone inventado pela imagem não é usado. Header real limitado a 80px.
- Serviços: conteúdo expansível à esquerda, macro de manutenção à direita. Cinco grupos, descrições completas dentro deles. O texto cresce livremente, sem alturas fixas.
- Produtos: quatro famílias em grade 2x2 sem células vazias, links individuais. Fotografia contextual separada da lista para evitar falsas associações de modelos.
- Notebooks: imagem à esquerda e texto à direita, quatro grupos de reparos. Reescrita factual de qualquer promessa gerada.
- Quem somos: 1995 como prova documental, losango discreto e história curta. Não importar afirmações sobre prêmios, cobertura ou representação comercial.
- Blog: seção compacta na home, com entrada para página separada. Quatro cartões reúnem publicações de 2023, com resumos adaptados e links originais.
- Contato: contatos reais em colunas, logo ampliada, horário com confirmação pendente e currículo por e-mail. Sem mapa inventado.

## Regras de implementação
DESIGN_VARIANCE 6, MOTION_INTENSITY 3 (menu pontualmente 5), VISUAL_DENSITY 4. Paleta clara com variante escura por preferência do sistema. Vermelho acessível #c81725 para botões claros. Raio 8px em controles e imagens. Navbar com 50px nas laterais desktop; conteúdo da hero centralizado no contêiner. GSAP anima entrada e revelação das seções em transform/opacity, sem movimento contínuo. O processo de brainstorming aproveita o briefing detalhado como autorização para produzir a versão revisável.

Teclado: botão com aria-expanded/aria-controls, dialog nativo com título, Escape, foco contido e restaurado, destinos focáveis. Preferência por movimento reduzido elimina transições. Eixo e traços decorativos não entram na árvore de acessibilidade. Se JavaScript estiver indisponível, links principais continuam no rodapé e o contato geral segue funcional.

Mobile: layouts viram uma coluna, imagens com proporção reservada, navegação cabe em viewport com rolagem interna. Links com alvo mínimo de 44px. Imagens WebP com srcset, hero prioritário e demais lazy. Fontes locais. Nenhuma transmissão automática de dados.

## Skills aplicadas
anti-ui-slop, design-taste-frontend, ui-ux-pro-max: direção, estados e inspeção. image-to-code e imagegen-frontend-web: sete imagens independentes antes do código. brandkit: restauração digital conservadora da logo. canvas-design: filosofia e prancha PNG de apresentação. gpt-taste: variedade e proporção, subordinadas ao conteúdo real e desempenho. shadcn: avaliação de compatibilidade, sem instalação desnecessária. everyday-security: links explícitos, sem coleta, scripts externos ou segredos. caveman: apenas comunicação no chat.

Geração: ferramenta image_gen integrada. Referências em design/01-inicio.png até 07-contato.png. Fotos originais geradas em design/*-source.png. Prompt comum: loja local de informática brasileira, vermelho/prata/grafite, títulos Outfit, sem preços, marcas, estoques ou alegações inventadas. Logo: restaurar bordas mantendo lettering Micro, DIGITAL, INFORMÁTICA, losango e disco. Os arquivos da pasta design são referências internas; a página não carrega essas pranchas.
