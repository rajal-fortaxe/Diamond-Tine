// WISHLIST CONSTANTS
const LOCAL_STORAGE_WISHLIST_KEY = 'shopify-wishlist';
const LOCAL_STORAGE_DELIMITER = ',';
const BUTTON_ACTIVE_CLASS = 'active';
const GRID_LOADED_CLASS = 'loaded';

const $ = window.jQuery || null;

const selectors = {
  button: '.button-wishlist > button',
  grid: '[grid-wishlist]',
  productCard: '.product-content-card',
};

// -----------------------------------------

document.addEventListener('DOMContentLoaded', () => {
  initButtons();
  initGrid();

 const wishlist = getWishlist();
if ($) {
  $('[data-count-wishlist] .count').html(`(${wishlist.length})`);
}

});

// -----------------------------------------

document.addEventListener('shopify-wishlist:updated', (event) => {
  const wishlist = event?.detail?.wishlist || getWishlist();
  initGrid(wishlist);
});

// -----------------------------------------

const fetchProductCardHTML = (handle) => {
  const url = `/products/${handle}?view=wishlist`;

  return fetch(url)
    .then(res => res.text())
    .then(res => {
      const doc = new DOMParser().parseFromString(res, 'text/html');
      return doc.querySelector(selectors.productCard)?.outerHTML || "";
    })
    .catch((err) => console.error('wishlist fetch error', err));
};

// -----------------------------------------

const setupGrid = async (grid, wishlist = getWishlist()) => {
  const responses = await Promise.all(wishlist.map(fetchProductCardHTML));
  grid.innerHTML = responses.join('');
  grid.classList.add(GRID_LOADED_CLASS);

  initButtons();

  if (window.initButtonsCompare) initButtonsCompare();
  if (window.wpbingo?.countdown) window.wpbingo.countdown();
  if (window.wpbingo?.click_atribute_image) window.wpbingo.click_atribute_image();
  
  if ($ && $('.bwp_currency').length > 0 && wishlist.length > 0) {
    if (typeof Currency !== 'undefined' && Currency.Currency_customer) {
      Currency.Currency_customer(true);
    }
  }
  
  if (window.ajaxCart?.init) ajaxCart.init();

  document.dispatchEvent(new CustomEvent('shopify-wishlist:init-product-grid', {
    detail: { wishlist }
  }));

  if ($) {
    $('.wishlist__grid').removeClass('loading_wishlist');
    if (wishlist.length > 0) {
      $('.wishlist_empty').addClass('hidden');
    } else {
      $('.wishlist_empty').removeClass('hidden');
    }
  }
};

// -----------------------------------------

const setupButtons = (buttons) => {
  buttons.forEach((button) => {
    const productHandle = button.dataset.productHandle;
    if (!productHandle) return;

    // Set initial active state
    if (wishlistContains(productHandle)) {
      button.classList.add(BUTTON_ACTIVE_CLASS);
    }

    // Set initial text if span exists
    const span_button_text = button.querySelector('span');
    if (span_button_text) {
      span_button_text.textContent = button.classList.contains(BUTTON_ACTIVE_CLASS)
        ? (window.strings?.remove_wishlist ?? 'Remove From Wishlist')
        : (window.strings?.wishlist ?? 'Add to Wishlist');
    }

    button.addEventListener('click', (e) => {
      e.preventDefault(); // Prevents page reload/navigation
      e.stopPropagation();

      updateWishlist(productHandle);
      button.classList.add('load-wishlist');

      setTimeout(() => {
        button.classList.remove('load-wishlist');
        button.classList.toggle(BUTTON_ACTIVE_CLASS);

        const parent = button.closest('.button-wishlist');
        const span_button = button.querySelector('span');
        const isAdded = button.classList.contains(BUTTON_ACTIVE_CLASS);
        
        const removeText = window.strings?.remove_wishlist ?? 'Remove From Wishlist';
        const addText = window.strings?.wishlist ?? 'Add to Wishlist';

        if (parent) {
          parent.setAttribute('data-title', isAdded ? removeText : addText);
        }

        if (span_button) {
          span_button.textContent = isAdded ? removeText : addText;
        }
      }, 700);
    });
  });
};

// -----------------------------------------

const initGrid = (wishlist = getWishlist()) => {
  const grid = document.querySelector(selectors.grid);
  if (grid) setupGrid(grid, wishlist);
};

// -----------------------------------------

const initButtons = (element) => {
  const container = element ? document.querySelector(element) : document;
  if (!container) return;

  const buttons = container.querySelectorAll(selectors.button);
  if (!buttons.length) return;

  setupButtons(buttons);

  document.dispatchEvent(new CustomEvent('shopify-wishlist:init-buttons', {
    detail: { wishlist: getWishlist() }
  }));

  if ($) {
    $(selectors.button).each(function () {
      const $btn = $(this);
      const parent = $btn.closest('.button-wishlist');
      if (!parent.length) return;

      const isAdded = $btn.hasClass(BUTTON_ACTIVE_CLASS);
      const title = isAdded ? (window.strings?.remove_wishlist ?? 'Remove') : (window.strings?.wishlist ?? 'Wishlist');

      parent.attr('data-title', title);
      
      // Only update text if a span exists inside the button
      const $span = $btn.find('span');
      if ($span.length > 0) {
        $span.text(title);
      }
    });
  }
};

// -----------------------------------------

const getWishlist = () => {
  const list = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
  return list ? list.split(LOCAL_STORAGE_DELIMITER) : [];
};

// -----------------------------------------

const setWishlist = (array) => {
  const wishlist = array.join(LOCAL_STORAGE_DELIMITER);

  if (array.length)
    localStorage.setItem(LOCAL_STORAGE_WISHLIST_KEY, wishlist);
  else
    localStorage.removeItem(LOCAL_STORAGE_WISHLIST_KEY);

  document.dispatchEvent(new CustomEvent('shopify-wishlist:updated', {
    detail: { wishlist: array }
  }));

  return wishlist;
};

// -----------------------------------------

const updateWishlist = (handle) => {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(handle);

  if (index === -1) wishlist.push(handle);
  else wishlist.splice(index, 1);

  if ($) $('[data-count-wishlist] .count').html(wishlist.length);

  return setWishlist(wishlist);
};

// -----------------------------------------

const wishlistContains = (handle) => getWishlist().includes(handle);
const resetWishlist = () => setWishlist([]);


class WishBuyButton extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.form = this.querySelector('form');
    if (!this.form) return;
    
    this.form.addEventListener('submit', this.onSubmitHandler.bind(this));
     
  }

  async onSubmitHandler(e) {
    
    e.preventDefault();
    const submitButton = this.querySelector('[type="submit"]');
    if (submitButton) {
      submitButton.setAttribute('aria-disabled', 'true');
      submitButton.classList.add('loading');
    }

    const formData = new FormData(this.form);
    
    formData.append('sections', 'cart-drawer,cart-icon-bubble');
    formData.append('sections_url', window.location.pathname);

    try {
      const response = await fetch(`${window.Shopify.routes.root}cart/add.js`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: formData
      });

      const responseData = await response.json();

      if (!response.ok) throw new Error(responseData.description || 'Cart error');
      this.updateCartUI(responseData.sections);

    } catch (error) {
      console.error('WishBuyButton Error:', error);
    } finally {
      if (submitButton) {
        submitButton.removeAttribute('aria-disabled');
        submitButton.classList.remove('loading');
      }
    }
  }

  updateCartUI(sections) {
    const drawer = document.querySelector('cart-drawer');
    if (drawer && sections['cart-drawer']) {
      drawer.renderContents({ sections: sections });
    }

    const cartBubble = document.querySelector('.cart-icon-bubble');
    const bubbleHTML = sections['cart-icon-bubble'];

    if (cartBubble && bubbleHTML) {
      const htmlParser = new DOMParser();
      const doc = htmlParser.parseFromString(bubbleHTML, 'text/html');

      const newContent = doc.querySelector('.cart-icon-bubble')?.innerHTML || doc.body.innerHTML;
      cartBubble.innerHTML = `(${newContent})`;
    }
     const wishlistBtn = this.closest('.product-card')?.querySelector('.button-wishlist button');
        if (wishlistBtn) {
          wishlistBtn.click();
        }
    } 
    if (drawer) {
      drawer.classList.remove('is-empty');
      drawer.open();
    }
      
}

if (!customElements.get('wish-buy-button')) {
  customElements.define('wish-buy-button', WishBuyButton);
}