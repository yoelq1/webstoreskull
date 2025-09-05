// assets/js/script.js
// Semua interaksi user-side: produk, keranjang, checkout, history

// --- Keranjang (localStorage) --------------------
function getCart() {
  return JSON.parse(localStorage.getItem('cart') || '[]');
}

function saveCart(cart) {
  localStorage.setItem('cart', JSON.stringify(cart));
}

// Tambah ke keranjang
function addToCart(product) {
  const cart = getCart();
  const existing = cart.find(c => c.id === product.id);
  if (existing) {
    existing.qty += 1;
  } else {
    cart.push({...product, qty: 1});
  }
  saveCart(cart);
  alert(product.name + ' ditambahkan ke keranjang');
}

// Render keranjang di cart.html
function renderCart() {
  const tbody = document.getElementById('cart-body');
  if (!tbody) return;
  const cart = getCart();
  tbody.innerHTML = '';
  let total = 0;
  cart.forEach((item, idx) => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${item.name}</td>
      <td>${item.qty}</td>
      <td>Rp ${item.price}</td>
      <td>Rp ${item.price * item.qty}</td>
      <td><button class="button" onclick="removeItem(${idx})">Hapus</button></td>
    `;
    total += item.price * item.qty;
    tbody.appendChild(tr);
  });
  document.getElementById('cart-total').innerText = 'Rp ' + total;
}

function removeItem(index) {
  const cart = getCart();
  cart.splice(index,1);
  saveCart(cart);
  renderCart();
}

// Checkout submit
document.getElementById('checkout-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const cart = getCart();
  if (!cart.length) { alert('Keranjang kosong'); return; }

  const phone = document.getElementById('phone').value;
  const address = document.getElementById('address').value;

  // Simpan order ke Supabase
  for (let item of cart) {
    await supabase.from('orders').insert([{
      product_name: item.name,
      quantity: item.qty,
      total: item.price * item.qty,
      phone: phone,
      address: address,
      status: 'pending',
      created_at: new Date()
    }]);
  }

  alert('Pesanan berhasil dibuat!');

  localStorage.removeItem('cart');
  window.location.href = 'history.html';
});

// Render history
async function renderHistory() {
  const tbody = document.getElementById('history-body');
  if (!tbody) return;

  const { data, error } = await supabase.from('orders').select('*').order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    tbody.innerHTML = `<tr><td colspan="5">Gagal memuat riwayat</td></tr>`;
    return;
  }

  tbody.innerHTML = '';
  data.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.product_name}</td>
      <td>${o.quantity}</td>
      <td>Rp ${o.total}</td>
      <td>${o.status}</td>
      <td>${o.created_at ? new Date(o.created_at).toLocaleString() : '-'}</td>
    `;
    tbody.appendChild(tr);
  });
}

// Load produk di product.html
async function loadProducts() {
  const container = document.getElementById('products-list');
  if (!container) return;

  const { data, error } = await supabase.from('products').select('*').order('created_at', { ascending: false });
  if (error) {
    console.error(error);
    container.innerHTML = '<p>Gagal memuat produk</p>';
    return;
  }

  container.innerHTML = '';
  data.forEach(p => {
    const card = document.createElement('div');
    card.className = 'card';
    card.innerHTML = `
      <img src="${p.image}" alt="${p.name}" />
      <div class="card-body">
        <h3>${p.name}</h3>
        <p>${p.description || ''}</p>
        <div class="price">Rp ${p.price}</div>
        <button class="button" onclick='addToCart(${JSON.stringify(p)})'>Beli</button>
      </div>
    `;
    container.appendChild(card);
  });
}

// --- INIT (jalan sesuai halaman) --------------------------
document.addEventListener('DOMContentLoaded', () => {
  renderCart();
  renderHistory();
  loadProducts();
});