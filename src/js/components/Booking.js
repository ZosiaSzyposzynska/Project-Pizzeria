import { templates, select } from '../settings.js';
import AmountWidget from './AmountWidget.js';

class Booking{
    constructor(element){
        const thisBooking = this;
        thisBooking.render(element);
        thisBooking.initWidgets;

    }

    render(element){
        const thisBooking = this;
        /* generate HTML */
        const generatedHTML = templates.bookingWidget();
        /* empty object */
        thisBooking.dom = {};
        /* add wrapper to thisBooking object */
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
        /* select peopleAmount */
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        /* select hoursAmount */
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
    }



}


export default Booking;