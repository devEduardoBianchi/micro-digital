# Micro Digital Dourados: proposta local

Landing page para apresentação ao proprietário. O site oficial e o domínio não foram alterados. Não há publicação, carrinho, pagamento, preços ou coleta de dados.

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
- `config.js`: WhatsApp, horário, dias e confirmação dos dias.
- `styles.css`: paleta, tipografia, espaçamento, versões móvel/desktop e tema escuro.
- `app.js`: geração das mensagens e interação do menu.
- `motion.js`: animações GSAP da entrada e das seções; respeita movimento reduzido.
- `assets/`: imagens WebP e fontes locais com suas licenças.
- `docs/DESIGN.md`: direção visual, decisões e skills aplicadas.
- `docs/FONTES.md`: fontes consultadas e conteúdo pendente.

Para confirmar dias de atendimento, preencha `days` em `config.js` e altere `daysConfirmed` para `true`. Atualize também o texto de fallback correspondente em `index.html`. O horário publicado é 08h às 18h; nenhum dia da semana foi presumido.

Cada link contém `data-wa` (tipo de mensagem) e, quando aplicável, `data-item` (assunto). Alterar o nome de uma categoria pede também atualizar `data-item`. O clique abre WhatsApp com a mensagem preenchida; nenhuma mensagem é enviada automaticamente.

## Conteúdo

Página principal com Início, Serviços, Produtos, Reparos de notebooks, Quem Somos, chamada para Blog e Contato. O Blog abre `blog.html`. A página separada apresenta quatro publicações de 2023, com resumos adaptados e acesso aos originais. Currículos usam o e-mail publicado pela empresa.

O menu é uma implementação nativa da ideia do Branched Menu do ReactBits. Ramificações surgem ligadas ao eixo, e o traço vermelho acompanha foco ou ponteiro. Selecionar uma opção fecha o menu e leva à seção. Escape fecha e restaura foco. Tab permanece dentro do diálogo. Setas, Home e End também funcionam. Movimento reduzido remove as transições.

As caixas de serviços e os resumos do Blog expandem suavemente com GSAP. Com movimento reduzido, conservam a abertura nativa imediata. A logo da área “Vamos conversar?” usa `assets/logo-contact-transparent.png`, com fundo alfa transparente.

## Identidade e imagens

Vermelho, prata e grafite preservam a identidade existente. Títulos Outfit e textos Manrope substituem a tipografia anterior. A skill brandkit orientou uma restauração digital da logo, mantendo nome, lettering, losango e disco. `assets/logo-original.png` preserva o arquivo recebido do site.

As fotografias foram geradas como ilustrações. Não representam instalações, funcionários, estoque ou modelos disponíveis da empresa. Sua aprovação faz parte da revisão do proprietário. Sete referências por seção foram geradas antes do código; podem conter textos de estudo, que não são a fonte final de dados.

## Validação realizada

- Destinos do menu, ida ao Blog e volta às seções testados em celular e desktop.
- 31 links de WhatsApp testados: número, mensagem, assunto, abertura em outra aba. Todos os destinos externos foram interceptados no teste, sem contato ou envio real.
- 12 categorias de produtos, cada uma com assunto próprio.
- Escape, restauração e contenção do foco, setas, Home/End e movimento reduzido.
- Última revisão: 320, 390, 768, 1366 e 1920 px, sem rolagem horizontal; capturas em `preview/*-update-*.png`.
- Abertura e fechamento dos serviços e resumos do Blog com mouse e teclado, inclusive com movimento reduzido.
- GSAP e ScrollTrigger locais, ativos com movimento normal e desativados com movimento reduzido.
- Imagem nova carregada sob demanda, sem corte dos equipamentos.
- Nenhum erro JavaScript ou resposta de recurso com erro nos testes atuais.

O teste atual está em `docs/check-update.cjs`. As evidências anteriores permanecem em `preview/` como histórico da primeira versão. Os scripts de validação usam Playwright apenas no ambiente de desenvolvimento.

## Revisão com o proprietário

1. Confirmar dias, eventuais intervalos e horários especiais.
2. Revisar categorias e escopo dos reparos, incluindo equipamentos Topdata citados no site.
3. Aprovar textos, tratamento da logo e fotografias ilustrativas; substituir por fotografias reais se desejar.
4. Revisar os resumos e orientações das publicações de 2023, especialmente o texto sobre baterias.

Uma eventual publicação futura depende de nova instrução. O protótipo contém `noindex, nofollow` para não ser tratado como site oficial.
