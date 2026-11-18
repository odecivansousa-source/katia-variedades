// Kátia Variedades - Catálogo & Configuração Oficial da Loja
// Dados reais extraídos dos materiais, fachada, endereço e Instagram (@katia._variedades)

export const FALLBACK_IMAGE = `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="800" viewBox="0 0 600 800">
  <rect width="600" height="800" fill="#1C1B1A"/>
  <rect x="24" y="24" width="552" height="752" fill="none" stroke="#383330" stroke-width="1.5"/>
  <g transform="translate(300, 360)" text-anchor="middle">
    <circle cx="0" cy="-25" r="32" fill="none" stroke="#C6A15B" stroke-width="1.5"/>
    <text y="-16" font-family="Cormorant Garamond, Georgia, serif" font-size="28" font-style="italic" fill="#E5D4AF">K</text>
    <text y="50" font-family="Cormorant Garamond, serif" font-size="26" letter-spacing="4" fill="#F5F2ED">KÁTIA</text>
    <text y="78" font-family="Plus Jakarta Sans, sans-serif" font-size="12" letter-spacing="3" fill="#C6A15B">VARIEDADES</text>
    <text y="115" font-family="Plus Jakarta Sans, sans-serif" font-size="10" letter-spacing="2" fill="#A9A29A">PRODUTO EM EXIBIÇÃO</text>
  </g>
</svg>
`)}`;

export const STORE_CONFIG = {
  name: "KÁTIA VARIEDADES",
  brandName: "Kátia",
  tagline: "Moda Feminina, Masculina, Lingerie & Juvenil",
  slogan: "Estilo, conforto e as melhores marcas para você e sua família.",
  whatsappNumber: "5584988416094", // WhatsApp Real da Loja
  whatsappDisplay: "(84) 98841-6094",
  instagramHandle: "@katia._variedades",
  instagramUrl: "https://instagram.com/katia._variedades",
  heroBannerImage: "images/fachada-katia.jpg", // Foto de capa padrão da loja (Fachada Real)
  logoImage: "images/logo-katia.jpg",
  address: {
    street: "R. Tabelião Aoem Menescal, 64",
    neighborhood: "Santo Antônio",
    city: "Mossoró",
    state: "RN",
    cep: "59621-647",
    full: "Rua Tabelião Aoem Menescal, 64 - Santo Antônio, Mossoró - RN, 59621-647"
  },
  openingHours: {
    weekdays: "Seg a Sex: 08:00 às 12:00 e 14:30 às 18:30",
    saturday: "Sábados: 08:00 às 13:00",
    sunday: "Domingos: Fechado"
  },
  paymentMethods: ["PIX", "Cartão de Crédito e Débito", "Dinheiro"],
  deliveryInfo: "Entregas rápidas em Mossoró e região sob consulta.",
  currency: "R$",
  categories: [
    { id: "todos", name: "Todas as Peças", icon: "sparkles" },
    { id: "destaques", name: "Destaques & Novidades", icon: "flame" },
    { id: "feminino", name: "Moda Feminina", icon: "shirt" },
    { id: "moda-intima", name: "Moda Íntima", icon: "heart" },
    { id: "masculino", name: "Moda Masculina", icon: "user" },
    { id: "infantil", name: "Infantil", icon: "baby" },
    { id: "juvenil", name: "Juvenil", icon: "smile" },
    { id: "cama-mesa-banho", name: "Cama, Mesa e Banho", icon: "home" },
    { id: "praia-uv", name: "Moda Praia & UV", icon: "sun" }
  ]
};

// Catálogo com os produtos e marcas reais da Kátia Variedades
export const PRODUCTS = [
  {
    id: "katia-01",
    name: "Conjunto Alfaiataria Cropped & Bermuda Chocolate",
    category: "feminino",
    price: 189.90,
    originalPrice: 229.90,
    isNew: true,
    isFeatured: true,
    badge: "Destaque",
    description: "Conjunto sofisticado em alfaiataria contemporânea na elegante cor marrom chocolate. Cropped de alças largas estruturadas com bermuda de cintura alta, passantes e bolsos faca. Tecido encorpado que não amassa.",
    composition: "Alfaiataria Premium com Elastano",
    image: "images/feed-moda-feminina.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: [
      { name: "Chocolate Intenso", hex: "#4A3324" },
      { name: "Preto Clássico", hex: "#141416" },
      { name: "Off White", hex: "#EBE6DD" }
    ]
  },
  {
    id: "katia-02",
    name: "Bermuda Jeans Feminina Ciclista Utilitária",
    category: "feminino",
    price: 139.90,
    originalPrice: null,
    isNew: true,
    isFeatured: true,
    badge: "Tendência",
    description: "Bermuda jeans com modelagem ciclista alongada e cintura alta que modela o corpo. Bolsos cargo laterais utilitários e lavagem média estonada. Combina perfeitamente com camisas sociais ou t-shirts casuais.",
    composition: "100% Jeans Algodão Macio",
    image: "images/bermuda-jeans-feminina.jpg",
    sizes: ["38", "40", "42", "44"],
    colors: [
      { name: "Jeans Médio Estonado", hex: "#2C4362" },
      { name: "Jeans Escuro Profundo", hex: "#1B2A3D" }
    ]
  },
  {
    id: "katia-03",
    name: "Blusa Térmica Manga Longa Proteção UV Diamantes Beach",
    category: "praia-uv",
    price: 129.90,
    originalPrice: null,
    isNew: true,
    isFeatured: true,
    badge: "Diamantes UV",
    description: "Original Diamantes Beachwear (Ref: 8004234). Blusa com tecnologia de proteção UV FPU 50+ contra raios solares. Gola alta e mangas longas anatômicas. Confeccionada em tecido de toque gelado ultra confortável para curtir a praia ou caminhadas com proteção máxima.",
    composition: "Poliamida com Fios UV e Elastano",
    image: "images/blusa-uv-diamantes.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: [
      { name: "Preto Noir Diamantes", hex: "#141416" },
      { name: "Azul Marinho", hex: "#1A2536" },
      { name: "Branco Pérola", hex: "#F5F2ED" }
    ]
  },
  {
    id: "katia-04",
    name: "Conjunto Lingerie Renda Sofisticada Diamantes",
    category: "moda-intima",
    price: 149.90,
    originalPrice: 179.90,
    isNew: true,
    isFeatured: true,
    badge: "Diamantes Lingerie",
    description: "Sutiã com bojo anatômico estruturado em renda francesa guipir e calcinha fio duplo rendada. Toque aveludado, alças reguláveis banhadas e excelente sustentação para o dia a dia e ocasiões especiais.",
    composition: "Renda Nobre e Microfibra de Poliamida",
    image: "images/feed-moda-feminina.jpg",
    sizes: ["P (40)", "M (42)", "G (44)", "GG (46)"],
    colors: [
      { name: "Bordô Nobre / Vinho", hex: "#631A26" },
      { name: "Preto Absoluto", hex: "#111214" },
      { name: "Nude Aveludado", hex: "#D4B69B" }
    ]
  },
  {
    id: "katia-05",
    name: "Conjunto Lingerie Sustentação Conforto Plus Size",
    category: "moda-intima",
    price: 159.90,
    originalPrice: null,
    isNew: false,
    isFeatured: true,
    badge: "Linha Conforto",
    description: "Projetado para garantir sustentação sem machucar os ombros. Laterais largas redutoras, fecho reforçado com quatro níveis de regulagem e bojo ultra macio. Calcinha alta anatômica com cós duplo.",
    composition: "Microfibra Soft Compressiva e Forro 100% Algodão",
    image: "images/feed-moda-feminina.jpg",
    sizes: ["46", "48", "50", "52"],
    colors: [
      { name: "Nude Bege Dourado", hex: "#D6BFAB" },
      { name: "Preto Clássico", hex: "#161618" },
      { name: "Chocolate Canela", hex: "#7E523A" }
    ]
  },
  {
    id: "katia-06",
    name: "Camisa Polo Masculina Piquet Clássica Kactus",
    category: "masculino",
    price: 119.90,
    originalPrice: 139.90,
    isNew: true,
    isFeatured: true,
    badge: "Kactus Oficial",
    description: "Camisa gola canelada estruturada confeccionada em piquet encorpado e respirável. Caimento impecável no peitoral e braços. Botões gravados e fenda lateral sutil. O clássico indispensável para o homem moderno.",
    composition: "Algodão Piquet Nobre e Elastano",
    image: "images/feed-moda-feminina.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: [
      { name: "Caramelo Dourado", hex: "#A87C52" },
      { name: "Preto Clássico", hex: "#141416" },
      { name: "Branco Neve", hex: "#F8F8FA" },
      { name: "Azul Turquesa Verão", hex: "#2B879E" }
    ]
  },
  {
    id: "katia-07",
    name: "Conjunto Infantil Dry Fit Esportivo",
    category: "infantil",
    price: 89.90,
    originalPrice: 109.90,
    isNew: true,
    isFeatured: false,
    badge: "Infantil",
    description: "Conjunto camiseta e bermuda esportiva em malha tecnológica dry fit leve e respirável com faixas contrastantes. Ideal para esportes, passeios e momentos de lazer com máxima liberdade.",
    composition: "100% Poliéster Dry Fit",
    image: "images/feed-moda-masculina.jpg",
    sizes: ["4", "6", "8", "10", "12"],
    colors: [
      { name: "Preto com Branco", hex: "#1A1A1A" },
      { name: "Vermelho Esportivo", hex: "#B92525" },
      { name: "Branco com Marinho", hex: "#E8E8EE" }
    ]
  },
  {
    id: "katia-08",
    name: "Bermuda Jeans Juvenil Destroyed Estonada",
    category: "juvenil",
    price: 99.90,
    originalPrice: null,
    isNew: true,
    isFeatured: true,
    badge: "Juvenil",
    description: "Jeans marmorizado com lavagem estonada cinza grafite e detalhes rasgados destroyed modernos. Elástico de ajuste interno na cintura e acabamento reforçado. Muito estilo para meninos e jovens.",
    composition: "Jeans Algodão com Elastano",
    image: "images/bermuda-jeans-juvenil.jpg",
    sizes: ["10 anos", "12 anos", "14 anos", "16 anos"],
    colors: [
      { name: "Jeans Marmorizado Cinza", hex: "#5C5D61" },
      { name: "Jeans Preto Desbotado", hex: "#2B2B2C" }
    ]
  },
  {
    id: "katia-09",
    name: "Conjunto Juvenil Masculino Camiseta & Bermuda Cargo",
    category: "juvenil",
    price: 119.90,
    originalPrice: 139.90,
    isNew: true,
    isFeatured: true,
    badge: "Coleção Garotos",
    description: "Look completo com bermuda cargo utilitária com fitas de ajuste e camiseta básica penteada com caimento perfeito. Conforto total para o dia a dia e passeios com os amigos.",
    composition: "Bermuda Sarja Leve e Camiseta 100% Algodão",
    image: "images/conjunto-cargo-juvenil.jpg",
    sizes: ["10", "12", "14", "16"],
    colors: [
      { name: "Bermuda Bege & T-shirt Marinho", hex: "#B8A082" },
      { name: "Bermuda Preta & T-shirt Vermelha", hex: "#1C1C1E" },
      { name: "Bermuda Off White & T-shirt Preta", hex: "#EAE7DF" }
    ]
  },
  {
    id: "katia-10",
    name: "Camisola Especial Amamentação Rendada Romântica",
    category: "moda-intima",
    price: 119.90,
    originalPrice: 139.90,
    isNew: true,
    isFeatured: true,
    badge: "Maternidade",
    description: "Desenvolvida com carinho para gestantes e puérperas. Abertura frontal prática com fecho click de amamentação fácil com uma só mão. Busto em renda macia hipoalergênica e corpo em liganete fresca e soltinha.",
    composition: "Liganete Poliamida e Renda Elástica",
    image: "images/camisola-amamentacao.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: [
      { name: "Vermelho Rubi Apaixonante", hex: "#9E1C2B" },
      { name: "Rosê Delicado", hex: "#D9AAB3" },
      { name: "Preto Elegance", hex: "#18181A" }
    ]
  },
  {
    id: "katia-11",
    name: "Kit 3 Cuecas Boxer Microfibra Sem Costura Hibisco",
    category: "moda-intima",
    price: 79.90,
    originalPrice: 95.00,
    isNew: false,
    isFeatured: false,
    badge: "Moda Íntima",
    description: "Kit com 3 cuecas boxer originais Hibisco / Equipaggio. Confeccionadas sem costura nas laterais com elástico largo anatômico personalizado que não enrola na cintura.",
    composition: "Microfibra Macia 92% Poliamida, 8% Elastano",
    image: "images/feed-moda-masculina.jpg",
    sizes: ["P", "M", "G", "GG"],
    colors: [
      { name: "Kit Preto, Marinho e Grafite", hex: "#22252A" }
    ]
  },
  {
    id: "katia-12",
    name: "Jogo de Toalhas de Banho Aveludadas Fendi & Grafite",
    category: "cama-mesa-banho",
    price: 89.90,
    originalPrice: null,
    isNew: true,
    isFeatured: false,
    badge: "Cama & Banho",
    description: "Toalhas encorpadas 100% algodão felpudo com barra geométrica aveludada em jacquard. Toque macio com altíssimo poder de absorção desde a primeira lavagem.",
    composition: "100% Algodão Gramatura 450g/m²",
    image: "images/toalha-banho-fendi.jpg",
    sizes: ["Banho + Rosto"],
    colors: [
      { name: "Fendi Acinzentado", hex: "#8A8D8F" },
      { name: "Bege Dourado Nobre", hex: "#C7B89E" }
    ]
  }
];
