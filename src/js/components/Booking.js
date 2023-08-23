import { templates, select, settings, classNames } from '../settings.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
import utils from '../utils.js';



class Booking {
    constructor(element) {
        
        const thisBooking = this;

        thisBooking.selectedTable = null;

        
    
        thisBooking.render(element);
        thisBooking.initWidgets(); 
        thisBooking.getData();
     

        console.log('Booking:', thisBooking);
    }


    getData(){
        const thisBooking = this;
        
        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],

            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
                
            ],

            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
                
            ],

        };

        console.log('getData params', params);

        const urls = {
            booking:       settings.db.url + '/' + settings.db.bookings + '?' + params.booking.join('&'),
            eventsCurrent: settings.db.url + '/' + settings.db.events + '?' + params.eventsCurrent.join('&'),
            eventsRepeat: settings.db.url  + '/' + settings.db.events + '?' + params.eventsRepeat.join('&'),
        };

        // console.log('getData urls', urls);

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
        .then(function (allResponses) {
        const bookingsResponse = allResponses[0];
        console.log('bookingsResponse:', bookingsResponse);
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([
            bookingsResponse.json(),
            eventsCurrentResponse.json(),
            eventsRepeatResponse.json(),
        ]);  
        })
        .then(function ([bookings, eventsCurrent, eventsRepeat]) {
        // console.log('bookings',bookings); 
        // console.log('current',eventsCurrent);
        // console.log('repeat',eventsRepeat);
        thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);

        });
    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);

        }
        const minDate = thisBooking.datePickerWidget.minDate;
        const maxDate = thisBooking.datePickerWidget.maxDate;
        
        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
                
                thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
            }

               
            }
        }

        // console.log('thisBooking.booked', thisBooking.booked);

        thisBooking.updateDOM();
    }

    makeBooked(date, hour, duration, table) {
  const thisBooking = this;

  if (typeof thisBooking.booked[date] === 'undefined') {
    thisBooking.booked[date] = {};
  }

  const startHour = utils.hourToNumber(hour);

  for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
    if (typeof thisBooking.booked[date][hourBlock] === 'undefined') {
      thisBooking.booked[date][hourBlock] = [];
    }

    thisBooking.booked[date][hourBlock].push(table);
  }
}

updateDOM() {
        const thisBooking = this;

        thisBooking.date = thisBooking.datePickerWidget.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

        console.log(thisBooking.date);
        console.log(thisBooking.hour);

        let allAvailable = false;

        if (
            typeof thisBooking.booked[thisBooking.date] === 'undefined' ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] === 'undefined'
        ) {
            allAvailable = true;
        }

        for (let table of thisBooking.dom.tables) {
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if (!isNaN(tableId)) {
                tableId = parseInt(tableId);
            }
            if (thisBooking.selectedTable === table && !thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)) {
                table.classList.remove(classNames.booking.selected);
                thisBooking.selectedTable = null;
            }
            if (
                allAvailable ||
                !thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId)
            ) {
                table.classList.remove(classNames.booking.tableBooked);
            } else {
                table.classList.add(classNames.booking.tableBooked);
            }
        }
    }




    render(element) {
        const thisBooking = this;
        const generatedHTML = templates.bookingWidget();
        thisBooking.dom = {};
        thisBooking.dom.wrapper = element;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;
        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);
        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);
        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);
        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.cart.phone);
        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.cart.address);
        thisBooking.dom.startersCheckboxes = thisBooking.dom.wrapper.querySelectorAll(select.booking.startersCheckboxes);

    }

    initWidgets() {
    const thisBooking = this;
    thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
    thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);
    thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
    thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);
    

    thisBooking.dom.wrapper.addEventListener('updated', function() {
      thisBooking.updateDOM();
    });

    thisBooking.dom.datePicker.addEventListener('updated', function() {
      thisBooking.date = thisBooking.datePickerWidget.value;
    });

    thisBooking.dom.hourPicker.addEventListener('updated', function() {
      thisBooking.hour = thisBooking.hourPickerWidget.value;
    });

    for (const table of thisBooking.dom.tables) {
      table.addEventListener('click', function() {
        thisBooking.initTables(table);
      });

    }
    thisBooking.dom.wrapper.addEventListener('submit', function(event) {
        event.preventDefault(); 
        thisBooking.sendBooking(event); 
    });
   

   
  }

  initTables(clickedTable) {
    const thisBooking = this;

    if (!clickedTable.classList.contains(classNames.booking.tableBooked)) {
       
        if (thisBooking.selectedTable) {
            thisBooking.selectedTable.classList.remove(classNames.booking.selected);
        }

      
        thisBooking.selectedTable = clickedTable;
        console.log(thisBooking.selectedTable);

       
        thisBooking.selectedTable.classList.add(classNames.booking.selected);

    } else {
       
        alert('Ten stolik jest już zarezerwowany!');
    }
}

    sendBooking(){
    const thisBooking = this;

    const url = settings.db.url + '/' + settings.db.bookings;

    const payload = {
        "date": thisBooking.datePickerWidget.value,
        "hour": thisBooking.hourPickerWidget.value,
        "table": thisBooking.selectedTable ? parseInt(thisBooking.selectedTable.getAttribute('data-table')) : null,
        "duration": thisBooking.hoursAmountWidget.value,
        "ppl": thisBooking.peopleAmountWidget.value,
        "starters": thisBooking.getStarters(), 
        "phone": thisBooking.dom.phone.value,
        "address": thisBooking.dom.address.value,
    };

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
        thisBooking.makeBooked(
            payload.date,
            utils.numberToHour(payload.hour),
            parseFloat(payload.duration),
            payload.table
        );

        thisBooking.updateDOM();
    })
    .catch(error => {
        console.error('Error:', error);
    });
  
}
    



    
   getStarters() {
    const thisBooking = this;
    const starters = [];

    for (const starterCheckbox of thisBooking.dom.startersCheckboxes) {
        if (starterCheckbox.checked) {
            starters.push(starterCheckbox.value);
            console.log(starters);
        }
    }

    return starters;
}


  }




export default Booking;
