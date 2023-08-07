import { settings, select, classNames } from '../js/settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';

const app = {
  initPages: function(){
     const thisApp = this;

     thisApp.pages = document.querySelector(select.containerOf.pages).children;
     thisApp.navLinks = document.querySelectorAll(select.nav.links);
     thisApp.activatePage(thisApp.pages[0].id);

    
  },

activatePage: function(pageId){
  const thisApp = this;
  /* add class active to matching pages */
    for(let page of thisApp.pages){

      page.classList.toggle(classNames.pages.active, page.id == pageId);  
    
    }
  /* add class active to links */
    for(let link of thisApp.navLinks){

      link.classList.toggle(
        classNames.nav.active, 
        link.getAttribute('href') == '#' + pageId
      );
    
    }
  
},


  initMenu: function () {
    const thisApp = this;
    for(let productData in thisApp.data.products){
      new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
    }
   
  },

  init: function () {
    const thisApp = this;

    thisApp.initData();
    thisApp.initMenu();
    thisApp.initCart();
    thisApp.initPages();
  },

  initData: function () {
    const thisApp = this;
    thisApp.data = {};
     const url = settings.db.url + '/' + settings.db.products;


    fetch(url)
      .then(function (rawResponse) {
        return rawResponse.json();
      })
      .then(function (parsedResponse) {
        console.log('parsed response', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

       
          
        
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

  initCart: function () {
    const thisApp = this;

    const cartElem = document.querySelector(select.containerOf.cart);
    thisApp.cart = new Cart(cartElem);

    thisApp.productList = document.querySelector(select.containerOf.menu);

    thisApp.productList.addEventListener('add-to-cart', function (event) {
      thisApp.cart.add(event.detail.product); 
    });
  },
};

app.init();
