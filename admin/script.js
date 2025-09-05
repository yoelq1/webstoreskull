// admin/scripts.js
// Requires: supabase global available from ../supabase/client.js

// --- AUTH GUARD (simple) ------------------------------------
async function adminGuard() {
  // Option A: simple localStorage flag (after login we set 'isAdmin')
  // Option B: session cookie or JWT from supabase auth (not implemented here)
  // We'll proceed without blocking but it's recommended to implement real auth.

  // If you want to enforce admin-only access:
  // if (!localStorage.getItem('isAdmin')) { window.location.href = 'login.html'; }
}

// --- LOAD PRODUCTS ------------------------------------------
async function loadProducts() {
  await adminGuard();
  const { data, error } = await supabase.from('products').select('*').order('created_at', {ascending:false});
  const tbody = document.getElementById('products-body');
  tbody.innerHTML = '';
  if (error) {
    console.error('loadProducts error', error);
    tbody.innerHTML = `<tr><td colspan="4">Gagal memuat produk</td></tr>`;
    return;
  }
  data.forEach(p => {
    const row = document.createElement('tr');
    row.innerHTML = `
      <td>${escapeHtml(p.name)}</td>
      <td>Rp ${p.price}</td>
      <td><img src="${escapeHtml(p.image)}" width="80" alt="${escapeHtml(p.name)}" /></td>
      <td>
        <button class="small-btn btn-edit" onclick="editProduct('${p.id}')">Edit</button>
        <button class="small-btn btn-delete" onclick="deleteProduct('${p.id}')">Hapus</button>
      </td>
    `;
    tbody.appendChild(row);
  });
}

// --- ADD PRODUCT -------------------------------------------
document.getElementById && document.getElementById('add-product-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const name = document.getElementById('p-name').value.trim();
  const price = parseFloat(document.getElementById('p-price').value);
  const image = document.getElementById('p-image').value.trim();
  const desc = document.getElementById('p-desc').value.trim();

  if (!name || !price || !image) { alert('Nama, harga, gambar wajib diisi'); return; }

  const { data, error } = await supabase.from('products').insert([{
    name, price, image, description: desc, created_at: new Date()
  }]);

  if (error) { alert('Gagal menambah produk: ' + error.message); console.error(error); return; }
  alert('Produk berhasil ditambahkan');
  e.target.reset();
  loadProducts();
});

// --- EDIT PRODUCT ------------------------------------------
async function editProduct(id) {
  // Ambil detail
  const { data: rows } = await supabase.from('products').select('*').eq('id', id).limit(1).single();
  if (!rows) return alert('Produk tidak ditemukan');

  const newName = prompt('Nama produk:', rows.name);
  const newPrice = prompt('Harga:', rows.price);
  const newImage = prompt('URL gambar:', rows.image);
  const newDesc = prompt('Deskripsi:', rows.description || '');

  if (!newName || !newPrice || !newImage) return alert('Tidak lengkap, batal');

  const { error } = await supabase.from('products').update({
    name: newName, price: parseFloat(newPrice), image: newImage, description: newDesc
  }).eq('id', id);

  if (error) return alert('Gagal update produk: ' + error.message);
  alert('Produk berhasil diupdate');
  loadProducts();
}

// --- DELETE PRODUCT ----------------------------------------
async function deleteProduct(id) {
  if (!confirm('Hapus produk ini?')) return;
  const { error } = await supabase.from('products').delete().eq('id', id);
  if (error) return alert('Gagal menghapus: ' + error.message);
  alert('Produk dihapus');
  loadProducts();
}

// --- ORDERS ------------------------------------------------
async function loadOrders() {
  await adminGuard();
  const { data, error } = await supabase.from('orders').select('*').order('created_at', {ascending:false});
  const tbody = document.getElementById('orders-body');
  tbody.innerHTML = '';
  if (error) {
    console.error('loadOrders error', error);
    tbody.innerHTML = `<tr><td colspan="7">Gagal memuat pesanan</td></tr>`;
    return;
  }
  data.forEach(o => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>${o.id}</td>
      <td>${escapeHtml(o.product_name || o.product_title || '-')}</td>
      <td>${o.quantity ?? 1}</td>
      <td>Rp ${o.total ?? (o.price ? o.price * (o.quantity ?? 1) : 0)}</td>
      <td>${escapeHtml(o.phone ?? o.customer_phone ?? '-')}</td>
      <td id="status-${o.id}">${escapeHtml(o.status)}</td>
      <td>
        <button class="small-btn btn-done" onclick="updateStatus('${o.id}','done')">Done</button>
        <button class="small-btn btn-cancel" onclick="updateStatus('${o.id}','batal')">Batal</button>
      </td>
    `;
    tbody.appendChild(tr);
  });
}

// --- UPDATE STATUS ----------------------------------------
async function updateStatus(id, newStatus) {
  const { error } = await supabase.from('orders').update({ status: newStatus }).eq('id', id);
  if (error) return alert('Gagal update status: ' + error.message);
  document.getElementById(`status-${id}`).innerText = newStatus;
  alert('Status berhasil diubah: ' + newStatus);
  loadOrders();
}

// --- ADMIN LOGIN HANDLER (for admin/login.html) -----------
document.getElementById && document.getElementById('admin-login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const username = document.getElementById('admin-username').value.trim();
  const password = document.getElementById('admin-password').value;

  // Query table 'admins' yang memiliki kolom username & password
  const { data, error } = await supabase.from('admins').select('*')
    .eq('username', username).eq('password', password).limit(1).single();

  if (error) { alert('Login gagal: ' + (error.message||error)); console.error(error); return; }
  if (!data) { alert('Username / password admin salah'); return; }

  // Set flag sederhana
  localStorage.setItem('isAdmin', '1');
  localStorage.setItem('adminUser', username);
  alert('Login admin sukses');
  window.location.href = 'dashboard.html';
});

// --- LOGOUT ------------------------------------------------
document.getElementById && document.getElementById('admin-logout')?.addEventListener('click', (e) => {
  localStorage.removeItem('isAdmin');
  localStorage.removeItem('adminUser');
  // allow link default to go to login page
});

// --- HELPER ------------------------------------------------
function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('>','&gt;')
    .replaceAll('"','&quot;').replaceAll("'",'&#39;');
}

// --- INIT --------------------------------------------------
document.addEventListener('DOMContentLoaded', () => {
  // load only on dashboard page
  if (document.getElementById('products-body')) loadProducts();
  if (document.getElementById('orders-body')) loadOrders();
});