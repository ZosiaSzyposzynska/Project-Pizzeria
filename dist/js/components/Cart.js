import { templates, select, settings, classNames } from '../settings.js';
import CartProduct from './CartProduct.js';
import utils from '../utils.js';


  class Cart {
  constructor(element) {
    const thisCart = this;
    thisCart.products = [];
    thisCart.dom = {};
    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);
    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);
    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;
    thisCart.deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.initActions();
  }

  initActions() {
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function (event) {
      event.preventDefault();
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(event){
      event.preventDefault();
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      event.preventDefault();
      thisCart.remove(event.detail.cartProduct);
      
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
      
    });

  }

  add(menuProduct) {
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct);
    const generatedDOM = utils.createDOMFromHTML(generatedHTML);
    thisCart.dom.productList.appendChild(generatedDOM);

    thisCart.products.push(new CartProduct(menuProduct, generatedDOM));
    thisCart.update();
  }

  update() {
    const thisCart = this;
    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

   for (let product of thisCart.products) {
    
    if (!isNaN(product.amountWidget.value)) {
      thisCart.totalNumber += product.amountWidget.value;
      thisCart.subtotalPrice += product.price;
    }
   
  }

    if (thisCart.totalNumber > 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + thisCart.deliveryFee;
    } else {
      thisCart.totalPrice = 0;
    }

    console.log('deliveryFee:', thisCart.deliveryFee);
    console.log('totalNumber:', thisCart.totalNumber);
    console.log('subtotalPrice:', thisCart.subtotalPrice);
    console.log('totalPrice:', thisCart.totalPrice);


    thisCart.dom.wrapper.querySelector(select.cart.totalNumber).innerHTML = thisCart.totalNumber;
    thisCart.dom.wrapper.querySelector(select.cart.totalPrice).innerHTML = thisCart.totalPrice;
  
  }


  remove(cartProduct){
    
    const thisCart = this;
    
    cartProduct.dom.wrapper.remove();

    const indexOfProduct = thisCart.products.indexOf(cartProduct);
    if (indexOfProduct !== -1) {
      thisCart.products.splice(indexOfProduct, 1);
    }


    thisCart.update();



  }


  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;


    const payload = {

      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.totalPrice,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.deliveryFee,
      products: [],

    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };

    fetch(url, options)
    .then(response => response.json())
    .then(data => {
      console.log('Response from server:', data);
    })
    .catch(error => {
      console.error('Error:', error);
    });

  }





}
export default Cart;