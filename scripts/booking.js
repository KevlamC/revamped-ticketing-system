// booking.js
// Minimal interactions for the booking flow pages:
// - ticket_quantity.html: increase/decrease quantity and persist to localStorage
// - seat_selection.html: render seat map, allow selection up to quantity
// - food_selection.html: simple add-to-order UI
// - snack_upsell.html: add upsells and compute order total

document.addEventListener('DOMContentLoaded', () => {
  // Shared helpers
  const parseQty = v => Math.max(0, parseInt(v, 10) || 0);

  // Ticket Quantity page
  const ticketCountEl = document.getElementById('ticket-count');
  const incrementBtn = document.getElementById('increment');
  const decrementBtn = document.getElementById('decrement');
  const proceedToSeatsBtn = document.getElementById('proceed-to-seats');
  const ticketPriceEl = document.getElementById('ticket-price');

  if (ticketCountEl && incrementBtn && decrementBtn) {
    let count = parseQty(localStorage.getItem('ticketQty')) || 1;
    const pricePer = 12.0;
    const render = () => {
      ticketCountEl.textContent = count;
      ticketPriceEl && (ticketPriceEl.textContent = `$${pricePer.toFixed(2)}`);
    };
    render();

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

    proceedToSeatsBtn && proceedToSeatsBtn.addEventListener('click', () => {
      // ensure qty persisted
      localStorage.setItem('ticketQty', count);
      window.location.href = 'seat_selection.html';
    });
  }

  // Seat selection page
  const seatMapEl = document.getElementById('seat-map');
  const selectedQtyEl = document.getElementById('selected-qty');
  const confirmSeatsBtn = document.getElementById('confirm-seats');
  if (seatMapEl) {
    const rows = 6; // 6 rows
    const cols = 8; // 8 seats per row
    const totalSeats = rows * cols;
    const desiredQty = parseQty(localStorage.getItem('ticketQty')) || 1;
    selectedQtyEl && (selectedQtyEl.textContent = desiredQty);

    // create seats
    for (let i = 0; i < totalSeats; i++) {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'showtime-btn';
      btn.style.padding = '12px';
      btn.textContent = `${Math.floor(i / cols) + 1}${String.fromCharCode(65 + (i % cols))}`; // e.g. 1A
      btn.dataset.index = i;
      btn.dataset.selected = 'false';
      btn.addEventListener('click', () => {
        // toggle selection but respect desiredQty
        const currentlySelected = seatMapEl.querySelectorAll('button[data-selected="true"]').length;
        const isSelected = btn.dataset.selected === 'true';
        if (!isSelected && currentlySelected >= desiredQty) {
          // allow deselect only
          return;
        }
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

    confirmSeatsBtn && confirmSeatsBtn.addEventListener('click', () => {
      const selected = Array.from(seatMapEl.querySelectorAll('button[data-selected="true"]')).map(b => b.textContent);
      if (selected.length !== desiredQty) {
        alert(`Please select ${desiredQty} seats.`);
        return;
      }
      localStorage.setItem('selectedSeats', JSON.stringify(selected));
      window.location.href = 'food_selection.html';
    });
  }

  // Food selection page
  if (document.querySelectorAll('.concession-card').length) {
    const snackCards = Array.from(document.querySelectorAll('.concession-card'));
    const order = JSON.parse(localStorage.getItem('foodOrder') || '{}');

    snackCards.forEach(card => {
      const qtyEl = card.querySelector('.snack-qty');
      const inc = card.querySelector('.qty-increase');
      const dec = card.querySelector('.qty-decrease');
      const add = card.querySelector('.add-snack');

      let qty = 0;
      const renderQty = () => qtyEl && (qtyEl.textContent = qty);
      renderQty();

      inc && inc.addEventListener('click', () => { qty = Math.min(10, qty + 1); renderQty(); });
      dec && dec.addEventListener('click', () => { qty = Math.max(0, qty - 1); renderQty(); });

      add && add.addEventListener('click', () => {
        const name = card.querySelector('h3').textContent.trim();
        if (qty <= 0) return alert('Choose a quantity first');
        order[name] = (order[name] || 0) + qty;
        localStorage.setItem('foodOrder', JSON.stringify(order));
        qty = 0; renderQty();
        alert(`${name} added to your order`);
      });
    });

    const reviewBtn = document.getElementById('review-order');
    reviewBtn && reviewBtn.addEventListener('click', () => {
      window.location.href = 'snack_upsell.html';
    });
  }

  // Snack upsell page
  if (document.querySelectorAll('.add-upsell').length) {
    const upsells = Array.from(document.querySelectorAll('.add-upsell'));
    const totalEl = document.getElementById('order-total');
    let baseTotal = 0;

    // compute base total from tickets + food (simple pricing)
    const ticketQty = parseQty(localStorage.getItem('ticketQty')) || 0;
    baseTotal += ticketQty * 12.0;

    const foodOrder = JSON.parse(localStorage.getItem('foodOrder') || '{}');
    // simple prices map for demo
    const priceMap = {
      'Classic Popcorn': 6,
      'Ultimate Combo': 22,
      'Loaded Nachos': 9,
      'cookie': 4,
      'drink-upgrade': 2,
      'poster': 10
    };

    Object.keys(foodOrder).forEach(name => {
      const qty = parseQty(foodOrder[name]);
      baseTotal += (priceMap[name] || 5) * qty;
    });

    let upsellTotal = 0;
    const renderTotal = () => {
      totalEl && (totalEl.textContent = `$${(baseTotal + upsellTotal).toFixed(2)}`);
    };
    renderTotal();

    upsells.forEach(btn => {
      btn.addEventListener('click', () => {
        const item = btn.dataset.item;
        const price = parseFloat(btn.dataset.price) || 0;
        upsellTotal += price;
        // persist simple upsell cart
        const upsellCart = JSON.parse(localStorage.getItem('upsellCart') || '[]');
        upsellCart.push({ item, price });
        localStorage.setItem('upsellCart', JSON.stringify(upsellCart));
        renderTotal();
        btn.textContent = 'Added';
        btn.disabled = true;
      });
    });

    const completeBtn = document.getElementById('complete-purchase');
    completeBtn && completeBtn.addEventListener('click', (e) => {
      e.preventDefault();
      // For demo: show a summary
      const seats = JSON.parse(localStorage.getItem('selectedSeats') || '[]');
      const food = JSON.parse(localStorage.getItem('foodOrder') || '{}');
      const upsell = JSON.parse(localStorage.getItem('upsellCart') || '[]');
      alert('Purchase complete!\nSeats: ' + seats.join(', ') + '\nFood: ' + JSON.stringify(food) + '\nUpsells: ' + JSON.stringify(upsell) + '\nTotal: ' + (totalEl ? totalEl.textContent : '$0.00'));
      // Clear demo state
      localStorage.removeItem('ticketQty');
      localStorage.removeItem('selectedSeats');
      localStorage.removeItem('foodOrder');
      localStorage.removeItem('upsellCart');
      window.location.href = 'index.html';
    });
  }
});
