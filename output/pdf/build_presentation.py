from pathlib import Path
from PIL import Image
from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor, Color
from reportlab.lib.utils import ImageReader
from reportlab.platypus import Paragraph
from reportlab.lib.styles import ParagraphStyle

ROOT = Path(__file__).resolve().parents[2]
OUT = Path(__file__).resolve().parent
ASSETS = OUT / "assets"
PREVIEW = OUT / "preview"
PDF = OUT / "apresentacao-micro-digital-dourados.pdf"
W, H = 960, 540

DARK = HexColor("#202220")
DARK2 = HexColor("#2a2c29")
INK = HexColor("#262826")
MUTED = HexColor("#686d68")
PAPER = HexColor("#f5f4f1")
WHITE = HexColor("#ffffff")
RED = HexColor("#c81725")
CORAL = HexColor("#f2737e")
LINE = HexColor("#deded9")
SOFT = HexColor("#ecebe7")

BODY = ParagraphStyle("body", fontName="Helvetica", fontSize=11.3, leading=15.1,
                      textColor=INK, spaceAfter=0)
SMALL = ParagraphStyle("small", fontName="Helvetica", fontSize=9.2, leading=12.3,
                       textColor=MUTED, spaceAfter=0)
BODY_LIGHT = ParagraphStyle("body_light", fontName="Helvetica", fontSize=11.3,
                            leading=15.1, textColor=WHITE, spaceAfter=0)
SMALL_LIGHT = ParagraphStyle("small_light", fontName="Helvetica", fontSize=9.2,
                             leading=12.3, textColor=HexColor("#c5c8c3"), spaceAfter=0)

def crop(src, box, filename, max_size=(1800, 1400)):
    im = Image.open(src).convert("RGB").crop(box)
    im.thumbnail(max_size, Image.Resampling.LANCZOS)
    dest = ASSETS / filename
    im.save(dest, "JPEG", quality=89, optimize=True)
    return dest

def prepare_images():
    p = ROOT / "preview"
    crop(p / "home-update-1366.png", (0, 0, 1366, 760), "home-hero.jpg")
    crop(p / "blog-update-1366.png", (20, 430, 1346, 1810), "blog-cards.jpg")
    crop(p / "notebooks-update-1366.png", (0, 640, 1366, 2240), "notebook-services.jpg")
    crop(p / "services-detail.png", (0, 0, 1366, 1413), "services-accordion.jpg")
    crop(p / "produtos-desktop.png", (0, 0, 1366, 768), "product-categories.jpg")

def para(c, text, x, top, width, style=BODY):
    p = Paragraph(text, style)
    _, height = p.wrap(width, 1000)
    p.drawOn(c, x, top - height)
    return height

def bullet(c, text, x, top, width, dark=False, size=11.3, color=RED, gap=7):
    style = BODY_LIGHT if dark else BODY
    style = ParagraphStyle(
        "bullet_" + str(size) + ("d" if dark else "l"),
        parent=style, fontSize=size, leading=size * 1.34
    )
    c.setFillColor(color if not dark else CORAL)
    c.circle(x + 4, top - 7, 2.4, fill=1, stroke=0)
    h = para(c, text, x + 17, top, width - 18, style)
    return h + gap

def image_fit(c, path, x, y, width, height, background=None, border=True):
    if background:
        c.setFillColor(background)
        c.roundRect(x, y, width, height, 8, fill=1, stroke=0)
    im = Image.open(path)
    iw, ih = im.size
    scale = min(width / iw, height / ih)
    dw, dh = iw * scale, ih * scale
    dx, dy = x + (width - dw) / 2, y + (height - dh) / 2
    c.drawImage(ImageReader(im), dx, dy, dw, dh, mask="auto")
    if border:
        c.setStrokeColor(LINE)
        c.setLineWidth(0.7)
        c.roundRect(x, y, width, height, 8, fill=0, stroke=1)

def header(c, number, kicker, title, subtitle=None, dark=False):
    bg = DARK if dark else PAPER
    fg = WHITE if dark else INK
    substyle = SMALL_LIGHT if dark else SMALL
    c.setFillColor(bg)
    c.rect(0, 0, W, H, fill=1, stroke=0)
    c.setFillColor(CORAL if dark else RED)
    c.setFont("Helvetica-Bold", 8.8)
    c.drawString(56, 493, kicker.upper())
    para(c, title, 56, 475, 815,
         ParagraphStyle("h_title", fontName="Helvetica-Bold", fontSize=26,
                        leading=30, textColor=fg))
    if subtitle:
        para(c, subtitle, 57, 407, 820, substyle)
    return 390

def footer(c, page, dark=False):
    c.setStrokeColor(HexColor("#414440") if dark else LINE)
    c.setLineWidth(0.6)
    c.line(56, 31, 904, 31)
    c.setFillColor(HexColor("#bfc2bd") if dark else MUTED)
    c.setFont("Helvetica", 7.4)
    c.drawString(56, 17, "MICRO DIGITAL DOURADOS  |  PROPOSTA LOCAL")
    c.drawRightString(904, 17, f"{page:02d} / 10")

def panel(c, x, y, w, h, dark=False, accent=False):
    c.setFillColor(DARK2 if dark else WHITE)
    c.setStrokeColor(HexColor("#3d413d") if dark else LINE)
    c.setLineWidth(0.7)
    c.roundRect(x, y, w, h, 9, fill=1, stroke=1)
    if accent:
        c.setFillColor(RED if not dark else CORAL)
        c.roundRect(x, y + h - 5, w, 5, 2, fill=1, stroke=0)

def label(c, text, x, y, dark=False):
    c.setFillColor(CORAL if dark else RED)
    c.setFont("Helvetica-Bold", 8.3)
    c.drawString(x, y, text.upper())

def make_pdf():
    prepare_images()
    c = canvas.Canvas(str(PDF), pagesize=(W, H), pageCompression=1)
    c.setTitle("Proposta de presença digital | Micro Digital Dourados")
    c.setAuthor("Micro Digital Dourados | Protótipo local")

    # 1. Capa
    cover = ASSETS / "capa-conceitual.png"
    c.drawImage(ImageReader(Image.open(cover)), 0, 0, W, H, mask="auto")
    # A foto já traz uma área escura à esquerda para o título; sem overlay,
    # a bancada de manutenção permanece visível no restante da capa.
    c.setFillColor(WHITE)
    c.roundRect(56, 432, 120, 70, 8, fill=1, stroke=0)
    logo = ROOT / "assets" / "logo-navbar-transparent.png"
    image_fit(c, logo, 65, 440, 102, 52, background=WHITE, border=False)
    label(c, "Proposta de presença digital", 58, 391, dark=True)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 38)
    c.drawString(56, 326, "Micro Digital")
    c.drawString(56, 279, "Dourados")
    para(c, "Uma nova forma de apresentar produtos, assistência técnica e a história da loja.",
         58, 246, 395, BODY_LIGHT)
    c.setFillColor(CORAL)
    c.roundRect(58, 161, 178, 27, 13, fill=1, stroke=0)
    c.setFillColor(DARK)
    c.setFont("Helvetica-Bold", 9)
    c.drawCentredString(147, 171, "PROTÓTIPO LOCAL")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 11)
    c.drawString(58, 123, "Desde 1995")
    c.setFillColor(HexColor("#d8dad6"))
    c.setFont("Helvetica", 8.5)
    c.drawString(58, 39, "Material para avaliação do proprietário  |  Não publicado")
    c.showPage()

    # 2. Comparativo
    header(c, 2, "Visão geral", "Do site atual ao protótipo",
           "A proposta reúne os caminhos principais e mantém áreas próprias onde o conteúdo pede mais espaço.")
    panel(c, 56, 105, 405, 280, accent=False)
    panel(c, 499, 105, 405, 280, dark=True, accent=True)
    label(c, "Hoje, no site oficial", 78, 354)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(78, 325, "Conteúdo em páginas separadas")
    y = 296
    for t in [
        "Início, Produtos, Serviços, Quem Somos, Contato e LP-Notebooks têm páginas próprias.",
        "O visitante alterna entre páginas para conhecer as categorias e encontrar o atendimento.",
        "A página principal do Blog não apresenta a lista de artigos; quatro publicações têm links individuais."
    ]:
        y -= bullet(c, t, 78, y, 358, size=10.1, gap=9)
    label(c, "Na proposta local", 522, 354, dark=True)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 18)
    c.drawString(522, 325, "Uma página principal, dois destinos")
    y = 296
    for t in [
        "Início reúne apresentação, produtos, serviços, história, acesso ao Blog e contato.",
        "Blog e reparos de notebooks continuam em páginas próprias.",
        "Chamadas de produto e manutenção abrem o WhatsApp com o assunto preenchido."
    ]:
        y -= bullet(c, t, 522, y, 356, dark=True, size=10.1, gap=9)
    para(c, "Comparação baseada nas páginas públicas consultadas em 27/10/2026. "
            "Site oficial: microdigitaldourados.com.br.",
         58, 84, 820, SMALL)
    footer(c, 2)
    c.showPage()

    # 3. Página inicial
    header(c, 3, "Início", "Tecnologia perto. Solução de verdade.",
           "A primeira tela apresenta a empresa, o atendimento e o tempo de atuação em Dourados.")
    image_fit(c, ASSETS / "home-hero.jpg", 56, 91, 492, 302, background=WHITE)
    panel(c, 579, 105, 325, 286, dark=True, accent=True)
    label(c, "O primeiro contato", 603, 356, dark=True)
    y = 328
    for t in [
        "Boas-vindas à Micro Digital Informática.",
        "Destaque para a história iniciada em 1995.",
        "Atalho para conversar pelo WhatsApp e acesso direto aos serviços.",
        "A página continua com categorias, catálogo, Quem Somos e Contato."
    ]:
        y -= bullet(c, t, 603, y, 275, dark=True, size=10.4, gap=9)
    c.setFillColor(MUTED)
    c.setFont("Helvetica", 8)
    c.drawString(57, 75, "Imagem de manutenção ilustrativa. Pode ser substituída por fotografia aprovada pela loja.")
    footer(c, 3)
    c.showPage()

    # 4. Menu e conversas
    header(c, 4, "Navegação", "Um caminho visual para cada área",
           "O menu ramificado organiza sete destinos e indica a opção em foco.")
    panel(c, 56, 90, 410, 314)
    # Eixo e ramificações, desenho estático para explicar a animação implementada.
    c.setStrokeColor(RED)
    c.setLineWidth(2)
    c.line(111, 348, 111, 153)
    rows = [
        ("Início", 338), ("Serviços", 308), ("Produtos", 278),
        ("Blog / Dicas", 248), ("Quem Somos", 218), ("Contato", 188),
        ("LP-Notebooks / Reparos", 158)
    ]
    for i, (name, yy) in enumerate(rows):
        c.setStrokeColor(RED if i == 2 else LINE)
        c.setLineWidth(2 if i == 2 else 1)
        c.line(111, yy, 153, yy)
        c.setFillColor(RED if i == 2 else MUTED)
        c.circle(111, yy, 3 if i == 2 else 2, fill=1, stroke=0)
        c.setFillColor(RED if i == 2 else INK)
        c.setFont("Helvetica-Bold" if i == 2 else "Helvetica", 11)
        c.drawString(166, yy - 4, name)
    label(c, "Eixo + ramificações", 80, 117)
    panel(c, 499, 90, 405, 314, dark=True, accent=True)
    label(c, "Interação", 523, 369, dark=True)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(523, 341, "Menu por mouse e teclado")
    y = 318
    for t in [
        "O traço acompanha o foco e desenha o percurso até a opção selecionada.",
        "Escape fecha o menu; setas, Home e End ajudam a navegar.",
        "Foco visível, estado anunciado e movimento reduzido para quem prefere menos animação."
    ]:
        y -= bullet(c, t, 523, y, 355, dark=True, size=9.8, gap=8)
    c.setFillColor(CORAL)
    c.setFont("Helvetica-Bold", 10)
    c.drawString(523, 180, "WHATSAPP COM CONTEXTO")
    para(c, "Produtos e serviços abrem uma conversa com o assunto preenchido. "
            "A pessoa revisa a mensagem e decide se quer enviá-la.",
         523, 163, 344, SMALL_LIGHT)
    para(c, "Sem carrinho, checkout ou pagamento no protótipo.",
         523, 112, 344, SMALL_LIGHT)
    footer(c, 4, dark=False)
    c.showPage()

    # 5. Catálogo
    header(c, 5, "Produtos", "Um catálogo de consulta, ligado ao atendimento",
           "A página organiza as categorias da loja e mostra como cada interesse pode iniciar uma conversa.")
    # Quatro cartões com imagens ilustrativas, sem dados de preço ou estoque na apresentação.
    catalog_items = [
        ("Notebook", "catalog-notebook.webp"),
        ("Desktop", "catalog-desktop.webp"),
        ("Monitor", "catalog-monitor.webp"),
        ("Impressora", "catalog-printer.webp"),
    ]
    positions = [(56, 250), (253, 250), (56, 103), (253, 103)]
    for (title, filename), (x, y) in zip(catalog_items, positions):
        panel(c, x, y, 180, 130)
        image_fit(c, ROOT / "assets" / filename, x + 8, y + 34, 164, 86,
                  background=WHITE, border=False)
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(x + 10, y + 15, title)
    panel(c, 465, 103, 439, 277, dark=True, accent=True)
    label(c, "Categorias no protótipo", 489, 350, dark=True)
    cats_a = ["Desktops", "Notebooks", "Impressoras", "Monitores", "Estabilizadores", "Nobreaks"]
    cats_b = ["Acessórios", "Hoverboards", "Ponto facial", "Relógios de ponto", "Catracas eletrônicas", "Automação comercial"]
    for j, txt in enumerate(cats_a):
        bullet(c, txt, 489, 322 - j * 27, 180, dark=True, size=9.4, gap=0)
    for j, txt in enumerate(cats_b):
        bullet(c, txt, 690, 322 - j * 27, 190, dark=True, size=9.2, gap=0)
    c.setFillColor(CORAL)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(489, 142, "BUSCA  |  FILTRO  |  ORDENAÇÃO")
    para(c, "Cada chamada envia o nome do item ao WhatsApp para consultar modelos reais.",
         489, 127, 385, SMALL_LIGHT)
    c.setFillColor(SOFT)
    c.roundRect(56, 62, 848, 27, 6, fill=1, stroke=0)
    para(c, "Os quatro produtos exibidos no protótipo são exemplos. Modelos, especificações, preços e estoque precisam ser conferidos e substituídos antes da publicação.",
         68, 81, 823, SMALL)
    footer(c, 5)
    c.showPage()

    # 6. Serviços
    header(c, 6, "Serviços", "Atendimentos organizados por tipo de equipamento",
           "As descrições usam os serviços publicados pela loja e levam o visitante ao pedido de informações ou orçamento.")
    image_fit(c, ASSETS / "services-accordion.jpg", 56, 78, 420, 329, background=DARK)
    panel(c, 500, 82, 404, 323)
    label(c, "Serviços contemplados", 523, 372)
    groups = [
        ("Computadores e notebooks", "Limpeza, formatação, recuperação de dados, placas, BGA, telas, fontes e instalação."),
        ("Impressoras, monitores e nobreaks", "Reparos em diferentes tipos de impressora; telas, placas, fontes, cabos e baterias."),
        ("Catracas e relógios de ponto", "Conserto e troca de peças conforme o atendimento publicado pela loja."),
        ("Outros eletrônicos", "Hoverboards, tablets, teclados e órgãos eletrônicos, projetores e data show.")
    ]
    y = 344
    for title, desc in groups:
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 10)
        c.drawString(523, y, title)
        h = para(c, desc, 523, y - 8, 356, SMALL)
        y -= 24 + h
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 8.5)
    c.drawString(523, 104, "CADA GRUPO PODE ABRIR SUA DESCRIÇÃO E CONTATO")
    footer(c, 6)
    c.showPage()

    # 7. Página de notebooks
    header(c, 7, "LP-Notebooks", "Reparos de notebooks em uma página própria",
           "O destino aparece no menu e na chamada dentro dos serviços de computadores e notebooks.")
    repair_items = [
        ("Placa-mãe e BGA", "notebook-bga-640.webp", "Reparo de placas e troca de BGA."),
        ("Tela e estrutura", "notebook-screen-640.webp", "Troca de tela, dobradiças e carcaça."),
        ("Limpeza e dados", "notebook-clean-data-640.webp", "Limpeza, formatação e recuperação de arquivos."),
        ("HD para SSD", "notebook-ssd-640.webp", "Consulta de substituição compatível com o equipamento.")
    ]
    slots = [(56, 235), (493, 235), (56, 79), (493, 79)]
    for (title, filename, desc), (x, y) in zip(repair_items, slots):
        panel(c, x, y, 411, 139)
        image_fit(c, ROOT / "assets" / filename, x + 8, y + 8, 145, 123,
                  background=WHITE, border=False)
        c.setFillColor(RED)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(x + 165, y + 111, "REPAROS DE NOTEBOOK")
        c.setFillColor(INK)
        c.setFont("Helvetica-Bold", 13)
        c.drawString(x + 165, y + 84, title)
        para(c, desc, x + 165, y + 70, 225, SMALL)
        c.setFillColor(RED)
        c.setFont("Helvetica-Bold", 8.2)
        c.drawString(x + 165, y + 22, "PEDIR INFORMAÇÕES PELO WHATSAPP")
    footer(c, 7)
    c.showPage()

    # 8. Blog
    header(c, 8, "Blog", "Quatro publicações reunidas para leitura",
           "O protótipo cria uma página de artigos e liga cada cartão ao conteúdo original da empresa.")
    image_fit(c, ASSETS / "blog-cards.jpg", 56, 86, 440, 311, background=WHITE)
    panel(c, 522, 88, 382, 308, dark=True, accent=True)
    label(c, "Na página proposta", 545, 363, dark=True)
    posts = [
        "Como limpar a tela do seu notebook",
        "Utilize corretamente a bateria do notebook",
        "Como limpar o teclado do seu computador",
        "Como limpar a memória RAM e deixar o computador mais rápido"
    ]
    y = 332
    for i, title in enumerate(posts, start=1):
        c.setFillColor(CORAL)
        c.setFont("Helvetica-Bold", 8)
        c.drawString(545, y - 1, f"{i:02d}")
        h = para(c, title, 574, y + 3, 300,
                 ParagraphStyle("post", fontName="Helvetica-Bold", fontSize=10.4,
                                leading=13.2, textColor=WHITE))
        y -= h + 26
    para(c, "Os textos são de 2023. As orientações técnicas precisam ser revistas pelo proprietário, especialmente as dicas sobre bateria. O vídeo do artigo sobre memória RAM não é reproduzido nesta proposta.",
         545, 168, 324, SMALL_LIGHT)
    c.setFillColor(CORAL)
    c.setFont("Helvetica-Bold", 8.4)
    c.drawString(545, 108, "RESUMOS EXPANSÍVEIS  |  LINKS PARA OS ORIGINAIS")
    footer(c, 8)
    c.showPage()

    # 9. História e contato
    header(c, 9, "Quem somos e contato", "A história da loja e os canais de atendimento",
           "Informações publicadas pela Micro Digital, com os dias de atendimento marcados para confirmação.")
    panel(c, 56, 94, 375, 295, dark=True, accent=True)
    label(c, "Desde Dourados", 82, 349, dark=True)
    c.setFillColor(CORAL)
    c.setFont("Helvetica-Bold", 56)
    c.drawString(80, 271, "1995")
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 14)
    c.drawString(82, 236, "Montagem. Instalação. Assistência.")
    para(c, "A proposta resume a trajetória da empresa e sua atuação com equipamentos de informática, periféricos e eletrônicos.",
         82, 214, 310, SMALL_LIGHT)
    c.setStrokeColor(HexColor("#4b4e49"))
    c.line(82, 150, 397, 150)
    para(c, "Currículos: ronaldo.microdigital@gmail.com", 82, 132, 310, SMALL_LIGHT)
    panel(c, 460, 94, 444, 295)
    label(c, "Fale com a equipe", 485, 349)
    c.setFillColor(INK)
    c.setFont("Helvetica-Bold", 16)
    c.drawString(485, 320, "Micro Digital Informática")
    para(c, "Avenida Marcelino Pires, 1096<br/>Dourados, MS  |  CEP 79801-001",
         485, 297, 380, BODY)
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(485, 242, "TELEFONE")
    c.setFillColor(INK)
    c.setFont("Helvetica", 11)
    c.drawString(485, 224, "(67) 3422-2472")
    c.drawString(485, 205, "(67) 99253-7517  |  WhatsApp")
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(485, 176, "E-MAIL")
    c.setFillColor(INK)
    c.setFont("Helvetica", 10.4)
    c.drawString(485, 158, "ronaldo.microdigital@gmail.com")
    c.setFillColor(RED)
    c.setFont("Helvetica-Bold", 9)
    c.drawString(485, 126, "HORÁRIO INFORMADO")
    c.setFillColor(INK)
    c.setFont("Helvetica", 10)
    c.drawString(485, 109, "08h às 18h. Dias da semana a confirmar.")
    footer(c, 9)
    c.showPage()

    # 10. Revisão e status
    header(c, 10, "Para avaliação", "Pontos para revisar antes de qualquer publicação",
           "A apresentação mostra o protótipo atual. A decisão sobre o conteúdo final fica com a empresa.")
    panel(c, 56, 85, 548, 319)
    checklist = [
        "Confirmar dias da semana, horário e eventuais exceções.",
        "Revisar categorias, descrições dos serviços e termos usados pela equipe.",
        "Escolher modelos reais e substituir nomes, imagens, especificações, preços e estoque demonstrativos.",
        "Validar os quatro textos do Blog, com atenção às recomendações técnicas publicadas em 2023.",
        "Aprovar a apresentação da logo e as imagens ilustrativas, ou enviar fotos reais da loja e dos serviços."
    ]
    y = 367
    for t in checklist:
        y -= bullet(c, t, 80, y, 500, size=10.2, gap=10)
    panel(c, 630, 85, 274, 319, dark=True, accent=True)
    label(c, "Status desta proposta", 653, 368, dark=True)
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 17)
    c.drawString(653, 338, "Protótipo local")
    status_lines = [
        "Site oficial e domínio sem alterações.",
        "Sem compra, checkout ou pagamento.",
        "WhatsApp abre com mensagem preenchida; o usuário decide enviar.",
        "Conteúdo preparado para telas móveis e desktop.",
        "Avaliações do Google ficaram fora desta versão e podem ser discutidas depois."
    ]
    y = 309
    for t in status_lines:
        y -= bullet(c, t, 653, y, 226, dark=True, size=9.3, gap=8)
    c.setFillColor(SOFT)
    c.roundRect(56, 52, 848, 22, 5, fill=1, stroke=0)
    para(c, "Esta proposta serve para revisar apresentação, navegação e conteúdo antes de decidir os próximos passos.",
         68, 68, 823, SMALL)
    footer(c, 10)
    c.save()
    print(PDF)

if __name__ == "__main__":
    make_pdf()

