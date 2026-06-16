import { useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import * as XLSX from "xlsx";
import "../css/DocumentCheck.css";
import tickIcon from "../assets/tick.png";   // ✅ green tick
import cancelIcon from "../assets/cancel.png"; // ❌ red cross

function DocumentCheck() {
  const nav = useNavigate();
  const API = import.meta.env.VITE_API_URL;

    const formatName = (name) =>
  name?.charAt(0).toUpperCase() + name?.slice(1);

  const [loading, setLoading] = useState(true);

  const [user, setUser] = useState(null);
  const [view, setView] = useState("17C");
  const [data, setData] = useState([]);
  const [editIndex, setEditIndex] = useState(null);

  const fileRef = useRef();

  useEffect(() => {
    const u = JSON.parse(localStorage.getItem("user"));
    if (!u) nav("/");
    else setUser(u);
  }, []);

  useEffect(() => {
    loadData();
  }, [view]);

  const loadData = async () => {
    try {
      setLoading(true); // 🔥 start loading

      const res = await fetch(`${API}/document/${view}`);
      const json = await res.json();
      setData(json);

    } catch {
      alert("Load fail ❌");
    } finally {
      setLoading(false); // 🔥 stop loading
    }
  };

  // 🔥 IMPORT EXCEL
  const handleImport = (e) => {
  const file = e.target.files[0];
  const reader = new FileReader();

  reader.onload = async (evt) => {
    const wb = XLSX.read(evt.target.result, { type: "array" });

    try {
      // ✅ Form17C
      const sheet17C = wb.Sheets["Form17C"];
      if (sheet17C) {
        const json17C = XLSX.utils.sheet_to_json(sheet17C);
        await fetch(`${API}/document/import/17C`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json17C)
        });
      }

      // ✅ Form17A
      const sheet17A = wb.Sheets["Form17A"];
      if (sheet17A) {
        const json17A = XLSX.utils.sheet_to_json(sheet17A);
        await fetch(`${API}/document/import/17A`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(json17A)
        });
      }

      // ✅ Presiding
      const sheetPO = wb.Sheets["Presiding"];
      if (sheetPO) {
        const jsonPO = XLSX.utils.sheet_to_json(sheetPO);
        await fetch(`${API}/document/import/PO`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(jsonPO)
        });
      }

      alert("All sheets imported ✅");
      loadData();

    } catch (err) {
      console.log(err);
      alert("Import failed ❌");
    }
  };

  reader.readAsArrayBuffer(file);
};

  // 🔥 CHANGE HANDLER + AUTO %
 const handleChange = (i, field, value) => {
  const updated = [...data];
  updated[i][field] = value;

  const row = updated[i];

  const totalElectors = Number(row.total || 0);
  const maleElectors = Number(row.male || 0);
  const femaleElectors = Number(row.female || 0);
  const othersElectors = Number(row.others || 0);

  const totalVotes = Number(row.total_votes || 0);
  const maleVotes = Number(row.male_votes || 0);
  const femaleVotes = Number(row.female_votes || 0);
  const othersVotes = Number(row.others_votes || 0);

  // 🟢 % Vote
  row.percent_votes = totalElectors
    ? ((totalVotes / totalElectors) * 100).toFixed(2)
    : "0.00";

  // 🔵 % Male (FIXED)
  row.percent_male = totalVotes
    ? ((maleVotes / totalVotes) * 100).toFixed(2)
    : "0.00";

  // 🟡 % Female (FIXED)
  row.percent_female = totalVotes
    ? ((femaleVotes / totalVotes) * 100).toFixed(2)
    : "0.00";

  // 🟣 % Others (FIXED)
  row.percent_others = totalVotes
    ? ((othersVotes / totalVotes) * 100).toFixed(2)
    : "0.00";

    // 🟣 17A TOTAL AUTO CALCULATION
if (view === "17A") {
  const epic = Number(row.epic || 0);
  const other = Number(row.other_doc || 0);
  const nodoc = Number(row.no_doc || 0);

  const totalVotes = Number(row.total_votes || 0); // ✅ manual

  row.percent_epic = totalVotes
    ? ((epic / totalVotes) * 100).toFixed(2)
    : "0.00";

  row.percent_other = totalVotes
    ? ((other / totalVotes) * 100).toFixed(2)
    : "0.00";

  row.percent_no_doc = totalVotes
    ? ((nodoc / totalVotes) * 100).toFixed(2)
    : "0.00";
}

  setData(updated);
};
  // 🔥 SAVE WITH VALIDATION
const handleSave = async (row) => {

  try {

    if (view === "17C") {
      const totalVotes = Number(row.total_votes || 0);
      const male = Number(row.male_votes || 0);
      const female = Number(row.female_votes || 0);
      const others = Number(row.others_votes || 0);

      if (male + female + others !== totalVotes) {
        alert("❌ Male + Female + Others must equal Total Votes");
        return false;
      }
    }

    if (view === "17A") {
      const epic = Number(row.epic || 0);
      const other = Number(row.other_doc || 0);
      const nodoc = Number(row.no_doc || 0);
      const total = Number(row.total_votes || 0);

      if (epic + other + nodoc !== total) {
        alert("❌ 17A Total mismatch");
        return false;
      }
    }

    await fetch(`${API}/document/update/${view}/${row.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(row)
    });

    setEditIndex(null);

    return true;

  } catch (err) {
    console.log(err);
  }
};

const updateStatus = async (id, status) => {
  try {
    setLoading(true); // 🔥 only here

    await fetch(`${API}/document/status/${view}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status })
    });

    setEditIndex(null);
    await loadData(); // 🔥 single refresh

  } catch (err) {
    console.log(err);
    alert("Status update failed ❌");
  } finally {
    setLoading(false); // 🔥 stop here only
  }
};



const render17CTable = () => (
  <table className="doc-table">
          <thead>
            <tr>
              <th rowSpan="2" className="col-sl">Sl No</th>
              <th rowSpan="2" className="col-part">Part</th>
              <th rowSpan="2" className="col-zp">ZP</th>
              <th rowSpan="2" className="polling-col">Polling Station</th>
              <th rowSpan="2" className="col-small">Total Electors</th>
              <th rowSpan="2" className="col-small">Male</th>
              <th rowSpan="2" className="col-small">Female</th>
              <th rowSpan="2" className="col-small">Others</th>

              <th colSpan="8">17-C Details (8)</th>
              
              <th rowSpan="2" className="col-small">Status</th>
              <th rowSpan="2" className="col-small">Action</th>
            </tr>
            <tr>
              <th className="col-small">Total No Votes Polled</th>
              <th className="col-small">% Total Votes Polled</th>
              <th className="col-small">No of Male Votes</th>
              <th className="col-small">% Male Votes</th>
              <th className="col-small">No of Female Votes</th>
              <th className="col-small">% Female Votes</th>
              <th className="col-small">No of Others Votes</th>
              <th className="col-small">% Others Votes</th>

            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i}>
                <td className="col-sl">{i + 1}</td>
                <td className="col-part">{row.part_no}</td>
                <td className="col-zp">{row.zp_no}</td>
                <td className="polling-col">{row.part_name}</td>
                <td className="col-small">{row.total}</td>
                <td className="col-small">{row.male}</td>
                <td className="col-small">{row.female}</td>
                <td className="col-small">{row.others}</td>

                {/* TOTAL VOTES */}
                <td className="col-small">
                  {editIndex === i ? (
                    <input
                      value={row.total_votes || ""}
                      onChange={(e) =>
                        handleChange(i, "total_votes", e.target.value)
                      }
                    />
                  ) : (
                    row.total_votes
                  )}
                </td>

                <td className="col-small">{Number(row.percent_votes || 0).toFixed(2)} %</td>

                {/* MALE */}
                <td className="col-small">
                  {editIndex === i ? (
                    <input
                      value={row.male_votes || ""}
                      onChange={(e) =>
                        handleChange(i, "male_votes", e.target.value)
                      }
                    />
                  ) : (
                    row.male_votes
                  )}
                </td>

                <td className="col-small">{Number(row.percent_male || 0).toFixed(2)} %</td>

                {/* FEMALE */}
                <td className="col-small">
                  {editIndex === i ? (
                    <input
                      value={row.female_votes || ""}
                      onChange={(e) =>
                        handleChange(i, "female_votes", e.target.value)
                      }
                    />
                  ) : (
                    row.female_votes
                  )}
                </td>

                <td className="col-small">{Number(row.percent_female || 0).toFixed(2)} %</td>

                {/* OTHERS */}
                <td className="col-small"> 
                  {editIndex === i ? (
                    <input
                      value={row.others_votes || ""}
                      onChange={(e) =>
                        handleChange(i, "others_votes", e.target.value)
                      }
                    />
                  ) : (
                    row.others_votes
                  )}
                </td>

                <td className="col-small">{Number(row.percent_others || 0).toFixed(2)} %</td>
                <td className={row.status === "Received" ? "green" : "orange"}>
                  {row.status || "Pending"}
                </td>

                {/* ACTION */}
                <td className="col-small">
                  {/* ✅ RECEIVED */}
    <img
      src={tickIcon}
      alt="received"
      className="status-icon"
      onClick={() => updateStatus(row.id, "Received")}
    />

    {/* ❌ PENDING */}
    <img
      src={cancelIcon}
      alt="pending"
      className="status-icon"
      onClick={() => updateStatus(row.id, "Pending")}
    />
                  {editIndex === i ? (
                    // <button className="check-btn-save" onClick={() => handleSave(row)} >
                    //   💾 Save
                    // </button>

                  <button
                    className="check-btn-save"
                    onClick={async () => {
  const isValid = await handleSave(row);

  if (isValid) {
    await updateStatus(row.id, "Received");
  }
}}
                  >
                    💾 Save
                  </button>

                  ) : (
                    <button className="check-btn-edit" onClick={() => setEditIndex(i)}>
                      ✏ Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>

          </table>
);

const render17ATable = () => (
  <table className="doc-table">
    <thead>
  <tr>
    <th rowSpan="2" className="col-sl">S.No</th>
    <th rowSpan="2" className="col-part">Part No</th>
    <th rowSpan="2" className="col-zp">Zonal Party No</th>
    <th rowSpan="2" className="polling-col">Part Name</th>
    <th rowSpan="2" className="col-small">Total No. of Electors</th>
    <th rowSpan="2" className="col-small">Male</th>
    <th rowSpan="2" className="col-small">Female</th>
    <th rowSpan="2" className="col-small">Third Gender</th>

    <th colSpan="8">17-A Details (9)</th>

    <th rowSpan="2" className="col-small">Status</th>
    <th rowSpan="2" className="col-small">Action</th>
  </tr>

  <tr>
    <th className="col-small">Total No. of Votes Polled</th>
    <th className="col-small">Total no. of persons who voted with EPIC</th>
    <th className="col-small">% of Voters with EPIC</th>
    <th className="col-small">No. of persons who voted without any document</th>
    <th className="col-small">% of other document details</th>
    <th className="col-small">persons voted without document details or no document details are available in 17A</th>
    <th className="col-small">% of Voters without any documents details </th>
    <th className="col-small">Remarks column showing type of document not at all filled up (Yes/No)</th>
  </tr>
</thead>

    <tbody>
      {data.map((row, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{row.part_no}</td>
          <td>{row.zp_no}</td>
          <td className="polling-col">{row.part_name}</td>
          <td className="col-small">{row.total}</td>
          <td className="col-small">{row.male}</td>
          <td className="col-small">{row.female}</td>
          <td className="col-small">{row.others}</td>

          <td className="col-small">
            {editIndex === i ? (
<input
  value={row.total_votes || ""}
  onChange={(e) =>
    handleChange(i, "total_votes", e.target.value)
  }
/>
            ) : (
              row.total_votes
            )}
          </td>
          {/* EPIC */}
          <td>
            {editIndex === i ? (
              <input
                value={row.epic || ""}
                onChange={(e) =>
                  handleChange(i, "epic", e.target.value)
                }
              />
            ) : (
              row.epic
            )}
          </td>

          <td>{Number(row.percent_epic || 0).toFixed(2)} %</td>

          {/* OTHER DOC */}
          <td>
            {editIndex === i ? (
              <input
                value={row.other_doc || ""}
                onChange={(e) =>
                  handleChange(i, "other_doc", e.target.value)
                }
              />
            ) : (
              row.other_doc
            )}
          </td>

          <td>{Number(row.percent_other || 0).toFixed(2)} %</td>

          {/* NO DOC */}
          <td>
            {editIndex === i ? (
              <input
                value={row.no_doc || ""}
                onChange={(e) =>
                  handleChange(i, "no_doc", e.target.value)
                }
              />
            ) : (
              row.no_doc
            )}
          </td>

          <td>{Number(row.percent_no_doc || 0).toFixed(2)} %</td>

          {/* REMARKS */}
          <td>
            {editIndex === i ? (
              <input
                value={row.remarks || ""}
                onChange={(e) =>
                  handleChange(i, "remarks", e.target.value)
                }
              />
            ) : (
              row.remarks
            )}
          </td>

          {/* STATUS */}
          <td className={row.status === "Received" ? "green" : "orange"}>
            {row.status || "Pending"}
          </td>

          {/* ACTION */}
          <td>
            <img
              src={tickIcon}
              className="status-icon"
              onClick={() => updateStatus(row.id, "Received")}
            />
            <img
              src={cancelIcon}
              className="status-icon"
              onClick={() => updateStatus(row.id, "Pending")}
            />

            {editIndex === i ? (
              //<button className="check-btn-save" onClick={() => handleSave(row)}>💾Save</button>
            <button
              className="check-btn-save"
              onClick={async () => {
                const isValid = await handleSave(row);

                if (isValid) {
                  await updateStatus(row.id, "Received");
                }
              }}
            >
              💾 Save
            </button>
            ) : (
              <button className="check-btn-edit" onClick={() => setEditIndex(i)}>✏Edit</button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);


const numberFields = [
  "votes_tendered",
  "challenged_votes",
  "votes_49o"
];
const yesNoFields = [
  "evm_not_functioning",
  "evm_replaced",
  "mock_poll",
  "mock_poll_agent",
  "incident",
  "remarks"
];
const renderPOTable = () => (
  <table className="doc-table">
    <thead>
      <tr>
        <th rowSpan="2" className="col-sl">S.No</th>
        <th rowSpan="2" className="col-part">Part No</th>
        <th rowSpan="2" className="col-zp">Zonal Party No</th>
        <th rowSpan="2" className="polling-col">Part Name</th>
        <th rowSpan="2" className="col-small">Total No. of Electors</th>
        <th rowSpan="2" className="col-small">Male</th>
        <th rowSpan="2" className="col-small">Female</th>
        <th rowSpan="2" className="col-small">Third Gender</th>

        <th colSpan="9">Presiding officer diary and complaint register of RO, ARO, DEO and observer and control room (10)</th>

        <th rowSpan="2">Status</th>
        <th rowSpan="2">Action</th>
      </tr>
    <tr>
        <th className="col-small">EVM & VVPAT not functioning for some time</th>
        <th className="col-small">EVM & VVPAT replaced</th>
        <th className="col-small">Mock Poll conducted without agents</th>
        <th className="col-small">Mock Poll conducted without prominent candidate agent</th>
        <th className="col-small">No. of tender Votes polled</th>
        <th className="col-small">No. of Challenged Votes</th>
        <th className="col-small">No. of votes under 49 'O'</th>
        <th className="col-small">Any significant incident (like violence, clash)</th>
        <th className="col-small">Complaints regarding poll rigging mal practices received</th>
      </tr>
    </thead>

    <tbody>
      {data.map((row, i) => (
        <tr key={i}>
          <td>{i + 1}</td>
          <td>{row.part_no}</td>
          <td>{row.zp_no}</td>
          <td>{row.part_name}</td>
          <td>{row.total}</td>
          <td>{row.male}</td>
          <td>{row.female}</td>
          <td>{row.others}</td>

          {/* EDITABLE FIELDS */}
          {[
  "evm_not_functioning",
  "evm_replaced",
  "mock_poll",
  "mock_poll_agent",
  "votes_tendered",
  "challenged_votes",
  "votes_49o",
  "incident",
  "remarks"
].map((field) => (
  <td key={field}>
    {editIndex === i ? (
      
      numberFields.includes(field) ? (
        // 🔢 NUMBER INPUT
        <input
          type="number"
          value={row[field] || ""}
          onChange={(e) =>
            handleChange(i, field, e.target.value)
          }
        />
      ) : (
        // ✅ YES / NO DROPDOWN
        <select
          value={row[field] || "No"}
          onChange={(e) =>
            handleChange(i, field, e.target.value)
          }
        >
          <option value="Yes">Yes</option>
          <option value="No">No</option>
        </select>
      )

    ) : (
      row[field]
    )}
  </td>
))}

          <td className={row.status === "Received" ? "green" : "orange"}>
            {row.status || "Pending"}
          </td>

          <td>
            <img
              src={tickIcon}
              className="status-icon"
              onClick={() => updateStatus(row.id, "Received")}
            />
            <img
              src={cancelIcon}
              className="status-icon"
              onClick={() => updateStatus(row.id, "Pending")}
            />

            {editIndex === i ? (
              //<button className="check-btn-save" onClick={() => handleSave(row)}>💾Save</button>
            <button
              className="check-btn-save"
              onClick={async () => {
                const isValid = await handleSave(row);

                if (isValid) {
                  await updateStatus(row.id, "Received");
                }
              }}
            >
              💾 Save
            </button>
            ) : (
              <button className="check-btn-edit" onClick={() => setEditIndex(i)}>✏Edit</button>
            )}
          </td>
        </tr>
      ))}
    </tbody>
  </table>
);



  return (
    <div className="doc-page">

      {/* HEADER */}
      <div className="doc-header">
        <h2>Welcome, {formatName(user?.name)}</h2>
        <h2>Reception Table Details</h2>
        <span>
          <button className="check-btn-back" onClick={() => nav(-1)}>Back</button>
          <button className="check-btn-home" onClick={() => nav(-2)}>🏠 Home</button>
        </span>
      </div>

     
      <div className="check-main-container">

        {/* TABS */}
        <div className="doc-tabs">
          <button onClick={() => setView("17C")}>Form 17C</button>
          <button onClick={() => setView("17A")}>Form 17A</button>
          <button onClick={() => setView("PO")}>Presiding Officer</button>
        </div>

        {/* IMPORT */}
        <div className="doc-topbar">
          <button onClick={() => fileRef.current.click()}>
            📥 Import Excel
          </button>
          <input type="file" ref={fileRef} hidden onChange={handleImport}/>
        </div>
      </div>

      {/* TABLE */}
      <div className="table-wrapper">
        {loading ? (
          <div className="loader-container">
            <div className="loader"></div>
            <p>Loading data...</p>
          </div>
        ) : (
          <>
            {view === "17C" && render17CTable()}
            {view === "17A" && render17ATable()}
            {view === "PO" && renderPOTable()}
          </>
        )}
      </div>
    </div>
  );
}

export default DocumentCheck;