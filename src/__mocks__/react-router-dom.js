// Minimal manual mock for react-router-dom used in tests
const React = require("react");

exports.BrowserRouter = ({ children }) =>
  React.createElement(React.Fragment, null, children);
exports.Routes = ({ children }) =>
  React.createElement(React.Fragment, null, children);
exports.Route = ({ element }) => element || null;
exports.Link = ({ children }) => React.createElement("a", null, children);
exports.NavLink = exports.Link;
exports.useNavigate = () => {
  return () => {};
};
exports.useLocation = () => ({ pathname: "/" });
exports.useParams = () => ({});

module.exports = exports;
