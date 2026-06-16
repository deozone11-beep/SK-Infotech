import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import "../css/CandidateSet.css";
import { useNavigate } from "react-router-dom";

function EvmManagement() {
  const API = import.meta.env.VITE_API_URL;
  const [showAllTabs, setShowAllTabs] = useState(false);
  const currentUser = JSON.parse(localStorage.getItem("user"));
  const role = currentUser?.role;
  const today = new Date().toLocaleDateString("en-GB");

  const [data, setData] = useState([]);
  const [view, setView] = useState("overall");
  const [mode, setMode] = useState("main");
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState([]);
  const fileRef = useRef();
  const [isPrint, setIsPrint] = useState(false);
  const nav = useNavigate();
  const [boxNo, setBoxNo] = useState("");
  const [unitType, setUnitType] = useState("");
  const [boxData, setBoxData] = useState([]);

const isReserve = (d) => {
  const ps = (d.psName || "").toLowerCase().trim();
  return ps === "reserve" || ps === "" || ps === "-" || ps === "0";
};

  const [selectedZP, setSelectedZP] = useState("ALL");

  const zpList = [
    "ALL",
    ...Array.from({ length: 40 }, (_, i) => `ZP_${String(i + 1).padStart(2, "0")}`),
    "Reserve"
  ];

  const loadData = () => {
    fetch(`${API}/evm`)
    // fetch("http://localhost:5000/evm")
    // fetch("http://192.168.0.130:5000/evm")
    // fetch("http://192.168.0.100:5000/evm")
    // fetch("http://10.5.11.127:5000/evm")

      .then(res => res.json())
      .then(setData);
  };

  useEffect(() => {
    loadData();
  }, []);

  // 🔍 Auto Search
  useEffect(() => {
    if (!searchId) {
      setResult([]);
      return;
    }
    fetch(`${API}/evm/search/${searchId}`)
    // fetch(`http://localhost:5000/evm/search/${searchId}`)
    // fetch(`http://192.168.0.130:5000/evm/search/${searchId}`)
    // fetch(`http://192.168.0.100:5000/evm/search/${searchId}`)
    // fetch(`http://10.5.11.127:5000/evm/search/${searchId}`)
      .then(res => res.json())
      .then(setResult);
  }, [searchId]);

  // 📥 Import
  const handleImport = (e) => {
    const file = e.target.files[0];
    const reader = new FileReader();

    reader.onload = (evt) => {
      const wb = XLSX.read(evt.target.result, { type: "array" });
      const sheet = wb.Sheets[wb.SheetNames[0]];
      const json = XLSX.utils.sheet_to_json(sheet);

      fetch(`${API}/evm`, {
      // fetch("http://localhost:5000/evm", {
      // fetch("http://192.168.0.130:5000/evm", {
      // fetch("http://192.168.0.100:5000/evm", {
      // fetch("http://10.5.11.127:5000/evm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(json)
      }).then(() => {
        alert("Data Imported ✅");
        loadData();
      });
    };

    reader.readAsArrayBuffer(file);
  };

  // 🔥 FILTER + SORT + RESERVE FIX
 const filteredData = [...data]
  .filter(d => {

    // 🔥 RESERVE VIEW ONLY
    if (view === "reserve") {
      const ps = (d.psName || "").toString().trim().toLowerCase();

      const isReserve =
        ps === "reserve" ||
        ps === "" ||
        ps === "-" ||
        ps === "0";

      if (!isReserve) return false;

      // dropdown filter inside reserve
      if (selectedZP === "ALL") return true;

      return (d.zonalPartyNo || "") === selectedZP;
    }

    // 🔥 NORMAL (OVERALL / BU / CU / VVPAT)
    if (selectedZP === "ALL") return true;

    if (selectedZP === "Reserve") {
      const ps = (d.psName || "").toString().trim().toLowerCase();

      return (
        ps === "reserve" ||
        ps === "" ||
        ps === "-" ||
        ps === "0"
      );
    }

    return (d.zonalPartyNo || "") === selectedZP;
  })
  .sort((a, b) =>
    (a.zonalPartyNo || "").localeCompare(b.zonalPartyNo || "")
  );

// 🔥 Use filteredData instead of data
const nonReserve = filteredData.filter(d => !isReserve(d));

const bu1Count = nonReserve.filter(d => d.bu1Id).length;
const bu2Count = nonReserve.filter(d => d.bu2Id).length;
const cuCount = nonReserve.filter(d => d.cuId).length;
const vvpatCount = nonReserve.filter(d => d.vvpatId).length;

const reserve = filteredData.filter(d => isReserve(d));

// const reserveBU = reserve.filter(d => d.bu1Id).length;
const reserveBU = reserve.reduce(
  (sum, d) => sum + (d.bu1Id ? 1 : 0) + (d.bu2Id ? 1 : 0),
  0
);
const reserveCU = reserve.filter(d => d.cuId).length;
const reserveVVPAT = reserve.filter(d => d.vvpatId).length;




  // 🔥 MERGE FUNCTION (REUSE)
  const renderMergedRows = (columns, rowFilter = () => true) => {
  let rows = [];
  let i = 0;

  const filtered = filteredData.filter(rowFilter);

  let serial = 1; // 🔥 S.No counter

  while (i < filtered.length) {
    let j = i;
    const currentZP = filtered[i].zonalPartyNo;

    while (j < filtered.length && filtered[j].zonalPartyNo === currentZP) {
      j++;
    }

    const span = j - i;

    for (let k = i; k < j; k++) {
      const d = filtered[k];

      rows.push(
        <tr key={k}>
          <td>{serial++}</td> {/* 🔥 S.No */}

          <td>{d.psNo || "-"}</td>
          <td>{d.psName || "-"}</td>

          {k === i && (
            <>
              <td rowSpan={span}>{d.zonalPartyNo || "-"}</td>
              <td rowSpan={span}>{d.zonalPartyName || "-"}</td>
            </>
          )}

          {columns.map((col, idx) => (
            <td key={idx}>{d[col] || "-"}</td>
          ))}
        </tr>
      );
    }

    i = j;
  }

  return rows;
};

const loadBoxReport = async () => {
  if (!boxNo || !unitType) {
    alert("Box & Unit select pannu bro ⚠️");
    return;
  }

  try {
    const res = await fetch(`${API}/evm/box/${boxNo}/${unitType}`);
    const data = await res.json();

    data.sort((a, b) =>
      a.zonalPartyNo.localeCompare(b.zonalPartyNo)
    );

    setBoxData(data);
  } catch (err) {
    console.error(err);
    alert("Box search fail aachu ❌");
  }
};


useEffect(() => {
  if (role === "employee" && view !== "search") {
    setView("search");
  }

  if (role === "team_lead" && view !== "search" && view !== "overall") {
    setView("search");
  }
}, [role, view]);


// 🔥 GROUP DATA
const groupedData = {};

filteredData.forEach(d => {
  const zp = d.zonalPartyNo || "Unknown";

  if (!groupedData[zp]) {
    groupedData[zp] = {
      zp,
      name: d.zonalPartyName,
      psList: [],
      buPolling: 0,
      buReserve: 0,
      cuPolling: 0,
      cuReserve: 0,
      vvPolling: 0,
      vvReserve: 0
    };
  }

  // ✅ PS CLEAN (NO NA)
  const ps = (d.psNo || "").toString().trim();
  if (ps && ps !== "NA" && ps !== "-") {
    groupedData[zp].psList.push(ps);
  }

  // ✅ COUNT LOGIC (BU1 + BU2)
  if (!isReserve(d)) {
    groupedData[zp].buPolling += (d.bu1Id ? 1 : 0) + (d.bu2Id ? 1 : 0);
    groupedData[zp].cuPolling += d.cuId ? 1 : 0;
    groupedData[zp].vvPolling += d.vvpatId ? 1 : 0;
  } else {
    groupedData[zp].buReserve += (d.bu1Id ? 1 : 0) + (d.bu2Id ? 1 : 0);
    groupedData[zp].cuReserve += d.cuId ? 1 : 0;
    groupedData[zp].vvReserve += d.vvpatId ? 1 : 0;
  }
});


// 🔥 GRAND TOTAL (OUTSIDE LOOP - IMPORTANT)
const grandTotal = {
  buPolling: 0,
  buReserve: 0,
  cuPolling: 0,
  cuReserve: 0,
  vvPolling: 0,
  vvReserve: 0,
  totalPS: 0
};

Object.values(groupedData).forEach(g => {
  const uniquePS = [...new Set(g.psList)];

  grandTotal.totalPS += uniquePS.length;

  grandTotal.buPolling += g.buPolling;
  grandTotal.buReserve += g.buReserve;

  grandTotal.cuPolling += g.cuPolling;
  grandTotal.cuReserve += g.cuReserve;

  grandTotal.vvPolling += g.vvPolling;
  grandTotal.vvReserve += g.vvReserve;
});

const handleExport = () => {
  if (!data || data.length === 0) {
    alert("Data illa bro ❌");
    return;
  }

  const ws = XLSX.utils.json_to_sheet(data);
  const wb = XLSX.utils.book_new();

  XLSX.utils.book_append_sheet(wb, ws, "EVM Data");

  XLSX.writeFile(wb, "EVM_Data.xlsx");
};

  return (
    <div className="evm-container">

      <h2 className="evm-title">Polling Candidate Setting</h2>

      {/* 🔘 Cards */}
      <div className="evm-cards">

  {/* 🔍 SEARCH → ALL USERS */}

  {/* 🧑‍💼 TEAM LEAD */}
  {role === "team_lead" && (
    <div className="evm-card" onClick={() => setView("overall")}>
      EVM Overall
    </div>
  )}

  {/* 👑 ADMIN → ALL */}
  {role === "admin" && (
    <>
      <div className="evm-card" onClick={() => setView("overall")}>
        <img src="src/assets/EVM.png" /> EVM Overall
      </div>
      <div className="evm-card" onClick={() => setView("bu")}>
        <img src="src/assets/BU.png" /> Ballot Unit
      </div>
      <div className="evm-card" onClick={() => setView("cu")}>
        <img src="src/assets/CU-1.png" /> Control Unit
      </div>
      <div className="evm-card" onClick={() => setView("vvpat")}>
        <img src="src/assets/VVPAT-1.png" /> VVPAT
      </div>
      <div className="evm-card" onClick={() => setView("reserve")}>
        <img src="src/assets/Godown.png" /> Reserve
      </div>
      <div className="evm-card" onClick={() => setView("report")}>
        <img src="src/assets/report.png" /> Report
      </div>
      <div className="evm-card" onClick={() => setView("boxReport")}>
        <img src="src/assets/box.png" />Box-Base Report
      </div>
    </>
  )}

  <div className="evm-card" onClick={() => setView("search")}>
    <img src="src/assets/search.png" alt="Search" />
    Search
  </div>
</div>

      {/* 🔥 Topbar */}
      <div className="evm-topbar">
        <div className="left-controls">
    <button className="btn-back" onClick={() => nav(-1)}>
      ⬅ Back
    </button>

    <select value={selectedZP} onChange={(e) => setSelectedZP(e.target.value)}>
      {zpList.map((zp, i) => (
        <option key={i}>{zp}</option>
      ))}
    </select>
  </div>

      <div className="evm-summary">

  {/* 🔵 Polling Machines */}
  <div className="summary-card blue">
    <h4>BU (Polling)</h4>
    <p>{bu1Count+bu2Count}</p>
  </div>

  <div className="summary-card green">
    <h4>CU (Polling)</h4>
    <p>{cuCount}</p>
  </div>

  <div className="summary-card purple">
    <h4>VVPAT (Polling)</h4>
    <p>{vvpatCount}</p>
  </div>

  {/* 🔴 Reserve */}
  <div className="summary-card red">
    <h4>Reserve BU</h4>
    <p>{reserveBU}</p>
  </div>

  <div className="summary-card red">
    <h4>Reserve CU</h4>
    <p>{reserveCU}</p>
  </div>

  <div className="summary-card red">
    <h4>Reserve VVPAT</h4>
    <p>{reserveVVPAT}</p>
  </div>

</div>

  <div className="topbar-actions">
  <button onClick={() => fileRef.current.click()} className="btn-green">
    📥 Import
  </button>
  <input
  type="file"
  ref={fileRef}
  style={{ display: "none" }}
  accept=".xlsx, .xls"
  onChange={handleImport}
/>
<button onClick={handleExport} className="btn-blue">
  📤 Export
</button>
  <button
    onClick={() => {
      setIsPrint(true);
      setTimeout(() => {
        window.print();
        setIsPrint(false);
      }, 300);
    }}
    className="btn-orange"
  >
    🖨️ Print
  </button>
</div>

</div>

      {/* 🔍 Search */}
      {view === "search" && (
        <>
          <div className="evm-search">
            <input
  value={searchId}
  onChange={(e) => setSearchId(e.target.value)}

  onFocus={() => setSearchId("")}   // 🔥 clear before scan

  onKeyDown={(e) => {
    if (e.key === "Enter") {
      handleSearch(searchId);       // 🔍 search run
      setSearchId("");              // 🔥 clear after scan
    }
  }}

  placeholder="Scan BU/CU/VVPAT ID"
/>
          </div>

          {result.length > 0 && (
            <table className="evm-table">
              <thead>
                <tr>
                  <th>PS No.</th>
                  {/* <th>PS Name.</th> */}
                  <th>Zonal Party No.</th>
                  <th>Zonal Party Name.</th>
                  <th>Type.</th>
                  <th>Box No.</th>
                  <th>Unit ID.</th>
                </tr>
              </thead>
              <tbody>
                {result.map((r, i) => {
                  let boxNo = "", type = "", id = "";

                  if (r.bu1Id === searchId) { type = "BU1"; id = r.bu1Id; boxNo = r.bu1Box; }
                  else if (r.bu2Id === searchId) { type = "BU2"; id = r.bu2Id; boxNo = r.bu2Box; }
                  else if (r.cuId === searchId) { type = "CU"; id = r.cuId; boxNo = r.cuBox; }
                  else if (r.vvpatId === searchId) { type = "VVPAT"; id = r.vvpatId; boxNo = r.vvpatNo; }

                  return (
                    <tr key={i}>
                      <td style={{ fontSize: 40 }}>{r.psNo || "-"}</td>
                      {/* <td>{r.psName || "-"}</td> */}
                      <td style={{ fontSize: 150 }}>{r.zonalPartyNo || "-"}</td>
                      <td style={{ fontSize: 40 }}>{r.zonalPartyName || "-"}</td>
                      <td>{type}</td>
                      <td>{boxNo}</td>
                      <td style={{ fontSize: 50 }}>{id}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </>
      )}

      {/* 🖨️ Print Header */}
      {view !== "search" && (
        <div className="print-header">
          <h3>
            {view === "overall" && "EVM Overall Report"}
            {view === "bu" && "Ballot Unit (BU) Report"}
            {view === "cu" && "Control Unit (CU) Report"}
            {view === "vvpat" && "VVPAT Report"}
            {view === "reserve" && "Reserve Unit Report"}
          </h3>

          <p>
            {selectedZP === "ALL"
              ? "All Zonal Parties"
              : `Zonal Party: ${selectedZP}`}
          </p>
        </div>
      )}

      {/* 📊 Table */}
      {view !== "search" && (
        <table className="evm-table">
          <thead>
            {view === "overall" && (
  <tr>
    <th>S.No</th>
    <th>PS No</th>
    <th>PS Name</th>
    <th>ZP No</th>
    <th>ZP Name</th>
    <th>BU1 Box</th>
    <th>BU1 ID</th>

    {selectedZP !== "Reserve" && (
      <>
        <th>BU2 Box</th>
        <th>BU2 ID</th>
      </>
    )}

    <th>CU Box</th>
    <th>CU ID</th>
    <th>VVPAT No</th>
    <th>VVPAT ID</th>
  </tr>
)}

            {view === "bu" && (
              <tr>
                <th>S.No</th>
                <th>PS No</th>
                <th>PS Name</th>
                <th>ZP No</th>
                <th>ZP Name</th>
                <th>BU1 Box</th>
                <th>BU1 ID</th>
    {selectedZP !== "Reserve" && (
      <>
        <th>BU2 Box</th>
        <th>BU2 ID</th>
      </>
    )}
              </tr>
            )}

            {view === "cu" && (
              <tr>
                <th>S.No</th>
                <th>PS No</th>
                <th>PS Name</th>
                <th>ZP No</th>
                <th>ZP Name</th>
                <th>CU Box</th>
                <th>CU ID</th>
              </tr>
            )}

            {view === "vvpat" && (
              <tr>
                <th>S.No</th>
                <th>PS No</th>
                <th>PS Name</th>
                <th>ZP No</th>
                <th>ZP Name</th>
                <th>VVPAT No</th>
                <th>VVPAT ID</th>
              </tr>
            )}

            {view === "reserve" && (
                <tr>
                  <th>S.No</th>
                  <th>PS No</th>
                  <th>PS Name</th>
                  <th>ZP No</th>
                  <th>ZP Name</th>
                  <th>BU1 Box</th>
                  <th>BU1 ID</th>
                  <th>CU Box</th>
                  <th>CU ID</th>
                  <th>VVPAT No</th>
                  <th>VVPAT ID</th>
                </tr>
              )}
          </thead>

          <tbody>
{view === "overall" &&
  renderMergedRows(
    selectedZP === "Reserve"
      ? ["bu1Box","bu1Id","cuBox","cuId","vvpatNo","vvpatId"] // ❌ BU2 removed
      : ["bu1Box","bu1Id","bu2Box","bu2Id","cuBox","cuId","vvpatNo","vvpatId"]
  )}

{view === "bu" &&
  renderMergedRows(
    selectedZP === "Reserve"
      ? ["bu1Box","bu1Id"] // ❌ BU2 remove
      : ["bu1Box","bu1Id","bu2Box","bu2Id"]
  )}

            {view === "cu" &&
  renderMergedRows(
    ["cuBox","cuId"],
    (d) => d.cuId && d.cuId !== "-"
  )
}

           {view === "vvpat" &&
  renderMergedRows(
    ["vvpatNo","vvpatId"],
    (d) => d.vvpatId && d.vvpatId !== "-"
  )
}
            {view === "reserve" &&
              renderMergedRows([
                "bu1Box","bu1Id",
                "cuBox","cuId",
                "vvpatNo","vvpatId"
              ])
            }
          </tbody>
        </table>
      )}

      {view === "boxReport" && (
  <>
    <h3 style={{ textAlign: "center" }}>📦 Box Base Report</h3>

    {/* Controls */}
    <div style={{ textAlign: "center", marginBottom: "15px" }}>
      
      {/* Dropdown */}
      <select value={boxNo} onChange={(e) => setBoxNo(e.target.value)}>
        <option value="">Select Box</option>
        {Array.from({ length: 117 }, (_, i) => (
          <option key={i+1} value={i+1}>{i+1}</option>
        ))}
      </select>

      {/* Radio */}
      <label style={{ marginLeft: "15px" }}>
        <input
          type="radio"
          name="unit"
          value="bu"
          onChange={(e) => setUnitType(e.target.value)}
        />
        Ballot Unit
      </label>

      <label style={{ marginLeft: "10px" }}>
        <input
          type="radio"
          name="unit"
          value="cu"
          onChange={(e) => setUnitType(e.target.value)}
        />
        Control Unit
      </label>

      <button
        onClick={loadBoxReport}
        className="btn-green"
        style={{ marginLeft: "15px" }}
      >
        Search
      </button>
    </div>

    {/* Table */}
    <table className="evm-table">
      <thead>
        <tr>
          <th>S.No</th>
          <th>PS No</th>
          <th>PS Name</th>
          <th>Zonal Party No</th>
          <th>Zonal Party Name</th>
          <th>Unit ID</th>
        </tr>
      </thead>

      <tbody>
        {boxData.map((d, i) => (
          <tr key={i}>
            <td>{i+1}</td>
            <td>{d.psNo}</td>
            <td>{d.psName}</td>
            <td>{d.zonalPartyNo}</td>
            <td>{d.zonalPartyName}</td>
            <td>{d.unitId}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </>
)}





      {view === "report" && (
  <>
    <h3 style={{ textAlign: "center" }}>
      EVM Machine Details Zonal Party-wise on ({today})
    </h3>

    <table className="evm-table">
      <thead>
        <tr>
          <th rowSpan="2">S.No</th>
          <th rowSpan="2">Zonal Party No</th>
          <th rowSpan="2">Zonal Party Name</th>
          <th rowSpan="2">PS No</th>
          <th rowSpan="2">Total PS</th>

          <th colSpan="3">Ballot Unit</th>
          <th colSpan="3">Control Unit</th>
          <th colSpan="3">VVPAT</th>
        </tr>

        <tr>
          <th>Polling</th>
          <th>Reserve</th>
          <th>Total</th>

          <th>Polling</th>
          <th>Reserve</th>
          <th>Total</th>

          <th>Polling</th>
          <th>Reserve</th>
          <th>Total</th>
        </tr>
      </thead>

      <tbody>
        {Object.values(groupedData).map((g, i) => (
          <tr key={i}>
            <td>{i + 1}</td>
            <td>{g.zp}</td>
            <td>{g.name}</td>
            <td>{g.psList.join(", ")}</td>
            <td>{g.psList.length}</td>

            <td>{g.buPolling}</td>
            <td>{g.buReserve}</td>
            <td>{g.buPolling + g.buReserve}</td>

            <td>{g.cuPolling}</td>
            <td>{g.cuReserve}</td>
            <td>{g.cuPolling + g.cuReserve}</td>

            <td>{g.vvPolling}</td>
            <td>{g.vvReserve}</td>
            <td>{g.vvPolling + g.vvReserve}</td>
          </tr>
          
        ))}
        <tr style={{ fontWeight: "bold", background: "#f2f2f2" }}>
  <td colSpan="4" style={{ textAlign: "right" }}>Grand Total</td>

  <td>{grandTotal.totalPS}</td>

  <td>{grandTotal.buPolling}</td>
  <td>{grandTotal.buReserve}</td>
  <td>{grandTotal.buPolling + grandTotal.buReserve}</td>

  <td>{grandTotal.cuPolling}</td>
  <td>{grandTotal.cuReserve}</td>
  <td>{grandTotal.cuPolling + grandTotal.cuReserve}</td>

  <td>{grandTotal.vvPolling}</td>
  <td>{grandTotal.vvReserve}</td>
  <td>{grandTotal.vvPolling + grandTotal.vvReserve}</td>
</tr>
      </tbody>
      
    </table>
  </>
)}
    </div>
  );
}

export default EvmManagement;