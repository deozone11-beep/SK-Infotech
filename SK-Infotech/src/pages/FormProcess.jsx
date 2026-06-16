import { useNavigate } from "react-router-dom";

function FormProcess() {
  const nav = useNavigate();
  return (
    <div style={styles.container}>
      <h1 style={styles.title}>🚧 Under Maintenance</h1>
      <p style={styles.text}>
        This form is currently unavailable. Please try again later.
      </p>
      <button className="formprocess-back" onClick={() => nav(-1)}>Home</button>
    </div>
  );
}

const styles = {
  container: {
    height: "100vh",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    background: "#f4f4f4",
  },
  title: {
    fontSize: "2.5rem",
    color: "#ff4d4f",
  },
  text: {
    fontSize: "1.2rem",
    color: "#555",
  },
};

export default FormProcess;