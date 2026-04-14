// Announcement bar scrolling height & Header height

const announcementBar = document.querySelector(".announcement-bar-section");

function updateVisibleHeight() {
  if (!announcementBar) return; // Safety: don't crash if bar doesn't exist
  const rect = announcementBar.getBoundingClientRect();
  const visible = Math.max(
    0,
    Math.min(rect.bottom, window.innerHeight) - Math.max(rect.top, 0)
  );
  document.documentElement.style.setProperty('--announcement-visible-height', Math.round(visible) + "px");
}

window.addEventListener("scroll", updateVisibleHeight);
window.addEventListener("resize", updateVisibleHeight);
updateVisibleHeight();

// const header_heigt = document.querySelector(".section-header");
// if (header_heigt) { // Safety: don't crash if header doesn't exist
//   const headerHeight = header_heigt.offsetHeight;
//   document.documentElement.style.setProperty('--header-height', headerHeight + "px");
// }
document.documentElement.style.setProperty('--window-scroll-height', window.scrollY + "px");
window.addEventListener("scroll", () => {
  document.documentElement.style.setProperty('--window-scroll-height', window.scrollY + "px");
});
window.addEventListener('load', () => {
  const SearchBarLayout = document.querySelector('.inline-searchbar-header-layout');
  if (SearchBarLayout) {
    const height = SearchBarLayout.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--searchbar-header-height', height + 'px');
  }
  const header_heigt = document.querySelector(".section-header");
  if (header_heigt) { // Safety: don't crash if header doesn't exist
    const headerHeight = header_heigt.getBoundingClientRect().height;
    document.documentElement.style.setProperty('--header-height', headerHeight + "px");
  }
});
class CollectionCarousel extends HTMLElement {
  constructor() {
    super();
			
			var swiper = new Swiper(".js-collection-carousel", {
				slidesPerView: 1.19561,
				spaceBetween:10,
				slidesOffsetAfter:30,
        a11y: true,
				breakpoints: {
					769: {
						slidesPerView: 3,
						spaceBetween:  20,
						slidesOffsetAfter: 0,
					},
					1024: {
						slidesPerView: 4.1126,
						spaceBetween: 20,
						slidesOffsetAfter:0,
					}
				}
			});

  }
}

customElements.define('collection-carousel', CollectionCarousel);


class CollectionGridCarousel extends HTMLElement {
  constructor() {
    super();
			
			var swiper = new Swiper(".js-collection-grid-carousel", {
				slidesPerView: 1,
        a11y: true,
        pagination: {
          el: ".swiper-pagination",
        },
				breakpoints: {
					769: {
						slidesPerView:  3,
					},
					1024: {
						slidesPerView: 4,
					}
				}
			});

  }
}

customElements.define('collection-grid-carousel', CollectionGridCarousel);

class textWithContent extends HTMLElement {
  constructor() {
    super();
			
			var swiper = new Swiper(".js-text-with-content", {
        slidesPerView: 1.2,
        spaceBetween: 10,
        slidesOffsetAfter:30,
        a11y: true,
        pagination: {
          el: ".swiper-pagination",
        },
				breakpoints: {
					769: {
						slidesPerView:  2,
            spaceBetween: 20,
            slidesOffsetAfter:0,
					},
					1024: {
						slidesPerView: 3.0866,
            spaceBetween: 20,
					}
				}
			});
  }
}

customElements.define('text-with-content', textWithContent);

class CollectionProductCarousel extends HTMLElement {
  constructor() {
    super();
			
			var swiper = new Swiper(".js-collection-product-carousel", {
				slidesPerView: 1.375,
				spaceBetween:10,
				slidesOffsetAfter:30,
        a11y: true,
				breakpoints: {
					769: {
						slidesPerView:  4,
						spaceBetween:  20,
						slidesOffsetAfter: 40,
					},
					1024: {
						slidesPerView: 5.034,
						spaceBetween:20,
						slidesOffsetAfter:40,
					}
				}
			});

  }
}

customElements.define('collection-product-carousel', CollectionProductCarousel);


class IamgeWithTextCarousel extends HTMLElement {
  constructor() {
    super();

    const autoRotate = this.dataset.autoRotate === 'true';
    const rotationSpeed = (parseInt(this.dataset.speed) || 5) * 1000;

    const autoplayConfig = autoRotate ? {
      delay: rotationSpeed,
      disableOnInteraction: false,
    } : false;
    const imageSwiper = new Swiper(this.querySelector(".js-iamge-carousel"), {
      slidesPerView: 1,
      spaceBetween: 20,
      a11y: true,
      loop: true,
      pagination: {
        el: this.querySelector(".swiper-pagination.image-pagination"),
        clickable: true,
      },
      autoplay: autoplayConfig
    });

    const contentSwiper = new Swiper(this.querySelector(".js-content-carousel"), {
      slidesPerView: 1,
      a11y: true,
      loop: true,
    });

    imageSwiper.controller.control = contentSwiper;
    contentSwiper.controller.control = imageSwiper;
  }
}

customElements.define('image-and-text-carousel', IamgeWithTextCarousel);

class AnimateAccordion extends HTMLElement {
  constructor() {
    super();

    this.details = this.querySelector('details');
    this.summary = this.querySelector('summary');
    this.content = this.querySelector('.details-content');

    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;
		this.init();
  }

  init() {
    this.summary.addEventListener('click', (e) => this.onClick(e));
  }

  onClick(e) {
    e.preventDefault();
    this.content.style.overflow = 'hidden';

    if (this.isClosing || !this.details.open) {
      this.closeOtherAccordions();
      this.open();
    } else if (this.isExpanding || this.details.open) {
      this.shrink();
    }
  }

  closeOtherAccordions() {
    document.querySelectorAll('acordion-animated').forEach((accordion) => {
      if (accordion !== this && accordion.details.open) {
        accordion.shrink();
      }
    });
  }

  shrink() {
    this.isClosing = true;

    const startHeight = `${this.content.offsetHeight}px`;
    const endHeight = `0px`;

    if (this.animation) {
      this.animation.cancel();
    }

    this.animation = this.content.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 400,
        easing: 'ease',
      }
    );

    this.animation.onfinish = () => this.onAnimationFinish(false);
    this.animation.oncancel = () => (this.isClosing = false);
  }

  open() {
    this.details.open = true;
    window.requestAnimationFrame(() => this.expand());
  }

  expand() {
    this.isExpanding = true;

    const startHeight = `0px`;
    const endHeight = `${this.content.offsetHeight}px`;

    if (this.animation) {
      this.animation.cancel();
    }

    this.animation = this.content.animate(
      {
        height: [startHeight, endHeight],
      },
      {
        duration: 400,
        easing: 'ease-out',
      }
    );

    this.animation.onfinish = () => this.onAnimationFinish(true);
    this.animation.oncancel = () => (this.isExpanding = false);
  }

  onAnimationFinish(open) {
    this.details.open = open;
    this.animation = null;
    this.isClosing = false;
    this.isExpanding = false;

    this.content.style.height = '';
    this.content.style.overflow = '';
  }
}

customElements.define('acordion-animated', AnimateAccordion);


class ShopTheLook extends HTMLElement {
  constructor() {
    super();
      const backgroundColor = this.getAttribute("data-svg-color");
      const backgroundSvg = this.querySelector(".shop-the-look-products");
      const svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='692' height='751' viewBox='0 0 692 751' fill='none'>
          <path d='M8.58086 191.566C-39.7832 -3.21582 139.375 -23.0423 268.669 35.7717C344.105 66.019 393.646 -28.0478 487.097 9.49311C580.548 47.034 468.52 165.288 611.511 225.979C754.503 286.67 684.696 558.215 559.719 561.344C434.742 564.472 469.082 610.147 344.105 714.636C219.128 819.124 8.58115 673.966 60.9364 520.674C113.292 367.383 60.9358 402.421 8.58086 191.566Z' stroke='${backgroundColor}'/>
          <path d='M277.561 343.154C271.981 324.603 298.119 294.674 319.136 307.446C338.381 319.143 357.98 311.254 370.928 316.469C405.015 330.196 392.477 337.463 407.715 353.766C426.257 373.605 435.105 425.556 392.477 425.556C357.417 425.556 367.907 444.481 341.654 452.867C315.401 461.253 285.628 446.979 285.628 409.398C285.628 395.286 286.856 374.053 277.561 343.154Z' stroke='${backgroundColor}'/>
          <path d='M33.0304 204.401C-11.4442 25.6395 153.803 4.89465 273.253 59.5231C343.582 88.0839 390.4 1.85154 476.533 36.4536C564.587 71.8296 461.603 179.994 592.981 236.649C724.659 293.627 662.003 545.209 544.512 548.053C427.709 550.897 459.881 594.14 343.879 689.892C227.877 785.644 33.764 652.385 81.3596 509.612C128.955 368.973 81.4707 398.895 33.0304 204.401Z' stroke='${backgroundColor}'/>
          <path d='M57.4791 217.235C16.8939 54.4953 168.23 32.8321 277.837 83.275C343.057 110.149 387.154 31.7513 465.968 63.4147C548.626 96.6258 454.686 194.7 574.45 247.321C694.815 300.584 639.308 532.203 529.304 534.763C420.675 537.322 450.679 578.134 343.652 665.149C236.625 752.165 58.9459 630.804 101.782 498.55C144.618 370.564 102.005 395.371 57.4791 217.235Z' stroke='${backgroundColor}'/>
          <path d='M81.9289 230.072C45.2331 83.3524 182.659 60.7707 282.422 107.028C342.534 132.216 383.908 61.6524 455.404 90.3769C532.665 121.423 447.77 209.408 555.92 257.993C664.971 307.543 616.615 519.199 514.097 521.474C413.643 523.749 441.479 562.128 343.426 640.407C245.374 718.686 84.129 609.224 122.206 487.489C160.282 372.156 122.54 391.847 81.9289 230.072Z' stroke='${backgroundColor}'/>
          <path d='M106.379 242.908C73.5726 112.21 197.087 88.7096 287.007 130.781C342.011 154.283 380.663 91.5536 444.841 117.339C516.705 146.221 440.855 224.116 537.39 268.666C635.128 314.502 593.923 506.194 498.89 508.185C406.61 510.176 432.278 546.123 343.201 615.666C254.123 685.208 109.312 587.644 142.629 476.429C175.946 373.748 143.075 388.324 106.379 242.908Z' stroke='${backgroundColor}'/>
          <path d='M130.829 256.395C101.912 141.717 211.516 117.299 291.593 155.185C341.488 177 377.418 122.105 434.277 144.952C500.745 171.669 433.939 239.474 518.861 279.989C605.285 322.111 571.23 493.84 483.684 495.547C399.578 497.253 423.078 530.769 342.975 591.575C262.873 652.38 134.496 566.715 163.053 466.019C191.611 375.991 163.611 385.451 130.829 256.395Z' stroke='${backgroundColor}'/>
          <path d='M155.279 270.651C130.251 171.995 225.944 146.658 296.177 180.358C340.965 200.487 374.173 153.427 423.713 173.335C484.784 197.887 427.023 255.602 500.331 292.081C575.441 330.49 548.537 482.256 468.477 483.678C392.546 485.1 413.877 516.184 342.749 568.253C271.622 620.322 159.679 546.555 183.477 456.379C207.275 379.003 184.146 383.348 155.279 270.651Z' stroke='${backgroundColor}'/>
          <path d='M179.731 284.951C158.593 202.316 240.375 176.06 300.765 205.575C340.444 224.017 370.93 184.791 413.152 201.761C468.826 224.148 420.109 271.773 481.803 304.218C545.6 338.912 525.846 470.715 453.273 471.853C385.516 472.99 404.679 501.643 342.526 544.975C280.373 588.307 184.864 526.439 203.903 446.782C222.941 382.059 204.684 381.288 179.731 284.951Z' stroke='${backgroundColor}'/>
          <path d='M204.183 299.31C186.934 232.696 254.804 205.522 305.351 230.852C339.922 247.607 367.686 216.216 402.59 230.246C452.867 250.468 413.195 288.004 463.275 316.413C515.758 347.394 503.155 459.234 438.068 460.087C378.485 460.94 395.48 487.161 342.302 521.757C289.124 556.352 210.049 506.383 224.328 437.244C238.606 385.174 225.22 379.288 204.183 299.31Z' stroke='${backgroundColor}'/>
          <path d='M228.636 313.763C215.276 263.169 269.236 235.077 309.94 256.221C339.402 271.29 364.444 247.733 392.029 258.825C436.91 276.882 406.282 304.328 444.748 328.702C485.918 355.969 480.465 447.846 422.864 448.414C371.456 448.983 386.282 472.772 342.079 498.631C297.876 524.49 235.235 486.419 244.754 427.8C254.274 388.382 245.759 377.381 228.636 313.763Z' stroke='${backgroundColor}'/>
          <path d='M253.094 328.351C243.624 293.778 283.673 264.768 314.533 281.726C338.887 295.109 361.208 279.386 381.474 287.539C420.958 303.432 399.375 320.788 426.227 341.127C456.083 364.68 457.781 436.593 407.666 436.878C364.432 437.162 377.09 458.519 341.862 475.642C306.634 492.764 260.427 466.591 265.187 418.492C269.946 391.726 266.303 375.61 253.094 328.351Z' stroke='${backgroundColor}'/>
      </svg>`;

      const encodedSvg = encodeURIComponent(svgContent);
      backgroundSvg.style.backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;

      const swiperNextBtn = this.querySelector(".shop-look-slider-buttons .next-buttton");
      const swiperprevBtn = this.querySelector(".shop-look-slider-buttons .prev-buttton");

      const mainSliderNext =  this.querySelector(".js-shop-look-product-carousel .swiper-button-next");
      const mainSliderPrev =  this.querySelector(".js-shop-look-product-carousel .swiper-button-prev");

        swiperNextBtn.addEventListener("click", () => {
            mainSliderNext.click(); 
        });

        swiperprevBtn.addEventListener("click", () => {
            mainSliderPrev.click(); 
        });
        
      
      var swiper = new Swiper(".js-shop-look-product-carousel", {
        slidesPerView: "auto",
        spaceBetween: 20,
        a11y: true,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next.shop-the-look-next",
          prevEl: ".swiper-button-prev.shop-the-look-prev",
        },

        pagination: {
          el: ".swiper-pagination.shop-look-pagination",
          clickable: true,
          renderBullet: function (index, className) {
            return '<span class="' + className + '" data-index="' + (index + 1) + '">' + "</span>";
          },
        },
      });

        const allSwiperBullets = this.querySelectorAll(".swiper-pagination.shop-look-pagination .swiper-pagination-bullet");
        const imageSwiperBullets = this.querySelectorAll(".shop-look-dots .dot");

        allSwiperBullets.forEach(bullet => {
          const bulletIndex = bullet.getAttribute("data-index");
          imageSwiperBullets.forEach(dot => {
            const dotIndex = dot.getAttribute("data-dot-index");
            if ( bullet.classList.contains("swiper-pagination-bullet-active") && bulletIndex == dotIndex ) { 
              dot.classList.add("active"); 
            }
            dot.addEventListener("click", e => {
              const clickedIndex = e.currentTarget.getAttribute("data-dot-index");
              if (clickedIndex == bulletIndex) {
                bullet.click();
              }
            });
          });
        });


        swiper.on('slideChange', () => {
          const activeIndex = swiper.realIndex + 1;
          imageSwiperBullets.forEach(dot => dot.classList.remove("active"));
          const activeDot = this.querySelector(`.shop-look-dots .dot[data-dot-index="${activeIndex}"]`);
          if (activeDot) activeDot.classList.add("active");
        });


      const openerButtons = this.querySelectorAll(".shop-the-look__opener");
      const mainProductPart = this.querySelector(".shop-the-look-products");
      const closeButton = this.querySelector(".pop-up-close");

      const mediaQuery = window.matchMedia('(max-width: 768px)');

      const enableMobileBehaviour = () => {
        if (!openerButtons.length || !mainProductPart) return;

        openerButtons.forEach((openerButton) => {
          openerButton.addEventListener('click', openHandler);
        });

        mainProductPart.addEventListener('click', stopPropagationHandler);
        document.addEventListener('click', closeHandler);

        if (closeButton) {
          closeButton.addEventListener('click', closeHandler);
        }
      };

      const disableMobileBehaviour = () => {
        openerButtons.forEach((openerButton) => {
          openerButton.removeEventListener('click', openHandler);
        });

        mainProductPart.removeEventListener('click', stopPropagationHandler);
        document.removeEventListener('click', closeHandler);

        if (closeButton) {
          closeButton.removeEventListener('click', closeHandler);
        }

        mainProductPart.classList.remove('active');
      };

      const openHandler = (e) => {
        e.stopPropagation();
        mainProductPart.classList.toggle('active');
      };

      const stopPropagationHandler = (e) => {
        e.stopPropagation();
      };

      const closeHandler = () => {
        mainProductPart.classList.remove('active');
      };

      if (mediaQuery.matches) {
        enableMobileBehaviour();
      }

      mediaQuery.addEventListener('change', (e) => {
        if (e.matches) {
          enableMobileBehaviour();
        } else {
          disableMobileBehaviour();
        }
      });

  }
}

customElements.define('shop-the-look', ShopTheLook);

class ShopTheLookV2 extends HTMLElement {
  constructor() {
    super();
      const backgroundColor = this.getAttribute("data-svg-color");
      const backgroundSvg = this.querySelector(".shop-the-look-products");
      const svgContent = `<svg xmlns='http://www.w3.org/2000/svg' width='692' height='751' viewBox='0 0 692 751' fill='none'>
          <path d='M8.58086 191.566C-39.7832 -3.21582 139.375 -23.0423 268.669 35.7717C344.105 66.019 393.646 -28.0478 487.097 9.49311C580.548 47.034 468.52 165.288 611.511 225.979C754.503 286.67 684.696 558.215 559.719 561.344C434.742 564.472 469.082 610.147 344.105 714.636C219.128 819.124 8.58115 673.966 60.9364 520.674C113.292 367.383 60.9358 402.421 8.58086 191.566Z' stroke='${backgroundColor}'/>
          <path d='M277.561 343.154C271.981 324.603 298.119 294.674 319.136 307.446C338.381 319.143 357.98 311.254 370.928 316.469C405.015 330.196 392.477 337.463 407.715 353.766C426.257 373.605 435.105 425.556 392.477 425.556C357.417 425.556 367.907 444.481 341.654 452.867C315.401 461.253 285.628 446.979 285.628 409.398C285.628 395.286 286.856 374.053 277.561 343.154Z' stroke='${backgroundColor}'/>
          <path d='M33.0304 204.401C-11.4442 25.6395 153.803 4.89465 273.253 59.5231C343.582 88.0839 390.4 1.85154 476.533 36.4536C564.587 71.8296 461.603 179.994 592.981 236.649C724.659 293.627 662.003 545.209 544.512 548.053C427.709 550.897 459.881 594.14 343.879 689.892C227.877 785.644 33.764 652.385 81.3596 509.612C128.955 368.973 81.4707 398.895 33.0304 204.401Z' stroke='${backgroundColor}'/>
          <path d='M57.4791 217.235C16.8939 54.4953 168.23 32.8321 277.837 83.275C343.057 110.149 387.154 31.7513 465.968 63.4147C548.626 96.6258 454.686 194.7 574.45 247.321C694.815 300.584 639.308 532.203 529.304 534.763C420.675 537.322 450.679 578.134 343.652 665.149C236.625 752.165 58.9459 630.804 101.782 498.55C144.618 370.564 102.005 395.371 57.4791 217.235Z' stroke='${backgroundColor}'/>
          <path d='M81.9289 230.072C45.2331 83.3524 182.659 60.7707 282.422 107.028C342.534 132.216 383.908 61.6524 455.404 90.3769C532.665 121.423 447.77 209.408 555.92 257.993C664.971 307.543 616.615 519.199 514.097 521.474C413.643 523.749 441.479 562.128 343.426 640.407C245.374 718.686 84.129 609.224 122.206 487.489C160.282 372.156 122.54 391.847 81.9289 230.072Z' stroke='${backgroundColor}'/>
          <path d='M106.379 242.908C73.5726 112.21 197.087 88.7096 287.007 130.781C342.011 154.283 380.663 91.5536 444.841 117.339C516.705 146.221 440.855 224.116 537.39 268.666C635.128 314.502 593.923 506.194 498.89 508.185C406.61 510.176 432.278 546.123 343.201 615.666C254.123 685.208 109.312 587.644 142.629 476.429C175.946 373.748 143.075 388.324 106.379 242.908Z' stroke='${backgroundColor}'/>
          <path d='M130.829 256.395C101.912 141.717 211.516 117.299 291.593 155.185C341.488 177 377.418 122.105 434.277 144.952C500.745 171.669 433.939 239.474 518.861 279.989C605.285 322.111 571.23 493.84 483.684 495.547C399.578 497.253 423.078 530.769 342.975 591.575C262.873 652.38 134.496 566.715 163.053 466.019C191.611 375.991 163.611 385.451 130.829 256.395Z' stroke='${backgroundColor}'/>
          <path d='M155.279 270.651C130.251 171.995 225.944 146.658 296.177 180.358C340.965 200.487 374.173 153.427 423.713 173.335C484.784 197.887 427.023 255.602 500.331 292.081C575.441 330.49 548.537 482.256 468.477 483.678C392.546 485.1 413.877 516.184 342.749 568.253C271.622 620.322 159.679 546.555 183.477 456.379C207.275 379.003 184.146 383.348 155.279 270.651Z' stroke='${backgroundColor}'/>
          <path d='M179.731 284.951C158.593 202.316 240.375 176.06 300.765 205.575C340.444 224.017 370.93 184.791 413.152 201.761C468.826 224.148 420.109 271.773 481.803 304.218C545.6 338.912 525.846 470.715 453.273 471.853C385.516 472.99 404.679 501.643 342.526 544.975C280.373 588.307 184.864 526.439 203.903 446.782C222.941 382.059 204.684 381.288 179.731 284.951Z' stroke='${backgroundColor}'/>
          <path d='M204.183 299.31C186.934 232.696 254.804 205.522 305.351 230.852C339.922 247.607 367.686 216.216 402.59 230.246C452.867 250.468 413.195 288.004 463.275 316.413C515.758 347.394 503.155 459.234 438.068 460.087C378.485 460.94 395.48 487.161 342.302 521.757C289.124 556.352 210.049 506.383 224.328 437.244C238.606 385.174 225.22 379.288 204.183 299.31Z' stroke='${backgroundColor}'/>
          <path d='M228.636 313.763C215.276 263.169 269.236 235.077 309.94 256.221C339.402 271.29 364.444 247.733 392.029 258.825C436.91 276.882 406.282 304.328 444.748 328.702C485.918 355.969 480.465 447.846 422.864 448.414C371.456 448.983 386.282 472.772 342.079 498.631C297.876 524.49 235.235 486.419 244.754 427.8C254.274 388.382 245.759 377.381 228.636 313.763Z' stroke='${backgroundColor}'/>
          <path d='M253.094 328.351C243.624 293.778 283.673 264.768 314.533 281.726C338.887 295.109 361.208 279.386 381.474 287.539C420.958 303.432 399.375 320.788 426.227 341.127C456.083 364.68 457.781 436.593 407.666 436.878C364.432 437.162 377.09 458.519 341.862 475.642C306.634 492.764 260.427 466.591 265.187 418.492C269.946 391.726 266.303 375.61 253.094 328.351Z' stroke='${backgroundColor}'/>
      </svg>`;
    
      const encodedSvg = encodeURIComponent(svgContent);
      backgroundSvg.style.backgroundImage = `url("data:image/svg+xml,${encodedSvg}")`;

      
      const swiperNextBtn = this.querySelector(".shop-look-slider-buttons .next-buttton");
      const swiperprevBtn = this.querySelector(".shop-look-slider-buttons .prev-buttton");

      const mainSliderNext =  this.querySelector(".js-shop-look-product-carousel .swiper-button-next");
      const mainSliderPrev =  this.querySelector(".js-shop-look-product-carousel .swiper-button-prev");

        swiperNextBtn.addEventListener("click", () => {
            mainSliderNext.click(); 
        });

        swiperprevBtn.addEventListener("click", () => {
            mainSliderPrev.click(); 
        });

      var imageswiper = new Swiper(".js-shop-look-image-carousel", {
        slidesPerView: "auto",
        spaceBetween: 20,
        a11y: true,
        loop: true,
        pagination: {
          el: ".swiper-pagination.shop-look-image-pagination",
          clickable: true,
        },
         navigation: {
          nextEl: ".swiper-button-next.shop-the-look-image-next",
          prevEl: ".swiper-button-prev.shop-the-look-image-prev",
           clickable: true,
        }
        
      });
      
      var productswiper = new Swiper(".js-shop-look-product-carousel", {
        slidesPerView: "auto",
        spaceBetween: 20,
        a11y: true,
        loop: true,
        navigation: {
          nextEl: ".swiper-button-next.shop-the-look-next",
          prevEl: ".swiper-button-prev.shop-the-look-prev",
        }
      });

      imageswiper.controller.control = productswiper;
      productswiper.controller.control = imageswiper;
        


        const openerButtons = this.querySelectorAll('.shop-the-look__opener');
        const mainProductPart = this.querySelector('.shop-the-look-products');
        const closeButton = this.querySelector(".pop-up-close");

        if (openerButtons.length && mainProductPart) {
          openerButtons.forEach((openerButton) => {
            openerButton.addEventListener('click', (e) => {
              e.stopPropagation();
              mainProductPart.classList.toggle('active');
            });
          });

          mainProductPart.addEventListener('click', (e) => {
            e.stopPropagation();
          });

          document.addEventListener('click', () => {
            mainProductPart.classList.remove('active');
          });
          
          closeButton.addEventListener('click', () => {
            mainProductPart.classList.remove('active');
          });

        }

  }
}

customElements.define('shop-the-look-v2', ShopTheLookV2);

class LoadMoreProducts extends HTMLElement {
  constructor() {
    super();
    this.button = this.querySelector('#load-more-btn');
    this.gridId = this.dataset.gridId;
    this.productGrid = document.getElementById(this.gridId);

    this.productsPerPage = parseInt(this.dataset.productsPerPage);
    this.totalItems = parseInt(this.dataset.totalItems);
    this.currentPage = parseInt(this.dataset.currentPage);

    if (this.button && this.productGrid) {
      this.button.addEventListener('click', this.loadMore.bind(this));
    }
  }

  loadMore() {
    const nextPage = this.currentPage + 1;
    
    const url = new URL(window.location.href);
    url.searchParams.set('page', nextPage);

    this._setLoading(true);

    fetch(url.href)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP error! status: ${res.status}`);
        return res.text();
      })
      .then(html => {
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');

        const nextPageLoadMoreBtn = doc.querySelector('#load-more-btn');
        const fetchedGrid = doc.getElementById(this.gridId);
        
        if (!fetchedGrid) {
          throw new Error('Product grid not found in response');
        }

        const newItems = Array.from(fetchedGrid.children);
        
        let appendedCount = 0;

        newItems.forEach(item => {
          // Skip only the load-more container
          if (item.classList.contains('load-more-container')) {
            return;
          }

          // Handle banners - always append them
          if (item.classList.contains('collection-banner')) {
            this.productGrid.appendChild(item.cloneNode(true));
            return;
          }

          // Handle products - check for duplicates
          const productId = item.dataset.productId || item.querySelector('[data-product-id]')?.dataset.productId;
          
          if (productId) {
            const exists = this.productGrid.querySelector(`[data-product-id="${productId}"]`);
            if (!exists) {
              this.productGrid.appendChild(item.cloneNode(true));
              appendedCount++;
            }
          } else {
            this.productGrid.appendChild(item.cloneNode(true));
            appendedCount++;
          }
        });

        console.log('Products appended:', appendedCount);
        console.log('Expected products per page:', this.productsPerPage);

        this.currentPage = nextPage;
        this.dataset.currentPage = this.currentPage;

        const loadedItems = this.productsPerPage * this.currentPage;
        
        if (appendedCount === 0 || 
            !nextPageLoadMoreBtn || 
            appendedCount < this.productsPerPage ||
            loadedItems >= this.totalItems) {
          this.button.style.display = 'none';
          console.log('Last page reached - hiding button');
        } else {
          this._setLoading(false);
        }
      })
      .catch(error => {
        console.error('Error loading products:', error);
        this.button.textContent = 'Error Loading';
        setTimeout(() => this._setLoading(false), 2000);
      });
  }

  _setLoading(isLoading) {
    this.button.disabled = isLoading;
    this.button.textContent = isLoading ? 'Loading...' : 'View More';
  }
}

customElements.define('load-more-products', LoadMoreProducts);

class LoadMoreSearch extends HTMLElement {
  constructor() {
    super();

    this.button = this.querySelector('#load-more-btn');
    this.gridId = this.dataset.grid;
    this.grid = document.getElementById(this.gridId);

    this.currentPage = Number(this.dataset.currentPage);
    this.productsPerPage = Number(this.dataset.productsPerPage);
    this.totalItems = Number(this.dataset.totalItems);
    
    // Calculate total pages
    this.totalPages = Math.ceil(this.totalItems / this.productsPerPage);

    if (this.button && this.grid) {
      this.button.addEventListener('click', () => this.loadMore());
    }
  }

  loadMore() {
    if (this.currentPage >= this.totalPages) return;

    const nextPage = this.currentPage + 1;

    // Preserve search query, filters, etc.
    const params = new URLSearchParams(window.location.search);
    params.set('page', nextPage);

    const url = `${window.location.pathname}?${params.toString()}`;

    this.setLoading(true);

    fetch(url)
      .then(res => res.text())
      .then(html => {
        const doc = new DOMParser().parseFromString(html, 'text/html');
        const newItems = doc.querySelectorAll(`#${this.gridId} > li`);

        if (!newItems.length) {
          this.remove();
          return;
        }

        newItems.forEach(item => this.grid.appendChild(item));

        this.currentPage = nextPage;
        this.dataset.currentPage = nextPage;

        if (this.currentPage >= this.totalPages) {
          this.remove();
        } else {
          this.setLoading(false);
        }
      })
      .catch(err => {
        console.error('Load more failed', err);
        this.setLoading(false);
      });
  }

  setLoading(isLoading) {
    this.button.disabled = isLoading;
    this.button.textContent = isLoading ? 'Loading…' : 'View More';
  }
}

customElements.define('load-more-products-search', LoadMoreSearch);


class AccordianHoverAnimate extends HTMLElement {
  constructor() {
    super();
    this.details = this.querySelector('details');
    this.summary = this.querySelector('summary');
    this.content = this.querySelector('.details-content');
    this.parentContainer = this.closest('.header__inline-menu');

    this.animation = null;
    this.closeTimer = null; 
    
    this.init();
    const DataUrl = this.summary.getAttribute("data-url");
    this.summary.addEventListener("click", ()=> {
        window.location.href = DataUrl;
    })
  }

  init() {
    // 1. Mouse Enter
    this.addEventListener('mouseenter', () => {
      if (this.closeTimer) clearTimeout(this.closeTimer);
      this.onHoverEnter();
    });

    // 2. Mouse Leave with "Safe Zone" check
    this.addEventListener('mouseleave', (event) => {
      // Check if the mouse is moving to something inside the element
      if (event.relatedTarget && this.contains(event.relatedTarget)) return;

      this.closeTimer = setTimeout(() => {
        // Final safety check: Is the mouse physically over the content right now?
        if (!this.isMouseOverElement(event)) {
          this.shrink();
        }
      }, 300); 
    });

    // 3. Prevent click toggle
    this.summary.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
    });
  }

  // Helper function to check if mouse is physically within the element's area
  isMouseOverElement(event) {
    const rect = this.getBoundingClientRect();
    const contentRect = this.content.getBoundingClientRect();
    
    const x = event.clientX;
    const y = event.clientY;

    // Check if mouse is within the main component OR the expanded content
    const isOverMain = (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom);
    const isOverContent = (x >= contentRect.left && x <= contentRect.right && y >= contentRect.top && y <= contentRect.bottom);

    return isOverMain || isOverContent;
  }

  onHoverEnter() {
    this.closeOtherMenus();
    if (this.details.open && !this.classList.contains('is-closing')) return;
    this.open();
  }

  open() {
    if (this.animation) this.animation.cancel();
    this.classList.remove('is-closing');
    this.details.open = true;
    this.content.style.pointerEvents = 'auto';

    this.animation = this.content.animate(
      [
        { opacity: 0, transform: 'translateY(-10px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ],
      { duration: 250, easing: 'ease-out', fill: 'forwards' }
    );
  }

  shrink() {
    if (!this.details.open || this.classList.contains('is-closing')) return;

    this.classList.add('is-closing');
    this.content.style.pointerEvents = 'none';

    if (this.animation) this.animation.cancel();

    this.animation = this.content.animate(
      [
        { opacity: 1, transform: 'translateY(0)' },
        { opacity: 0, transform: 'translateY(-10px)' }
      ],
      { duration: 200, easing: 'ease-in', fill: 'forwards' }
    );

    this.animation.onfinish = () => {
      if (this.classList.contains('is-closing')) {
        this.details.open = false;
        this.classList.remove('is-closing');
        this.animation = null;
      }
    };
  }

  closeOtherMenus() {
    if (!this.parentContainer) return;
    const allMenus = this.parentContainer.querySelectorAll('accordian-hover-animate');
    allMenus.forEach(menu => {
      if (menu !== this && menu.details.open) {
        if (menu.closeTimer) clearTimeout(menu.closeTimer);
        menu.shrink();
      }
    });
  }

  closeAllInHeader() {
    const allMenus = this.parentContainer.querySelectorAll('accordian-hover-animate');
    allMenus.forEach(menu => {
      if (menu.closeTimer) clearTimeout(menu.closeTimer);
      menu.shrink();
    });
  }
}

customElements.define('accordian-hover-animate', AccordianHoverAnimate);



class BannerCarousel extends HTMLElement {
  connectedCallback() {
    const swiperEl = this.querySelector(".js-banner-carousel");
    const container = this.querySelector('.dynamic-progress-container');
    const slides = this.querySelectorAll('.swiper-slide');

    // Get attributes from <banner-carousel>
    const autoPlayAttr = this.getAttribute('data-auto-play') === 'true';
    const autoSpeedAttr = parseInt(this.getAttribute('data-auto-speed')) || 5000;

    // 1. Only create progress bars if autoplay is enabled
    if (autoPlayAttr && container) {
      slides.forEach(() => {
        const bar = document.createElement('div');
        bar.className = 'progress-bar-segment';
        bar.innerHTML = '<div class="progress-bar-fill"></div>';
        container.appendChild(bar);
      });
    }

    const bars = this.querySelectorAll('.progress-bar-segment');

    const swiper = new Swiper(swiperEl, {
      loop: true,
      // 2. Dynamic Autoplay Logic
      autoplay: autoPlayAttr ? {
        delay: autoSpeedAttr,
        disableOnInteraction: false,
      } : false,
      
      pagination: {
        el: this.querySelector(".banner-pagination"),
        clickable: true,
      },

      on: {
        slideChange: function() {
          if (!autoPlayAttr) return;
          
          bars.forEach((bar, index) => {
            bar.classList.toggle('is-passed', index < this.realIndex);
            bar.classList.toggle('is-active', index === this.realIndex);
            
            if (index !== this.realIndex) {
              bar.style.setProperty('--progress', 0);
            }
          });
        },
        autoplayTimeLeft(s, time, progress) {
          if (!autoPlayAttr) return;
          
          const activeBar = bars[this.realIndex];
          if (activeBar) {
            activeBar.style.setProperty("--progress", 1 - progress);
          }
        }
      }
    });
  }
}

if (!customElements.get('banner-carousel')) {
  customElements.define('banner-carousel', BannerCarousel);
}

class CollectionTab extends HTMLElement {
  constructor() {
    super();
    this.collectionTabCarousel();
  }

  connectedCallback() {
    this.buttons = this.querySelectorAll('.collection-tab-btn');
    this.panels = this.querySelectorAll('.collection-tab-panel');

    if (!this.buttons.length) return;

    this.buttons.forEach(button => {
      button.addEventListener('click', () => {
        this.switchTab(button);
      });
    });
  }

  switchTab(button) {
    const tabId = button.getAttribute('data-tab');

    this.buttons.forEach(btn => btn.classList.remove('active'));
    this.panels.forEach(panel => panel.classList.remove('active'));

    button.classList.add('active');

    const targetPanel = this.querySelector(`#${tabId}`);
    if (targetPanel) {
      targetPanel.classList.add('active');
    }
  }

  collectionTabCarousel(){
    var swiper = new Swiper(".js-collection-tab-caousel", {
				slidesPerView: 1.5,
				spaceBetween:10,
				slidesOffsetAfter:30,
        a11y: true,
				breakpoints: {
					769: {
						slidesPerView: 3.5,
						spaceBetween:  20,
						slidesOffsetAfter: 0,
					},
					1024: {
						slidesPerView: 4.5,
						spaceBetween: 20,
						slidesOffsetAfter:0,
					}
				}
			});
  }
}

customElements.define('collection-tab', CollectionTab);

class ShopTheLookCards extends HTMLElement {
  connectedCallback() {
    const isMobile = window.innerWidth < 769;
    const dots = this.querySelectorAll(".look-dot");
    dots.forEach((dot) => {
      const raw = dot.getAttribute("data-dot-index");
    });

    this.swiper = new Swiper(".js-shop-the-look-v3-carousel", {
      effect: isMobile ? "slide" : "cards",
      slidesPerView: isMobile ? 2 : 1,
      a11y: true,
      loop: true,
      spaceBetween: isMobile ? 10 : 0,
      grabCursor: true,
      pagination: {
        el: ".swiper-pagination",
        clickable: true,
      },
      navigation: {
        nextEl: ".swiper-button-next.look-product-next",
        prevEl: ".swiper-button-prev.look-product-prev",
      },
      on: {
        init: (swiper) => {
          this.setActiveDot(swiper.realIndex);
        },
        slideChange: (swiper) => {
          this.setActiveDot(swiper.realIndex);
        }
      }
    });

    dots.forEach((dot) => {
      dot.addEventListener('click', () => {
        const raw = dot.getAttribute("data-dot-index");
        const clickedIndex = parseInt(raw.trim()) - 1;
        this.swiper.slideToLoop(clickedIndex);
        this.setActiveDot(clickedIndex);
      });
    });
  }

  setActiveDot(index) {
    const dots = this.querySelectorAll(".look-dot"); 
    const targetVal = index + 1;

    dots.forEach((dot) => {
      dot.classList.remove("active");

      const dotVal = parseInt(dot.getAttribute("data-dot-index")?.trim());

      if (dotVal === targetVal) {
        dot.classList.add("active");
      }
    });
  }
}

customElements.define('shop-the-look-v3', ShopTheLookCards);



class CollectionDropdown extends HTMLElement {
  constructor() {
    super();
    this.collectionActiveImg();
  }

  collectionActiveImg(){
    const imgs = this.querySelectorAll(".collection-media");
    const details = this.querySelectorAll("details");

    details.forEach((detail) => {
      detail.addEventListener("toggle", () => {
        if (detail.open) {
          const contentAttr = detail.getAttribute("data-collection-name");
          imgs.forEach((img) => img.classList.remove("active-img"));
          imgs.forEach((img) => {
            const imgAttr = img.getAttribute("data-collection-image");
            
            if (contentAttr === imgAttr) {
              img.classList.add("active-img");
            }
          });
        }
      });
    });
  }

}

customElements.define('collection-dropdown', CollectionDropdown);

class DeliveryDate extends HTMLElement {
  connectedCallback() {
    const target = this.querySelector("#delivery-date-text");
    if (!target) return;

    const minDays = parseInt(this.getAttribute("min-days")) || 3;
    const maxDays = parseInt(this.getAttribute("max-days")) || 6;

    const today = new Date();

    const startDate = this.getWorkingDate(today, minDays);
    const endDate = this.getWorkingDate(today, maxDays);

    const text = `${this.formatDate(startDate)} and ${this.formatDate(endDate)}`;

    target.innerText = text;
  }

  getWorkingDate(startDate, daysToAdd) {
    let date = new Date(startDate);
    let addedDays = 0;

    while (addedDays < daysToAdd) {
      date.setDate(date.getDate() + 1);

      // Skip Sunday
      if (date.getDay() !== 0) {
        addedDays++;
      }
    }

    return date;
  }

  formatDate(date) {
    const weekday = date.toLocaleString('en-IN', { weekday: 'long' });
    const month = date.toLocaleString('en-IN', { month: 'short' });
    const day = date.getDate();

    return `${weekday}, ${month} ${day}`;
  }
}

customElements.define("delivery-date", DeliveryDate);


class DeliveryCountdown extends HTMLElement {
  constructor() {
    super();
    this.timer = null;
  }

  connectedCallback() {
    // Get values
    this.hours = parseInt(this.dataset.hour) || 0;
    this.minutes = parseInt(this.dataset.minute) || 0;
    this.seconds = parseInt(this.dataset.second) || 0;
    this.enableRestart = this.dataset.enableRestart === "true";

    // Convert to seconds
    this.initialTime = this.hours * 3600 + this.minutes * 60 + this.seconds;
    this.totalSeconds = this.initialTime;

    // Elements
    this.wrapper = this.querySelector(".countdown-wrapper");
    this.wrapperAfter = this.querySelector(".countdown-text-after");
    this.wrapperBefore = this.querySelector(".countdown-text-before");
    this.hoursEl = this.querySelector(".hours");
    this.minutesEl = this.querySelector(".minutes");
    this.secondsEl = this.querySelector(".seconds");
    this.afterTextEl = this.querySelector(".after-text");

    // Ensure initial state
    if (this.afterTextEl) this.afterTextEl.style.display = "none";

    this.startCountdown();
  }

  startCountdown() {
    this.updateDisplay();

    this.timer = setInterval(() => {

      if (this.totalSeconds <= 0) {
        clearInterval(this.timer);

        if (this.enableRestart) {
          this.totalSeconds = this.initialTime;

          if (this.afterTextEl) this.afterTextEl.style.display = "none";
          if (this.wrapper) this.wrapper.style.display = "inline";
          if (this.wrapperAfter) this.wrapperAfter.style.display = "inline";
          if (this.wrapperBefore) this.wrapperBefore.style.display = "inline";

          this.startCountdown();
        } else {
          if (this.wrapper) this.wrapper.style.display = "none";
          if (this.afterTextEl) this.afterTextEl.style.display = "inline";
          if (this.wrapperAfter) this.wrapperAfter.style.display = "none";
          if (this.wrapperBefore) this.wrapperBefore.style.display = "none";

          this.updateDisplay(); 
        }

        return;
      }

      this.totalSeconds--;
      this.updateDisplay();

    }, 1000);
  }

  updateDisplay() {
    let hrs = Math.floor(this.totalSeconds / 3600);
    let mins = Math.floor((this.totalSeconds % 3600) / 60);
    let secs = this.totalSeconds % 60;

    if (this.hoursEl) this.hoursEl.textContent = this.format(hrs);
    if (this.minutesEl) this.minutesEl.textContent = this.format(mins);
    if (this.secondsEl) this.secondsEl.textContent = this.format(secs);
  }

  format(value) {
    return value.toString().padStart(2, "0");
  }
}

customElements.define("delivery-countdown", DeliveryCountdown);

class TestimonialsCarousel extends HTMLElement {
  constructor() {
    super();
			
			var swiper = new Swiper(".js-testimonials-carousel", {
				slidesPerView: 1.3,
				spaceBetween:30,
        slidesOffsetAfter:0,
        a11y: true,
				breakpoints: {
					769: {
						slidesPerView: 2.3,
						spaceBetween:  40,
					},
					1024: {
						slidesPerView: 2.9,
						spaceBetween: 40,
            slidesOffsetAfter:20,
					}
				}
			});

  }
}

customElements.define('testimonials-carousel', TestimonialsCarousel);

/**
 * Custom Element for Cart Upsell Carousel
 * Handles Swiper initialization and AJAX Add to Cart
 */
if (!customElements.get('cart-upsell-product')) {
  customElements.define('cart-upsell-product', class CartUpsellProduct extends HTMLElement {
    constructor() {
      super();
      this.cart = document.querySelector('cart-drawer');
    }

    connectedCallback() {
      this.initCarousel();
      this.addEventListener('submit', this.onSubmitHandler.bind(this));
    }

    initCarousel() {
      const container = this.querySelector('.js-cart-upsell-carousel');
      if (!container) return;

      // Initialize Swiper
      this.swiper = new Swiper(container, {
        observer: true,
        observeParents: true,
        threshold: 5, // Prevents accidental clicks while swiping
        slidesPerView: 1.3,
        spaceBetween: 10,
        breakpoints: {
          769: { slidesPerView: 1.9, spaceBetween: 10 },
          1024: { slidesPerView: 2.2, spaceBetween: 10 },
        },
      });
    }

    onSubmitHandler(event) {
      event.preventDefault();
      const form = event.target;
      const submitButton = form.querySelector('[type="submit"]');

      if (!form || !submitButton) return;

      submitButton.setAttribute('disabled', true);
      submitButton.classList.add('loading');

      const formData = new FormData(form);
      
      // Tell the Cart Drawer to include its section ID in the response
      // so we can update the drawer HTML automatically.
      formData.append('sections', 'cart-drawer');
      formData.append('sections_url', window.location.pathname);

      fetch(`${routes.cart_add_url}`, {
        method: 'POST',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
          'Accept': 'application/javascript'
        },
        body: formData
      })
      .then((response) => response.json())
      .then((parsedState) => {
        // Find the cart-drawer component and trigger its internal refresh logic
        if (this.cart && this.cart.renderContents) {
          this.cart.renderContents(parsedState);
        } else {
          // Fallback: If your theme uses a different cart-drawer update method
          window.location.reload(); 
        }
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        submitButton.removeAttribute('disabled');
        submitButton.classList.remove('loading');
      });
    }

    // Clean up swiper if element is removed from DOM
    disconnectedCallback() {
      if (this.swiper) {
        this.swiper.destroy();
      }
    }
  });
}

class IconWithText extends HTMLElement {
  constructor() {
    super();
			
			var swiper = new Swiper(".js-icon-with-text-section", {
				slidesPerView: 3,
				spaceBetween:10,
				slidesOffsetAfter:30,
        a11y: true,
				breakpoints: {
					769: {
						slidesPerView: 4,
						spaceBetween:  20,
						slidesOffsetAfter: 0,
					},
					1024: {
						slidesPerView: 5,
						spaceBetween: 30,
						slidesOffsetAfter:0,
					}
				}
			});

  }
}

customElements.define('icon-with-text-section', IconWithText);

(function () {
  let panzoomInstances = new Map(); // Keep track of instances to clean up

  function initPanzoom() {
    if (window.innerWidth >= 769) {
      // Cleanup if resizing from mobile to desktop
      document.querySelectorAll('.pinch-zoom').forEach(img => {
        if (img.dataset.panzoomInitialized) {
          img.style.transform = 'none';
          delete img.dataset.panzoomInitialized;
        }
      });
      return;
    }

    document.querySelectorAll('.pinch-zoom').forEach((img) => {
      if (img.dataset.panzoomInitialized) return;
      img.dataset.panzoomInitialized = "true";

      const panzoom = Panzoom(img, {
        maxScale: 4,
        minScale: 1,
        contain: 'outside',
        cursor: 'grab'
      });

      function forceReset() {
        img.style.transform = 'translate(0px, 0px) scale(1)';
        panzoom.setOptions({
          startX: 0,
          startY: 0,
          startScale: 1
        });
      }

      setTimeout(forceReset, 50);
      setTimeout(forceReset, 150);

      if (!img.complete) {
        img.addEventListener('load', () => {
          setTimeout(forceReset, 50);
        });
      }

      img.parentElement.addEventListener('wheel', panzoom.zoomWithWheel);

      let lastTap = 0;
      img.addEventListener('touchend', (e) => {
        const now = Date.now();
        if (now - lastTap < 300) {
          e.preventDefault();
          if (panzoom.getScale() > 1) {
            panzoom.zoom(1, { animate: true });
            panzoom.pan(0, 0, { animate: true });
          } else {
            panzoom.zoom(2.5, { animate: true });
          }
        }
        lastTap = now;
      });
    });
  }

  document.addEventListener('DOMContentLoaded', initPanzoom);

  // Initialize on resize to catch orientation changes or window resizing
  window.addEventListener('resize', () => {
    initPanzoom();
  });

  // Dawn re-render fix
  document.addEventListener('variant:change', () => {
    setTimeout(() => {
      document.querySelectorAll('.pinch-zoom').forEach(img => {
        img.style.transform = 'translate(0px, 0px) scale(1)';
      });
      initPanzoom();
    }, 300);
  });
})();



