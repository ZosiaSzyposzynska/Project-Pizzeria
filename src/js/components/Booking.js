import { select, templates, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';
class Booking {
  constructor(element) {
    this.selectedTable;
    this.selectedStarters = [];

    this.render(element);
    this.initWidgets();
    this.getData();
  }

  getData() {
    const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(this.dateWidget.minDate);
    const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(this.dateWidget.maxDate);

    const params = {
      booking: [startDateParam, endDateParam],
      eventsCurrent: [settings.db.notRepeatParam, startDateParam, endDateParam],
      eventsRepeat: [settings.db.repeatParam, endDateParam],
    };

    const urls = {
      booking: `${settings.db.url}/${settings.db.booking}?${params.booking.join('&')}`,
      eventsCurrent: `${settings.db.url}/${settings.db.event}?${params.eventsCurrent.join('&')}`,
      eventsRepeat: `${settings.db.url}/${settings.db.event}?${params.eventsRepeat.join('&')}`,
    };

    Promise.all([fetch(urls.booking), fetch(urls.eventsCurrent), fetch(urls.eventsRepeat)])
      .then(function (allResponses) {
        const bookingResponse = allResponses[0];
        const eventsCurrentResponse = allResponses[1];
        const eventsRepeatResponse = allResponses[2];
        return Promise.all([bookingResponse.json(), eventsCurrentResponse.json(), eventsRepeatResponse.json()]);
      })
      .then(([bookings, eventsCurrent, eventsRepeat]) => {
        this.parseData(bookings, eventsCurrent, eventsRepeat);
      });
  }

  parseData(bookings, eventsCurrent, eventsRepeat) {
    this.booked = {};
    for (let item of bookings) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }
    for (let item of eventsCurrent) {
      this.makeBooked(item.date, item.hour, item.duration, item.table);
    }

    const minDate = this.dateWidget.minDate;
    const maxDate = this.dateWidget.maxDate;

    for (let item of eventsRepeat) {
      if (item.repeat === 'daily') {
        for (let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)) {
          this.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
        }
      }
    }

    this.updateDOM();
  }

  makeBooked(date, hour, duration, table) {
    if (typeof this.booked[date] == 'undefined') {
      this.booked[date] = {};
    }
    const startHour = utils.hourToNumber(hour);

    for (let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5) {
      if (typeof this.booked[date][hourBlock] == 'undefined') {
        this.booked[date][hourBlock] = [];
      }
      this.booked[date][hourBlock].push(table);
    }
  }

  updateDOM() {
    this.date = this.dateWidget.value;
    this.hour = utils.hourToNumber(this.timeWidget.value);

    let allAvailable = false;

    if (typeof this.booked[this.date] === 'undefined' || typeof this.booked[this.date][this.hour] === 'undefined') {
      allAvailable = true;
    }

    for (let table of this.dom.tables) {
      let tableId = table.getAttribute(settings.booking.tableIdAttribute);
      if (!isNaN(tableId)) {
        tableId = parseInt(tableId);
      }

      if (!allAvailable && this.booked[this.date][this.hour].includes(tableId)) {
        table.classList.add(classNames.booking.tableBooked);
      } else {
        table.classList.remove(classNames.booking.tableBooked);
      }
      table.classList.remove(classNames.booking.tableSelected);
    }
  }
  selectStarters(e) {
    if (e.target.type === 'checkbox' && e.target.name === 'starter' && e.target.tagName === 'INPUT') {
      if (e.target.checked) {
        this.selectedStarters.push(e.target.value);
      } else {
        const index = this.selectedStarters.indexOf(e.target.value);
        this.selectedStarters.splice(index, 1);
      }
    }
  }

  selectTable(e) {
    const allTables = document.querySelectorAll(select.booking.tables);
    for (let table of allTables) {
      if (table !== e.target) {
        table.classList.remove(classNames.booking.tableSelected);
      }
    }
    if (!e.target.classList.contains(classNames.booking.tableBooked)) {
      e.target.classList.toggle(classNames.booking.tableSelected);
      this.selectedTable = +e.target.getAttribute(settings.booking.tableIdAttribute);
    } else {
      alert('This table is already booked. Please select different one');
    }
  }
  sendBooking() {
    const url = settings.db.url + '/' + settings.db.booking;

    this.payload = {};
    this.payload.date = this.dateWidget.value;
    this.payload.hour = this.timeWidget.value;
    this.payload.table = this.selectedTable;
    this.payload.duration = +this.hoursWidget.value;
    this.payload.ppl = +this.peopleWidget.value;
    this.payload.starters = this.selectedStarters;
    this.payload.phone = this.dom.phoneInput.value;
    this.payload.address = this.dom.addressInput.value;

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(this.payload),
    };

    fetch(url, options)
      .then(function (response) {
        return response.json();
      })
      .then(parsedResponse => {
        console.log(parsedResponse);
        alert('Your booking was sent to restaurant. Thank you for your booking. ');
        this.makeBooked(this.payload.date, this.payload.hour, this.payload.duration, this.payload.table);
        this.updateDOM();
      });
  }

  render(element) {
    const generatedHTML = templates.bookingWidget();
    this.element = utils.createDOMFromHTML(generatedHTML);
    this.dom = {};
    this.dom.wrapper = element;

    this.dom.optionsWrapper = this.element.querySelector(select.booking.options);

    this.dom.peopleAmount = this.element.querySelector(select.booking.peopleAmount);
    this.dom.hoursAmount = this.element.querySelector(select.booking.hoursAmount);

    this.dom.datePicker = this.element.querySelector(select.widgets.datePicker.wrapper);

    this.dom.hourPicker = this.element.querySelector(select.widgets.hourPicker.wrapper);
    this.dom.tables = this.element.querySelectorAll(select.booking.tables);
    this.dom.floor = this.element.querySelector(select.booking.floor);
    this.dom.bookTable = this.element.querySelector(select.booking.bookTable);

    this.dom.phoneInput = this.element.querySelector(select.cart.phone);
    this.dom.addressInput = this.element.querySelector(select.cart.address);

    this.dom.wrapper.appendChild(this.element);
  }

  initWidgets() {
    this.peopleWidget = new AmountWidget(this.dom.peopleAmount, settings.amountWidget.defaultValue);
    this.hoursWidget = new AmountWidget(this.dom.hoursAmount, settings.amountWidget.defaultValue);
    this.dateWidget = new DatePicker(this.dom.datePicker);
    this.timeWidget = new HourPicker(this.dom.hourPicker);

    this.dom.wrapper.addEventListener('updated', () => {
      this.updateDOM();
    });

    this.dom.floor.addEventListener('click', e => {
      this.selectTable(e);
    });

    this.dom.optionsWrapper.addEventListener('click', e => {
      this.selectStarters(e);
    });

    this.dom.bookTable.addEventListener('click', e => {
      e.preventDefault();
      this.sendBooking();
    });
  }
}

export default Booking;