# KÁTIA VARIEDADES — Catálogo Digital de Moda & Gestão

Catálogo digital elegante, responsivo e contemporâneo para a loja **Kátia Variedades** (Mossoró / RN), desenvolvido com abordagem **Mobile-First**, gestão administrativa com proteção por senha, capa editável e finalização direta de pedidos pelo **WhatsApp**.

---

## 🎨 Identidade Visual Implementada

Seguindo rigorosamente a paleta de cores nobre e equilibrada:

| Elemento | Código HEX | Aplicação |
|---|---|---|
| **Fundo Principal** | `#111214` | Cor base do corpo da página |
| **Fundo Secundário** | `#1C1B1A` | Header, Hero banner, gaveta do carrinho e rodapé |
| **Cards de Produtos** | `#242220` | Superfície elevada dos cards de roupas |
| **Dourado Nobre** | `#C6A15B` | Acentos, botões de ação primária, ícones e badges |
| **Dourado Claro** | `#E5D4AF` | Destaques textuais e subtítulos refinados |
| **Texto Principal** | `#F5F2ED` | Títulos, nomes de produtos e contrastes legíveis |
| **Texto Secundário** | `#A9A29A` | Descrições, categorias, preços originais e metadados |
| **Bordas** | `#383330` | Divisores, contornos sutis dos cards e inputs |

> **Nota de Design:** O dourado foi empregado com parcimônia estratégica (botões de conversão, tags de destaque e linhas de acento), preservando o conforto visual e transmitindo sofisticação sem poluição ou contrastes cansativos.

---

## ✨ Funcionalidades da Vitrine Pública

1. **Fotos e Produtos Reais da Loja:**
   - Vitrine abastecida com as peças e fotos reais enviadas pela cliente (Blusa UV Diamantes Beachwear, Bermudas Jeans Ciclista e Juvenil Destroyed, Camisola de Amamentação, Conjunto Cargo Juvenil, Moda Praia e Toalhas Nobres).
2. **Capa Principal Editável:**
   - Foto de capa (Hero Banner) com a fachada real da loja em Mossoró/RN, podendo ser alterada a qualquer momento pelo painel administrativo.
3. **Navegação & Categorias:**
   - Barra de categorias com rolagem horizontal suave no celular (*Todas as Peças, Destaques, Feminino, Lingerie, Masculino, Juvenil, Moda Praia & UV*).
   - Busca em tempo real com normalização Unicode (ignora acentos e maiúsculas/minúsculas).
4. **Grade de Produtos Mobile-First:**
   - 2 colunas nos celulares para navegação confortável com uma mão.
   - 3 a 4 colunas em tablets e computadores.
   - Fotos verticais valorizadas, tags e amostras visuais de cores disponíveis.
5. **Seleção de Variantes (Tamanho & Cor):**
   - Modal interativo / Bottom Sheet no celular com detalhes completos da modelagem.
   - Seleção intuitiva de tamanhos e cores com círculos cromáticos reais.
6. **Sacola de Compras Dinâmica:**
   - Gaveta retrátil lateral (*Drawer*), miniaturas, ajuste rápido de quantidades e cálculo automático do total.
   - Persistência no `localStorage` do navegador.
7. **Finalização de Pedido no WhatsApp (Padrão Comercial Elegante):**
   - Mensagem comercial educada, humana e polida, sem emojis em excesso ou divisores ruidosos:
     ```text
     Olá, equipe Kátia Variedades! Tudo bem?

     Gostaria de consultar a disponibilidade das seguintes peças do catálogo:

     • 1x Blusa Térmica Manga Longa Proteção UV Diamantes Beach
       Tamanho: M | Cor: Preto Noir
       Valor: R$ 129,90

     Total do pedido: R$ 129,90

     Cliente: Mariana Silva
     Observações / Endereço: Santo Antônio, Mossoró - RN

     Como podemos combinar o pagamento e a entrega? Muito obrigado(a)!
     ```

---

## 🛡️ Painel de Gestão da Loja (Área Administrativa)

A proprietária pode gerenciar todo o catálogo em tempo real sem mexer em código através do endereço:
👉 **[http://localhost:3000/admin.html](http://localhost:3000/admin.html)**

### Recursos Administrativos:
- **Proteção por Senha Criptográfica (Auth Gate):**
  - Acesso bloqueado para clientes e visitantes não autorizados.
  - **Zero Senhas Expostas:** No primeiro acesso ao painel, o administrador define sua própria senha pessoal secreta diretamente no dispositivo.
  - Senha armazenada de forma segura com hash criptográfico SHA-256.
  - Opção para alterar a senha a qualquer momento no próprio painel.
  - Botão de logout para encerrar a sessão de forma segura.
- **Edição da Foto de Capa (Hero Banner):**
  - Botão **"Foto de Capa"** no cabeçalho do painel.
  - Permite subir uma nova foto diretamente do celular/computador ou informar uma URL externa.
  - Opção de restaurar a fachada original da loja com um clique.
- **Resumo Executivo (KPIs):** Contadores instantâneos de *Total de Produtos*, *Produtos Ativos* e *Produtos Ocultos*.
- **Cadastro Completo & Fotos do Dispositivo:** Cadastro de novas peças com foto da galeria do celular, tamanhos e paleta de cores.
- **Gestão de Visibilidade:** Ocultar ou reativar qualquer peça da vitrine com um único clique.
- **Edição & Exclusão:** Atualização de preços, dados e exclusão com diálogo de segurança.

---

## 🚀 Como Acessar e Testar

### No Computador:
- **Vitrine:** [http://localhost:3000](http://localhost:3000)
- **Painel:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

### No Celular (mesma rede Wi-Fi):
- **Vitrine:** `http://192.168.0.5:3000`
- **Painel:** `http://192.168.0.5:3000/admin.html`

---

## 📁 Estrutura de Arquivos

```
c:\Projetos\MEU PROJETO\
├── index.html              # Vitrine pública da Kátia Variedades
├── admin.html              # Painel administrativo com proteção por senha
├── images\                 # Fotos reais dos produtos e fachada da loja
│   ├── fachada-katia.jpg
│   ├── logo-katia.jpg
│   ├── blusa-uv-diamantes.jpg
│   ├── bermuda-jeans-feminina.jpg
│   ├── bermuda-jeans-juvenil.jpg
│   ├── conjunto-cargo-juvenil.jpg
│   ├── camisola-amamentacao.jpg
│   ├── toalha-banho-fendi.jpg
│   ├── feed-moda-feminina.jpg
│   ├── feed-moda-masculina.jpg
│   └── marcas-parceiras.jpg
├── css\
│   ├── styles.css          # Design system dark & gold e responsividade
│   └── admin.css           # Estilos do painel, tela de senha e modais
├── js\
│   ├── data.js             # Dados da loja (@katia._variedades) e catálogo real
│   ├── product-service.js  # Repositório, persistência, senha e capa editável
│   ├── app.js              # Vitrine pública, sacola e checkout elegante WhatsApp
│   └── admin.js            # Painel administrativo, autenticação e upload de fotos
├── package.json
└── README.md
```
