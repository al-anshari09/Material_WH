/**************************************************
 *  DATA DEFAULT & LOCAL STORAGE
 **************************************************/
const STORAGE_KEY = 'materials_data_v1';

const DEFAULT_MATERIALS = [
  {
    material_no: "15551163",
    storage_location: "V1B3",
    plant: "V1",
    material_text: "ELECTRODE; WELDING; PRIMACORE LW-71; 1.6MM",
    po_long_text: "ELECTRODE; WELDING; TYPE: PRIMACORE LW-71; FROM: SPOOL; WIRE DIAMETER: 1.6MM; CORE/FLUX: PRIMACORE LW-71; AWS: E71T-1C-JH8",
    manufacturer_name: "COPLAYM E61-B1",
    uom: "M",
    avg_unit_price: 81.61,
    purchasing_group: "FANI.JTAMI",
    purchasing_group_name: "Fani Jtami",
    part_number: "PN-LW71-16",
    pr_no: "PR-001234",
    po_no: "PO-009876",
    stock_type: "CRITICALITY C",
    qualifier_code_1: "NON STOCKABLE",
    qualifier_code_2: "Vendor Held Stock",
    last_updated_at: "2026-02-23 09:00"
  },
  {
    material_no: "15551164",
    storage_location: "V1B3",
    plant: "V1",
    material_text: "ELECTRODE; WELDING; 7018; 3.2MM",
    po_long_text: "Low hydrogen electrode 7018, diameter 3.2mm",
    manufacturer_name: "GENERIC",
    uom: "EA",
    avg_unit_price: 12.50,
    purchasing_group: "PG1",
    purchasing_group_name: "Purch Group 1",
    part_number: "PN-7018-32",
    pr_no: "PR-001235",
    po_no: "PO-009877",
    stock_type: "CRITICALITY B",
    qualifier_code_1: "STOCKABLE",
    qualifier_code_2: "Warehouse",
    last_updated_at: "2026-02-23 09:05"
  },
  {
    material_no: "20176290",
    storage_location: "ST01",
    plant: "PLT1",
    material_text: "WIRE; FLUX CORED; 1.2MM; SHIELDING GAS",
    po_long_text: "Application: semi automatic / automatic welding. Gas: CO2. Packaging: 15kg spool.",
    manufacturer_name: "PRIMA-CO",
    uom: "KG",
    avg_unit_price: 45.00,
    purchasing_group: "WELD.PUR",
    purchasing_group_name: "Welding Purchasing",
    part_number: "PN-FC-12",
    pr_no: "PR-001236",
    po_no: "PO-009878",
    stock_type: "CRITICALITY C",
    qualifier_code_1: "NON STOCKABLE",
    qualifier_code_2: "Vendor Held Stock",
    last_updated_at: "2026-02-22 15:10"
  }
];

let MATERIALS = loadMaterials();

function loadMaterials() {
  try {
    const s = localStorage.getItem(STORAGE_KEY);
    if (!s) return [...DEFAULT_MATERIALS];
    const arr = JSON.parse(s);
    // beri default untuk field yang mungkin belum ada
    return arr.map(x => ({
      purchasing_group_name: "",
      part_number: "",
      pr_no: "",
      po_no: "",
      ...x
    }));
  } catch {
    return [...DEFAULT_MATERIALS];
  }
}
function saveMaterials() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(MATERIALS)); } catch {}
}

/**************************************************
 *  STATE & ELEMENTS
 **************************************************/
let state = { q: "", page: 1, pageSize: 20, filtered: MATERIALS };

const resultListEl = document.getElementById("resultList");
const pagerEl = document.getElementById("pager");
const searchInput = document.getElementById("searchInput");

// Render awal
renderList();

/**************************************************
 *  SEARCH
 **************************************************/
function doSearch(e) {
  if (e) e.preventDefault();
  state.q = (searchInput.value || "").toLowerCase().trim();

  state.filtered = MATERIALS.filter(m => {
    return (m.material_no && m.material_no.toLowerCase().includes(state.q))
        || (m.material_text && m.material_text.toLowerCase().includes(state.q))
        || (m.storage_location && m.storage_location.toLowerCase().includes(state.q))
        || (m.manufacturer_name && m.manufacturer_name.toLowerCase().includes(state.q))
        || (m.pr_no && m.pr_no.toLowerCase().includes(state.q))
        || (m.po_no && m.po_no.toLowerCase().includes(state.q));
  });

  state.page = 1;
  renderList();
}

/**************************************************
 *  LIST & PAGINATION
 **************************************************/
function renderList() {
  const start = (state.page - 1) * state.pageSize;
  const items = state.filtered.slice(start, start + state.pageSize);

  if (!items.length) {
    resultListEl.innerHTML = `
      <div class="list-group-item text-muted small">No results</div>
    `;
  } else {
    resultListEl.innerHTML = items.map(it => `
      <a href="#" class="list-group-item list-group-item-action"
         onclick="openDetail('${escapeAttr(it.material_no)}'); return false class="text-muted">${escapeHtml(it.storage_location || "")}</small>
        </div>
        <div class="text-muted">${escapeHtml(it.material_text || "")}</div>
        <div class="small text-secondary">PR: ${escapeHtml(it.pr_no || "-")} · PO: ${escapeHtml(it.po_no || "-")}</div>
      </a>
    `).join("");
  }

  buildPager();
}

function buildPager() {
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  const page = state.page;

  function li(p, label, disabled=false, active=false){
    // gunakan <button> agar aksesibel & tidak perlu href
    return `
      <li class="page-item ${disabled ? "disabled" : ""} ${active ? "active" : ""}">
        <button type="button" class="page-link"
                ${disabled ? "tabindex='-1' aria-disabled='true'" : `onclick="gotoPage(${p})"`}
        >${label}</button>
      </li>`;
  }

  let html = "";
  html += li(Math.max(1, page-1), "Prev", page <= 1, false);

  const start = Math.max(1, page - 2);
  const end   = Math.min(totalPages, page + 2);
  for (let i = start; i <= end; i++) {
    html += li(i, i, false, i === page);
  }

  html += li(Math.min(totalPages, page+1), "Next", page >= totalPages, false);

  pagerEl.innerHTML = html;
}
function gotoPage(p){
  const totalPages = Math.max(1, Math.ceil(state.filtered.length / state.pageSize));
  state.page = Math.min(totalPages, Math.max(1, p));
  renderList();
}

/**************************************************
 *  DETAIL MODAL
 **************************************************/
function openDetail(materialNo) {
  const m = MATERIALS.find(x => x.material_no === materialNo);
  if (!m) return;

  const fields = [
    ["Material", m.material_no],
    ["Storage Location", m.storage_location],
    ["Plant", m.plant],
    ["Material Text", m.material_text],
    ["PO Long Text", m.po_long_text],
    ["Manufacturer Name", m.manufacturer_name],
    ["UoM", m.uom],
    ["Average Unit Price", formatPrice(m.avg_unit_price)],
    ["Purchasing Group", m.purchasing_group],
    ["Purchasing Group Name", m.purchasing_group_name],
    ["Part Number", m.part_number],
    ["No PR", m.pr_no],
    ["No PO", m.po_no],
    ["Stock Type", m.stock_type],
    ["Qualifier Code 1", m.qualifier_code_1],
    ["Qualifier Code 2", m.qualifier_code_2],
    ["Last Updated", m.last_updated_at]
  ];

  const detailEl = document.getElementById("detailFields");
  detailEl.innerHTML = fields.map(([k,v]) => `
    <dt class="col-5 col-md-4">${escapeHtml(k)}</dt>
    <dd class="col-7 col-md-8">${escapeHtml(String(v ?? ""))}</dd>
  `).join("");

  const modal = bootstrap.Modal.getOrCreateInstance(document.getElementById('materialModal'));
  modal.show();
}

/**************************************************
 *  ADD NEW MATERIAL
 **************************************************/
function saveNewMaterial(e){
  e.preventDefault();

  const material = {
    material_no: val('f_material_no'),
    material_text: val('f_material_text'),
    storage_location: val('f_storage_location'),
    plant: val('f_plant'),
    uom: val('f_uom'),
    avg_unit_price: num('f_avg_unit_price'),
    manufacturer_name: val('f_manufacturer'),
    stock_type: val('f_stock_type'),
    purchasing_group: val('f_purchasing_group'),
    purchasing_group_name: val('f_purchasing_group_name'),
    part_number: val('f_part_number'),
    pr_no: val('f_pr_no'),
    po_no: val('f_po_no'),
    po_long_text: val('f_po_long_text'),
    qualifier_code_1: "",
    qualifier_code_2: "",
    last_updated_at: new Date().toISOString().slice(0,16).replace('T',' ')
  };

  if (!material.material_no || !material.material_text) {
