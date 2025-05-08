document.addEventListener('DOMContentLoaded', () => {
  const priceInput = document.getElementById('price');
  const discountInput = document.getElementById('discount');
  const includeVatCheckbox = document.getElementById('includeVat');
  const vatLabel = document.getElementById('vatLabel');
  const vatRateInput = document.getElementById('vatRate');
  const calculateBtn = document.getElementById('calculate');
  const resetBtn = document.getElementById('reset');
  const resultDiv = document.getElementById('result');
  const historyContainer = document.getElementById('historyContainer');
  const clearHistoryBtn = document.getElementById('clearHistoryBtn');

  // Показ/скрытие НДС
  includeVatCheckbox.addEventListener('change', () => {
    if (includeVatCheckbox.checked) {
      vatLabel.classList.remove('hidden');
    } else {
      vatLabel.classList.add('hidden');
      vatRateInput.value = '';
    }
  });

  // Проверка корректности числа: 
  // Текстовое представление числа без ведущих нулей, с точкой для дробной части
  function isValidNumber(str) {
    return /^((0|[1-9]\d*)(\.\d+)?|0(\.\d+)?)$/.test(str);
  }

  // Блокировка ввода ведущих нулей
  function preventLeadingZeros(evt) {
    let val = evt.target.value;
    if (val === '') return; // пусто — ок

    // Если две и более нулей в начале
    if (/^0{2,}/.test(val)) {
      evt.target.value = '0';
      return;
    }

    // Если начинается с 0 и далее цифры (например 01)
    if (/^0\d+/.test(val)) {
      evt.target.value = val.replace(/^0+/, '');
      if (evt.target.value === '') evt.target.value = '0';
    }
  }

  priceInput.addEventListener('input', preventLeadingZeros);
  discountInput.addEventListener('input', preventLeadingZeros);
  vatRateInput.addEventListener('input', preventLeadingZeros);

  // Основная функция расчёта
  function calculate() {
    const priceStr = priceInput.value.trim();
    const discountStr = discountInput.value.trim();
    const vatRateStr = vatRateInput.value.trim();

    // Проверка цены
    if (!isValidNumber(priceStr) || Number(priceStr) === 0) {
      resultDiv.textContent = 'Введите корректную начальную цену товара (больше 0, без ведущих нулей).';
      resultDiv.classList.add('error');
      return;
    }

    // Проверка скидки
    if (!isValidNumber(discountStr) || Number(discountStr) < 0 || Number(discountStr) > 100) {
      resultDiv.textContent = 'Введите корректный процент скидки от 0 до 100.';
      resultDiv.classList.add('error');
      return;
    }

    // Проверка НДС, если выбран
    if (includeVatCheckbox.checked) {
      if (!isValidNumber(vatRateStr) || Number(vatRateStr) < 0 || Number(vatRateStr) > 100) {
        resultDiv.textContent = 'Введите корректную ставку НДС от 0 до 100.';
        resultDiv.classList.add('error');
        return;
      }
    }

    // Преобразование в числа
    const price = Number(priceStr);
    const discount = Number(discountStr);
    const vatRate = includeVatCheckbox.checked ? Number(vatRateStr) : 0;

    // Расчёты
    const discountAmount = price * discount / 100;
    let priceAfterDiscount = price - discountAmount;
    let vatAmount = 0;

    if (includeVatCheckbox.checked) {
      vatAmount = priceAfterDiscount * vatRate / 100;
      priceAfterDiscount += vatAmount;
    }

    // Форматирование вывода с 2 знаками после запятой
    const finalPrice = priceAfterDiscount.toFixed(2);
    const discountFixed = discountAmount.toFixed(2);
    const vatFixed = vatAmount.toFixed(2);

    // Вывод результата
    let resultHTML = `<p>Итоговая цена: <strong>${finalPrice} руб.</strong></p>`;
    resultHTML += `<p>Скидка: -${discountFixed} руб.</p>`;
    if (includeVatCheckbox.checked) {
      resultHTML += `<p>НДС: +${vatFixed} руб.</p>`;
    }

    resultDiv.innerHTML = resultHTML;
    resultDiv.classList.remove('error');

    // Добавление в историю
    addHistory(price, discount, vatRate, finalPrice);
  }

  // Функция сброса формы и результата
  function reset() {
    priceInput.value = '';
    discountInput.value = '';
    includeVatCheckbox.checked = false;
    vatLabel.classList.add('hidden');
    vatRateInput.value = '';
    resultDiv.textContent = '';
    resultDiv.classList.remove('error');
  }

  // История операций в localStorage
  function addHistory(price, discount, vatRate, finalPrice) {
    const item = {
      date: new Date().toLocaleString(),
      price: price.toFixed(2),
      discount: discount.toFixed(2),
      vatRate: vatRate.toFixed(2),
      finalPrice
    };

    let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
    history.unshift(item); // добавляем в начало

    if (history.length > 10) history.pop(); // ограничение истории 10 элементов

    localStorage.setItem('calcHistory', JSON.stringify(history));
    renderHistory();
  }

  // Вывод истории
 function renderHistory() {
  let history = JSON.parse(localStorage.getItem('calcHistory') || '[]');
  if (history.length === 0) {
    historyContainer.innerHTML = '<p>История пуста.</p>';
    return;
  }

  let html = '<ul>';
  for (let entry of history) {
    html += `<li>
      <strong>${entry.date}</strong>: 
      Цена <strong>${entry.price} руб.</strong>, 
      Скидка <strong>${entry.discount}%</strong>, `;
    
    if (entry.vatRate > 0) {
      html += `НДС <strong>${entry.vatRate}%</strong>, `;
    }

    html += `Итог <strong>${entry.finalPrice} руб.</strong>
    </li>`;
  }
  html += '</ul>';

  historyContainer.innerHTML = html;
}


  // Очистить историю
  clearHistoryBtn.addEventListener('click', () => {
    localStorage.removeItem('calcHistory');
    renderHistory();
  });

  calculateBtn.addEventListener('click', calculate);
  resetBtn.addEventListener('click', reset);

  // При загрузке
  renderHistory();
});