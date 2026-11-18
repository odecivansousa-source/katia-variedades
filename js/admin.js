// Aurum Atelier - Lógica do Painel Administrativo de Produtos
import { ProductService } from './product-service.js';
import { STORE_CONFIG, FALLBACK_IMAGE } from './data.js';

// Exposição global segura para fallbacks de imagem e repositório
if (typeof window !== 'undefined') {
  window.AURUM_FALLBACK_IMG = FALLBACK_IMAGE;
  window.ProductService = ProductService;
}

// Presets de tamanhos e cores de luxo
const PRESET_SIZES = ['PP', 'P', 'M', 'G', 'GG', '36', '38', '40', '42', '44', 'Único'];
const PRESET_COLORS = [
  { name: 'Preto Noir', hex: '#141416' },
  { name: 'Champagne Dourado', hex: '#E5D4AF' },
  { name: 'Dourado Nobre', hex: '#C6A15B' },
  { name: 'Creme Papiro', hex: '#EBE6DD' },
  { name: 'Branco Natural', hex: '#F5F2ED' },
  { name: 'Verde Oliva Profundo', hex: '#2E3A2F' },
  { name: 'Camel Intenso', hex: '#A87B4F' },
  { name: 'Terracota Queimado', hex: '#874C37' }
];

class AdminApp {
  constructor() {
    this.service = ProductService;
    this.config = STORE_CONFIG;

    this.state = {
      searchQuery: '',
      filterStatus: 'all', // 'all', 'active', 'hidden'
      filterCategory: 'all',
      editingId: null, // null = novo produto
      formSizes: [],
      formColors: [],
      formImage: '',
      pendingDeleteId: null
    };

    this.dom = {};
    this.init();
  }

  init() {
    this.cacheDom();
    this.bindEvents();
    this.populateCategories();
    this.render();
    this.refreshIcons();
    this.checkAuthentication();

    // Sincroniza alterações do Supabase Cloud em segundo plano
    window.addEventListener('aurum_products_updated', () => {
      this.render();
    });

    if (typeof this.service.syncFromCloud === 'function') {
      this.service.syncFromCloud();
    }
  }

  cacheDom() {
    // KPIs
    this.dom.kpiTotal = document.getElementById('kpiTotal');
    this.dom.kpiActive = document.getElementById('kpiActive');
    this.dom.kpiHidden = document.getElementById('kpiHidden');

    // Controls
    this.dom.searchInput = document.getElementById('adminSearchInput');
    this.dom.filterStatus = document.getElementById('adminFilterStatus');
    this.dom.filterCategory = document.getElementById('adminFilterCategory');
    this.dom.btnNewProduct = document.getElementById('btnNewProduct');

    // Lists
    this.dom.tableBody = document.getElementById('adminTableBody');
    this.dom.mobileCards = document.getElementById('adminMobileCards');
    this.dom.emptyState = document.getElementById('adminEmptyState');

    // Form Modal
    this.dom.formModal = document.getElementById('adminFormModal');
    this.dom.modalTitle = document.getElementById('adminModalTitle');
    this.dom.formCloseBtn = document.getElementById('adminFormCloseBtn');
    this.dom.btnCancelForm = document.getElementById('btnCancelForm');
    this.dom.productForm = document.getElementById('productForm');

    // Form Fields
    this.dom.fieldName = document.getElementById('prodName');
    this.dom.fieldCategory = document.getElementById('prodCategory');
    this.dom.fieldPrice = document.getElementById('prodPrice');
    this.dom.fieldOriginalPrice = document.getElementById('prodOriginalPrice');
    this.dom.fieldBadge = document.getElementById('prodBadge');
    this.dom.fieldComposition = document.getElementById('prodComposition');
    this.dom.fieldDesc = document.getElementById('prodDesc');
    this.dom.fieldActive = document.getElementById('prodActive');
    this.dom.fieldImageUrl = document.getElementById('prodImageUrl');

    // File Upload & Preview
    this.dom.photoUploadArea = document.getElementById('photoUploadArea');
    this.dom.fileInput = document.getElementById('prodFileInput');
    this.dom.photoPreview = document.getElementById('photoPreview');
    this.dom.btnRemovePhoto = document.getElementById('btnRemovePhoto');

    // Chips (Sizes & Colors)
    this.dom.sizeChipsContainer = document.getElementById('sizeChipsContainer');
    this.dom.customSizeInput = document.getElementById('customSizeInput');
    this.dom.btnAddCustomSize = document.getElementById('btnAddCustomSize');

    this.dom.colorChipsContainer = document.getElementById('colorChipsContainer');
    this.dom.customColorHex = document.getElementById('customColorHex');
    this.dom.customColorName = document.getElementById('customColorName');
    this.dom.btnAddCustomColor = document.getElementById('btnAddCustomColor');

    // Confirm Dialog
    this.dom.confirmDialog = document.getElementById('confirmDialog');
    this.dom.confirmDeleteName = document.getElementById('confirmDeleteName');
    this.dom.btnConfirmDelete = document.getElementById('btnConfirmDelete');
    this.dom.btnCancelDelete = document.getElementById('btnCancelDelete');

    // Toast
    this.dom.toastContainer = document.getElementById('toastContainer');

    // Auth Overlay & Controls
    this.dom.authOverlay = document.getElementById('adminAuthOverlay');
    this.dom.authTitle = document.getElementById('authTitle');
    this.dom.authDesc = document.getElementById('authDesc');
    this.dom.authForm = document.getElementById('adminAuthForm');
    this.dom.authPassword = document.getElementById('adminAuthPassword');
    this.dom.setupConfirmWrapper = document.getElementById('setupConfirmWrapper');
    this.dom.adminAuthConfirm = document.getElementById('adminAuthConfirm');
    this.dom.btnAuthSubmitText = document.getElementById('btnAuthSubmitText');
    this.dom.btnToggleAuthPass = document.getElementById('btnToggleAuthPass');
    this.dom.authError = document.getElementById('adminAuthError');
    this.dom.btnAdminLogout = document.getElementById('btnAdminLogout');

    // Store Cover Photo Modal
    this.dom.btnOpenCoverModal = document.getElementById('btnOpenCoverModal');
    this.dom.coverModal = document.getElementById('adminCoverModal');
    this.dom.coverModalCloseBtn = document.getElementById('coverModalCloseBtn');
    this.dom.btnCancelCover = document.getElementById('btnCancelCover');
    this.dom.coverPreview = document.getElementById('adminCoverPreview');
    this.dom.coverFileInput = document.getElementById('coverFileInput');
    this.dom.coverImageUrl = document.getElementById('coverImageUrl');
    this.dom.btnResetCover = document.getElementById('btnResetCover');
    this.dom.btnSaveCover = document.getElementById('btnSaveCover');

    // Change Password Modal
    this.dom.btnOpenChangePassModal = document.getElementById('btnOpenChangePassModal');
    this.dom.changePassModal = document.getElementById('adminChangePassModal');
    this.dom.changePassCloseBtn = document.getElementById('changePassCloseBtn');
    this.dom.btnCancelChangePass = document.getElementById('btnCancelChangePass');
    this.dom.changePassForm = document.getElementById('changePassForm');
    this.dom.currentPassInput = document.getElementById('currentPassInput');
    this.dom.newPassInput = document.getElementById('newPassInput');
    this.dom.confirmNewPassInput = document.getElementById('confirmNewPassInput');
    this.dom.changePassError = document.getElementById('changePassError');
  }

  bindEvents() {
    // Search & Filters
    this.dom.searchInput?.addEventListener('input', (e) => {
      this.state.searchQuery = e.target.value.trim().toLowerCase();
      this.render();
    });

    this.dom.filterStatus?.addEventListener('change', (e) => {
      this.state.filterStatus = e.target.value;
      this.render();
    });

    this.dom.filterCategory?.addEventListener('change', (e) => {
      this.state.filterCategory = e.target.value;
      this.render();
    });

    // Open Create Modal
    this.dom.btnNewProduct?.addEventListener('click', () => this.openFormModal(null));

    // Close Modal
    this.dom.formCloseBtn?.addEventListener('click', () => this.closeFormModal());
    this.dom.btnCancelForm?.addEventListener('click', () => this.closeFormModal());
    this.dom.formModal?.addEventListener('click', (e) => {
      if (e.target === this.dom.formModal) this.closeFormModal();
    });

    // Form Submit
    this.dom.productForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleSaveProduct();
    });

    // Photo File Input & Drag and Drop
    this.dom.fileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.processImageFile(file);
    });

    this.dom.photoUploadArea?.addEventListener('dragover', (e) => {
      e.preventDefault();
      this.dom.photoUploadArea.classList.add('dragover');
    });

    this.dom.photoUploadArea?.addEventListener('dragleave', () => {
      this.dom.photoUploadArea.classList.remove('dragover');
    });

    this.dom.photoUploadArea?.addEventListener('drop', (e) => {
      e.preventDefault();
      this.dom.photoUploadArea.classList.remove('dragover');
      const file = e.dataTransfer.files[0];
      if (file && file.type.startsWith('image/')) {
        this.processImageFile(file);
      }
    });

    this.dom.fieldImageUrl?.addEventListener('input', (e) => {
      const val = e.target.value.trim();
      if (val) {
        this.state.formImage = val;
        this.updatePhotoPreview(val);
      }
    });

    this.dom.btnRemovePhoto?.addEventListener('click', (e) => {
      e.stopPropagation();
      this.state.formImage = '';
      if (this.dom.fieldImageUrl) this.dom.fieldImageUrl.value = '';
      if (this.dom.fileInput) this.dom.fileInput.value = '';
      this.updatePhotoPreview('');
    });

    // Custom Size Adder
    this.dom.btnAddCustomSize?.addEventListener('click', () => {
      const val = this.dom.customSizeInput.value.trim().toUpperCase();
      if (val && !this.state.formSizes.includes(val)) {
        this.state.formSizes.push(val);
        this.dom.customSizeInput.value = '';
        this.renderSizeChips();
      }
    });

    // Custom Color Adder
    this.dom.btnAddCustomColor?.addEventListener('click', () => {
      const hex = this.dom.customColorHex.value;
      const name = this.dom.customColorName.value.trim();
      if (name) {
        this.state.formColors.push({ name, hex });
        this.dom.customColorName.value = '';
        this.renderColorChips();
      }
    });

    // Delete Confirmation
    this.dom.btnConfirmDelete?.addEventListener('click', () => {
      if (this.state.pendingDeleteId) {
        this.confirmDeleteProduct(this.state.pendingDeleteId);
      }
    });

    this.dom.btnCancelDelete?.addEventListener('click', () => {
      this.closeConfirmDialog();
    });

    // Auth Form Submit
    this.dom.authForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleAuthSubmit();
    });

    // Toggle Eye on Auth Password
    this.dom.btnToggleAuthPass?.addEventListener('click', () => {
      const type = this.dom.authPassword.getAttribute('type') === 'password' ? 'text' : 'password';
      this.dom.authPassword.setAttribute('type', type);
      const icon = this.dom.btnToggleAuthPass.querySelector('i');
      if (icon) {
        icon.setAttribute('data-lucide', type === 'password' ? 'eye' : 'eye-off');
        this.refreshIcons();
      }
    });

    // Logout
    this.dom.btnAdminLogout?.addEventListener('click', () => {
      this.handleLogout();
    });

    // Cover Photo Modal Events
    this.dom.btnOpenCoverModal?.addEventListener('click', () => this.openCoverModal());
    this.dom.coverModalCloseBtn?.addEventListener('click', () => this.closeCoverModal());
    this.dom.btnCancelCover?.addEventListener('click', () => this.closeCoverModal());
    this.dom.coverModal?.addEventListener('click', (e) => {
      if (e.target === this.dom.coverModal) this.closeCoverModal();
    });

    this.dom.coverFileInput?.addEventListener('change', (e) => {
      const file = e.target.files[0];
      if (file) this.processCoverImageFile(file);
    });

    this.dom.coverImageUrl?.addEventListener('input', (e) => {
      const url = e.target.value.trim();
      if (url) {
        this.dom.coverPreview.src = url;
      }
    });

    this.dom.btnResetCover?.addEventListener('click', () => this.handleResetCover());
    this.dom.btnSaveCover?.addEventListener('click', () => this.handleSaveCover());

    // Change Password Modal Events
    this.dom.btnOpenChangePassModal?.addEventListener('click', () => this.openChangePassModal());
    this.dom.changePassCloseBtn?.addEventListener('click', () => this.closeChangePassModal());
    this.dom.btnCancelChangePass?.addEventListener('click', () => this.closeChangePassModal());
    this.dom.changePassModal?.addEventListener('click', (e) => {
      if (e.target === this.dom.changePassModal) this.closeChangePassModal();
    });

    this.dom.changePassForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      this.handleChangePassSubmit();
    });

    // Keyboard ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.closeFormModal();
        this.closeConfirmDialog();
        this.closeCoverModal();
        this.closeChangePassModal();
      }
    });
  }

  populateCategories() {
    if (!this.dom.fieldCategory) return;
    const categories = this.config.categories.filter(c => c.id !== 'todos' && c.id !== 'destaques');

    this.dom.fieldCategory.innerHTML = categories.map(c => 
      `<option value="${c.id}">${c.name}</option>`
    ).join('');

    if (this.dom.filterCategory) {
      this.dom.filterCategory.innerHTML = `
        <option value="all">Todas as Categorias</option>
        ${categories.map(c => `<option value="${c.id}">${c.name}</option>`).join('')}
      `;
    }
  }

  async processImageFile(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    // Pré-visualização instantânea local
    const reader = new FileReader();
    reader.onload = (e) => {
      const dataUrl = e.target.result;
      this.state.formImage = dataUrl;
      if (this.dom.fieldImageUrl) this.dom.fieldImageUrl.value = '';
      this.updatePhotoPreview(dataUrl);
    };
    reader.readAsDataURL(file);

    // Upload em nuvem para o Supabase Storage
    if (typeof this.service.uploadImageToStorage === 'function') {
      const publicUrl = await this.service.uploadImageToStorage(file);
      if (publicUrl) {
        this.state.formImage = publicUrl;
      }
    }
  }

  updatePhotoPreview(src) {
    if (src) {
      this.dom.photoPreview.src = src;
      this.dom.photoPreview.style.display = 'block';
      this.dom.btnRemovePhoto.style.display = 'inline-flex';
    } else {
      this.dom.photoPreview.src = FALLBACK_IMAGE;
      this.dom.photoPreview.style.display = 'block';
      this.dom.btnRemovePhoto.style.display = 'none';
    }
  }

  render() {
    const allProducts = this.service.getAll();

    // Update KPI Cards
    const totalCount = allProducts.length;
    const activeCount = allProducts.filter(p => p.isActive !== false).length;
    const hiddenCount = totalCount - activeCount;

    if (this.dom.kpiTotal) this.dom.kpiTotal.textContent = totalCount;
    if (this.dom.kpiActive) this.dom.kpiActive.textContent = activeCount;
    if (this.dom.kpiHidden) this.dom.kpiHidden.textContent = hiddenCount;

    // Filter products
    const filtered = allProducts.filter(p => {
      // Status filter
      if (this.state.filterStatus === 'active' && p.isActive === false) return false;
      if (this.state.filterStatus === 'hidden' && p.isActive !== false) return false;

      // Category filter
      if (this.state.filterCategory !== 'all' && p.category !== this.state.filterCategory) return false;

      // Search query
      if (this.state.searchQuery) {
        const q = this.state.searchQuery;
        const inName = p.name.toLowerCase().includes(q);
        const inCat = p.category.toLowerCase().includes(q);
        const inBadge = p.badge ? p.badge.toLowerCase().includes(q) : false;
        if (!inName && !inCat && !inBadge) return false;
      }

      return true;
    });

    // Render Table & Cards
    if (filtered.length === 0) {
      if (this.dom.tableBody) this.dom.tableBody.innerHTML = '';
      if (this.dom.mobileCards) this.dom.mobileCards.innerHTML = '';
      if (this.dom.emptyState) this.dom.emptyState.style.display = 'block';
    } else {
      if (this.dom.emptyState) this.dom.emptyState.style.display = 'none';
      this.renderTable(filtered);
      this.renderMobileCards(filtered);
    }

    this.refreshIcons();
  }

  renderTable(products) {
    if (!this.dom.tableBody) return;

    this.dom.tableBody.innerHTML = products.map(p => {
      const isActive = p.isActive !== false;
      const formattedPrice = this.formatCurrency(p.price);
      const categoryName = this.getCategoryLabel(p.category);

      return `
        <tr data-id="${p.id}">
          <td>
            <div class="table-product-cell">
              <img 
                src="${p.image || FALLBACK_IMAGE}" 
                alt="${p.name}" 
                class="table-thumb"
                onerror="if (this.dataset.fallback !== '1') { this.dataset.fallback = '1'; this.src = window.AURUM_FALLBACK_IMG; }"
              >
              <div class="table-product-info">
                <span class="table-product-name">${p.name}</span>
                <span class="table-product-desc">${p.description || 'Sem descrição'}</span>
              </div>
            </div>
          </td>
          <td><span style="color: var(--gold-light); font-weight: 500;">${categoryName}</span></td>
          <td>
            <span style="font-weight: 700; color: var(--text-primary);">${formattedPrice}</span>
            ${p.originalPrice ? `<br><small style="color: var(--text-secondary); text-decoration: line-through;">${this.formatCurrency(p.originalPrice)}</small>` : ''}
          </td>
          <td>
            <span class="status-badge ${isActive ? 'status-active' : 'status-hidden'}">
              <span class="status-dot"></span>
              <span>${isActive ? 'Ativo' : 'Oculto'}</span>
            </span>
          </td>
          <td>
            <div class="table-actions">
              <button class="btn-action-icon btn-action-edit" data-id="${p.id}" title="Editar Produto" aria-label="Editar ${p.name}">
                <i data-lucide="edit-3" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action-icon btn-action-toggle" data-id="${p.id}" title="${isActive ? 'Ocultar Produto' : 'Reativar Produto'}" aria-label="Alternar visibilidade de ${p.name}">
                <i data-lucide="${isActive ? 'eye-off' : 'eye'}" style="width: 16px; height: 16px;"></i>
              </button>
              <button class="btn-action-icon btn-action-delete" data-id="${p.id}" title="Excluir Produto" aria-label="Excluir ${p.name}">
                <i data-lucide="trash-2" style="width: 16px; height: 16px;"></i>
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    this.bindRowActions(this.dom.tableBody);
  }

  renderMobileCards(products) {
    if (!this.dom.mobileCards) return;

    this.dom.mobileCards.innerHTML = products.map(p => {
      const isActive = p.isActive !== false;
      const formattedPrice = this.formatCurrency(p.price);
      const categoryName = this.getCategoryLabel(p.category);

      return `
        <div class="admin-mobile-card" data-id="${p.id}">
          <div class="mobile-card-top">
            <img 
              src="${p.image || FALLBACK_IMAGE}" 
              alt="${p.name}" 
              class="mobile-card-thumb"
              onerror="if (this.dataset.fallback !== '1') { this.dataset.fallback = '1'; this.src = window.AURUM_FALLBACK_IMG; }"
            >
            <div class="mobile-card-info">
              <span class="mobile-card-category">${categoryName}</span>
              <h4 class="mobile-card-title">${p.name}</h4>
              <span class="mobile-card-price">${formattedPrice}</span>
            </div>
          </div>

          <div class="mobile-card-bottom">
            <span class="status-badge ${isActive ? 'status-active' : 'status-hidden'}">
              <span class="status-dot"></span>
              <span>${isActive ? 'Ativo' : 'Oculto'}</span>
            </span>

            <div class="table-actions">
              <button class="btn-action-icon btn-action-edit" data-id="${p.id}" title="Editar" aria-label="Editar ${p.name}">
                <i data-lucide="edit-3" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="btn-action-icon btn-action-toggle" data-id="${p.id}" title="${isActive ? 'Ocultar' : 'Reativar'}" aria-label="Visibilidade">
                <i data-lucide="${isActive ? 'eye-off' : 'eye'}" style="width: 15px; height: 15px;"></i>
              </button>
              <button class="btn-action-icon btn-action-delete" data-id="${p.id}" title="Excluir" aria-label="Excluir">
                <i data-lucide="trash-2" style="width: 15px; height: 15px;"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');

    this.bindRowActions(this.dom.mobileCards);
  }

  bindRowActions(container) {
    container.querySelectorAll('.btn-action-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        this.openFormModal(id);
      });
    });

    container.querySelectorAll('.btn-action-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const updated = this.service.toggleActive(id);
        if (updated) {
          const statusText = updated.isActive ? 'reativado' : 'ocultado';
          this.showToast(`Produto "${updated.name}" foi ${statusText}.`);
          this.render();
        }
      });
    });

    container.querySelectorAll('.btn-action-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.id;
        const product = this.service.getById(id);
        if (product) {
          this.openConfirmDialog(product);
        }
      });
    });
  }

  // Open Form Modal (Create or Edit)
  openFormModal(productId = null) {
    this.state.editingId = productId;

    if (productId) {
      const p = this.service.getById(productId);
      if (!p) return;

      this.dom.modalTitle.textContent = 'Editar Peça';
      this.dom.fieldName.value = p.name;
      this.dom.fieldCategory.value = p.category;
      this.dom.fieldPrice.value = p.price;
      this.dom.fieldOriginalPrice.value = p.originalPrice || '';
      this.dom.fieldBadge.value = p.badge || '';
      this.dom.fieldComposition.value = p.composition || '';
      this.dom.fieldDesc.value = p.description || '';
      this.dom.fieldActive.checked = p.isActive !== false;
      this.dom.fieldImageUrl.value = (p.image && !p.image.startsWith('data:')) ? p.image : '';

      this.state.formImage = p.image || '';
      this.state.formSizes = Array.isArray(p.sizes) ? [...p.sizes] : ['M'];
      this.state.formColors = Array.isArray(p.colors) ? [...p.colors] : [{ name: 'Preto Noir', hex: '#141416' }];
    } else {
      this.dom.modalTitle.textContent = 'Cadastrar Nova Peça';
      this.dom.productForm.reset();
      this.dom.fieldActive.checked = true;
      this.dom.fieldImageUrl.value = '';

      this.state.formImage = '';
      this.state.formSizes = ['P', 'M', 'G'];
      this.state.formColors = [
        { name: 'Preto Noir', hex: '#141416' },
        { name: 'Champagne Dourado', hex: '#E5D4AF' }
      ];
    }

    this.updatePhotoPreview(this.state.formImage);
    this.renderSizeChips();
    this.renderColorChips();

    this.dom.formModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.refreshIcons();
    this.dom.fieldName.focus();
  }

  closeFormModal() {
    this.dom.formModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // Size Chips Rendering
  renderSizeChips() {
    if (!this.dom.sizeChipsContainer) return;

    // Combine preset sizes + any custom sizes currently selected
    const allSizes = Array.from(new Set([...PRESET_SIZES, ...this.state.formSizes]));

    this.dom.sizeChipsContainer.innerHTML = allSizes.map(size => {
      const isSelected = this.state.formSizes.includes(size);
      return `
        <button type="button" class="chip-btn ${isSelected ? 'selected' : ''}" data-size="${size}">
          ${size}
        </button>
      `;
    }).join('');

    this.dom.sizeChipsContainer.querySelectorAll('.chip-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        const size = btn.dataset.size;
        if (this.state.formSizes.includes(size)) {
          if (this.state.formSizes.length > 1) {
            this.state.formSizes = this.state.formSizes.filter(s => s !== size);
          } else {
            this.showToast('Ao menos um tamanho deve ser mantido.');
            return;
          }
        } else {
          this.state.formSizes.push(size);
        }
        this.renderSizeChips();
      });
    });
  }

  // Color Chips Rendering
  renderColorChips() {
    if (!this.dom.colorChipsContainer) return;

    // All presets + custom
    const colors = this.state.formColors;

    this.dom.colorChipsContainer.innerHTML = colors.map((col, idx) => `
      <div class="color-tag-item selected" data-index="${idx}">
        <span style="width: 14px; height: 14px; border-radius: 50%; background-color: ${col.hex}; border: 1px solid rgba(255,255,255,0.3); display: inline-block;"></span>
        <span>${col.name}</span>
        <button type="button" class="btn-remove-color" data-index="${idx}" style="color: var(--text-secondary); margin-left: 4px;" aria-label="Remover cor">×</button>
      </div>
    `).join('');

    this.dom.colorChipsContainer.querySelectorAll('.btn-remove-color').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.stopPropagation();
        const index = parseInt(btn.dataset.index, 10);
        if (this.state.formColors.length > 1) {
          this.state.formColors.splice(index, 1);
          this.renderColorChips();
        } else {
          this.showToast('Ao menos uma cor deve ser mantida.');
        }
      });
    });
  }

  // Save Product (Create or Update)
  handleSaveProduct() {
    const name = this.dom.fieldName.value.trim();
    const category = this.dom.fieldCategory.value;
    const price = parseFloat(this.dom.fieldPrice.value);
    const originalPrice = this.dom.fieldOriginalPrice.value ? parseFloat(this.dom.fieldOriginalPrice.value) : null;
    const badge = this.dom.fieldBadge.value.trim() || null;
    const composition = this.dom.fieldComposition.value.trim();
    const description = this.dom.fieldDesc.value.trim();
    const isActive = this.dom.fieldActive.checked;

    if (!name) {
      this.showToast('O nome do produto é obrigatório.');
      this.dom.fieldName.focus();
      return;
    }

    if (isNaN(price) || price < 0) {
      this.showToast('Informe um preço válido.');
      this.dom.fieldPrice.focus();
      return;
    }

    const productData = {
      name,
      category,
      price,
      originalPrice,
      badge,
      composition,
      description,
      isActive,
      image: this.state.formImage || FALLBACK_IMAGE,
      sizes: this.state.formSizes,
      colors: this.state.formColors
    };

    if (this.state.editingId) {
      const updated = this.service.update(this.state.editingId, productData);
      if (updated) {
        this.showToast(`Peça "${updated.name}" atualizada com sucesso!`);
      }
    } else {
      const created = this.service.create(productData);
      if (created) {
        this.showToast(`Nova peça "${created.name}" cadastrada no atelier!`);
      }
    }

    this.closeFormModal();
    this.render();
  }

  // Delete Confirmation
  openConfirmDialog(product) {
    this.state.pendingDeleteId = product.id;
    this.dom.confirmDeleteName.textContent = `Deseja realmente excluir a peça "${product.name}"? Esta ação removerá o produto do catálogo.`;
    this.dom.confirmDialog.classList.add('active');
  }

  closeConfirmDialog() {
    this.state.pendingDeleteId = null;
    this.dom.confirmDialog.classList.remove('active');
  }

  confirmDeleteProduct(id) {
    const success = this.service.delete(id);
    if (success) {
      this.showToast('Produto excluído com sucesso.');
      this.closeConfirmDialog();
      this.render();
    }
  }

  // --------------------------------------------------------------------------
  // Autenticação & Bloqueio por Senha (Auth Gate)
  // --------------------------------------------------------------------------
  checkAuthentication() {
    const isAuth = this.service.isAdminAuthenticated();
    const hasPassword = this.service.hasPasswordConfigured();

    if (!isAuth) {
      if (!hasPassword) {
        // Primeiro acesso: usuário define sua própria senha secreta diretamente no dispositivo
        this.dom.authTitle.textContent = 'Criar Senha de Acesso';
        this.dom.authDesc.innerHTML = 'Kátia Variedades • Primeiro Acesso.<br>Defina uma senha pessoal segura para gerenciar a loja neste dispositivo.';
        this.dom.authPassword.placeholder = 'Crie sua senha de acesso (mínimo 4 dígitos)...';
        this.dom.setupConfirmWrapper.style.display = 'block';
        this.dom.adminAuthConfirm.required = true;
        this.dom.btnAuthSubmitText.textContent = 'Cadastrar Senha e Entrar';
      } else {
        // Acesso normal com senha já cadastrada
        this.dom.authTitle.textContent = 'Acesso Restrito';
        this.dom.authDesc.innerHTML = 'Kátia Variedades • Área Administrativa.<br>Informe sua senha para gerenciar os produtos e o catálogo.';
        this.dom.authPassword.placeholder = 'Digite sua senha de acesso...';
        this.dom.setupConfirmWrapper.style.display = 'none';
        this.dom.adminAuthConfirm.required = false;
        this.dom.btnAuthSubmitText.textContent = 'Entrar no Painel';
      }

      this.dom.authError.classList.remove('visible');
      this.dom.authOverlay.classList.add('active');
      setTimeout(() => {
        this.dom.authPassword?.focus();
      }, 100);
    } else {
      this.dom.authOverlay.classList.remove('active');
    }
  }

  async handleAuthSubmit() {
    const password = this.dom.authPassword.value;
    const hasPassword = this.service.hasPasswordConfigured();

    if (!hasPassword) {
      // Cadastro da primeira senha
      const confirm = this.dom.adminAuthConfirm.value;
      if (password.length < 4) {
        this.dom.authError.textContent = 'A senha deve ter no mínimo 4 caracteres.';
        this.dom.authError.classList.add('visible');
        this.dom.authPassword.focus();
        return;
      }
      if (password !== confirm) {
        this.dom.authError.textContent = 'As senhas digitadas não coincidem.';
        this.dom.authError.classList.add('visible');
        this.dom.adminAuthConfirm.focus();
        return;
      }

      const res = await this.service.setAdminPassword(password);
      if (res.success) {
        this.service.setAdminAuthenticated(true);
        this.dom.authOverlay.classList.remove('active');
        this.dom.authPassword.value = '';
        this.dom.adminAuthConfirm.value = '';
        this.dom.authError.classList.remove('visible');
        this.showToast('Senha administrativa cadastrada com sucesso!');
      } else {
        this.dom.authError.textContent = res.message || 'Erro ao registrar senha.';
        this.dom.authError.classList.add('visible');
      }
      return;
    }

    // Login com senha existente
    const isValid = await this.service.verifyAdminPassword(password);
    if (isValid) {
      this.service.setAdminAuthenticated(true);
      this.dom.authOverlay.classList.remove('active');
      this.dom.authPassword.value = '';
      this.dom.authError.classList.remove('visible');
      this.showToast('Acesso ao painel liberado com sucesso!');
    } else {
      this.dom.authError.textContent = 'Senha incorreta. Tente novamente.';
      this.dom.authError.classList.add('visible');
      this.dom.authPassword.focus();
      this.dom.authPassword.select();
    }
  }

  handleLogout() {
    this.service.logoutAdmin();
    this.dom.authPassword.value = '';
    if (this.dom.adminAuthConfirm) this.dom.adminAuthConfirm.value = '';
    this.dom.authError.classList.remove('visible');
    this.checkAuthentication();
    this.showToast('Sessão encerrada com segurança.');
  }

  // --------------------------------------------------------------------------
  // Gestão da Foto de Capa da Loja (Hero Banner)
  // --------------------------------------------------------------------------
  openCoverModal() {
    const settings = this.service.getStoreSettings();
    this.dom.coverPreview.src = settings.heroBannerImage || 'images/fachada-katia.jpg';
    this.dom.coverImageUrl.value = settings.heroBannerImage.startsWith('http') ? settings.heroBannerImage : '';
    this.dom.coverModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.refreshIcons();
  }

  closeCoverModal() {
    this.dom.coverModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  async processCoverImageFile(file) {
    if (!file.type.startsWith('image/')) {
      this.showToast('Por favor, selecione um arquivo de imagem válido.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      this.dom.coverPreview.src = e.target.result;
      this.dom.coverImageUrl.value = ''; // limpa URL se subiu arquivo
    };
    reader.readAsDataURL(file);

    // Upload em nuvem para o Supabase Storage
    if (typeof this.service.uploadImageToStorage === 'function') {
      const publicUrl = await this.service.uploadImageToStorage(file);
      if (publicUrl) {
        this.dom.coverPreview.src = publicUrl;
        this.dom.coverImageUrl.value = publicUrl;
      }
    }
  }

  handleResetCover() {
    this.dom.coverPreview.src = 'images/fachada-katia.jpg';
    this.dom.coverImageUrl.value = '';
    if (this.dom.coverFileInput) this.dom.coverFileInput.value = '';
    this.showToast('Prévia restaurada para a fachada oficial da loja.');
  }

  handleSaveCover() {
    const newCover = this.dom.coverImageUrl.value.trim() || this.dom.coverPreview.src;
    if (!newCover) {
      this.showToast('Selecione ou informe uma foto de capa válida.');
      return;
    }

    const updated = this.service.saveStoreSettings({ heroBannerImage: newCover });
    if (updated) {
      this.showToast('Foto de capa da loja atualizada com sucesso!');
      this.closeCoverModal();
    }
  }

  // --------------------------------------------------------------------------
  // Gestão de Senha do Painel
  // --------------------------------------------------------------------------
  openChangePassModal() {
    this.dom.currentPassInput.value = '';
    this.dom.newPassInput.value = '';
    this.dom.confirmNewPassInput.value = '';
    this.dom.changePassError.classList.remove('visible');
    this.dom.changePassError.textContent = '';
    this.dom.changePassModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    setTimeout(() => this.dom.currentPassInput?.focus(), 80);
    this.refreshIcons();
  }

  closeChangePassModal() {
    this.dom.changePassModal.classList.remove('active');
    document.body.style.overflow = '';
  }

  async handleChangePassSubmit() {
    const currentPass = this.dom.currentPassInput.value;
    const newPass = this.dom.newPassInput.value;
    const confirmPass = this.dom.confirmNewPassInput.value;

    const isCurrentValid = await this.service.verifyAdminPassword(currentPass);
    if (!isCurrentValid) {
      this.dom.changePassError.textContent = 'Senha atual incorreta.';
      this.dom.changePassError.classList.add('visible');
      this.dom.currentPassInput.focus();
      return;
    }

    if (newPass.length < 4) {
      this.dom.changePassError.textContent = 'A nova senha deve ter no mínimo 4 caracteres.';
      this.dom.changePassError.classList.add('visible');
      this.dom.newPassInput.focus();
      return;
    }

    if (newPass !== confirmPass) {
      this.dom.changePassError.textContent = 'A confirmação de senha não confere.';
      this.dom.changePassError.classList.add('visible');
      this.dom.confirmNewPassInput.focus();
      return;
    }

    const res = await this.service.setAdminPassword(newPass);
    if (res.success) {
      this.showToast('Senha administrativa atualizada com sucesso!');
      this.closeChangePassModal();
    } else {
      this.dom.changePassError.textContent = res.message || 'Erro ao alterar senha.';
      this.dom.changePassError.classList.add('visible');
    }
  }

  // Helpers
  getCategoryLabel(categoryId) {
    const cat = this.config.categories.find(c => c.id === categoryId);
    return cat ? cat.name : categoryId.toUpperCase();
  }

  formatCurrency(value) {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  }

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
    setTimeout(() => toast.remove(), 3200);
  }

  refreshIcons() {
    if (window.lucide && typeof window.lucide.createIcons === 'function') {
      window.lucide.createIcons();
    }
  }
}

// Inicializa no carregamento do DOM
document.addEventListener('DOMContentLoaded', () => {
  window.adminApp = new AdminApp();
});
