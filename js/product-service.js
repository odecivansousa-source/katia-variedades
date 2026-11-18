// Aurum / Kátia Variedades - Camada de Serviços e Repositório de Produtos
// Abstrai a persistência e integra sincronização em nuvem com Supabase
import { PRODUCTS as INITIAL_PRODUCTS, STORE_CONFIG } from './data.js';

const STORAGE_KEY = 'katia_variedades_products_v4';
const SETTINGS_KEY = 'katia_variedades_settings_v1';
const AUTH_KEY = 'katia_admin_auth_v1';
const PASS_HASH_KEY = 'katia_admin_pwd_hash_v1';
const SALT = 'katia_boutique_salt_2026';

// Configuração do Supabase Cloud
const SUPABASE_URL = 'https://owzamemhgbmrqmwlkqcc.supabase.co';
const SUPABASE_ANON = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im93emFtZW1oZ2JtcnFtd2xrcWNjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTA1NTU3MzcsImV4cCI6MjEwNjEzMTczN30.cdd9aw9VhaPKiEIjwQ1edqDlI2PScFf2SihkxxAoY_s';

export function getSupabase() {
  if (typeof window !== 'undefined' && window.supabase && typeof window.supabase.createClient === 'function') {
    if (!window._supabaseInstance) {
      window._supabaseInstance = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON);
    }
    return window._supabaseInstance;
  }
  return null;
}

function mapFromDb(row) {
  return {
    id: row.id,
    name: row.name,
    category: row.category,
    price: parseFloat(row.price),
    originalPrice: row.original_price ? parseFloat(row.original_price) : null,
    isNew: !!row.is_new,
    isFeatured: !!row.is_featured,
    badge: row.badge,
    description: row.description || '',
    composition: row.composition || '',
    image: row.image,
    sizes: Array.isArray(row.sizes) ? row.sizes : ['Único'],
    colors: Array.isArray(row.colors) ? row.colors : [{ name: 'Padrão', hex: '#1C1B1A' }],
    isActive: !!row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

function mapToDb(item) {
  return {
    id: item.id,
    name: item.name,
    category: item.category,
    price: item.price,
    original_price: item.originalPrice || null,
    is_new: item.isNew !== undefined ? item.isNew : true,
    is_featured: item.isFeatured !== undefined ? item.isFeatured : false,
    badge: item.badge || null,
    description: item.description || '',
    composition: item.composition || '',
    image: item.image || '',
    sizes: item.sizes || ['Único'],
    colors: item.colors || [{ name: 'Padrão', hex: '#1C1B1A' }],
    is_active: item.isActive !== undefined ? item.isActive : true,
    updated_at: new Date().toISOString()
  };
}

export const ProductService = {
  /**
   * Inicializa o repositório no localStorage se ainda não existir
   */
  _init() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        // Marca todos os produtos iniciais como ativos
        const initialWithStatus = INITIAL_PRODUCTS.map(p => ({
          ...p,
          isActive: p.isActive !== undefined ? p.isActive : true,
          createdAt: p.createdAt || new Date().toISOString()
        }));
        localStorage.setItem(STORAGE_KEY, JSON.stringify(initialWithStatus));
        return initialWithStatus;
      }
      return JSON.parse(stored);
    } catch (e) {
      console.warn('Erro ao ler produtos do localStorage, usando dados padrão:', e);
      return INITIAL_PRODUCTS.map(p => ({ ...p, isActive: true }));
    }
  },

  /**
   * Retorna todos os produtos (ativos e ocultos)
   */
  getAll() {
    return this._init();
  },

  /**
   * Retorna apenas os produtos ativos para a vitrine pública
   */
  getActive() {
    return this.getAll().filter(p => p.isActive !== false);
  },

  /**
   * Retorna um produto por ID
   */
  getById(id) {
    const products = this.getAll();
    return products.find(p => p.id === id) || null;
  },

  /**
   * Persiste a lista completa de produtos
   */
  _saveAll(products) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
      // Dispara evento customizado para sincronização entre abas/janelas se necessário
      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('aurum_products_updated', { detail: { products } }));
      }
      return true;
    } catch (e) {
      console.error('Erro ao salvar produtos no localStorage:', e);
      return false;
    }
  },

  /**
   * Sincroniza catálogo e configurações da nuvem (Supabase)
   */
  async syncFromCloud() {
    const sb = getSupabase();
    if (!sb) return false;
    try {
      const { data: dbProducts, error: prodErr } = await sb
        .from('katia_products')
        .select('*')
        .order('created_at', { ascending: false });

      if (!prodErr && Array.isArray(dbProducts) && dbProducts.length > 0) {
        const mapped = dbProducts.map(mapFromDb);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(mapped));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('aurum_products_updated', { detail: { products: mapped } }));
        }
      }

      const { data: dbSettings, error: settErr } = await sb
        .from('katia_settings')
        .select('*')
        .eq('id', 'store_config')
        .single();

      if (!settErr && dbSettings) {
        const settings = {
          heroBannerImage: dbSettings.hero_banner_image,
          logoImage: dbSettings.logo_image,
          storeName: dbSettings.store_name,
          updatedAt: dbSettings.updated_at
        };
        localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
        if (typeof window !== 'undefined') {
          window.dispatchEvent(new CustomEvent('katia_settings_updated', { detail: { settings } }));
        }
      }
      return true;
    } catch (e) {
      console.warn('Sincronização em nuvem Supabase:', e);
      return false;
    }
  },

  /**
   * Envia uma foto diretamente para o Supabase Storage (Bucket katia-catalog)
   */
  async uploadImageToStorage(file) {
    const sb = getSupabase();
    if (!sb || !file) return null;
    try {
      const ext = file.name ? file.name.split('.').pop() : 'jpg';
      const fileName = `foto_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
      const { data, error } = await sb.storage
        .from('katia-catalog')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });

      if (error) {
        console.warn('Erro ao subir imagem no Supabase Storage:', error);
        return null;
      }
      const { data: urlData } = sb.storage.from('katia-catalog').getPublicUrl(fileName);
      return urlData?.publicUrl || null;
    } catch (e) {
      console.warn('Falha no upload do Supabase Storage:', e);
      return null;
    }
  },

  /**
   * Cadastra um novo produto
   */
  create(data) {
    const products = this.getAll();
    const newId = 'katia-' + Date.now().toString(36) + '-' + Math.random().toString(36).substr(2, 5);

    const newProduct = {
      id: newId,
      name: data.name.trim(),
      category: data.category || 'feminino',
      price: parseFloat(data.price) || 0,
      originalPrice: data.originalPrice ? parseFloat(data.originalPrice) : null,
      isNew: data.isNew !== undefined ? !!data.isNew : true,
      isFeatured: data.isFeatured !== undefined ? !!data.isFeatured : false,
      badge: data.badge ? data.badge.trim() : null,
      description: data.description ? data.description.trim() : '',
      composition: data.composition ? data.composition.trim() : '',
      image: data.image || '',
      sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : ['Único'],
      colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : [{ name: 'Padrão', hex: '#1C1B1A' }],
      isActive: data.isActive !== undefined ? !!data.isActive : true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    products.unshift(newProduct); // Novo item no início do catálogo
    this._saveAll(products);

    // Envio assíncrono para o Supabase Cloud
    const sb = getSupabase();
    if (sb) {
      sb.from('katia_products').insert(mapToDb(newProduct)).then(({ error }) => {
        if (error) console.warn('Erro ao sincronizar novo produto no Supabase:', error);
      });
    }

    return newProduct;
  },

  /**
   * Atualiza um produto existente
   */
  update(id, data) {
    const products = this.getAll();
    const index = products.findIndex(p => p.id === id);
    if (index === -1) return null;

    const existing = products[index];
    const updated = {
      ...existing,
      ...data,
      name: data.name !== undefined ? data.name.trim() : existing.name,
      category: data.category !== undefined ? data.category : existing.category,
      price: data.price !== undefined ? parseFloat(data.price) : existing.price,
      originalPrice: data.originalPrice !== undefined 
        ? (data.originalPrice ? parseFloat(data.originalPrice) : null) 
        : existing.originalPrice,
      description: data.description !== undefined ? data.description.trim() : existing.description,
      composition: data.composition !== undefined ? data.composition.trim() : existing.composition,
      badge: data.badge !== undefined ? (data.badge ? data.badge.trim() : null) : existing.badge,
      image: data.image !== undefined ? data.image : existing.image,
      sizes: Array.isArray(data.sizes) && data.sizes.length > 0 ? data.sizes : existing.sizes,
      colors: Array.isArray(data.colors) && data.colors.length > 0 ? data.colors : existing.colors,
      isActive: data.isActive !== undefined ? !!data.isActive : existing.isActive,
      updatedAt: new Date().toISOString()
    };

    products[index] = updated;
    this._saveAll(products);

    // Atualização assíncrona no Supabase Cloud
    const sb = getSupabase();
    if (sb) {
      sb.from('katia_products').update(mapToDb(updated)).eq('id', id).then(({ error }) => {
        if (error) console.warn('Erro ao atualizar produto no Supabase:', error);
      });
    }

    return updated;
  },

  /**
   * Alterna status Ativo/Oculto
   */
  toggleActive(id) {
    const products = this.getAll();
    const product = products.find(p => p.id === id);
    if (!product) return null;

    product.isActive = !product.isActive;
    product.updatedAt = new Date().toISOString();
    this._saveAll(products);

    // Atualização assíncrona no Supabase Cloud
    const sb = getSupabase();
    if (sb) {
      sb.from('katia_products').update({ is_active: product.isActive, updated_at: product.updatedAt }).eq('id', id).then(({ error }) => {
        if (error) console.warn('Erro ao atualizar status no Supabase:', error);
      });
    }

    return product;
  },

  /**
   * Exclui um produto por ID
   */
  delete(id) {
    const products = this.getAll();
    const filtered = products.filter(p => p.id !== id);
    if (filtered.length === products.length) return false;

    this._saveAll(filtered);

    // Remoção assíncrona no Supabase Cloud
    const sb = getSupabase();
    if (sb) {
      sb.from('katia_products').delete().eq('id', id).then(({ error }) => {
        if (error) console.warn('Erro ao excluir produto no Supabase:', error);
      });
    }

    return true;
  },

  /**
   * Restaura o catálogo para a base padrão
   */
  resetToDefaults() {
    localStorage.removeItem(STORAGE_KEY);
    return this._init();
  },

  // --------------------------------------------------------------------------
  // Configurações da Loja & Foto de Capa (Hero Banner)
  // --------------------------------------------------------------------------

  /**
   * Retorna as configurações da loja (incluindo foto de capa)
   */
  getStoreSettings() {
    try {
      const stored = localStorage.getItem(SETTINGS_KEY);
      if (stored) {
        return {
          heroBannerImage: STORE_CONFIG.heroBannerImage || 'images/fachada-katia.jpg',
          logoImage: STORE_CONFIG.logoImage || 'images/logo-katia.jpg',
          storeName: STORE_CONFIG.name,
          ...JSON.parse(stored)
        };
      }
    } catch (e) {
      console.warn('Erro ao ler configurações da loja:', e);
    }
    return {
      heroBannerImage: STORE_CONFIG.heroBannerImage || 'images/fachada-katia.jpg',
      logoImage: STORE_CONFIG.logoImage || 'images/logo-katia.jpg',
      storeName: STORE_CONFIG.name
    };
  },

  /**
   * Salva as configurações da loja (ex: nova foto de capa)
   */
  saveStoreSettings(settings) {
    try {
      const current = this.getStoreSettings();
      const updated = { ...current, ...settings, updatedAt: new Date().toISOString() };
      localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));

      if (typeof window !== 'undefined') {
        window.dispatchEvent(new CustomEvent('katia_settings_updated', { detail: { settings: updated } }));
      }

      // Sincronização assíncrona no Supabase Cloud
      const sb = getSupabase();
      if (sb) {
        sb.from('katia_settings').upsert({
          id: 'store_config',
          hero_banner_image: updated.heroBannerImage,
          logo_image: updated.logoImage,
          store_name: updated.storeName,
          updated_at: new Date().toISOString()
        }).then(({ error }) => {
          if (error) console.warn('Erro ao atualizar configurações no Supabase:', error);
        });
      }

      return updated;
    } catch (e) {
      console.error('Erro ao salvar configurações da loja:', e);
      return null;
    }
  },

  /**
   * Restaura a foto de capa padrão
   */
  resetHeroBanner() {
    return this.saveStoreSettings({
      heroBannerImage: 'images/fachada-katia.jpg'
    });
  },

  // --------------------------------------------------------------------------
  // Autenticação Criptográfica & Segurança do Painel
  // --------------------------------------------------------------------------

  /**
   * Gera hash SHA-256 criptográfico para proteção da senha
   */
  async _hash(text) {
    if (typeof crypto !== 'undefined' && crypto.subtle) {
      try {
        const encoder = new TextEncoder();
        const data = encoder.encode(text + ':' + SALT);
        const hashBuf = await crypto.subtle.digest('SHA-256', data);
        return Array.from(new Uint8Array(hashBuf)).map(b => b.toString(16).padStart(2, '0')).join('');
      } catch (e) {
        // Fallback se Web Crypto falhar
      }
    }
    let hash = 0;
    const str = text + ':' + SALT;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0;
    }
    return 'h_' + Math.abs(hash).toString(16);
  },

  /**
   * Verifica se a senha já foi configurada no dispositivo
   */
  hasPasswordConfigured() {
    try {
      return !!localStorage.getItem(PASS_HASH_KEY);
    } catch (e) {
      return false;
    }
  },

  /**
   * Valida se a senha digitada confere com o hash SHA-256
   */
  async verifyAdminPassword(password) {
    if (!password) return false;
    const storedHash = localStorage.getItem(PASS_HASH_KEY);
    if (!storedHash) return false;
    const inputHash = await this._hash(password.trim());
    return inputHash === storedHash;
  },

  /**
   * Define ou atualiza a senha do painel gerando hash SHA-256
   */
  async setAdminPassword(newPassword) {
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'A senha deve conter no mínimo 4 caracteres.' };
    }
    try {
      const hash = await this._hash(newPassword.trim());
      localStorage.setItem(PASS_HASH_KEY, hash);
      return { success: true };
    } catch (e) {
      return { success: false, message: 'Erro ao armazenar senha criptografada.' };
    }
  },

  /**
   * Verifica se o administrador está autenticado na sessão atual
   */
  isAdminAuthenticated() {
    try {
      return sessionStorage.getItem(AUTH_KEY) === 'true';
    } catch (e) {
      return false;
    }
  },

  /**
   * Registra autenticação na sessão atual
   */
  setAdminAuthenticated(status) {
    try {
      if (status) {
        sessionStorage.setItem(AUTH_KEY, 'true');
      } else {
        sessionStorage.removeItem(AUTH_KEY);
      }
      return true;
    } catch (e) {
      return false;
    }
  },

  /**
   * Encerra a sessão administrativa
   */
  logoutAdmin() {
    this.setAdminAuthenticated(false);
  }
};
