import { templates } from '../settings.js';
import utils from '../utils.js';

class Home {
  constructor(element) {
    this.render(element);
  }

  render(element) {
    const generatedHTML = templates.homePage();
    this.element = utils.createDOMFromHTML(generatedHTML);
    this.dom = {};
    this.dom.wrapper = element;
    this.dom.wrapper.appendChild(this.element);
  }
}

export default Home;