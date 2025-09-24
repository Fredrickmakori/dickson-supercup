import { useNavigate } from "react-router-dom";

function UpdateButton({ path }) {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="btn btn-sm btn-warning"
    >
      Update
    </button>
  );
}
