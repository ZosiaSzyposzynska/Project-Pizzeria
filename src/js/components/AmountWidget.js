 import { select, settings } from '../settings.js';

 
 class AmountWidget{
    constructor(element){
      const thisWidget = this;
     
      thisWidget.getElements(element);
      thisWidget.setValue(settings.amountWidget.defaultValue);
      thisWidget.initActions();
      
    }


   getElements(element){
    const thisWidget = this;

    thisWidget.element = element;
    thisWidget.input = thisWidget.element.querySelector(select.widgets.amount.input);
    thisWidget.linkDecrease = thisWidget.element.querySelector(select.widgets.amount.linkDecrease);
    thisWidget.linkIncrease = thisWidget.element.querySelector(select.widgets.amount.linkIncrease);

    
}

  initActions(){
    const thisWidget = this;
    

    thisWidget.input.addEventListener('change', function(event){
      event.preventDefault();
      thisWidget.setValue(thisWidget.input.value);
    });

    thisWidget.linkDecrease.addEventListener('click', function(event){
      event.preventDefault();
      thisWidget.setValue(parseInt(thisWidget.input.value) - 1);
    });

    thisWidget.linkIncrease.addEventListener('click', function(event){
      event.preventDefault();
    
     thisWidget.setValue(parseInt(thisWidget.input.value) + 1);
    });




  }

   announce() {
    const thisWidget = this;
    const event = new CustomEvent('updated', {
      bubbles: true
    });

    thisWidget.element.dispatchEvent(event);
  }

  

  setValue(value){
    const thisWidget = this;

    const newValue = parseInt(value);

    /* TODO: ADD VALIDATION */

    thisWidget.value = newValue;
    thisWidget.input.value = thisWidget.value;

    /* check if the value is diffetent from what it is already in thisWidget.value and if newValue is not null*/

    if(thisWidget.value !== newValue && !isNaN(newValue)){
      
      thisWidget.value = newValue;
      
      
   
    } else if (newValue <= settings.amountWidget.defaultMin) {
      
      thisWidget.value = settings.amountWidget.defaultMin;
      
    } else if (newValue >= settings.amountWidget.defaultMax) {
    
      thisWidget.value = settings.amountWidget.defaultMax;
      
    } 
    
    thisWidget.input.value = thisWidget.value;
    thisWidget.announce();
    
  
  }
}
export default AmountWidget;