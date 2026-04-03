// ===============================
// WISHLIST CONSTANTS
// ===============================
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

// ===============================
// UPDATE COUNT (ALWAYS SHOW 0)
// ===============================
function updateWishlistCount(wishlist) {
  const count = wishlist.length || 0;

  // jQuery
  if ($) {
    $('[data-count-wishlist] .count').html(`(${count})`);
  }

  // Vanilla fallback
  const el = document.querySelector('[data-count-wishlist] .count');
  if (el) {
    el.innerHTML = `${count}`;
  }
}

// ===============================
// INIT
// ===============================
document.addEventListener('DOMContentLoaded', () => {
  initButtons();
  initGrid();

  const wishlist = getWishlist();
  updateWishlistCount(wishlist); // ✅ always shows (0)
});

// ===============================
// EVENT: WISHLIST UPDATED
// ===============================
document.addEventListener('shopify-wishlist:updated', (event) => {
  const wishlist = event?.detail?.wishlist || getWishlist();

  initGrid(wishlist);
  updateWishlistCount(wishlist); // ✅ update count properly
});

// ===============================
// FETCH PRODUCT CARD
// ===============================
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

// ===============================
// GRID SETUP
// ===============================
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

// ===============================
// BUTTON SETUP
// ===============================
const setupButtons = (buttons) => {
  buttons.forEach((button) => {
    const productHandle = button.dataset.productHandle;
    if (!productHandle) return;

    if (wishlistContains(productHandle)) {
      button.classList.add(BUTTON_ACTIVE_CLASS);
    }

    const span_button_text = button.querySelector('span');
    if (span_button_text) {
      span_button_text.textContent = button.classList.contains(BUTTON_ACTIVE_CLASS)
        ? (window.strings?.remove_wishlist ?? 'Remove From Wishlist')
        : (window.strings?.wishlist ?? 'Add to Wishlist');
    }

    button.addEventListener('click', (e) => {
      e.preventDefault();
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

// ===============================
// INIT HELPERS
// ===============================
const initGrid = (wishlist = getWishlist()) => {
  const grid = document.querySelector(selectors.grid);
  if (grid) setupGrid(grid, wishlist);
};

const initButtons = (element) => {
  const container = element ? document.querySelector(element) : document;
  if (!container) return;

  const buttons = container.querySelectorAll(selectors.button);
  if (!buttons.length) return;

  setupButtons(buttons);

  document.dispatchEvent(new CustomEvent('shopify-wishlist:init-buttons', {
    detail: { wishlist: getWishlist() }
  }));
};

// ===============================
// STORAGE
// ===============================
const getWishlist = () => {
  const list = localStorage.getItem(LOCAL_STORAGE_WISHLIST_KEY);
  return list ? list.split(LOCAL_STORAGE_DELIMITER) : [];
};

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

const updateWishlist = (handle) => {
  const wishlist = getWishlist();
  const index = wishlist.indexOf(handle);

  if (index === -1) wishlist.push(handle);
  else wishlist.splice(index, 1);

  return setWishlist(wishlist); // ✅ event handles count update
};

const wishlistContains = (handle) => getWishlist().includes(handle);
const resetWishlist = () => setWishlist([]);