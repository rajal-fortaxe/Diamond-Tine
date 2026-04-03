class FacetFiltersForm extends HTMLElement {
  constructor() {
    super();
    this.onActiveFilterClick = this.onActiveFilterClick.bind(this);

    this.debouncedOnSubmit = debounce((event) => {
      this.onSubmitHandler(event);
    }, 800);

    const facetForm = this.querySelector('form');
    facetForm.addEventListener('input', this.debouncedOnSubmit.bind(this));
    const facetWrapper = this.querySelector('#FacetsWrapperDesktop');
    if (facetWrapper) facetWrapper.addEventListener('keyup', onKeyUpEscape);
  }

  static setListeners() {
    const onHistoryChange = (event) => {
      const searchParams = event.state ? event.state.searchParams : FacetFiltersForm.searchParamsInitial;
      if (searchParams === FacetFiltersForm.searchParamsPrev) return;
      FacetFiltersForm.renderPage(searchParams, null, false);
    };
    window.addEventListener('popstate', onHistoryChange);
  }

  static toggleActiveFacets(disable = true) {
    document.querySelectorAll('.js-facet-remove').forEach((element) => {
      element.classList.toggle('disabled', disable);
    });
  }

  static renderPage(searchParams, event, updateURLHash = true) {
    FacetFiltersForm.searchParamsPrev = searchParams;
    const sections = FacetFiltersForm.getSections();
    const countContainer = document.getElementById('ProductCount');
    const countContainerDesktop = document.getElementById('ProductCountDesktop');
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.remove('hidden'));
    document.getElementById('ProductGridContainer').querySelector('.collection').classList.add('loading');
    if (countContainer) {
      countContainer.classList.add('loading');
    }
    if (countContainerDesktop) {
      countContainerDesktop.classList.add('loading');
    }

    sections.forEach((section) => {
      const url = `${window.location.pathname}?section_id=${section.section}&${searchParams}`;
      const filterDataUrl = (element) => element.url === url;

      FacetFiltersForm.filterData.some(filterDataUrl)
        ? FacetFiltersForm.renderSectionFromCache(filterDataUrl, event)
        : FacetFiltersForm.renderSectionFromFetch(url, event);
    });

    if (updateURLHash) FacetFiltersForm.updateURLHash(searchParams);
  }

  static renderSectionFromFetch(url, event) {
    fetch(url)
      .then((response) => response.text())
      .then((responseText) => {
        const html = responseText;
        FacetFiltersForm.filterData = [...FacetFiltersForm.filterData, { html, url }];
        FacetFiltersForm.renderFilters(html, event);
        FacetFiltersForm.renderProductGridContainer(html);
        FacetFiltersForm.renderProductCount(html);
        if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
      });
  }

  static renderSectionFromCache(filterDataUrl, event) {
    const html = FacetFiltersForm.filterData.find(filterDataUrl).html;
    FacetFiltersForm.renderFilters(html, event);
    FacetFiltersForm.renderProductGridContainer(html);
    FacetFiltersForm.renderProductCount(html);
    if (typeof initializeScrollAnimationTrigger === 'function') initializeScrollAnimationTrigger(html.innerHTML);
  }

  static renderProductGridContainer(html) {
    document.getElementById('ProductGridContainer').innerHTML = new DOMParser()
      .parseFromString(html, 'text/html')
      .getElementById('ProductGridContainer').innerHTML;

    document
      .getElementById('ProductGridContainer')
      .querySelectorAll('.scroll-trigger')
      .forEach((element) => {
        element.classList.add('scroll-trigger--cancel');
      });
  }

  static renderProductCount(html) {
    const count = new DOMParser().parseFromString(html, 'text/html').getElementById('ProductCount').innerHTML;
    const container = document.getElementById('ProductCount');
    const containerDesktop = document.getElementById('ProductCountDesktop');
    container.innerHTML = count;
    container.classList.remove('loading');
    if (containerDesktop) {
      containerDesktop.innerHTML = count;
      containerDesktop.classList.remove('loading');
    }
    const loadingSpinners = document.querySelectorAll(
      '.facets-container .loading__spinner, facet-filters-form .loading__spinner'
    );
    loadingSpinners.forEach((spinner) => spinner.classList.add('hidden'));
  }

  static renderFilters(html, event) {
    const parsedHTML = new DOMParser().parseFromString(html, 'text/html');
    const facetDetailsElementsFromFetch = parsedHTML.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );
    const facetDetailsElementsFromDom = document.querySelectorAll(
      '#FacetFiltersForm .js-filter, #FacetFiltersFormMobile .js-filter, #FacetFiltersPillsForm .js-filter'
    );

    // Remove facets that are no longer returned from the server
    Array.from(facetDetailsElementsFromDom).forEach((currentElement) => {
      if (!Array.from(facetDetailsElementsFromFetch).some(({ id }) => currentElement.id === id)) {
        currentElement.remove();
      }
    });

    const matchesId = (element) => {
      const jsFilter = event ? event.target.closest('.js-filter') : undefined;
      return jsFilter ? element.id === jsFilter.id : false;
    };

    const facetsToRender = Array.from(facetDetailsElementsFromFetch).filter((element) => !matchesId(element));
    const countsToRender = Array.from(facetDetailsElementsFromFetch).find(matchesId);

    facetsToRender.forEach((elementToRender, index) => {
      const currentElement = document.getElementById(elementToRender.id);
      // Element already rendered in the DOM so just update the innerHTML
      if (currentElement) {
        document.getElementById(elementToRender.id).innerHTML = elementToRender.innerHTML;
      } else {
        if (index > 0) {
          const { className: previousElementClassName, id: previousElementId } = facetsToRender[index - 1];
          // Same facet type (eg horizontal/vertical or drawer/mobile)
          if (elementToRender.className === previousElementClassName) {
            document.getElementById(previousElementId).after(elementToRender);
            return;
          }
        }

        if (elementToRender.parentElement) {
          document.querySelector(`#${elementToRender.parentElement.id} .js-filter`).before(elementToRender);
        }
      }
    });

    FacetFiltersForm.renderActiveFacets(parsedHTML);
    FacetFiltersForm.renderAdditionalElements(parsedHTML);

    if (countsToRender) {
      const closestJSFilterID = event.target.closest('.js-filter').id;

      if (closestJSFilterID) {
        FacetFiltersForm.renderCounts(countsToRender, event.target.closest('.js-filter'));
        FacetFiltersForm.renderMobileCounts(countsToRender, document.getElementById(closestJSFilterID));

        const newFacetDetailsElement = document.getElementById(closestJSFilterID);
        const newElementSelector = newFacetDetailsElement.classList.contains('mobile-facets__details')
          ? `.mobile-facets__close-button`
          : `.facets__summary`;
        const newElementToActivate = newFacetDetailsElement.querySelector(newElementSelector);

        const isTextInput = event.target.getAttribute('type') === 'text';

        if (newElementToActivate && !isTextInput) newElementToActivate.focus();
      }
    }
  }

  static renderActiveFacets(html) {
    const activeFacetElementSelectors = ['.active-facets-mobile', '.active-facets-desktop'];

    activeFacetElementSelectors.forEach((selector) => {
      const activeFacetsElement = html.querySelector(selector);
      if (!activeFacetsElement) return;
      document.querySelector(selector).innerHTML = activeFacetsElement.innerHTML;
    });

    FacetFiltersForm.toggleActiveFacets(false);
  }

  static renderAdditionalElements(html) {
    const mobileElementSelectors = ['.mobile-facets__open', '.mobile-facets__count', '.sorting'];

    mobileElementSelectors.forEach((selector) => {
      if (!html.querySelector(selector)) return;
      document.querySelector(selector).innerHTML = html.querySelector(selector).innerHTML;
    });

    document.getElementById('FacetFiltersFormMobile').closest('menu-drawer').bindEvents();
  }

  static renderCounts(source, target) {
    const targetSummary = target.querySelector('.facets__summary');
    const sourceSummary = source.querySelector('.facets__summary');

    if (sourceSummary && targetSummary) {
      targetSummary.outerHTML = sourceSummary.outerHTML;
    }

    const targetHeaderElement = target.querySelector('.facets__header');
    const sourceHeaderElement = source.querySelector('.facets__header');

    if (sourceHeaderElement && targetHeaderElement) {
      targetHeaderElement.outerHTML = sourceHeaderElement.outerHTML;
    }

    const targetWrapElement = target.querySelector('.facets-wrap');
    const sourceWrapElement = source.querySelector('.facets-wrap');

    if (sourceWrapElement && targetWrapElement) {
      const isShowingMore = Boolean(target.querySelector('show-more-button .label-show-more.hidden'));
      if (isShowingMore) {
        sourceWrapElement
          .querySelectorAll('.facets__item.hidden')
          .forEach((hiddenItem) => hiddenItem.classList.replace('hidden', 'show-more-item'));
      }

      targetWrapElement.outerHTML = sourceWrapElement.outerHTML;
    }
  }

  static renderMobileCounts(source, target) {
    const targetFacetsList = target.querySelector('.mobile-facets__list');
    const sourceFacetsList = source.querySelector('.mobile-facets__list');

    if (sourceFacetsList && targetFacetsList) {
      targetFacetsList.outerHTML = sourceFacetsList.outerHTML;
    }
  }

  static updateURLHash(searchParams) {
    history.pushState({ searchParams }, '', `${window.location.pathname}${searchParams && '?'.concat(searchParams)}`);
  }

  static getSections() {
    return [
      {
        section: document.getElementById('product-grid').dataset.id,
      },
    ];
  }

  createSearchParams(form) {
    const formData = new FormData(form);
    return new URLSearchParams(formData).toString();
  }

  onSubmitForm(searchParams, event) {
    FacetFiltersForm.renderPage(searchParams, event);
  }

  onSubmitHandler(event) {
    event.preventDefault();
    const sortFilterForms = document.querySelectorAll('facet-filters-form form');
    if (event.srcElement.className == 'mobile-facets__checkbox') {
      const searchParams = this.createSearchParams(event.target.closest('form'));
      this.onSubmitForm(searchParams, event);
    } else {
      const forms = [];
      const isMobile = event.target.closest('form').id === 'FacetFiltersFormMobile';

      sortFilterForms.forEach((form) => {
        if (!isMobile) {
          if (form.id === 'FacetSortForm' || form.id === 'FacetFiltersForm' || form.id === 'FacetSortDrawerForm') {
            forms.push(this.createSearchParams(form));
          }
        } else if (form.id === 'FacetFiltersFormMobile') {
          forms.push(this.createSearchParams(form));
        }
      });
      this.onSubmitForm(forms.join('&'), event);
    }
  }

  onActiveFilterClick(event) {
    event.preventDefault();
    FacetFiltersForm.toggleActiveFacets();
    const url =
      event.currentTarget.href.indexOf('?') == -1
        ? ''
        : event.currentTarget.href.slice(event.currentTarget.href.indexOf('?') + 1);
    FacetFiltersForm.renderPage(url);
  }
}

FacetFiltersForm.filterData = [];
FacetFiltersForm.searchParamsInitial = window.location.search.slice(1);
FacetFiltersForm.searchParamsPrev = window.location.search.slice(1);
customElements.define('facet-filters-form', FacetFiltersForm);
FacetFiltersForm.setListeners();



class FacetRemove extends HTMLElement {
  constructor() {
    super();
    const facetLink = this.querySelector('a');
    facetLink.setAttribute('role', 'button');
    facetLink.addEventListener('click', (event) => {
      setTimeout(() => {
        const allCheckbox = document.querySelectorAll('input[type="checkbox"]');
        const windowURL = window.location.href;

        allCheckbox.forEach((checkbox) => {
          if (!windowURL.includes(checkbox.value)) {
            checkbox.checked = false;
            checkbox.classList.remove('active-value');
          }
        });
      }, 300); 

      this.closeFilter(event);
    });
    facetLink.addEventListener('keyup', (event) => {
      event.preventDefault();
      if (event.code.toUpperCase() === 'SPACE') this.closeFilter(event);
    });
  }

  closeFilter(event) {
    event.preventDefault();
    
    // Check if this is a price filter remove button
    const isPriceFilter = this.querySelector('.price-filter-remove')
    
    if (isPriceFilter) {
      this.resetPriceFilter();
    }
    
    // Continue with normal filter removal
    const form = this.closest('facet-filters-form') || document.querySelector('facet-filters-form');
    if (form && typeof form.onActiveFilterClick === 'function') {
      form.onActiveFilterClick(event);
    }
  }
  
  resetPriceFilter() {
    // Find the price range element
    const priceRange = document.querySelector('.price-range');
    
    if (!priceRange) {
      console.log('Price range element not found');
      return;
    }
    
    const slider = priceRange.querySelector('.price-range__slider');
    const minRange = parseFloat(priceRange.dataset.min) || 0;
    const maxRange = parseFloat(priceRange.dataset.max) || 100;
    
    if (slider && slider.noUiSlider) {
      // Reset slider to full range
      slider.noUiSlider.set([minRange, maxRange]);
      
      // Update hidden inputs
      const inputMin = priceRange.querySelector('.price-range__input-min');
      const inputMax = priceRange.querySelector('.price-range__input-max');
      
      if (inputMin) inputMin.value = minRange;
      if (inputMax) inputMax.value = maxRange;
      
      console.log('Price range reset to:', minRange, '-', maxRange);
    }
  }
}

customElements.define('facet-remove', FacetRemove);

class FacetValues extends HTMLElement {
  connectedCallback() {
    const checkbox = this.querySelector('input[type="checkbox"]');
    if (!checkbox) return;

    // toggle active class
    checkbox.addEventListener('click', () => {
      checkbox.classList.toggle('active-value', checkbox.checked);
    });
  }
}

customElements.define('facet-values', FacetValues);





class sortByDrawer extends HTMLElement {
  constructor() {
    super();
    this._onDocumentClick = null;
    this._onOpenerClick = null;
    this._onKeydown = null;
  }

  connectedCallback() {
    this.opener = this.querySelector(".sort-by-button");
    this.wrapper = this.querySelector(".sort-by-wrappper");
    this.close = this.querySelector(".sort-close");
    this.close.addEventListener("click", () =>{
          this.wrapper.classList.remove("active");
    })
    if (!this.opener || !this.wrapper) return;
    this._onOpenerClick = (e) => {
      e.preventDefault();
      this.wrapper.classList.toggle("active");
    };
    this.opener.addEventListener("click", this._onOpenerClick);
    this._onDocumentClick = (e) => {
      if (this.wrapper.contains(e.target)) return;
      if (this.opener.contains(e.target)) return;
      this.wrapper.classList.remove("active");
    };
    document.addEventListener("click", this._onDocumentClick);
    this._onKeydown = (e) => {
      if (e.key === "Escape") {
        this.wrapper.classList.remove("active");
      }
    };
    document.addEventListener("keydown", this._onKeydown);
  }

  disconnectedCallback() {
    if (this.opener && this._onOpenerClick) {
      this.opener.removeEventListener("click", this._onOpenerClick);
    }
    if (this._onDocumentClick) {
      document.removeEventListener("click", this._onDocumentClick);
    }
    if (this._onKeydown) {
      document.removeEventListener("keydown", this._onKeydown);
    }
  }
}

customElements.define("sort-by-drawer", sortByDrawer);


// ============================================
// COMPLETE price-range.js FILE
// ============================================

// Initialize theme object
window.theme = window.theme || {};
theme.settings = theme.settings || {};
theme.settings.moneyFormat = theme.settings.moneyFormat || '{{amount}}';

// Currency formatter - formats as whole numbers with currency symbol
theme.Currency = {
  formatMoney: function(cents, format) {
    if (typeof cents === 'string') {
      cents = cents.replace(/,/g, '');
    }
    
    let value = parseFloat(cents);
    
    // If it's already in cents (large number), convert to dollars
    if (value > 1000) {
      value = value / 100;
    }
    
    // Round to whole number (no decimals)
    const money = Math.round(value);
    
    if (!format) {
      format = '{{amount}}';
    }
    
    // Get currency symbol from cart or default to $
    const currencySymbol = window.Shopify && window.Shopify.currency && window.Shopify.currency.active 
      ? this.getCurrencySymbol(window.Shopify.currency.active)
      : '$';
    
    // Format with thousands separator and currency symbol
    const formattedMoney = money.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    
    return format.replace('{{amount}}', currencySymbol + formattedMoney);
  },
  
  getCurrencySymbol: function(currency) {
    const symbols = {
      'USD': '$',
      'EUR': '€',
      'GBP': '£',
      'CAD': 'CA$',
      'AUD': 'A$',
      'JPY': '¥',
      'INR': '₹',
      'CNY': '¥',
      'CHF': 'CHF',
      'SEK': 'kr',
      'NZD': 'NZ$',
      'MXN': 'MX$',
      'SGD': 'S$',
      'HKD': 'HK$',
      'NOK': 'kr',
      'KRW': '₩',
      'TRY': '₺',
      'RUB': '₽',
      'BRL': 'R$',
      'ZAR': 'R',
      'DKK': 'kr',
      'PLN': 'zł',
      'THB': '฿',
      'MYR': 'RM'
    };
    return symbols[currency] || '$';
  }
};

// Check if noUiSlider is available
if (typeof noUiSlider === 'undefined') {
  console.error('noUiSlider library is not loaded. Please add the CDN link to theme.liquid');
}

// Price Range Component
theme.PriceRange = (function () {
  var defaultStep = 1;
  var selectors = {
    priceRange: '.price-range',
    priceRangeSlider: '.price-range__slider',
    priceRangeInputMin: '.price-range__input-min',
    priceRangeInputMax: '.price-range__input-max',
    priceRangeDisplayMin: '.price-range__display-min',
    priceRangeDisplayMax: '.price-range__display-max',
  };

  function PriceRange(container, options) {
    options = options || {};
    this.container = container;
    this.onChange = options.onChange;
    this.onUpdate = options.onUpdate;
    this.sliderOptions = options.sliderOptions || {};

    return this.init();
  }

  PriceRange.prototype = Object.assign({}, PriceRange.prototype, {
    init: function () {
      if (!this.container.classList.contains('price-range')) {
        console.error('You must instantiate PriceRange with a valid container');
        return null;
      }

      this.formEl = this.container.closest('form');
      this.sliderEl = this.container.querySelector(selectors.priceRangeSlider);
      this.inputMinEl = this.container.querySelector(selectors.priceRangeInputMin);
      this.inputMaxEl = this.container.querySelector(selectors.priceRangeInputMax);
      this.displayMinEl = this.container.querySelector(selectors.priceRangeDisplayMin);
      this.displayMaxEl = this.container.querySelector(selectors.priceRangeDisplayMax);

      if (!this.sliderEl) {
        console.error('Price range slider element not found');
        return null;
      }

      this.minRange = parseFloat(this.container.dataset.min) || 0;
      this.minValue = parseFloat(this.container.dataset.minValue) || 0;
      this.maxRange = parseFloat(this.container.dataset.max) || 100;
      this.maxValue = parseFloat(this.container.dataset.maxValue) || this.maxRange;

      console.log('Price Range Init:', {
        minRange: this.minRange,
        maxRange: this.maxRange,
        minValue: this.minValue,
        maxValue: this.maxValue
      });

      return this.createPriceRange();
    },

    createPriceRange: function () {
      if (this.sliderEl && this.sliderEl.noUiSlider && typeof this.sliderEl.noUiSlider.destroy === 'function') {
        this.sliderEl.noUiSlider.destroy();
      }

      if (typeof noUiSlider === 'undefined') {
        console.error('noUiSlider is not defined');
        return null;
      }

      var slider = noUiSlider.create(this.sliderEl, {
        connect: true,
        step: defaultStep,
        start: [this.minValue, this.maxValue],
        range: {
          min: this.minRange,
          max: this.maxRange,
        },
      });

      var self = this;

      slider.on('update', function(values) {
        self.displayMinEl.innerHTML = theme.Currency.formatMoney(
          values[0],
          theme.settings.moneyFormat
        );
        self.displayMaxEl.innerHTML = theme.Currency.formatMoney(
          values[1],
          theme.settings.moneyFormat
        );

        if (self.onUpdate) {
          self.onUpdate(values);
        }
      });

      slider.on('change', function(values) {
        self.inputMinEl.value = values[0];
        self.inputMaxEl.value = values[1];

        if (self.onChange) {
          var formData = new FormData(self.formEl);
          self.onChange(formData);
        }
    
        if (self.formEl) {
          setTimeout(function() {
            if (typeof self.formEl.onFilterChange === 'function') {
              self.formEl.onFilterChange();
            } else {
              var submitEvent = new Event('input', { bubbles: true });
              self.inputMinEl.dispatchEvent(submitEvent);
            }
          }, 300);
        }
      });

      return slider;
    },
  });

  return PriceRange;
})();

function initAllPriceRanges() {
  var priceRanges = document.querySelectorAll('.price-range');
  
  if (priceRanges.length === 0) {
    console.log('No price range elements found');
    return;
  }

  priceRanges.forEach(function(priceRangeEl) {
    if (!priceRangeEl.dataset.initialized) {
      try {
        new theme.PriceRange(priceRangeEl, {
          onChange: function(formData) {
            var form = priceRangeEl.closest('form');
            if (form) {
              if (form.tagName === 'FACET-FILTERS-FORM') {
                form.onActiveFilterClick && form.onActiveFilterClick();
              }
              var inputMin = priceRangeEl.querySelector('.price-range__input-min');
              if (inputMin) {
                inputMin.dispatchEvent(new Event('change', { bubbles: true }));
              }
              if (form.requestSubmit) {
                form.requestSubmit();
              } else {
                form.submit();
              }
            }
          }
        });
        priceRangeEl.dataset.initialized = 'true';
        console.log('Price range initialized successfully');
      } catch (error) {
        console.error('Failed to initialize price range:', error);
      }
    }
  });
}

// Run on page load
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initAllPriceRanges);
} else {
  initAllPriceRanges();
}

// Also run when filters are updated (for AJAX-loaded content)
document.addEventListener('shopify:section:load', initAllPriceRanges);
document.addEventListener('shopify:section:reorder', initAllPriceRanges);

// Export for potential use in other scripts
if (typeof module !== 'undefined' && module.exports) {
  module.exports = theme.PriceRange;
}