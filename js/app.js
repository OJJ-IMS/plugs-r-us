// Age gate
const ageGate = document.getElementById('age-gate');
const site = document.getElementById('site');
const enterBtn = document.getElementById('age-gate-enter');

function enterSite() {
  sessionStorage.setItem('ageVerified', '1');
  ageGate.classList.add('hidden');
  site.classList.remove('hidden');
}

if (sessionStorage.getItem('ageVerified')) {
  enterSite();
}

enterBtn.addEventListener('click', enterSite);

// Cart state
let cart = JSON.parse(sessionStorage.getItem('cart') || '[]');

function saveCart() {
  sessionStorage.setItem('cart', JSON.stringify(cart));
}

function getCartCount() {
  return cart.reduce((sum, item) => sum + item.qty, 0);
}

function getCartTotal() {
  return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
}

function updateCartUI() {
  const count = getCartCount();
  document.getElementById('cart-count').textContent = count;
  document.getElementById('cart-count').style.display = count > 0 ? 'flex' : 'none';

  const itemsEl = document.getElementById('cart-items');
  const total = getCartTotal();
  document.getElementById('cart-total').textContent = '$' + total.toFixed(2);

  if (cart.length === 0) {
    itemsEl.innerHTML = '<p class="cart-empty">Your cart is empty.</p>';
    return;
  }

  itemsEl.innerHTML = cart.map(item => `
    <div class="cart-item">
      <div class="cart-item__emoji">${item.emoji}</div>
      <div class="cart-item__info">
        <div class="cart-item__name">${item.name}</div>
        <div class="cart-item__price">$${item.price.toFixed(2)}</div>
      </div>
      <div class="cart-item__qty">
        <button class="qty-btn" data-id="${item.id}" data-action="dec">−</button>
        <span>${item.qty}</span>
        <button class="qty-btn" data-id="${item.id}" data-action="inc">+</button>
      </div>
      <button class="cart-item__remove" data-id="${item.id}">×</button>
    </div>
  `).join('');

  itemsEl.querySelectorAll('.qty-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = parseInt(btn.dataset.id);
      const action = btn.dataset.action;
      const item = cart.find(i => i.id === id);
      if (!item) return;
      if (action === 'inc') item.qty++;
      else item.qty = Math.max(0, item.qty - 1);
      cart = cart.filter(i => i.qty > 0);
      saveCart();
      updateCartUI();
    });
  });

  itemsEl.querySelectorAll('.cart-item__remove').forEach(btn => {
    btn.addEventListener('click', () => {
      cart = cart.filter(i => i.id !== parseInt(btn.dataset.id));
      saveCart();
      updateCartUI();
    });
  });
}

function addToCart(product) {
  const existing = cart.find(i => i.id === product.id);
  if (existing) {
    existing.qty++;
  } else {
    cart.push({ id: product.id, name: product.name, price: product.price, emoji: product.emoji, qty: 1 });
  }
  saveCart();
  updateCartUI();
  showToast(`${product.emoji} ${product.name} added to cart!`);
}

// Toast
function showToast(msg) {
  const toast = document.getElementById('toast');
  toast.textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2800);
}

// Cart drawer
const cartDrawer = document.getElementById('cart-drawer');
const cartOverlay = document.getElementById('cart-overlay');

function openCart() {
  cartDrawer.classList.add('open');
  cartOverlay.classList.add('show');
}

function closeCart() {
  cartDrawer.classList.remove('open');
  cartOverlay.classList.remove('show');
}

document.getElementById('cart-toggle').addEventListener('click', openCart);
document.getElementById('cart-close').addEventListener('click', closeCart);
cartOverlay.addEventListener('click', closeCart);

document.getElementById('checkout-btn').addEventListener('click', () => {
  if (cart.length === 0) { showToast('Your cart is empty!'); return; }
  cart = [];
  saveCart();
  updateCartUI();
  closeCart();
  showToast('✅ Order placed! Check your email for confirmation.');
});

// Render product card
function renderCard(product) {
  const card = document.createElement('div');
  card.className = 'product-card';
  card.dataset.category = product.category;

  const stars = '★'.repeat(Math.floor(product.rating)) + (product.rating % 1 >= 0.5 ? '½' : '');
  const saleHtml = product.originalPrice
    ? `<span class="price--original">$${product.originalPrice.toFixed(2)}</span>`
    : '';

  card.innerHTML = `
    ${product.badge ? `<span class="product-badge" style="background:${product.color}">${product.badge}</span>` : ''}
    <div class="product-card__emoji" style="background:${product.color}22">${product.emoji}</div>
    <div class="product-card__body">
      <h3 class="product-card__name">${product.name}</h3>
      <p class="product-card__tagline">${product.tagline}</p>
      <p class="product-card__meta">${product.material} · ${product.size}</p>
      <p class="product-card__desc">${product.description}</p>
      <div class="product-card__rating">
        <span class="stars">${stars}</span>
        <span class="rating-num">${product.rating} (${product.reviews})</span>
      </div>
      <div class="product-card__footer">
        <div class="product-card__price">
          ${saleHtml}
          <span class="price--current">$${product.price.toFixed(2)}</span>
        </div>
        <button class="btn btn--primary add-to-cart-btn" data-id="${product.id}">Add to Cart</button>
      </div>
    </div>
  `;

  card.querySelector('.add-to-cart-btn').addEventListener('click', () => addToCart(product));
  return card;
}

// Populate grids
function populateGrids() {
  const bestsellerGrid = document.getElementById('bestseller-grid');
  const catalogGrid = document.getElementById('catalog-grid');

  PRODUCTS.filter(p => p.bestseller).forEach(p => bestsellerGrid.appendChild(renderCard(p)));
  PRODUCTS.forEach(p => catalogGrid.appendChild(renderCard(p)));
}

// Filter buttons
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    const filter = btn.dataset.filter;
    document.querySelectorAll('#catalog-grid .product-card').forEach(card => {
      const show = filter === 'all' || card.dataset.category === filter;
      card.style.display = show ? '' : 'none';
    });
  });
});

// Contact form
document.getElementById('contact-form').addEventListener('submit', e => {
  e.preventDefault();
  document.getElementById('form-success').classList.remove('hidden');
  e.target.reset();
});

// Smooth scroll for nav links
document.querySelectorAll('a[href^="#"]').forEach(a => {
  a.addEventListener('click', e => {
    const target = document.querySelector(a.getAttribute('href'));
    if (target) { e.preventDefault(); target.scrollIntoView({ behavior: 'smooth' }); }
  });
});

// Init
populateGrids();
updateCartUI();
