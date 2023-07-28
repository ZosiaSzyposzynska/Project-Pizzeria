import { settings, select } from './settings.js';
import Product from './components/Product.js';
import Cart from './components/Cart.js';


 const app = {
  initMenu: function() {
    const thisApp = this;
    const url = settings.db.url + '/' + settings.db.products;

    fetch(url)
      .then(function(rawResponse) {
        return rawResponse.json();
      })
      .then(function(parsedResponse) {
        console.log('parsed response', parsedResponse);

        /* save parsedResponse as thisApp.data.products */
        thisApp.data.products = parsedResponse;

        /* execute initMenu method */
        for (let productData in thisApp.data.products) {
          new Product(thisApp.data.products[productData].id, thisApp.data.products[productData]);
        }

        
      });

    console.log('thisApp.data', JSON.stringify(thisApp.data));
  },

    init: function(){
      const thisApp = this;
    

      thisApp.initData();
      thisApp.initMenu();
      thisApp.initCart();
    },

    initData: function(){
      const thisApp = this;
      thisApp.data = {};
      
    },

    initCart: function(){
      const thisApp = this;

      const cartElem = document.querySelector(select.containerOf.cart); 
      thisApp.cart = new Cart(cartElem);

      thisApp.productList = document.querySelector(select.containerOf.menu);

      thisApp.productList.addEventListener('add-to-cart', function(event){
        app.cart.add(event.detail.product);
      });
    }

  };

  
  app.init();
