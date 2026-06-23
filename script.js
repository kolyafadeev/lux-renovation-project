const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (!prefersReducedMotion) {
  document.documentElement.classList.add('reveal-ready');
}

function closeMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Открыть меню');
  mainNav.classList.remove('open');
  document.body.classList.remove('menu-open');
}

function openMenu() {
  if (!menuToggle || !mainNav) return;
  menuToggle.setAttribute('aria-expanded', 'true');
  menuToggle.setAttribute('aria-label', 'Закрыть меню');
  mainNav.classList.add('open');
  document.body.classList.add('menu-open');
}

if (menuToggle && mainNav) {
  menuToggle.addEventListener('click', () => {
    const willOpen = menuToggle.getAttribute('aria-expanded') !== 'true';
    if (willOpen) {
      openMenu();
    } else {
      closeMenu();
    }
  });
}

document.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && menuToggle?.getAttribute('aria-expanded') === 'true') {
    closeMenu();
    menuToggle.focus();
  }
});

document.querySelectorAll('a[href^="#"]').forEach((link) => {
  link.addEventListener('click', (event) => {
    const selector = link.getAttribute('href');
    const target = selector ? document.querySelector(selector) : null;

    if (!target) return;
    event.preventDefault();
    closeMenu();

    if (selector === '#top') {
      window.scrollTo({ top: 0, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
      return;
    }

    target.scrollIntoView({ behavior: prefersReducedMotion ? 'auto' : 'smooth', block: 'start' });
  });
});

const revealElements = document.querySelectorAll('.reveal');

if (!prefersReducedMotion && 'IntersectionObserver' in window) {
  const revealObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      entry.target.classList.add('is-visible');
      observer.unobserve(entry.target);
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -8% 0px',
  });

  revealElements.forEach((element) => revealObserver.observe(element));
} else {
  revealElements.forEach((element) => element.classList.add('is-visible'));
  document.documentElement.classList.remove('reveal-ready');
}

const comparison = document.querySelector('.comparison');
const comparisonRange = document.querySelector('.comparison-range');

if (comparison && comparisonRange) {
  const updateComparison = () => {
    comparison.style.setProperty('--position', `${comparisonRange.value}%`);
    comparisonRange.setAttribute('aria-valuetext', `${comparisonRange.value}% после ремонта`);
  };

  comparisonRange.addEventListener('input', updateComparison);
  updateComparison();
}

const form = document.querySelector('#estimate-form');
const nameInput = document.querySelector('#name');
const phoneInput = document.querySelector('#phone');
const consentInput = document.querySelector('#consent');

function clearSuccessMessage() {
  if (!form) return;
  const successMessage = form.querySelector('.form-success');
  successMessage.classList.remove('visible');
  successMessage.textContent = '';
}

function formatPhone(rawValue) {
  let digits = rawValue.replace(/\D/g, '');

  if (digits.startsWith('7') || digits.startsWith('8')) {
    digits = digits.slice(1);
  }

  digits = digits.slice(0, 10);

  if (!digits.length) return '';

  let formatted = '+7';
  if (digits.length > 0) formatted += ` (${digits.slice(0, 3)}`;
  if (digits.length >= 3) formatted += ')';
  if (digits.length > 3) formatted += ` ${digits.slice(3, 6)}`;
  if (digits.length > 6) formatted += `-${digits.slice(6, 8)}`;
  if (digits.length > 8) formatted += `-${digits.slice(8, 10)}`;
  return formatted;
}

if (phoneInput) {
  phoneInput.addEventListener('input', () => {
    phoneInput.value = formatPhone(phoneInput.value);
    phoneInput.classList.remove('invalid');
    phoneInput.setAttribute('aria-invalid', 'false');
    document.querySelector('#phone-error').textContent = '';
    clearSuccessMessage();
  });

  phoneInput.addEventListener('focus', () => {
    if (!phoneInput.value) phoneInput.value = '+7 (';
  });

  phoneInput.addEventListener('blur', () => {
    if (phoneInput.value === '+7 (') phoneInput.value = '';
  });
}

if (nameInput) {
  nameInput.addEventListener('input', () => {
    nameInput.classList.remove('invalid');
    nameInput.setAttribute('aria-invalid', 'false');
    document.querySelector('#name-error').textContent = '';
    clearSuccessMessage();
  });
}

if (consentInput) {
  consentInput.addEventListener('change', () => {
    document.querySelector('#consent-error').textContent = '';
    consentInput.setAttribute('aria-invalid', 'false');
    clearSuccessMessage();
  });
}

if (form && nameInput && phoneInput && consentInput) {
  form.addEventListener('submit', (event) => {
    event.preventDefault();

    const nameError = document.querySelector('#name-error');
    const phoneError = document.querySelector('#phone-error');
    const consentError = document.querySelector('#consent-error');
    const successMessage = form.querySelector('.form-success');
    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    let firstInvalidField = null;

    nameError.textContent = '';
    phoneError.textContent = '';
    consentError.textContent = '';
    nameInput.classList.remove('invalid');
    phoneInput.classList.remove('invalid');
    nameInput.setAttribute('aria-invalid', 'false');
    phoneInput.setAttribute('aria-invalid', 'false');
    consentInput.setAttribute('aria-invalid', 'false');
    successMessage.classList.remove('visible');
    successMessage.textContent = '';

    if (!nameInput.value.trim()) {
      nameError.textContent = 'Укажите имя';
      nameInput.classList.add('invalid');
      nameInput.setAttribute('aria-invalid', 'true');
      firstInvalidField = nameInput;
    }

    if (phoneDigits.length !== 11 || phoneDigits[0] !== '7') {
      phoneError.textContent = 'Введите телефон полностью';
      phoneInput.classList.add('invalid');
      phoneInput.setAttribute('aria-invalid', 'true');
      firstInvalidField ||= phoneInput;
    }

    if (!consentInput.checked) {
      consentError.textContent = 'Необходимо подтвердить согласие';
      consentInput.setAttribute('aria-invalid', 'true');
      firstInvalidField ||= consentInput;
    }

    if (firstInvalidField) {
      firstInvalidField.focus();
      return;
    }

    successMessage.textContent = 'Заявка принята. Мы свяжемся с вами в ближайшее время.';
    successMessage.classList.add('visible');
    form.reset();
    nameInput.setAttribute('aria-invalid', 'false');
    phoneInput.setAttribute('aria-invalid', 'false');
    consentInput.setAttribute('aria-invalid', 'false');
  });
}

window.addEventListener('resize', () => {
  if (window.innerWidth > 860) closeMenu();
});
