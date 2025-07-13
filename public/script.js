const form = document.getElementById('incomeForm');
const status = document.getElementById('status');
const tableContainer = document.getElementById('tableContainer');
const yearFilter = document.getElementById('yearFilter');
const monthFilter = document.getElementById('monthFilter');
const paginationControls = document.getElementById('paginationControls');

let monthlyChart, yearlyChart;
let currentPage = 1;
const itemsPerPage = 30;

form.addEventListener('submit', async (e) => {
  e.preventDefault();

  const entry = {
    date: document.getElementById('date').value,
    event: document.getElementById('event').value,
    token: document.getElementById('token').value,
    amount: parseFloat(document.getElementById('amount').value),
    usd: parseFloat(document.getElementById('usd').value)
  };

  const editIndex = form.dataset.editIndex;
  if (editIndex !== undefined) {
    await fetch('/edit', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ index: parseInt(editIndex), entry })
    });
    delete form.dataset.editIndex;
  } else {
    await fetch('/save', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry)
    });
  }

  status.textContent = 'Data berhasil disimpan';
  form.reset();
  currentPage = 1;
  loadTable();
});

async function loadTable() {
  const res = await fetch('/data');
  const data = await res.json();
  if (!data || data.length === 0) {
    tableContainer.innerHTML = '<p>Belum ada data.</p>';
    paginationControls.innerHTML = '';
    return;
  }

  const selectedYear = yearFilter.value ? parseInt(yearFilter.value) : null;
  const selectedMonth = monthFilter.value;

  const filteredData = data.filter(item => {
    const dateObj = new Date(item.date);
    const yearMatch = !selectedYear || dateObj.getFullYear() === selectedYear;
    const monthMatch = selectedMonth ? String(dateObj.getMonth() + 1).padStart(2, '0') === selectedMonth : true;
    return yearMatch && monthMatch;
  }).sort((a, b) => new Date(a.date) - new Date(b.date));

  const paginatedData = filteredData.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);
  const totalPages = Math.ceil(filteredData.length / itemsPerPage);

  const years = new Set(data.map(d => new Date(d.date).getFullYear()));
  const monthlySums = {};
  const yearlySums = {};

  filteredData.forEach(entry => {
    const dateObj = new Date(entry.date);
    const year = dateObj.getFullYear();
    const monthName = dateObj.toLocaleString('id-ID', { month: 'long' });
    const monthKey = `${monthName}`;
    monthlySums[monthKey] = (monthlySums[monthKey] || 0) + entry.usd;
    yearlySums[year] = (yearlySums[year] || 0) + entry.usd;
    years.add(year);
  });

  let html = '<table><thead><tr><th>No</th><th>Tanggal</th><th>Event</th><th>Token</th><th>Amount</th><th>USD</th><th>Aksi</th></tr></thead><tbody>';
  paginatedData.forEach((entry, i) => {
    const globalIndex = data.findIndex(d =>
      d.date === entry.date &&
      d.event === entry.event &&
      d.token === entry.token &&
      d.amount === entry.amount &&
      d.usd === entry.usd
    );
    html += `<tr>
      <td>${i + 1 + (currentPage - 1) * itemsPerPage}</td>
      <td>${entry.date}</td><td>${entry.event}</td><td>${entry.token}</td>
      <td>${entry.amount}</td><td>${entry.usd.toFixed(2)}</td>
      <td>
        <button onclick="editEntry(${globalIndex})">Edit</button>
        <button onclick="deleteEntry(${globalIndex})">Hapus</button>
      </td>
    </tr>`;
  });
  html += '</tbody></table>';

  html += '<h3>Total USD per Bulan</h3><ul>';
  for (const month in monthlySums) {
    html += `<li>${month}: ${monthlySums[month].toFixed(2)} USD</li>`;
  }
  html += '</ul>';

  html += '<h3>Total USD per Tahun</h3><ul>';
  for (const year in yearlySums) {
    html += `<li>${year}: ${yearlySums[year].toFixed(2)} USD</li>`;
  }
  html += '</ul>';

  tableContainer.innerHTML = html;
  updateYearFilter([...years].sort());
  renderPagination(totalPages);
  drawMonthlyChart(monthlySums);
  drawYearlyChart(yearlySums);
}

function renderPagination(totalPages) {
  paginationControls.innerHTML = '';
  if (totalPages <= 1) return;

  if (currentPage > 1) {
    const prevBtn = document.createElement('button');
    prevBtn.textContent = 'Prev';
    prevBtn.onclick = () => { currentPage--; loadTable(); };
    paginationControls.appendChild(prevBtn);
  }

  for (let i = 1; i <= totalPages; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.disabled = i === currentPage;
    btn.onclick = () => { currentPage = i; loadTable(); };
    paginationControls.appendChild(btn);
  }

  if (currentPage < totalPages) {
    const nextBtn = document.createElement('button');
    nextBtn.textContent = 'Next';
    nextBtn.onclick = () => { currentPage++; loadTable(); };
    paginationControls.appendChild(nextBtn);
  }
}

function updateYearFilter(years) {
  const options = ['<option value="">Semua Tahun</option>'];
  years.forEach(y => {
    options.push(`<option value="${y}">${y}</option>`);
  });
  yearFilter.innerHTML = options.join('');
}

function drawMonthlyChart(data) {
  if (monthlyChart) monthlyChart.destroy();
  const ctx = document.getElementById('monthlyChart').getContext('2d');
  monthlyChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Total USD per Bulan',
        data: Object.values(data),
        backgroundColor: 'rgba(54, 162, 235, 0.7)'
      }]
    }
  });
}

function drawYearlyChart(data) {
  if (yearlyChart) yearlyChart.destroy();
  const ctx = document.getElementById('yearlyChart').getContext('2d');
  yearlyChart = new Chart(ctx, {
    type: 'line',
    data: {
      labels: Object.keys(data),
      datasets: [{
        label: 'Total USD per Tahun',
        data: Object.values(data),
        borderColor: 'rgba(255, 99, 132, 0.7)',
        fill: false
      }]
    }
  });
}

function editEntry(index) {
  fetch('/data').then(res => res.json()).then(data => {
    const entry = data[index];
    document.getElementById('date').value = entry.date;
    document.getElementById('event').value = entry.event;
    document.getElementById('token').value = entry.token;
    document.getElementById('amount').value = entry.amount;
    document.getElementById('usd').value = entry.usd;
    form.dataset.editIndex = index;
  });
}

function deleteEntry(index) {
  if (!confirm('Yakin ingin menghapus entri ini?')) return;
  fetch('/delete', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ index })
  }).then(() => loadTable());
}

yearFilter.addEventListener('change', () => { currentPage = 1; loadTable(); });
monthFilter.addEventListener('change', () => { currentPage = 1; loadTable(); });

loadTable();
