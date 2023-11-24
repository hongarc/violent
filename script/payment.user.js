// ==UserScript==
// @name        Autofill - everfit.io
// @namespace   Everfit
// @match       https://*-coach.everfit.io/package/*
// @grant       none
// @version     1.0
// @author      Hongarc
// @updateURL   https://github.com/hongarc/violent/raw/main/script/payment.user.js
// @description 7/27/2023, 11:36:34 AM
// ==/UserScript==

const snakeCase = (string) => string.replace(/\W+/g, ' ')
  .split(/ |\B(?=[A-Z])/)
  .map((word) => word.toLowerCase())
  .join('_');

function generateReadableName() {
  const middleNames = [
    'John', 'Mary', 'Peter', 'Elizabeth', 'David', 'Alice', 'Robert',
    'Sandra', 'Michael', 'Margaret', 'Charles', 'Patricia', 'Joseph', 'Barbara',
    'William', 'Helen', 'Thomas', 'Susan', 'Richard', 'Dorothy', 'James',
    'Karen', 'Paul', 'Ruth', 'Kenneth', 'Shirley', 'Steven', 'Donna', 'Edward',
    'Nancy', 'Anthony', 'Evelyn', 'Mark', 'Carolyn', 'Donald', 'Janice',
    'Gregory', 'Marie', 'Gary', 'Betty', 'Harold', 'Sandra', 'Lawrence', 'Cheryl',
    'Wayne', 'Melissa', 'Raymond', 'Barbara', 'Roger', 'Sharon', 'Terry',
    'Michelle', 'Jeffrey', 'Laura', 'Nicholas', 'Sarah', 'Eric', 'Deborah', 'Christopher',
    'Katherine', 'Dennis', 'Susan', 'Stephen', 'Margaret', 'Arthur', 'Dorothy',
  ];

  const lastNames = [
    'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Taylor', 'Anderson',
    'Thompson', 'Davis', 'Wilson', 'Evans', 'Parker', 'Hill', 'Scott', 'Clark',
    'Turner', 'Phillips', 'Lee', 'Edwards', 'Martin', 'Lewis', 'Morgan', 'Allen',
    'Young', 'Cooper', 'King', 'Campbell', 'Bennett', 'Carter', 'Harris', 'Jackson',
    'Miller', 'Turner', 'Thompson', 'White', 'Davis', 'Johnson', 'Brown', 'Williams',
    'Jones', 'Taylor', 'Anderson', 'Thompson', 'Davis', 'Wilson', 'Evans', 'Parker',
  ];

  // Randomly determine the number of middle names
  const numberOfMiddleNames = Math.floor(Math.random() * 2) + 1; // 0 to 1

  let fullName = '';
  for (let i = 0; i < numberOfMiddleNames; i++) {
    const middleNameIndex = Math.floor(Math.random() * middleNames.length);
    fullName += `${middleNames[middleNameIndex]} `;
  }

  const lastNameIndex = Math.floor(Math.random() * lastNames.length);
  fullName += lastNames[lastNameIndex];

  return fullName;
}

const generateRandomPhoneNumber = () => {
  const digits = '0123456789';
  let phoneNumber = '';

  for (let i = 0; i < 10; i++) {
    phoneNumber += digits[Math.floor(Math.random() * digits.length)];
  }

  return phoneNumber;
};

const nativeInputValueSetter = Object.getOwnPropertyDescriptor(window.HTMLInputElement.prototype, 'value').set;
const setValue = (inputElement, text) => {
  nativeInputValueSetter.call(inputElement, text);
  inputElement.dispatchEvent(new Event('input', { bubbles: true }));
};

const waitForElm = (selector) =>
  // eslint-disable-next-line implicit-arrow-linebreak
  new Promise((resolve) => {
    const element = document.querySelector(selector);
    if (element) {
      resolve(element);
    } else {
      const observer = new MutationObserver(() => {
        const elem = document.querySelector(selector);
        if (elem) {
          observer.disconnect();
          resolve(elem);
        }
      });
      observer.observe(document.body, { childList: true, subtree: true });
    }
  });

const addEvent = (element, event, func) => {
  if (element.attachEvent) return element.attachEvent(`on${event}`, func);
  return element.addEventListener(event, func, false);
};

const prefixBindElement = 'auto_fill_prefix:';
const getKey = (name) => prefixBindElement + name;
const autoFill = async () => {
  const submitEvent = 'auto_fill_submitted';
  const emitter = new EventTarget();

  const bindElement = (selector, defaultValue, converter = (a) => a, revert = (a) => a) => {
    emitter.addEventListener(submitEvent, async () => {
      const element = await waitForElm(selector);
      localStorage.setItem(getKey(selector), revert(element.value));
    });
    return waitForElm(selector).then((element) => {
      const stored = localStorage.getItem(getKey(selector)) || defaultValue;
      setValue(element, converter(stored));
      return element;
    });
  };

  const fullName = generateReadableName();
  const userName = `${snakeCase(fullName).substring(0, 10)}_${Math.floor(Math.random() * 100)}`;
  bindElement('[name="email"]', 'hongtu+custom_here@everfit.io', (value) => value.replace(/(?<=\+).+(?=@)/, userName));
  bindElement('[name="name"]', 'custom_here', () => fullName);
  bindElement('[name="phoneNumber"]', generateRandomPhoneNumber());
  bindElement('[name="address"]', 'Ngo Sy Lien');
  bindElement('[name="city"]', 'Danang');
  bindElement('[name="zip"]', '550000');
  bindElement('#react-select-2-input', 'VN')
    .then(() => {
      document.getElementById('react-select-2-listbox').childNodes[0].childNodes[0].click();
    });

  const submitBtn = await waitForElm('[type="submit"]');
  let listened = false;
  addEvent(submitBtn, 'click', async () => {
    if (listened) {
      return;
    }
    listened = true;
    emitter.dispatchEvent(new Event(submitEvent));
    const repeatName = await waitForElm('[name="confirm"]');
    setValue(repeatName, fullName);

    const submit2 = await waitForElm('[type="submit"]');
    submit2.click();
  });
};

autoFill();
