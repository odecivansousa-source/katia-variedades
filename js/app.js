// Aurum Atelier - Application Logic & State Management
import { STORE_CONFIG, FALLBACK_IMAGE } from './data.js';
import { ProductService } from './product-service.js';

// Exposição global segura para fallbacks de imagem em runtime e serviços
if (typeof window !== 'undefined') {
  window.AURUM_FALLBACK_IMG = FALLBACK_IMAGE;
  window.ProductService = ProductService;
}

// Normalização Unicode com NFD para ignorar acentos e diacríticos na busca
export function normalizeText(text) {
  if (!text) return '';
  return text
    .toString()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .trim();
}

class CatalogApp {
  constructor() {
    this.productService = ProductService;
    // Carrega apenas produtos ativos para a vitrine pública
    this.products = this.productService.getActive();
    this.config = STORE_CONFIG;
    this.currentCategory = 'todos';
    this.searchQuery = '';
    this.lastFocusedElement = null;
    
    // Load cart from LocalStorage
    this.cart = this.loadCart();
    
    // Active modal state
    this.modalState = {
      product: null,
      selectedSize: '',
      selectedColor: null,
      quantity: 1
    };

    this.dom = {};
    this.init();
  }

  init() {
    this.cacheDom();
    this.applyStoreSettings();
    this.renderCategories();
    this.renderProducts();
    this.updateCartUI();
    this.bindEvents();
    
    // Setup Lucide icons if available
    this.refreshIcons();

    // Sincroniza alterações de configurações (como foto de capa) em tempo real
    window.addEventListener('katia_settings_updated', (e) => {
      if (e.detail && e.detail.settings && this.dom.heroCoverImg) {
        this.dom.heroCoverImg.src = e.detail.settings.heroBannerImage;
      }
    });

    // Atualiza vitrine quando os produtos forem sincronizados com a nuvem
    window.addEventListener('aurum_products_updated', () => {
      this.products = this.productService.getActive();
      this.renderProducts();
    });

    // Sincroniza em segundo plano com o Supabase Cloud
    if (typeof this.productService.syncFromCloud === 'function') {
      this.productService.syncFromCloud();
    }
  }

  cacheDom() {
    this.dom.categoriesContainer = document.getElementById('categoriesContainer');
    this.dom.productsGrid = document.getElementById('productsGrid');
    this.dom.catalogCount = document.getElementById('catalogCount');
    this.dom.heroCoverImg = document.getElementById('heroCoverImg');
    
    // Search
    this.dom.searchToggleBtn = document.getElementById('searchToggleBtn');
    this.dom.searchContainer = document.getElementById('searchContainer');
    this.dom.searchInput = document.getElementById('searchInput');
    this.dom.searchClearBtn = document.getElementById('searchClearBtn');
    
    // Cart elements
    this.dom.cartToggleBtn = document.getElementById('cartToggleBtn');
    this.dom.cartCloseBtn = document.getElementById('cartCloseBtn');
    this.dom.cartBackdrop = document.getElementById('cartBackdrop');
    this.dom.cartDrawer = document.getElementById('cartDrawer');
    this.dom.cartItemsList = document.getElementById('cartItemsList');
    this.dom.cartBadge = document.getElementById('cartBadge');
    this.dom.cartHeaderCount = document.getElementById('cartHeaderCount');
    this.dom.cartSubtotal = document.getElementById('cartSubtotal');
    this.dom.cartTotal = document.getElementById('cartTotal');
    this.dom.clientNameInput = document.getElementById('clientNameInput');
    this.dom.clientNotesInput = document.getElementById('clientNotesInput');
    this.dom.btnWhatsappCheckout = document.getElementById('btnWhatsappCheckout');
    this.dom.mobileCartFloater = document.getElementById('mobileCartFloater');
    this.dom.mobileCartCount = document.getElementById('mobileCartCount');
    this.dom.btnMobileCart = document.getElementById('btnMobileCart');
    
    // Product modal
    this.dom.productModal = document.getElementById('productModal');
    this.dom.modalCloseBtn = document.getElementById('modalCloseBtn');
    this.dom.modalImg = document.getElementById('modalImg');
    this.dom.modalCategory = document.getElementById('modalCategory');
    this.dom.modalTitle = document.getElementById('modalTitle');
    this.dom.modalPrice = document.getElementById('modalPrice');
    this.dom.modalOriginalPrice = document.getElementById('modalOriginalPrice');
    this.dom.modalDesc = document.getElementById('modalDesc');
    this.dom.modalComposition = document.getElementById('modalComposition');
    this.dom.sizeOptionsContainer = document.getElementById('sizeOptionsContainer');
    this.dom.selectedSizeLabel = document.getElementById('selectedSizeLabel');
    this.dom.colorOptionsContainer = document.getElementById('colorOptionsContainer');
    this.dom.selectedColorLabel = document.getElementById('selectedColorLabel');
    this.dom.modalQtyInput = document.getElementById('modalQtyInput');
    this.dom.modalQtyMinus = document.getElementById('modalQtyMinus');
    this.dom.modalQtyPlus = document.getElementById('modalQtyPlus');
    this.dom.btnModalAdd = document.getElementById('btnModalAdd');
    
    // Toast container
    this.dom.toastContainer = document.getElementById('toastContainer');
  }

  applyStoreSettings() {
    const settings = this.productService.getStoreSettings();
    if (this.dom.heroCoverImg && settings.heroBannerImage) {
      this.dom.heroCoverImg.src = settings.heroBannerImage;
    }
  }

  bindEvents() {
    // Search toggle & input
    this.dom.searchToggleBtn?.addEventListener('click', () => {
      this.dom.searchContainer.classList.toggle('active');
      if (this.dom.searchContainer.classList.contains('active')) {
        this.dom.searchInput.focus();
      }
    });

    this.dom.searchInput?.addEventListener('input', (e) => {
      this.searchQuery = e.target.value.trim().toLowerCase();
      if (this.searchQuery.length > 0) {
        this.dom.searchClearBtn.classList.add('visible');
      } else {
        this.dom.searchClearBtn.classList.remove('visible');
      }
      this.renderProducts();
    });

    this.dom.searchClearBtn?.addEventListener('click', () => {
      this.dom.searchInput.value = '';
      this.searchQuery = '';
      this.dom.searchClearBtn.classList.remove('visible');
      this.renderProducts();
      this.dom.searchInput.focus();
    });

    // Cart open/close
    this.dom.cartToggleBtn?.addEventListener('click', () => this.openCart());
    this.dom.btnMobileCart?.addEventListener('click', () => this.openCart());
    this.dom.cartCloseBtn?.addEventListener('click', () => this.closeCart());
    this.dom.cartBackdrop?.addEventListener('click', (e) => {
      if (e.target === this.dom.cartBackdrop) {
        this.closeCart();
      }
    });

    // Modal close
    this.dom.modalCloseBtn?.addEventListener('click', () => this.closeModal());
    this.dom.productModal?.addEventListener('click', (e) => {
      if (e.target === this.dom.productModal) {
        this.closeModal();
      }
    });

    // Modal Qty
    this.dom.modalQtyMinus?.addEventListener('click', () => {
      if (this.modalState.quantity > 1) {
        this.modalState.quantity--;
        this.dom.modalQtyInput.value = this.modalState.quantity;
      }
    });

    this.dom.modalQtyPlus?.addEventListener('click', () => {
      if (this.modalState.quantity < 20) {
        this.modalState.quantity++;
        this.dom.modalQtyInput.value = this.modalState.quantity;
      }
    });

    // Modal Add to Cart
    this.dom.btnModalAdd?.addEventListener('click', () => this.confirmAddFromModal());

    // WhatsApp Checkout
    this.dom.btnWhatsappCheckout?.addEventListener('click', () => this.checkoutViaWhatsApp());

    // Footer direct WhatsApp link (compatível com desktop e mobile)
    const footerWa = document.getElementById('footerWhatsappLink');
    if (footerWa) {
      footerWa.addEventListener('click', (e) => {
        e.preventDefault();
        const msg = encodeURIComponent(`Olá! Gostaria de falar com o atendimento da ${this.config.name} para tirar dúvidas sobre o catálogo.`);
        const url = `https://wa.me/${this.config.whatsappNumber}?text=${msg}`;
        const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;
        if (isMobile) {
          window.location.href = url;
        } else {
          window.open(url, '_blank', 'noopener,noreferrer');
        }
      });
    }

    // Gestão de teclado: Fechamento com Escape e Focus Trap para Acessibilidade
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        if (this.dom.productModal.classList.contains('active')) {
          this.closeModal();
        } else if (this.dom.cartBackdrop.classList.contains('active')) {
          this.closeCart();
        }
        return;
      }

      // Confinamento de foco (Focus Trap) no elemento ativo (modal ou drawer)
      if (e.key === 'Tab') {
        let activeContainer = null;
        if (this.dom.productModal.classList.contains('active')) {
          activeContainer = this.dom.productModal.querySelector('.modal-content');
        } else if (this.dom.cartBackdrop.classList.contains('active')) {
          activeContainer = this.dom.cartDrawer;
        }

        if (activeContainer) {
          const focusableSelectors = 'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])';
          const focusables = Array.from(activeContainer.querySelectorAll(focusableSelectors))
            .filter(el => el.offsetParent !== null && window.getComputedStyle(el).visibility !== 'hidden');

          if (focusables.length === 0) {
            e.preventDefault();
            return;
          }

          const firstEl = focusables[0];
          const lastEl = focusables[focusables.length - 1];

          if (e.shiftKey) {
            if (document.activeElement === firstEl || !activeContainer.contains(document.activeElement)) {
              e.preventDefault();
              lastEl.focus();
            }
          } else {
            if (document.activeElement === lastEl || !activeContainer.contains(document.activeElement)) {
              e.preventDefault();
              firstEl.focus();
            }
          }
        }
      }
    });

    // Sincronização automática com alterações feitas no painel administrativo
    window.addEventListener('aurum_products_updated', () => {
      this.products = this.productService.getActive();
      this.renderProducts();
    });
    window.addEventListener('storage', (e) => {
      if (e.key === 'aurum_products_v1') {
        this.products = this.productService.getActive();
        this.renderProducts();
      }
    });
  }

  // Categories Navigation
  renderCategories() {
    if (!this.dom.categoriesContainer) return;
    
    this.dom.categoriesContainer.innerHTML = this.config.categories
      .map(cat => {
        const isActive = cat.id === this.currentCategory;
        return `
          <button class="category-pill ${isActive ? 'active' : ''}" data-category="${cat.id}">
            <i data-lucide="${cat.icon || 'tag'}" style="width: 14px; height: 14px;"></i>
            <span>${cat.name}</span>
          </button>
        `;
      }).join('');

    this.dom.categoriesContainer.querySelectorAll('.category-pill').forEach(btn => {
      btn.addEventListener('click', () => {
        const catId = btn.dataset.category;
        this.setCategory(catId);
      });
    });
  }

  setCategory(catId) {
    this.currentCategory = catId;
    this.dom.categoriesContainer.querySelectorAll('.category-pill').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.category === catId);
    });
    this.renderProducts();
  }

  // Filter products by category and search (com normalização Unicode NFD)
  getFilteredProducts() {
    return this.products.filter(product => {
      let matchesCategory = true;
      if (this.currentCategory === 'destaques') {
        matchesCategory = product.isFeatured || product.isNew;
      } else if (this.currentCategory !== 'todos') {
        matchesCategory = product.category === this.currentCategory;
      }

      let matchesSearch = true;
      if (this.searchQuery) {
        const query = normalizeText(this.searchQuery);
        const inName = normalizeText(product.name).includes(query);
        const inDesc = normalizeText(product.description).includes(query);
        const inComp = normalizeText(product.composition).includes(query);
        const inCat = normalizeText(product.category).includes(query);
        const inBadge = normalizeText(product.badge).includes(query);
        const inColors = Array.isArray(product.colors) 
          ? product.colors.some(c => normalizeText(c.name).includes(query)) 
          : false;

        matchesSearch = inName || inDesc || inComp || inCat || inBadge || inColors;
      }

      return matchesCategory && matchesSearch;
    });
  }

  // Render product grid
  renderProducts() {
    if (!this.dom.productsGrid) return;
    
    const filtered = this.getFilteredProducts();
    if (this.dom.catalogCount) {
      this.dom.catalogCount.textContent = `${filtered.length} ${filtered.length === 1 ? 'modelo' : 'modelos'}`;
    }

    if (filtered.length === 0) {
      this.dom.productsGrid.innerHTML = `
        <div class="empty-catalog">
          <svg class="empty-catalog-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 class="empty-catalog-title">Nenhum produto encontrado</h3>
          <p class="empty-catalog-text">Não encontramos nenhuma peça com os filtros atuais. Tente buscar por outro termo ou categoria.</p>
          <button class="btn-secondary" id="btnResetFilters">Limpar Filtros</button>
        </div>
      `;
      document.getElementById('btnResetFilters')?.addEventListener('click', () => {
        this.currentCategory = 'todos';
        this.searchQuery = '';
        if (this.dom.searchInput) this.dom.searchInput.value = '';
        this.dom.searchClearBtn?.classList.remove('visible');
        this.renderCategories();
        this.renderProducts();
      });
      return;
    }

    this.dom.productsGrid.innerHTML = filtered.map(item => this.createProductCardHtml(item)).join('');
    
    // Bind card buttons
    this.dom.productsGrid.querySelectorAll('.product-card').forEach(card => {
      const productId = card.dataset.id;
      const product = this.products.find(p => p.id === productId);

      // Open detail modal on image/body click
      card.querySelector('.card-media-wrapper').addEventListener('click', () => {
        this.openProductModal(product);
      });
      
      card.querySelector('.card-title').addEventListener('click', () => {
        this.openProductModal(product);
      });

      // Quick action button
      card.querySelector('.btn-card-quick').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openProductModal(product);
      });

      // Add to bag button
      card.querySelector('.btn-card-add').addEventListener('click', (e) => {
        e.stopPropagation();
        this.openProductModal(product);
      });
    });

    this.refreshIcons();
  }

  createProductCardHtml(product) {
    const formattedPrice = this.formatCurrency(product.price);
    const formattedOriginal = product.originalPrice ? this.formatCurrency(product.originalPrice) : null;
    
    const colorSwatches = product.colors.slice(0, 4).map(c => 
      `<span class="color-dot-mini" style="background-color: ${c.hex};" title="${c.name}"></span>`
    ).join('');

    return `
      <article class="product-card" data-id="${product.id}">
        <div class="card-media-wrapper" style="cursor: pointer;">
          <img 
            src="${product.image}" 
            alt="${product.name}" 
            class="card-img" 
            loading="lazy" 
            onerror="if (this.dataset.fallback !== '1') { this.dataset.fallback = '1'; this.src = window.AURUM_FALLBACK_IMG; }"
          >
          ${product.badge ? `<span class="card-badge">${product.badge}</span>` : ''}
          <div class="card-quick-actions">
            <button class="btn-card-quick" title="Ver Detalhes" aria-label="Ver detalhes de ${product.name}">
              <i data-lucide="eye" style="width: 18px; height: 18px;"></i>
            </button>
          </div>
        </div>

        <div class="card-body">
          <div class="card-color-swatches">
            ${colorSwatches}
          </div>
          <span class="card-category">${product.category}</span>
          <h3 class="card-title" title="${product.name}" style="cursor: pointer;">${product.name}</h3>
          
          <div class="card-price-row">
            <span class="price-current">${formattedPrice}</span>
            ${formattedOriginal ? `<span class="price-original">${formattedOriginal}</span>` : ''}
          </div>

          <button class="btn-card-add" aria-label="Selecionar opções de ${product.name}">
            <i data-lucide="shopping-bag" style="width: 14px; height: 14px;"></i>
            <span>Escolher Opções</span>
          </button>
        </div>
      </article>
    `;
  }

  // Product Detail Modal
  openProductModal(product) {
    if (!product) return;

    // Guarda elemento que abriu o modal para devolver o foco após fechamento
    this.lastFocusedElement = document.activeElement;

    this.modalState = {
      product: product,
      selectedSize: product.sizes && product.sizes.length > 0 ? product.sizes[0] : '',
      selectedColor: product.colors && product.colors.length > 0 ? product.colors[0] : null,
      quantity: 1
    };

    // Configura imagem com fallback elegante
    this.dom.modalImg.dataset.fallback = '0';
    this.dom.modalImg.onerror = () => {
      if (this.dom.modalImg.dataset.fallback !== '1') {
        this.dom.modalImg.dataset.fallback = '1';
        this.dom.modalImg.src = FALLBACK_IMAGE;
      }
    };
    this.dom.modalImg.src = product.image;
    this.dom.modalImg.alt = product.name;
    this.dom.modalCategory.textContent = product.category.toUpperCase();
    this.dom.modalTitle.textContent = product.name;
    this.dom.modalPrice.textContent = this.formatCurrency(product.price);
    
    if (product.originalPrice) {
      this.dom.modalOriginalPrice.textContent = this.formatCurrency(product.originalPrice);
      this.dom.modalOriginalPrice.style.display = 'inline';
    } else {
      this.dom.modalOriginalPrice.style.display = 'none';
    }

    this.dom.modalDesc.textContent = product.description;
    this.dom.modalComposition.textContent = product.composition || 'Alta Costura & Acabamento Premium';
    this.dom.modalQtyInput.value = 1;

    // Render Sizes
    this.renderModalSizes(product.sizes);
    // Render Colors
    this.renderModalColors(product.colors);

    // Show modal
    this.dom.productModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.refreshIcons();

    // Transfere o foco para dentro do modal (botão de fechar)
    setTimeout(() => {
      this.dom.modalCloseBtn?.focus();
    }, 50);
  }

  closeModal() {
    this.dom.productModal.classList.remove('active');
    document.body.style.overflow = '';

    // Devolve o foco para o elemento de origem
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }
  }

  renderModalSizes(sizes) {
    this.dom.selectedSizeLabel.textContent = this.modalState.selectedSize || 'Não selecionado';
    
    this.dom.sizeOptionsContainer.innerHTML = sizes.map(size => {
      const isSelected = size === this.modalState.selectedSize;
      return `
        <button class="size-btn ${isSelected ? 'selected' : ''}" data-size="${size}">
          ${size}
        </button>
      `;
    }).join('');

    this.dom.sizeOptionsContainer.querySelectorAll('.size-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        this.modalState.selectedSize = size;
        this.dom.selectedSizeLabel.textContent = size;
        this.dom.sizeOptionsContainer.querySelectorAll('.size-btn').forEach(b => {
          b.classList.toggle('selected', b.dataset.size === size);
        });
      });
    });
  }

  renderModalColors(colors) {
    const selectedColorName = this.modalState.selectedColor ? this.modalState.selectedColor.name : 'Padrão';
    this.dom.selectedColorLabel.textContent = selectedColorName;

    this.dom.colorOptionsContainer.innerHTML = colors.map((col, idx) => {
      const isSelected = this.modalState.selectedColor && this.modalState.selectedColor.name === col.name;
      return `
        <div class="color-swatch-wrapper ${isSelected ? 'selected' : ''}" data-index="${idx}">
          <span class="color-circle" style="background-color: ${col.hex};"></span>
          <span class="color-name">${col.name}</span>
        </div>
      `;
    }).join('');

    this.dom.colorOptionsContainer.querySelectorAll('.color-swatch-wrapper').forEach(wrapper => {
      wrapper.addEventListener('click', () => {
        const index = parseInt(wrapper.dataset.index, 10);
        const col = colors[index];
        this.modalState.selectedColor = col;
        this.dom.selectedColorLabel.textContent = col.name;
        this.dom.colorOptionsContainer.querySelectorAll('.color-swatch-wrapper').forEach(w => {
          w.classList.toggle('selected', parseInt(w.dataset.index, 10) === index);
        });
      });
    });
  }

  confirmAddFromModal() {
    const product = this.modalState.product;
    if (!product) return;

    const size = this.modalState.selectedSize;
    const color = this.modalState.selectedColor;
    const quantity = parseInt(this.modalState.quantity, 10) || 1;

    this.addToCart(product, size, color, quantity);
    this.closeModal();
    this.showToast(`"${product.name}" adicionado à sacola.`);
  }

  // Cart Management
  loadCart() {
    try {
      const saved = localStorage.getItem('aurum_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  }

  saveCart() {
    try {
      localStorage.setItem('aurum_cart', JSON.stringify(this.cart));
    } catch (e) {
      console.warn('Erro ao salvar sacola:', e);
    }
  }

  addToCart(product, size, color, quantity = 1) {
    const colorName = color ? color.name : 'Única';
    const colorHex = color ? color.hex : '#111214';
    const itemKey = `${product.id}_${size}_${colorName}`;

    const existingIndex = this.cart.findIndex(i => i.itemKey === itemKey);

    if (existingIndex > -1) {
      this.cart[existingIndex].quantity += quantity;
    } else {
      this.cart.push({
        itemKey: itemKey,
        productId: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        size: size,
        colorName: colorName,
        colorHex: colorHex,
        quantity: quantity
      });
    }

    this.saveCart();
    this.updateCartUI();
    this.triggerCartBadgeAnimation();
  }

  removeFromCart(itemKey) {
    this.cart = this.cart.filter(item => item.itemKey !== itemKey);
    this.saveCart();
    this.updateCartUI();
  }

  updateItemQuantity(itemKey, change) {
    const item = this.cart.find(i => i.itemKey === itemKey);
    if (!item) return;

    item.quantity += change;
    if (item.quantity <= 0) {
      this.removeFromCart(itemKey);
    } else {
      this.saveCart();
      this.updateCartUI();
    }
  }

  openCart() {
    this.lastFocusedElement = document.activeElement;
    this.dom.cartBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';

    // Move foco para o botão de fechar da sacola
    setTimeout(() => {
      this.dom.cartCloseBtn?.focus();
    }, 50);
  }

  closeCart() {
    this.dom.cartBackdrop.classList.remove('active');
    document.body.style.overflow = '';

    // Devolve o foco para o elemento de origem
    if (this.lastFocusedElement && typeof this.lastFocusedElement.focus === 'function') {
      this.lastFocusedElement.focus();
    }
  }

  updateCartUI() {
    const totalCount = this.cart.reduce((sum, item) => sum + item.quantity, 0);
    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    // Update badges
    if (this.dom.cartBadge) {
      this.dom.cartBadge.textContent = totalCount;
      this.dom.cartBadge.style.display = totalCount > 0 ? 'flex' : 'none';
    }

    if (this.dom.cartHeaderCount) {
      this.dom.cartHeaderCount.textContent = `${totalCount} ${totalCount === 1 ? 'item' : 'itens'}`;
    }

    if (this.dom.mobileCartCount) {
      this.dom.mobileCartCount.textContent = totalCount;
    }

    if (this.dom.mobileCartFloater) {
      this.dom.mobileCartFloater.classList.toggle('visible', totalCount > 0);
    }

    // Totals
    const formattedTotal = this.formatCurrency(subtotal);
    if (this.dom.cartSubtotal) this.dom.cartSubtotal.textContent = formattedTotal;
    if (this.dom.cartTotal) this.dom.cartTotal.textContent = formattedTotal;

    // Render list
    if (this.dom.cartItemsList) {
      if (this.cart.length === 0) {
        this.dom.cartItemsList.innerHTML = `
          <div class="cart-empty">
            <svg class="cart-empty-icon" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <h4 class="cart-empty-title">Sua sacola está vazia</h4>
            <p class="cart-empty-text">Escolha suas peças preferidas no catálogo e adicione à sacola.</p>
            <button class="btn-primary" id="btnExploreCatalog" style="font-size: 0.75rem; padding: 0.65rem 1.25rem;">
              Explorar Catálogo
            </button>
          </div>
        `;
        document.getElementById('btnExploreCatalog')?.addEventListener('click', () => {
          this.closeCart();
        });
      } else {
        this.dom.cartItemsList.innerHTML = this.cart.map(item => `
          <div class="cart-item" data-key="${item.itemKey}">
            <img 
              src="${item.image}" 
              alt="${item.name}" 
              class="cart-item-img"
              onerror="if (this.dataset.fallback !== '1') { this.dataset.fallback = '1'; this.src = window.AURUM_FALLBACK_IMG; }"
            >
            <div class="cart-item-info">
              <div>
                <h4 class="cart-item-title">${item.name}</h4>
                <div class="cart-item-meta">
                  <span class="cart-item-badge">Tam: ${item.size}</span>
                  <span style="display: inline-flex; align-items: center; gap: 4px;">
                    <span style="width: 8px; height: 8px; border-radius: 50%; background-color: ${item.colorHex}; display: inline-block;"></span>
                    ${item.colorName}
                  </span>
                </div>
              </div>

              <div class="cart-item-bottom">
                <span class="cart-item-price">${this.formatCurrency(item.price * item.quantity)}</span>
                <div class="cart-qty-inline">
                  <button class="cart-qty-btn btn-cart-minus" aria-label="Diminuir quantidade">−</button>
                  <span class="cart-qty-val">${item.quantity}</span>
                  <button class="cart-qty-btn btn-cart-plus" aria-label="Aumentar quantidade">+</button>
                </div>
              </div>
            </div>

            <button class="cart-remove-btn" aria-label="Remover item">
              <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
            </button>
          </div>
        `).join('');

        // Bind item actions
        this.dom.cartItemsList.querySelectorAll('.cart-item').forEach(el => {
          const key = el.dataset.key;
          el.querySelector('.btn-cart-minus').addEventListener('click', () => this.updateItemQuantity(key, -1));
          el.querySelector('.btn-cart-plus').addEventListener('click', () => this.updateItemQuantity(key, 1));
          el.querySelector('.cart-remove-btn').addEventListener('click', () => this.removeFromCart(key));
        });
      }
    }

    this.refreshIcons();
  }

  triggerCartBadgeAnimation() {
    if (!this.dom.cartBadge) return;
    this.dom.cartBadge.classList.remove('bump');
    void this.dom.cartBadge.offsetWidth; // trigger reflow
    this.dom.cartBadge.classList.add('bump');
  }

  // Finalizar Pedido pelo WhatsApp
  checkoutViaWhatsApp() {
    if (this.cart.length === 0) {
      this.showToast('Sua sacola está vazia!');
      return;
    }

    const clientName = this.dom.clientNameInput ? this.dom.clientNameInput.value.trim() : '';
    const clientNotes = this.dom.clientNotesInput ? this.dom.clientNotesInput.value.trim() : '';

    const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const formattedTotal = this.formatCurrency(subtotal);

    // Mensagem comercial refinada, cortês e profissional para o atendimento da loja
    let message = `Olá, equipe Kátia Variedades! Tudo bem?\n\n`;
    message += `Gostaria de consultar a disponibilidade das seguintes peças do catálogo:\n\n`;

    this.cart.forEach((item) => {
      message += `• ${item.quantity}x ${item.name}\n`;
      message += `  Tamanho: ${item.size} | Cor: ${item.colorName}\n`;
      message += `  Valor: ${this.formatCurrency(item.price * item.quantity)}\n\n`;
    });

    message += `Total do pedido: ${formattedTotal}\n\n`;

    if (clientName) {
      message += `Cliente: ${clientName}\n`;
    }
    if (clientNotes) {
      message += `Observações / Endereço: ${clientNotes}\n`;
    }

    message += `\nComo podemos combinar o pagamento e a entrega? Muito obrigado(a)!`;

    const encodedMessage = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${this.config.whatsappNumber}?text=${encodedMessage}`;

    // Compatibilidade mobile: evita bloqueio de pop-up em navegadores móveis (ex: Safari iOS)
    const isMobile = /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768;

    if (isMobile) {
      window.location.href = whatsappUrl;
    } else {
      window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    }
  }

  // Toast Notification
  showToast(text) {
    if (!this.dom.toastContainer) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <i data-lucide="check-circle" style="width: 16px; height: 16px; color: var(--gold);"></i>
      <span>${text}</span>
    `;

    this.dom.toastContainer.appendChild(toast);
    this.refreshIcons();

    setTimeout(() => {
      toast.remove();
    }, 3000);
  }

  // Helper: Currency Formatter
  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

  // Helper: Lucide icons refresh
  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.catalogApp = new CatalogApp();
});
