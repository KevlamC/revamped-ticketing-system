// booking.js
// Booking flow script with size-aware food items

// Shared helpers
const parseQty = v => Math.max(0, parseInt(v, 10) || 0);
// Normalize a stored foodOrder entry so older formats don't show 'undefined'
const normalizeFoodItem = (key, item) => {
  // If the stored item already has name, use it
  if (item && item.name) {
    return {
      name: item.name,
      size: item.size || null,
      qty: parseQty(item.qty),
      price: parseFloat(item.price) || 0
    };
  }
  // Legacy/other formats: try to recover from the key "Name||Size"
  const parts = String(key).split('||');
  const name = parts[0] || key;
  const size = parts[1] && parts[1] !== 'Default' ? parts[1] : null;
  let qty = 0;
  let price = 0;
  if (item == null) {
    qty = 0;
    price = 0;
  } else if (typeof item === 'number') {
    qty = parseQty(item);
  } else if (typeof item === 'string') {
    qty = parseQty(item);
  } else if (typeof item === 'object') {
    qty = parseQty(item.qty);
    price = parseFloat(item.price) || 0;
  }
  return { name, size, qty, price };
};

// Normalize an entire foodOrder object and return a canonical map keyed by "Name||Size"
const normalizeFoodOrder = raw => {
  const normalized = {};
  try {
    const keys = Object.keys(raw || {});
    keys.forEach(k => {
      const rawItem = raw[k];
      const it = normalizeFoodItem(k, rawItem);
      const key = `${it.name}||${it.size || 'Default'}`;
      if (!normalized[key]) {
        normalized[key] = { name: it.name, size: it.size, qty: 0, price: it.price };
      }
      // accumulate quantity
      normalized[key].qty = (normalized[key].qty || 0) + (parseQty(it.qty) || 0);
      // prefer an explicit price if provided
      if (it.price) normalized[key].price = it.price;
    });
  } catch (e) {
    // if parsing fails, return empty map
    return {};
  }
  return normalized;
};

const getNormalizedFoodOrder = () => {
  const raw = JSON.parse(localStorage.getItem('foodOrder') || '{}');
  const norm = normalizeFoodOrder(raw);
  // rewrite storage to canonical form so future reads are consistent
  localStorage.setItem('foodOrder', JSON.stringify(norm));
  return norm;
};

document.addEventListener('DOMContentLoaded', () => {
  // small helper to unify popups (toast first, fallback to alert)
  const notify = (message, type = 'info') => {
    if (typeof showToast === 'function') {
      showToast(message, type);
    } else {
      alert(message);
    }
  };

  // -----------------------
  // Checkout page
  // -----------------------
  if (document.getElementById('checkout-ticket-qty')) {
    const qtyEl = document.getElementById('checkout-ticket-qty');
    const seatsEl = document.getElementById('checkout-seats');
    const ticketPriceEl = document.getElementById('checkout-ticket-price');
    const foodListEl = document.getElementById('checkout-food-list');
    const upsellListEl = document.getElementById('checkout-upsell-list');
    const totalEl = document.getElementById('checkout-total');
    const finalizeBtn = document.getElementById('finalize-purchase');

    const ticketQty = parseQty(localStorage.getItem('ticketQty')) || 0;
    const ticketUnitPrice = parseFloat(localStorage.getItem('ticketUnitPrice')) || 12.0;
    const seats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
    const foodOrder = getNormalizedFoodOrder();
    const upsellCart = JSON.parse(localStorage.getItem('upsellCart') || '[]');

    // Small price map fallback
    const priceMap = {
      'Classic Popcorn': 6,
      'Ultimate Combo': 22,
      'Loaded Nachos': 9
    };

    // Tickets
    qtyEl.textContent = ticketQty;
    seatsEl.textContent = seats.length ? seats.join(', ') : '-';
    ticketPriceEl.textContent = `$${(ticketQty * ticketUnitPrice).toFixed(2)}`;

    // Food: iterate stored keys (key = name||size)
    foodListEl.innerHTML = '';
    let foodTotal = 0;
    Object.keys(foodOrder).forEach(k => {
      const raw = foodOrder[k];
      const it = normalizeFoodItem(k, raw);
      const qty = parseQty(it.qty);
      const unit = parseFloat(it.price) || (priceMap[it.name] || 0);
      if (qty > 0) {
        const line = unit * qty;
        foodTotal += line;
        const li = document.createElement('li');
        // label
        const span = document.createElement('span');
        span.textContent = `${it.name}${it.size ? ` (${it.size})` : ''} × ${qty} — $${line.toFixed(2)}`;
        li.appendChild(span);
        // remove button to let user delete unexpected items
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-secondary';
        removeBtn.style.marginLeft = '12px';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          const current = getNormalizedFoodOrder();
          if (current[k]) delete current[k];
          localStorage.setItem('foodOrder', JSON.stringify(current));
          // simple refresh
          window.location.reload();
        });
        li.appendChild(removeBtn);
        foodListEl.appendChild(li);
      }
    });
    if (!foodListEl.children.length) {
      const li = document.createElement('li');
      li.textContent = 'No snacks selected.';
      foodListEl.appendChild(li);
    }

    // Upsells (aggregate duplicates)
    upsellListEl.innerHTML = '';
    let upsellTotal = 0;
    if (Array.isArray(upsellCart) && upsellCart.length) {
      const map = {};
      upsellCart.forEach(u => {
        const key = u.item || String(u);
        const price = parseFloat(u.price) || 0;
        upsellTotal += price;
        if (!map[key]) map[key] = { qty: 0, price };
        map[key].qty += 1;
      });
      Object.keys(map).forEach(k => {
        const it = map[k];
        const li = document.createElement('li');
        const span = document.createElement('span');
        span.textContent = `${k} × ${it.qty} — $${(it.qty * it.price).toFixed(2)}`;
        li.appendChild(span);
        const removeBtn = document.createElement('button');
        removeBtn.className = 'btn-secondary';
        removeBtn.style.marginLeft = '12px';
        removeBtn.textContent = 'Remove';
        removeBtn.addEventListener('click', () => {
          const ups = JSON.parse(localStorage.getItem('upsellCart') || '[]');
          const filtered = ups.filter(u => (u.item || String(u)) !== k);
          localStorage.setItem('upsellCart', JSON.stringify(filtered));
          window.location.reload();
        });
        li.appendChild(removeBtn);
        upsellListEl.appendChild(li);
      });
    } else {
      const li = document.createElement('li');
      li.textContent = 'No upsells.';
      upsellListEl.appendChild(li);
    }

    const total = ticketQty * ticketUnitPrice + foodTotal + upsellTotal;
    totalEl.textContent = `$${total.toFixed(2)}`;

    finalizeBtn &&
      finalizeBtn.addEventListener('click', () => {
        const foodSummary = Object.keys(foodOrder).length
          ? Object.keys(foodOrder)
              .map(k => {
                const raw = foodOrder[k];
                const it = normalizeFoodItem(k, raw);
                return `${it.name}${
                  it.size ? ` (${it.size})` : ''
                }×${it.qty} ($${(parseFloat(it.price || 0) * parseQty(it.qty)).toFixed(2)})`;
              })
              .join(', ')
          : 'None';

        const upsellSummary = upsellCart.length
          ? upsellCart.map(u => `${u.item} ($${(u.price || 0).toFixed(2)})`).join(', ')
          : 'None';

        const fullMessage =
          'Thank you for your purchase!\n\nOrder details:\n' +
          `Tickets: ${ticketQty} ($${(ticketQty * ticketUnitPrice).toFixed(2)})\n` +
          `Seats: ${seats.length ? seats.join(', ') : '-'}\n` +
          `Snacks: ${foodSummary}\n` +
          `Upsells: ${upsellSummary}\n` +
          `Total: $${total.toFixed(2)}`;

        // Use toast for a clean success popup, log full details to console
        if (typeof showToast === 'function') {
          console.log(fullMessage);
          notify('Thank you for your purchase!', 'success');
        } else {
          alert(fullMessage);
        }

        // clear demo state
        localStorage.removeItem('ticketQty');
        localStorage.removeItem('selectedSeats');
        localStorage.removeItem('foodOrder');
        localStorage.removeItem('upsellCart');
        window.location.href = 'index.html';
      });
  }

  // -----------------------
  // Ticket quantity page
  // -----------------------
  const ticketCountEl = document.getElementById('ticket-count');
  const incrementBtn = document.getElementById('increment');
  const decrementBtn = document.getElementById('decrement');
  const proceedToSeatsBtn = document.getElementById('proceed-to-seats');
  const ticketPriceEl = document.getElementById('ticket-price');
  const ticketTypeEl = document.getElementById('ticket-type');

  if (ticketCountEl && incrementBtn && decrementBtn) {
    let count = parseQty(localStorage.getItem('ticketQty')) || 1;
    // determine initial price per ticket from saved value or selected ticket type
    let pricePer = parseFloat(localStorage.getItem('ticketUnitPrice')) || 12.0;
    if (ticketTypeEl && ticketTypeEl.selectedOptions && ticketTypeEl.selectedOptions[0]) {
      pricePer = parseFloat(ticketTypeEl.selectedOptions[0].dataset.price) || pricePer;
    }

    const render = () => {
      ticketCountEl.textContent = count;
      ticketPriceEl && (ticketPriceEl.textContent = `$${pricePer.toFixed(2)}`);
    };
    render();

    // when ticket type changes, update pricePer and persist
    if (ticketTypeEl) {
      ticketTypeEl.addEventListener('change', () => {
        const opt = ticketTypeEl.selectedOptions && ticketTypeEl.selectedOptions[0];
        const newPrice = opt ? parseFloat(opt.dataset.price) || pricePer : pricePer;
        pricePer = newPrice;
        // save selected type and unit price for later pages (upsell/checkout)
        localStorage.setItem('ticketType', ticketTypeEl.value || 'standard');
        localStorage.setItem('ticketUnitPrice', String(pricePer));
        render();
      });
      // ensure we persist initial selection as well
      localStorage.setItem('ticketType', ticketTypeEl.value || 'standard');
      localStorage.setItem('ticketUnitPrice', String(pricePer));
    }

    incrementBtn.addEventListener('click', () => {
      count = Math.min(10, count + 1);
      localStorage.setItem('ticketQty', count);
      render();
    });

    decrementBtn.addEventListener('click', () => {
      count = Math.max(1, count - 1);
      localStorage.setItem('ticketQty', count);
      render();
    });

    proceedToSeatsBtn &&
      proceedToSeatsBtn.addEventListener('click', () => {
        localStorage.setItem('ticketQty', count);
        // also persist the latest unit price (in case user didn't change type after load)
        if (ticketTypeEl) {
          const opt = ticketTypeEl.selectedOptions && ticketTypeEl.selectedOptions[0];
          const unit = opt ? parseFloat(opt.dataset.price) || pricePer : pricePer;
          localStorage.setItem('ticketUnitPrice', String(unit));
          localStorage.setItem('ticketType', ticketTypeEl.value || 'standard');
        }
        window.location.href = 'seat_selection.html';
      });
  }

  // -----------------------
  // Seat selection page (old grid-based version)
  // -----------------------
  const seatMapEl = document.getElementById('seat-map');
  const selectedQtyEl = document.getElementById('selected-qty');
  const confirmSeatsBtn = document.getElementById('confirm-seats');
  if (seatMapEl) {
    const rows = 6;
    const cols = 9;
    const totalSeats = rows * cols;
    const desiredQty = parseQty(localStorage.getItem('ticketQty')) || 1;
    selectedQtyEl && (selectedQtyEl.textContent = desiredQty);

    // build seat map row-by-row so we can insert a spacer (staircase) between columns
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        // insert narrow visual spacers (staircases) after certain columns
        // keep them narrower than seat buttons so seat sizes are not changed
        if (c === 3 || c === 6) {
          const spacer = document.createElement('div');
          spacer.className = 'seat-spacer';
          spacer.style.display = 'inline-block';
          // make the staircase column noticeably narrower than a seat
          spacer.style.width = '10px';
          // match vertical rhythm but don't force button sizing
          spacer.style.height = '44px';
          spacer.style.margin = '6px 2px';
          spacer.style.verticalAlign = 'middle';
          // optionally add a subtle visual to suggest steps
          spacer.style.background = 'transparent';
          seatMapEl.appendChild(spacer);
          continue;
        }

        const index = r * cols + c;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'showtime-btn';
        btn.textContent = `${r + 1}${String.fromCharCode(65 + c)}`;
        btn.dataset.index = index;
        btn.dataset.selected = 'false';
        btn.addEventListener('click', () => {
          const currentlySelected = seatMapEl.querySelectorAll('button[data-selected="true"]').length;
          const isSelected = btn.dataset.selected === 'true';
          if (!isSelected && currentlySelected >= desiredQty) return;
          if (isSelected) {
            btn.dataset.selected = 'false';
            btn.style.background = '';
            btn.style.color = '';
          } else {
            btn.dataset.selected = 'true';
            btn.style.background = 'var(--accent-red)';
            btn.style.color = 'white';
          }
        });
        seatMapEl.appendChild(btn);
      }
    }

    confirmSeatsBtn &&
      confirmSeatsBtn.addEventListener('click', () => {
        const selected = Array.from(
          seatMapEl.querySelectorAll('button[data-selected="true"]')
        ).map(b => b.textContent);
        if (selected.length !== desiredQty) {
          notify(`Please select ${desiredQty} seat${desiredQty === 1 ? '' : 's'}.`, 'error');
          return;
        }
        localStorage.setItem('selectedSeats', JSON.stringify(selected));
        window.location.href = 'food_selection.html';
      });
  }

  // -----------------------
  // Food selection page
  // -----------------------
  if (document.querySelectorAll('.concession-card').length) {
    const snackCards = Array.from(document.querySelectorAll('.concession-card'));
    // order keyed by `${name}||${size}` -> { name, size, qty, price }
    const order = getNormalizedFoodOrder();

    snackCards.forEach(card => {
      const qtyEl = card.querySelector('.snack-qty');
      const inc = card.querySelector('.qty-increase');
      const dec = card.querySelector('.qty-decrease');
      const add = card.querySelector('.add-snack');
      const sizeSelect = card.querySelector('.size-select');

      let qty = 0;
      const renderQty = () => qtyEl && (qtyEl.textContent = qty);
      renderQty();

      inc &&
        inc.addEventListener('click', () => {
          qty = Math.min(10, qty + 1);
          renderQty();
        });
      dec &&
        dec.addEventListener('click', () => {
          qty = Math.max(0, qty - 1);
          renderQty();
        });

      add &&
        add.addEventListener('click', () => {
          const name = card.querySelector('h3').textContent.trim();
          let selectedSize = null;
          let unitPrice = parseFloat(add.dataset.price) || 0;
          if (sizeSelect && sizeSelect.selectedOptions && sizeSelect.selectedOptions[0]) {
            const opt = sizeSelect.selectedOptions[0];
            selectedSize = opt.dataset.size || opt.textContent || null;
            unitPrice = parseFloat(opt.dataset.price) || unitPrice;
          }

          if (qty <= 0) {
            notify('Choose a quantity first', 'error');
            return;
          }

          const key = `${name}||${selectedSize || 'Default'}`;
          if (!order[key]) {
            order[key] = { name, size: selectedSize, qty: 0, price: unitPrice };
          }
          order[key].qty = (order[key].qty || 0) + qty;
          order[key].price = unitPrice;
          // write normalized order back to storage
          localStorage.setItem('foodOrder', JSON.stringify(order));
          qty = 0;
          renderQty();
          notify(
            `${name}${selectedSize ? ' (' + selectedSize + ')' : ''} added to your order`,
            'success'
          );
        });
    });

    const reviewBtn = document.getElementById('review-order');
    reviewBtn &&
      reviewBtn.addEventListener(
        'click',
        () => (window.location.href = 'payment-summary.html')
      );
  }

  // -----------------------
  // Snack upsell page
  // -----------------------
  if (document.querySelectorAll('.add-upsell').length) {
    const upsells = Array.from(document.querySelectorAll('.add-upsell'));
    const totalEl = document.getElementById('order-total');

    let baseTotal = 0;
    const ticketQty = parseQty(localStorage.getItem('ticketQty')) || 0;
    // read persisted unit price (set on the ticket quantity page) so upsell totals match selected ticket type
    const ticketUnitPrice = parseFloat(localStorage.getItem('ticketUnitPrice')) || 12.0;
    baseTotal += ticketQty * ticketUnitPrice;

    const foodOrder = getNormalizedFoodOrder();
    Object.keys(foodOrder).forEach(k => {
      const raw = foodOrder[k];
      const it = normalizeFoodItem(k, raw);
      const qty = parseQty(it.qty);
      const unit = parseFloat(it.price) || 0;
      baseTotal += unit * qty;
    });

    let upsellTotal = 0;
    const renderTotal = () =>
      totalEl && (totalEl.textContent = `$${(baseTotal + upsellTotal).toFixed(2)}`);
    renderTotal();

    upsells.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.dataset.item;
        const price = parseFloat(btn.dataset.price) || 0;
        upsellTotal += price;
        const upsellCart = JSON.parse(localStorage.getItem('upsellCart') || '[]');
        upsellCart.push({ item, price });
        localStorage.setItem('upsellCart', JSON.stringify(upsellCart));
        renderTotal();
        btn.textContent = 'Added';
        btn.disabled = true;
      });
    });

    const completeBtn = document.getElementById('complete-purchase');
    if (completeBtn) {
      completeBtn.addEventListener('click', () => {
        /* navigation link will go to checkout */
      });
    }
  }
});

// ---------- Global toast / popup helper ----------
(function () {
  var timeoutId = null;

  function ensureToast() {
    var existing = document.getElementById('app-toast');
    if (existing) return existing;

    var toast = document.createElement('div');
    toast.id = 'app-toast';
    toast.className = 'app-toast';
    toast.dataset.type = 'info';

    var icon = document.createElement('span');
    icon.className = 'app-toast-icon';
    icon.textContent = '•';

    var msg = document.createElement('span');
    msg.id = 'app-toast-message';

    toast.appendChild(icon);
    toast.appendChild(msg);
    document.body.appendChild(toast);
    return toast;
  }

  function show(message, type) {
    var toast = ensureToast();
    var msgEl = document.getElementById('app-toast-message') || toast;
    msgEl.textContent = message;

    type = type || 'info';
    toast.dataset.type = type;

    // icon per type
    var iconEl = toast.querySelector('.app-toast-icon');
    if (iconEl) {
      if (type === 'error') iconEl.textContent = '⚠️';
      else if (type === 'success') iconEl.textContent = '✅';
      else iconEl.textContent = 'ℹ️';
    }

    toast.classList.add('visible');
    clearTimeout(timeoutId);
    timeoutId = setTimeout(function () {
      toast.classList.remove('visible');
    }, 2400);
  }

  // make it globally available
  window.showToast = function (message, type) {
    show(message, type);
  };
})();
