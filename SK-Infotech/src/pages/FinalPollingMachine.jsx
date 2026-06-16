import { useEffect, useState, useRef } from "react";
import * as XLSX from "xlsx";
import "../css/CandidateSet.css";
import { useNavigate } from "react-router-dom";

function FinalPollingMachine() {
  const API = import.meta.env.VITE_API_URL;
  const nav = useNavigate();

  const [user, setUser] = useState(null);
  const formatName = (name) =>
  name?.charAt(0).toUpperCase() + name?.slice(1);

    useEffect(() => {
  const storedUser = JSON.parse(localStorage.getItem("user"));

  if (!storedUser) {
    nav("/");
  } else {
    setUser(storedUser);
  }
}, []);

  const [data, setData] = useState([]);
  const [view, setView] = useState("overall");
  const [searchId, setSearchId] = useState("");
  const [result, setResult] = useState([]);
  const fileRef = useRef();

  const [selectedZP, setSelectedZP] = useState("ALL");

  const zpList = [
    "ALL",
    ...Array.from({ length: 40 }, (_, i) =>
      `ZP_${String(i + 1).padStart(2, "0")}`
    )
  ];

  // 🔥 LOAD DATA BASED ON VIEW
  const loadData = () => {
    let url = `${API}/final-machine`;

    if (view === "reserve") url = `${API}/reserve-machine`;
    if (view === "defect") url = `${API}/defect-machine`;

    fetch(url)
      .then(res => res.json())
      .then(setData)
      .catch(() => alert("Load fail ❌"));
  };

  useEffect(() => {
    loadData();
  }, [view]);


const searchBU = result.filter(
  r =>
    r.type === "BU1" ||
    r.type === "BU2" ||
    r.type === "BU"
).length;

const searchCU = result.filter(
  r => r.type === "CU"
).length;

const searchVVPAT = result.filter(
  r => r.type === "VVPAT"
).length;

  // 🔍 SEARCH (ALL TABLES)
  useEffect(() => {
    if (!searchId) {
      setResult([]);
      return;
    }

    fetch(`${API}/final-machine/search/${searchId}`)
      .then(res => res.json())
      .then(setResult);
  }, [searchId]);

  // 📥 IMPORT
  const handleImport = async (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = async (evt) => {
    const wb = XLSX.read(evt.target.result, { type: "array" });

    // ✅ Correct sheet names
    const pollingSheet = wb.Sheets["pollingMachine"];
    const reserveSheet = wb.Sheets["reserveMachine"];
    const defectSheet = wb.Sheets["defectiveMachine"];

    if (!pollingSheet || !reserveSheet || !defectSheet) {
      alert("Sheet name mismatch bro ❌");
      return;
    }

    const pollingData = XLSX.utils.sheet_to_json(pollingSheet);
    const reserveData = XLSX.utils.sheet_to_json(reserveSheet);
    const defectData = XLSX.utils.sheet_to_json(defectSheet);

    // 🔥 3 API calls
    await fetch(`${API}/final-machine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pollingData)
    });

    await fetch(`${API}/reserve-machine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reserveData)
    });

    await fetch(`${API}/defect-machine`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(defectData)
    });

    alert("All Sheets Imported ✅");
    loadData();
  };

  reader.readAsArrayBuffer(file);
};

  // 📤 EXPORT
const handleExport = () => {

  let exportData = [];
  let merges = [];

  if (view === "defect") {
    const arr = [...filteredData].sort((a, b) =>
      (a.zonalPartyNo || "").localeCompare(b.zonalPartyNo || "")
    );

    let rowIndex = 1;

    for (let i = 0; i < arr.length; ) {
      let j = i;
      while (
        j < arr.length &&
        arr[j].zonalPartyNo === arr[i].zonalPartyNo
      ) {
        j++;
      }

      const span = j - i;

      for (let k = i; k < j; k++) {
        exportData.push([
          k + 1,
          arr[k].psNo,
          arr[k].psName,
          arr[k].zonalPartyNo,
          arr[k].zonalPartyName,
          arr[k].defectType,
          arr[k].defectedId,
          arr[k].replacedId
        ]);
      }

      // 🔥 MERGE ZP NO (col index 3)
      merges.push({
        s: { r: rowIndex, c: 3 },
        e: { r: rowIndex + span - 1, c: 3 }
      });

      // 🔥 MERGE ZP NAME (col index 4)
      merges.push({
        s: { r: rowIndex, c: 4 },
        e: { r: rowIndex + span - 1, c: 4 }
      });

      rowIndex += span;
      i = j;
    }

    const headers = [
      "S.No","PS No","PS Name","ZP No","ZP Name",
      "Type","Defected","Replaced"
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);
    ws["!merges"] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Defect");

    XLSX.writeFile(wb, "Defect_Report.xlsx");
  }

  else {
    const arr = [...sortedData];

    let rowIndex = 1;

    for (let i = 0; i < arr.length; ) {
      let j = i;

      while (
        j < arr.length &&
        arr[j].zonalPartyNo === arr[i].zonalPartyNo
      ) {
        j++;
      }

      const span = j - i;

      for (let k = i; k < j; k++) {
        exportData.push([
          k + 1,
          arr[k].psNo,
          arr[k].psName,
          arr[k].zonalPartyNo,
          arr[k].zonalPartyName,
          arr[k].bu1Id,
          arr[k].bu2Id,
          arr[k].cuId,
          arr[k].vvpatId
        ]);
      }

      // 🔥 MERGE ZP NO
      merges.push({
        s: { r: rowIndex, c: 3 },
        e: { r: rowIndex + span - 1, c: 3 }
      });

      // 🔥 MERGE ZP NAME
      merges.push({
        s: { r: rowIndex, c: 4 },
        e: { r: rowIndex + span - 1, c: 4 }
      });

      rowIndex += span;
      i = j;
    }

    const headers = [
      "S.No","PS No","PS Name","ZP No","ZP Name",
      "BU1","BU2","CU","VVPAT"
    ];

    const ws = XLSX.utils.aoa_to_sheet([headers, ...exportData]);
    ws["!merges"] = merges;

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Final");

    XLSX.writeFile(wb, "Final_Polling.xlsx");
  }
};

  // 🔥 FILTER
  const filteredData =
    selectedZP === "ALL"
      ? data
      : data.filter(d => d.zonalPartyNo === selectedZP);

  const sortedData = [...filteredData].sort((a, b) =>
  (a.zonalPartyNo || "").localeCompare(b.zonalPartyNo || "")
);

let buCount = 0;
let cuCount = 0;
let vvpatCount = 0;

if (view === "defect") {
  // 🔴 DEFECT
  buCount = filteredData.filter(d => d.defectType === "BU1").length + filteredData.filter(d => d.defectType === "BU2").length;
  cuCount = filteredData.filter(d => d.defectType === "CU").length;
  vvpatCount = filteredData.filter(d => d.defectType === "VVPAT").length;

} else {
  // 🟢 OVERALL + RESERVE
  const bu1Count = filteredData.filter(d => d.bu1Id).length;
  const bu2Count = filteredData.filter(d => d.bu2Id).length;

  buCount = bu1Count + bu2Count;
  cuCount = filteredData.filter(d => d.cuId).length;
  vvpatCount = filteredData.filter(d => d.vvpatId).length;
}



  return (
    <div className="evm-container">
      <div className="final-evm-header">
        <h2 className="final-poll-user">Welcome, {formatName(user?.name)}</h2>
        <h2 className="final-evm-title">🗳️ Final Polling Machine</h2>
          <h2 className="polling-btn-back" onClick={() => nav(-1)}>
            ⬅ Back
          </h2>
      </div>

      {/* 🔘 Cards */}
      <div className="evm-cards">

        <div className="evm-card" onClick={() => setView("overall")}>
          📊 Overall
        </div>

        <div className="evm-card" onClick={() => setView("reserve")}>
          🏬 Reserve Machine
        </div>

        <div className="evm-card" onClick={() => setView("defect")}>
          ❌ Defect Machine
        </div>

        <div className="evm-card" onClick={() => setView("search")}>
          🔍 Search
        </div>

      </div>

      {/* 🔥 Topbar */}
      <div className="evm-topbar">

        <div className="left-controls">
          <button className="btn-back" onClick={() => nav(-1)}>
            ⬅ Back
          </button>

          <select
            value={selectedZP}
            onChange={(e) => setSelectedZP(e.target.value)}
          >
            {zpList.map((zp, i) => (
              <option key={i}>{zp}</option>
            ))}
          </select>
        </div>

        {/* Summary */}
        <div className="evm-summary">
          <div className="summary-card blue">
            <h4>BU</h4>
            <p>{buCount}</p>
          </div>

          <div className="summary-card green">
            <h4>CU</h4>
            <p>{cuCount}</p>
          </div>

          <div className="summary-card purple">
            <h4>VVPAT</h4>
            <p>{vvpatCount}</p>
          </div>
        </div>

        {/* Actions */}
        <div className="topbar-actions">
          <button
            onClick={() => fileRef.current.click()}
            className="btn-green"
          >
            📥 Import
          </button>

          <input
            type="file"
            ref={fileRef}
            hidden
            onChange={handleImport}
          />

          <button onClick={handleExport} className="btn-blue">
            📤 Export
          </button>
        </div>
      </div>

      {/* 🔍 SEARCH */}
      {view === "search" && (
  <div className="evm-search">
<input className="finalpolling-search"
  value={searchId}
  onChange={(e) => setSearchId(e.target.value)}

  onFocus={() => setSearchId("")}   // 🔥 scan munnadi clear

  onKeyDown={(e) => {
    if (e.key === "Enter") {
      setSearchId("");              // 🔥 scan aprm clear
    }
  }}

  placeholder="Scan Machine ID"
/>
  </div>
)}
{view === "search" && result.length > 0 && (
  <table className="evm-table">
    <thead>
      <tr>
        <th>PS No</th>
        <th>PS Name</th>
        <th>ZP No</th>
        <th>ZP Name</th>
        <th>Category</th>
        <th>Machine Type</th>
        <th>Unit ID</th>
      </tr>
    </thead>

    <tbody>
  {result.map((r, i) => (
    <tr key={i}>
      <td>{r.psNo}</td>
      <td>{r.psName}</td>
      <td>{r.zonalPartyNo}</td>
      <td>{r.zonalPartyName}</td>
      <td>{r.category}</td>
      <td>{r.type}</td>
      <td>{r.unitId}</td>
    </tr>
  ))}
</tbody>
  </table>
)}

      {/* 📊 TABLE */}
      {view === "defect" ? (
  <table className="evm-table">
    <thead>
      <tr>
        <th>S.No</th>
        <th>PS No</th>
        <th>PS Name</th>
        <th>ZP No</th>
        <th>ZP Name</th>
        <th>Type</th>
        <th>Defected</th>
        <th>Replaced</th>
      </tr>
    </thead>
    <tbody>
  {[...filteredData]
    .sort((a, b) =>
      (a.zonalPartyNo || "").localeCompare(b.zonalPartyNo || "")
    )
    .map((d, i, arr) => {

      const prev = arr[i - 1];

      const isSameZP =
        prev && prev.zonalPartyNo === d.zonalPartyNo;

      const rowSpanCount = arr.filter(
        x => x.zonalPartyNo === d.zonalPartyNo
      ).length;

      return (
        <tr key={i}>
          <td>{d.sno}</td>
          <td>{d.psNo}</td>
          <td>{d.psName}</td>

          {/* 🔥 ZP NO MERGE */}
          {!isSameZP && (
            <td rowSpan={rowSpanCount}>
              {d.zonalPartyNo}
            </td>
          )}

          {/* 🔥 ZP NAME MERGE */}
          {!isSameZP && (
            <td rowSpan={rowSpanCount}>
              {d.zonalPartyName}
            </td>
          )}

          <td>{d.defectType}</td>
          <td>{d.defectedId}</td>
          <td>{d.replacedId}</td>
        </tr>
      );
    })}
</tbody>
  </table>
) : view !== "search" && (
        <table className="evm-table">
          <thead>
            <tr>
              <th>S.No</th>
              <th>PS No</th>
              <th>PS Name</th>
              <th>ZP No</th>
              <th>ZP Name</th>
              <th>BU1</th>
              <th>BU2</th>
              <th>CU</th>
              <th>VVPAT</th>
            </tr>
          </thead>

          <tbody>
  {sortedData.map((d, i) => {
    const prev = sortedData[i - 1];

    const isSameZP =
      prev && prev.zonalPartyNo === d.zonalPartyNo;

    const rowSpanCount = sortedData.filter(
      x => x.zonalPartyNo === d.zonalPartyNo
    ).length;

    return (
      <tr key={i}>
        <td>{i + 1}</td>
        <td>{d.psNo}</td>
        <td>{d.psName}</td>

        {/* 🔥 MERGE ZP NO */}
        {!isSameZP && (
          <td rowSpan={rowSpanCount}>
            {d.zonalPartyNo}
          </td>
        )}

        {/* 🔥 MERGE ZP NAME */}
        {!isSameZP && (
          <td rowSpan={rowSpanCount}>
            {d.zonalPartyName}
          </td>
        )}

        <td>{d.bu1Id}</td>
        <td>{d.bu2Id}</td>
        <td>{d.cuId}</td>
        <td>{d.vvpatId}</td>
      </tr>
    );
  })}
</tbody>
        </table>
      )}

    </div>
  );
}

export default FinalPollingMachine;